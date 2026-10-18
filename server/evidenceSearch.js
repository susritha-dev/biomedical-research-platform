import { XMLParser } from 'fast-xml-parser'

const MAX_RESULTS_PER_SOURCE = 8
const pubmedXmlParser = new XMLParser({ ignoreAttributes: false, trimValues: true })

function toArray(value) {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function textValue(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (!value || typeof value !== 'object') return ''
  if ('#text' in value) return String(value['#text'])
  return ''
}

async function fetchPubMedAbstracts(ids) {
  if (ids.length === 0) return new Map()

  try {
    const params = new URLSearchParams({
      db: 'pubmed',
      id: ids.join(','),
      rettype: 'abstract',
      retmode: 'xml',
      tool: 'helix_research_explorer',
    })
    const response = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params}`,
      { headers: { Accept: 'application/xml' } },
    )
    if (!response.ok) return new Map()

    const parsed = pubmedXmlParser.parse(await response.text())
    const articles = toArray(parsed.PubmedArticleSet?.PubmedArticle)
    return new Map(articles.flatMap((article) => {
      const citation = article.MedlineCitation
      const id = textValue(citation?.PMID)
      const sections = toArray(citation?.Article?.Abstract?.AbstractText)
      const abstract = sections.map((section) => {
        const label = section?.['@_Label']
        const text = textValue(section)
        return label && text ? `${label}: ${text}` : text
      }).filter(Boolean).join(' ')
      return id && abstract ? [[id, abstract]] : []
    }))
  } catch {
    return new Map()
  }
}

function cleanQuery(value) {
  return String(value || '')
    .replace(/\?/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getYearFromDateParts(dateParts) {
  if (!Array.isArray(dateParts)) {
    return null
  }

  const firstDate = dateParts[0]

  if (!Array.isArray(firstDate)) {
    return null
  }

  return firstDate[0] ? String(firstDate[0]) : null
}

function decodeOpenAlexAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== 'object') {
    return ''
  }

  const words = []

  Object.entries(invertedIndex).forEach(([word, positions]) => {
    if (Array.isArray(positions)) {
      positions.forEach((position) => {
        words[position] = word
      })
    }
  })

  return words.filter(Boolean).join(' ')
}

function normalizeUrl(value) {
  if (!value) {
    return ''
  }

  return String(value)
}

function dedupeArticles(articles) {
  const unique = new Map()

  articles.forEach((article) => {
    const titleKey = String(article.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')

    const doiKey = String(article.doi || '')
      .toLowerCase()
      .replace(/^https:\/\/doi\.org\//, '')

    const key = doiKey || titleKey

    if (!key) return

    const existing = unique.get(key)
    if (!existing) {
      unique.set(key, article)
      return
    }

    const preferred =
      article.provider === 'PubMed' ? article : existing
    const additional = preferred === article ? existing : article

    unique.set(key, {
      ...additional,
      ...preferred,
      abstract: preferred.abstract || additional.abstract,
      authors: preferred.authors?.length
        ? preferred.authors
        : additional.authors,
      citationCount: Math.max(
        Number(preferred.citationCount || 0),
        Number(additional.citationCount || 0),
      ),
      doi: preferred.doi || additional.doi,
      openAccessPdf: preferred.openAccessPdf || additional.openAccessPdf,
      pubmedId: preferred.pubmedId || additional.pubmedId,
    })
  })

  return [...unique.values()]
}


const STOPWORDS = new Set('a an and are as at be between by can could does do for from how in is it its of on or our that the their these this to using via was were what when where which who why with affect affects associated association role evidence studies study research paper papers link linked relates relationship explain mechanism mechanisms'.split(' '))
const ALIAS_GROUPS = [
  ['amyotrophic lateral sclerosis', 'als'],
  ['crispr cas9', 'crispr-cas9', 'cas9'],
  ['alzheimer disease', 'alzheimers disease', 'alzheimer'],
  ['parkinson disease', 'parkinsons disease', 'parkinson'],
  ['tumor', 'tumour'],
]
function tokenize(value) {
  return String(value || '').toLowerCase().replace(/<[^>]*>/g, ' ').replace(/[^a-z0-9]+/g, ' ').split(' ')
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
}
function queryTerms(query) {
  const input = String(query || '').toLowerCase()
  const tokens = [...new Set(tokenize(input))]
  for (const group of ALIAS_GROUPS) {
    if (group.some((name) => input.includes(name))) {
      for (const name of group) tokens.push(...tokenize(name))
    }
  }
  return [...new Set(tokens)].slice(0, 24)
}
function relevanceAssessment(article, question) {
  const terms = queryTerms(question)
  if (!terms.length) return { score: 0, matchedTerms: [], coverage: 0 }
  const title = new Set(tokenize(article.title))
  const abstract = new Set(tokenize(article.abstract))
  const matchedTerms = terms.filter((term) => title.has(term) || abstract.has(term))
  const titleMatches = terms.filter((term) => title.has(term)).length
  const coverage = matchedTerms.length / terms.length
  // Match the user's biomedical concepts; citation popularity does not establish relevance.
  const score = Math.round(coverage * 72 + (titleMatches / terms.length) * 24 +
    (article.abstract ? 4 : 0))
  return { score, matchedTerms, coverage: Number(coverage.toFixed(2)) }
}
function rankArticles(articles, question) {
  return articles.map((article) => ({
    ...article,
    relevance: relevanceAssessment(article, question),
  })).sort((a, b) =>
    b.relevance.score - a.relevance.score ||
    b.relevance.coverage - a.relevance.coverage ||
    Number(Boolean(b.abstract)) - Number(Boolean(a.abstract)) ||
    Number(Boolean(b.doi)) - Number(Boolean(a.doi)) ||
    String(b.year).localeCompare(String(a.year))
  )
}

async function searchSemanticScholar(query) {
  const fields = [
    'title',
    'abstract',
    'year',
    'venue',
    'authors',
    'url',
    'citationCount',
    'externalIds',
    'publicationTypes',
    'openAccessPdf',
  ].join(',')

  const url =
    `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
      query,
    )}&limit=${MAX_RESULTS_PER_SOURCE}&fields=${fields}`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Semantic Scholar returned ${response.status}`)
  }

  const data = await response.json()

  return (data.data || [])
    .filter((paper) => paper.title)
    .map((paper) => {
      const doi = paper.externalIds?.DOI || ''
      const pubmedId = paper.externalIds?.PubMed || ''

      return {
        id: `semantic-${paper.paperId}`,
        title: paper.title,
        source: paper.venue || 'Semantic Scholar',
        year: paper.year ? String(paper.year) : 'Unknown year',
        abstract: paper.abstract || '',
        authors: Array.isArray(paper.authors)
          ? paper.authors
              .slice(0, 6)
              .map((author) => author.name)
              .filter(Boolean)
          : [],
        url:
          normalizeUrl(paper.url) ||
          (doi ? `https://doi.org/${doi}` : ''),
        doi,
        pubmedId,
        citationCount: paper.citationCount || 0,
        provider: 'Semantic Scholar',
        type:
          Array.isArray(paper.publicationTypes) &&
          paper.publicationTypes.length > 0
            ? paper.publicationTypes.join(', ')
            : 'Research paper',
        openAccessPdf: paper.openAccessPdf?.url || '',
      }
    })
}

async function searchPubMed(query) {
  const searchParams = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmode: 'json',
    retmax: String(MAX_RESULTS_PER_SOURCE),
    sort: 'relevance',
    tool: 'helix_research_explorer',
  })
  const searchResponse = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`,
    { headers: { Accept: 'application/json' } },
  )

  if (!searchResponse.ok) {
    throw new Error(`PubMed search returned ${searchResponse.status}`)
  }

  const searchData = await searchResponse.json()
  const ids = searchData.esearchresult?.idlist || []
  if (ids.length === 0) return []

  const summaryParams = new URLSearchParams({
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json',
    tool: 'helix_research_explorer',
  })
  const summaryResponse = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`,
    { headers: { Accept: 'application/json' } },
  )

  if (!summaryResponse.ok) {
    throw new Error(`PubMed summary returned ${summaryResponse.status}`)
  }

  const summaryData = await summaryResponse.json()
  const abstracts = await fetchPubMedAbstracts(ids)

  return ids.flatMap((id) => {
    const record = summaryData.result?.[id]
    if (!record?.title) return []

    const articleIds = record.articleids || []
    const doi = articleIds.find((item) => item.idtype === 'doi')?.value || ''
    const pubmedId = articleIds.find((item) => item.idtype === 'pubmed')?.value || id

    return [{
      id: `pubmed-${pubmedId}`,
      title: record.title,
      source: record.fulljournalname || record.source || 'PubMed',
      year: String(record.pubdate || '').match(/\d{4}/)?.[0] || 'Unknown year',
      abstract: abstracts.get(pubmedId) || '',
      authors: Array.isArray(record.authors)
        ? record.authors.slice(0, 6).map((author) => author.name).filter(Boolean)
        : [],
      url: `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`,
      doi,
      pubmedId,
      citationCount: 0,
      provider: 'PubMed',
      type: Array.isArray(record.pubtype) && record.pubtype.length > 0
        ? record.pubtype.join(', ')
        : 'Publication type not reported',
      openAccessPdf: '',
    }]
  })
}

async function searchOpenAlex(query) {
  const select = [
    'id',
    'display_name',
    'publication_year',
    'doi',
    'cited_by_count',
    'authorships',
    'primary_location',
    'abstract_inverted_index',
    'type',
  ].join(',')

  const url =
    `https://api.openalex.org/works?search=${encodeURIComponent(
      query,
    )}&per-page=${MAX_RESULTS_PER_SOURCE}&select=${select}`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`OpenAlex returned ${response.status}`)
  }

  const data = await response.json()

  return (data.results || [])
    .filter((work) => work.display_name)
    .map((work) => {
      const doi = work.doi
        ? String(work.doi).replace('https://doi.org/', '')
        : ''

      const sourceName =
        work.primary_location?.source?.display_name ||
        'OpenAlex'

      const articleUrl =
        work.primary_location?.landing_page_url ||
        work.primary_location?.pdf_url ||
        work.doi ||
        work.id

      const authors = Array.isArray(work.authorships)
        ? work.authorships
            .slice(0, 6)
            .map((item) => item.author?.display_name)
            .filter(Boolean)
        : []

      return {
        id: `openalex-${String(work.id || work.display_name).replace(
          /[^a-zA-Z0-9]/g,
          '-',
        )}`,
        title: work.display_name,
        source: sourceName,
        year: work.publication_year
          ? String(work.publication_year)
          : 'Unknown year',
        abstract: decodeOpenAlexAbstract(work.abstract_inverted_index),
        authors,
        url: normalizeUrl(articleUrl),
        doi,
        pubmedId: '',
        citationCount: work.cited_by_count || 0,
        provider: 'OpenAlex',
        type: work.type || 'Scholarly work',
        openAccessPdf:
          work.primary_location?.pdf_url || '',
      }
    })
}

async function searchCrossref(query) {
  const url =
    `https://api.crossref.org/works?query=${encodeURIComponent(
      query,
    )}&rows=${MAX_RESULTS_PER_SOURCE}`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'HelixResearchExplorer/1.0 (mailto:demo@example.com)',
    },
  })

  if (!response.ok) {
    throw new Error(`Crossref returned ${response.status}`)
  }

  const data = await response.json()
  const items = data.message?.items || []

  return items
    .filter((item) => Array.isArray(item.title) && item.title[0])
    .map((item) => {
      const authors = Array.isArray(item.author)
        ? item.author
            .slice(0, 6)
            .map((author) =>
              [author.given, author.family].filter(Boolean).join(' '),
            )
            .filter(Boolean)
        : []

      const source =
        Array.isArray(item['container-title']) &&
        item['container-title'][0]
          ? item['container-title'][0]
          : item.publisher || 'Crossref'

      return {
        id: `crossref-${item.DOI || item.URL || item.title[0]}`,
        title: item.title[0],
        source,
        year:
          getYearFromDateParts(item['published-print']?.['date-parts']) ||
          getYearFromDateParts(item['published-online']?.['date-parts']) ||
          getYearFromDateParts(item.published?.['date-parts']) ||
          'Unknown year',
        abstract: item.abstract || '',
        authors,
        url:
          item.URL ||
          (item.DOI ? `https://doi.org/${item.DOI}` : ''),
        doi: item.DOI || '',
        pubmedId: '',
        citationCount: item['is-referenced-by-count'] || 0,
        provider: 'Crossref',
        type: item.type || 'Scholarly metadata',
        openAccessPdf: '',
      }
    })
}

export async function searchEvidence(query) {
  const cleanedQuery = cleanQuery(query)

  if (!cleanedQuery) {
    return {
      query: '',
      articles: [],
      errors: ['Missing search query.'],
    }
  }

  // Search the question as written. Long natural-language queries can dilute
  // biomedical indexing, so also query with the key domain terms.
  const focusedTerms = queryTerms(cleanedQuery).slice(0, 9)
  const focusedQuery = focusedTerms.join(' ')
  const providers = [
    ['PubMed', searchPubMed],
    ['Semantic Scholar', searchSemanticScholar],
    ['OpenAlex', searchOpenAlex],
    ['Crossref', searchCrossref],
  ]
  const searches = await Promise.allSettled(providers.map(async ([, search]) => {
    let first = []
    let firstError = null
    try {
      first = await search(cleanedQuery)
    } catch (error) {
      firstError = error
    }
    if (!focusedQuery || focusedQuery.toLowerCase() === cleanedQuery.toLowerCase()) {
      if (firstError) throw firstError
      return first
    }
    try {
      const second = await search(focusedQuery)
      return [...first, ...second]
    } catch (error) {
      if (firstError) throw firstError
      return first
    }
  }))

  const articles = []
  const errors = []

  const sources = searches.map((result, i) => {
    const name = providers[i][0]
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
      return { name, status: 'ok', count: result.value.length }
    }
    const reason = result.reason?.message || 'Source unavailable.'
    errors.push(`${name}: ${reason}`)
    return { name, status: 'error', count: 0 }
  })

  const uniqueArticles = dedupeArticles(articles)
  const rankedArticles = rankArticles(uniqueArticles, cleanedQuery)
  // Require meaningful matching rather than filling the page with loosely related citations.
  const minimumMatch = queryTerms(cleanedQuery).length > 2 ? 25 : 15
  const relevant = rankedArticles.filter((article) => article.relevance.score >= minimumMatch)
  return {
    query: cleanedQuery,
    searchTerms: queryTerms(cleanedQuery),
    articles: relevant.slice(0, 24),
    totalCandidates: uniqueArticles.length,
    sources,
    errors,
    note: 'Keyword relevance is a retrieval aid, not a validation of the paper or its conclusions.',
  }
}
