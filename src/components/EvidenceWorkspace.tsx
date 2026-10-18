import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Database,
  ExternalLink,
  LoaderCircle,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  ResearchEdge,
  ResearchMap,
  ResearchNode,
} from '../types/researchMap'
import { assessEvidence } from '../utils/evidenceQuality'

import './EvidenceWorkspace.css'

interface EvidenceWorkspaceProps {
  map: ResearchMap
  onOpenMap: () => void
}

type EvidenceStrength =
  | ResearchNode['evidenceStrength']
  | ResearchEdge['evidenceStrength']

interface EvidenceArticle {
  id: string
  title: string
  source: string
  year: string
  abstract: string
  authors: string[]
  url: string
  doi: string
  pubmedId: string
  citationCount: number
  provider: string
  type: string
  openAccessPdf: string
}

interface EvidenceApiResponse {
  ok?: boolean
  query: string
  articles: EvidenceArticle[]
  errors: string[]
  sources?: Array<{ name: string; status: string; count: number }>
  searchTerms?: string[]
  totalCandidates?: number
}

function cleanQuestion(question: string) {
  return question
    .replace(/\?/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getEvidenceLabel(strength: EvidenceStrength) {
  if (!strength || strength === 'unknown') {
    return 'Needs verification'
  }

  if (strength === 'limited') {
    return 'Limited'
  }

  return strength.charAt(0).toUpperCase() + strength.slice(1)
}

function getEvidenceIcon(strength: EvidenceStrength) {
  if (strength === 'strong') {
    return <CheckCircle2 size={18} />
  }

  if (strength === 'moderate' || strength === 'limited') {
    return <AlertTriangle size={18} />
  }

  return <CircleHelp size={18} />
}

function getEvidenceClass(strength: EvidenceStrength) {
  if (strength === 'strong') {
    return 'helix-evidence-status-strong'
  }

  if (strength === 'moderate') {
    return 'helix-evidence-status-moderate'
  }

  if (strength === 'limited') {
    return 'helix-evidence-status-weak'
  }

  return 'helix-evidence-status-unknown'
}

function getAssessmentClass(level: string) {
  if (level === 'high' || level === 'strong') {
    return 'helix-evidence-status-strong'
  }
  if (level === 'moderate') {
    return 'helix-evidence-status-moderate'
  }
  if (level === 'limited' || level === 'low') {
    return 'helix-evidence-status-weak'
  }
  return 'helix-evidence-status-unknown'
}

function filterNodesByEvidence(
  nodes: ResearchNode[],
  strength: ResearchNode['evidenceStrength'],
) {
  return nodes.filter(
    (node) =>
      node.type !== 'question' &&
      node.evidenceStrength === strength,
  )
}

function getUnknownNodes(nodes: ResearchNode[]) {
  return nodes.filter(
    (node) =>
      node.type !== 'question' &&
      (!node.evidenceStrength || node.evidenceStrength === 'unknown'),
  )
}

function findNode(nodes: ResearchNode[], id: string) {
  return nodes.find((node) => node.id === id)
}

function buildEvidenceQuery(map: ResearchMap) {
  return cleanQuestion(map.question)
}

function getAuthorsText(authors: string[]) {
  if (!authors || authors.length === 0) {
    return 'Authors not listed'
  }

  const visibleAuthors = authors.slice(0, 4).join(', ')

  if (authors.length > 4) {
    return `${visibleAuthors} et al.`
  }

  return visibleAuthors
}

function getAbstractPreview(abstract: string) {
  if (!abstract) {
    return 'No abstract was returned from this metadata source. Open the article page to review the paper directly.'
  }

  if (abstract.length <= 420) {
    return abstract
  }

  return `${abstract.slice(0, 420)}…`
}

export function EvidenceWorkspace({
  map,
  onOpenMap,
}: EvidenceWorkspaceProps) {
  const [articles, setArticles] = useState<EvidenceArticle[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [sources, setSources] = useState<Array<{ name: string; status: string; count: number }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const evidenceQuery = useMemo(
    () => buildEvidenceQuery(map),
    [map],
  )

  const strongNodes = filterNodesByEvidence(map.nodes, 'strong')
  const moderateNodes = filterNodesByEvidence(map.nodes, 'moderate')
  const limitedNodes = filterNodesByEvidence(map.nodes, 'limited')
  const unknownNodes = getUnknownNodes(map.nodes)

  const verifiableEdges = map.edges.slice(0, 10)

  const reviewQueue = [
    ...unknownNodes,
    ...limitedNodes,
  ].slice(0, 6)

  useEffect(() => {
    let cancelled = false

    async function loadEvidence() {
      setIsLoading(true)
      setApiError(null)
      setErrors([])
      setSources([])
      setArticles([])

      try {
        const url =
          `/api/evidence?q=${encodeURIComponent(evidenceQuery)}`

        console.log('Loading evidence from:', url)

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Evidence API returned ${response.status}`)
        }

        const data = await response.json() as EvidenceApiResponse

        console.log('Evidence API response:', data)

        if (!cancelled) {
          setArticles(data.articles || [])
          setErrors(data.errors || [])
          setSources(data.sources || [])
        }
      } catch (error) {
        console.error('Evidence frontend error:', error)

        if (!cancelled) {
          setApiError(
            error instanceof Error
              ? error.message
              : 'Evidence search failed.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    if (evidenceQuery) {
      loadEvidence()
    }

    return () => {
      cancelled = true
    }
  }, [evidenceQuery])

  return (
    <main className="helix-evidence-page">
      <section className="helix-evidence-shell">
        <div className="helix-evidence-hero">
          <div className="helix-evidence-hero-copy">
            <span className="helix-evidence-eyebrow">
              <ShieldCheck size={16} />

              Live research evidence
            </span>

            <h2>
              Real paper metadata from scholarly databases.
            </h2>

            <p>
              Helix searches NLM PubMed and public scholarly indexes, then
              reports source traceability separately from study design.
              Indexed records are candidates to review, not proof of a claim.
            </p>
          </div>

          <aside className="helix-evidence-command-card">
            <span>
              Evidence query
            </span>

            <strong>
              {
                evidenceQuery
              }
            </strong>

            <button
              type="button"
              onClick={onOpenMap}
            >
              Inspect on map

              <ArrowRight size={16} />
            </button>
          </aside>
        </div>

        {sources.length > 0 && (
          <div className="helix-evidence-provider-status" aria-label="Scholarly database search status">
            {sources.map((source) => (
              <span key={source.name} className={source.status === 'ok' ? 'helix-provider-ok' : 'helix-provider-error'}>
                <Database size={14} />
                {source.name}: {source.status === 'ok' ? `${source.count} retrieved` : 'unavailable'}
              </span>
            ))}
          </div>
        )}
        {errors.length > 0 && (
          <div className="helix-source-why" role="status">
            <strong>Some databases could not be reached</strong>
            <p>{errors.join(' • ')} Results from available databases are shown; coverage may be incomplete.</p>
          </div>
        )}
        <div className="helix-evidence-scoreboard">
          <article className="helix-evidence-score-card helix-score-strong">
            <CheckCircle2 size={21} />

            <strong>
              {
                strongNodes.length
              }
            </strong>

            <span>
              Strong map claims
            </span>
          </article>

          <article className="helix-evidence-score-card helix-score-moderate">
            <AlertTriangle size={21} />

            <strong>
              {
                moderateNodes.length
              }
            </strong>

            <span>
              Moderate claims
            </span>
          </article>

          <article className="helix-evidence-score-card helix-score-weak">
            <BookOpen size={21} />

            <strong>
              {
                isLoading ? '...' : articles.length
              }
            </strong>

            <span>
              Retrieved articles
            </span>
          </article>

          <article className="helix-evidence-score-card helix-score-review">
            <CircleHelp size={21} />

            <strong>
              {
                reviewQueue.length
              }
            </strong>

            <span>
              Review queue
            </span>
          </article>
        </div>

        <div className="helix-evidence-layout">
          <section className="helix-evidence-column">
            <div className="helix-evidence-section-heading">
              <div>
                <span>
                  Article results
                </span>

                <h3>
                  Papers and scholarly works related to the question
                </h3>
              </div>

              {
                isLoading
                  ? <LoaderCircle className="helix-spinner" size={20} />
                  : <BookOpen size={20} />
              }
            </div>

            {
              isLoading && (
                <div className="helix-evidence-loading">
                  <LoaderCircle className="helix-spinner" size={18} />

                    Searching NLM PubMed, Semantic Scholar, OpenAlex, and Crossref...
                </div>
              )
            }

            {
              apiError && (
                <div className="helix-source-why">
                  <strong>
                    Evidence API failed
                  </strong>

                  <p>
                    {
                      apiError
                    } Check that the evidence API is reachable and try again.
                  </p>
                </div>
              )
            }

            {
              !isLoading &&
              !apiError &&
              articles.length === 0 && (
                <div className="helix-source-why">
                  <strong>
                    No article metadata returned
                  </strong>

                  <p>
                    The backend responded, but it did not return article
                    cards for this query. Try a more specific scientific
                    question like “What evidence connects SOD1 to ALS?”
                    or “How does CRISPR-Cas9 target DNA?”
                  </p>
                </div>
              )
            }

            <div className="helix-source-grid">
              {
                articles.map((article) => {
                  const assessment = assessEvidence(article)
                  return (
                    <article
                      key={article.id}
                      className="helix-source-card"
                    >
                    <div className="helix-source-card-top">
                      <span className="helix-evidence-status-pill helix-evidence-status-unknown">
                        <Database size={15} />
                        {article.provider}
                      </span>

                      <span
                        className={`helix-evidence-status-pill ${getAssessmentClass(assessment.sourceCredibility)}`}
                        title={assessment.sourceReason}
                      >
                        Source: {assessment.sourceLabel}
                      </span>

                      <span
                        className={`helix-evidence-status-pill ${getAssessmentClass(assessment.strength)}`}
                        title={assessment.strengthReason}
                      >
                        Evidence: {assessment.strengthLabel}
                      </span>

                      <span className="helix-source-year">
                        {
                          article.year
                        }
                      </span>
                    </div>

                    <h4>
                      {
                        article.title
                      }
                    </h4>

                    <div className="helix-source-meta-row">
                      <span>
                        {
                          article.source
                        }
                      </span>

                      <span>
                        {
                          article.type
                        }
                      </span>

                      {article.citationCount > 0 && (
                        <span>{article.citationCount} citations</span>
                      )}
                    </div>

                    <p className="helix-source-assessment">
                      {assessment.sourceReason} {assessment.strengthReason}
                    </p>

                    <p className="helix-source-authors">
                      {
                        getAuthorsText(article.authors)
                      }
                    </p>

                    <p className="helix-source-summary">
                      {
                        getAbstractPreview(article.abstract)
                      }
                    </p>

                    <div className="helix-source-tags">
                      {
                        article.doi && (
                          <span>
                            DOI
                          </span>
                        )
                      }

                      {
                        article.pubmedId && (
                          <span>
                            PubMed
                          </span>
                        )
                      }

                      {
                        article.openAccessPdf && (
                          <span>
                            Open PDF
                          </span>
                        )
                      }

                      <span>
                        {
                          article.provider
                        }
                      </span>
                    </div>

                    <div className="helix-source-actions">
                      {
                        article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="helix-source-open"
                          >
                            Open article

                            <ExternalLink size={14} />
                          </a>
                        )
                      }

                      {
                        article.openAccessPdf && (
                          <a
                            href={article.openAccessPdf}
                            target="_blank"
                            rel="noreferrer"
                            className="helix-source-open helix-source-open-secondary"
                          >
                            Open PDF

                            <ExternalLink size={14} />
                          </a>
                        )
                      }
                    </div>
                    </article>
                  )
                })
              }
            </div>

            {
              errors.length > 0 && (
                <div className="helix-source-why">
                  <strong>
                    Some sources failed
                  </strong>

                  <p>
                    {
                      errors.join(' ')
                    }
                  </p>
                </div>
              )
            }
          </section>

          <aside className="helix-evidence-side">
            <div className="helix-evidence-panel-card">
              <div className="helix-evidence-section-heading">
                <div>
                  <span>
                    Relationship claims
                  </span>

                  <h3>
                    What the map is claiming
                  </h3>
                </div>

                <Network size={20} />
              </div>

              <div className="helix-evidence-claim-list">
                {
                  verifiableEdges.map((edge) => {
                    const source = findNode(map.nodes, edge.sourceId)
                    const target = findNode(map.nodes, edge.targetId)

                    return (
                      <article
                        key={edge.id}
                        className="helix-evidence-claim-card"
                      >
                        <strong>
                          {
                            source?.label ?? edge.sourceId
                          }{' '}
                          →{' '}
                          {
                            target?.label ?? edge.targetId
                          }
                        </strong>

                        <span
                          className={`helix-evidence-status-pill ${getEvidenceClass(edge.evidenceStrength)}`}
                        >
                          {
                            getEvidenceIcon(edge.evidenceStrength)
                          }

                          {
                            getEvidenceLabel(edge.evidenceStrength)
                          }
                        </span>

                        <p>
                          {
                            edge.explanation
                          }
                        </p>
                      </article>
                    )
                  })
                }
              </div>
            </div>

            <div className="helix-evidence-panel-card">
              <div className="helix-evidence-section-heading">
                <div>
                  <span>
                    Verification tasks
                  </span>

                  <h3>
                    How to use these papers
                  </h3>
                </div>

                <Search size={20} />
              </div>

              <div className="helix-evidence-review-list">
                <article className="helix-evidence-review-card">
                  <Sparkles size={16} />

                  <div>
                    <strong>
                      Compare the map to the papers
                    </strong>

                    <p>
                      Check whether the article titles and abstracts
                      actually support the generated relationship claims.
                    </p>
                  </div>
                </article>

                <article className="helix-evidence-review-card">
                  <Sparkles size={16} />

                  <div>
                    <strong>
                      Compare the study design and source
                    </strong>

                    <p>
                      Citation counts can help discover papers, but do not
                      establish quality or whether a paper supports the claim.
                    </p>
                  </div>
                </article>

                <article className="helix-evidence-review-card">
                  <Sparkles size={16} />

                  <div>
                    <strong>
                      Do not treat search results as proof
                    </strong>

                    <p>
                      These articles are evidence candidates. A user still
                      needs to read and verify the actual claims.
                    </p>
                  </div>
                </article>
              </div>
            </div>

            <div className="helix-evidence-panel-card">
              <div className="helix-evidence-section-heading">
                <div>
                  <span>
                    Review queue
                  </span>

                  <h3>
                    Concepts needing support
                  </h3>
                </div>

                <Database size={20} />
              </div>

              {
                reviewQueue.length > 0
                  ? (
                    <div className="helix-evidence-review-list">
                      {
                        reviewQueue.map((node) => (
                          <article
                            key={node.id}
                            className="helix-evidence-review-card"
                          >
                            <Sparkles size={16} />

                            <div>
                              <strong>
                                {
                                  node.label
                                }
                              </strong>

                              <p>
                                Needs stronger source support before being
                                presented as a confident research
                                connection.
                              </p>
                            </div>
                          </article>
                        ))
                      }
                    </div>
                  )
                  : (
                    <p className="helix-evidence-empty">
                      No limited or unknown concepts are currently in the
                      review queue.
                    </p>
                  )
              }
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
