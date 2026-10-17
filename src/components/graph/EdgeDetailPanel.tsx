import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ExternalLink, Loader2, X } from 'lucide-react'
import type { AssociationDetail, GraphEdge, GraphNode } from '../../types/biomedical'
import { assessEvidence } from '../../utils/evidenceQuality'
import { entityVisuals, relationshipLabels } from './entityConfig'

interface EdgeDetailPanelProps {
  edge: GraphEdge | null
  sourceNode: GraphNode | null
  targetNode: GraphNode | null
  associationDetail: AssociationDetail | null
  loadingDetail: boolean
  onClose: () => void
}

interface EvidenceArticle {
  id: string
  title: string
  source: string
  year: string
  url: string
  doi: string
  pubmedId: string
  provider: string
  type: string
  abstract?: string
  authors?: string[]
  citationCount?: number
}

interface EvidenceApiResponse {
  articles: EvidenceArticle[]
}

export function EdgeDetailPanel({
  edge,
  sourceNode,
  targetNode,
  associationDetail,
  loadingDetail,
  onClose,
}: EdgeDetailPanelProps) {
  const navigate = useNavigate()
  const [navigating, setNavigating] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState<EvidenceArticle[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [relatedError, setRelatedError] = useState<string | null>(null)

  const literatureQuery = [sourceNode?.label, targetNode?.label]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    if (!edge || !literatureQuery) {
      setRelatedArticles([])
      setRelatedError(null)
      setLoadingRelated(false)
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({ q: literatureQuery })
    setRelatedArticles([])
    setRelatedError(null)
    setLoadingRelated(true)

    fetch(`/api/evidence?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Literature search failed (${response.status})`)
        return response.json() as Promise<EvidenceApiResponse>
      })
      .then((data) => {
        const articles = data.articles ?? []
        const indexed = articles.filter((article) => article.provider === 'PubMed')
        const additional = articles.filter((article) => article.provider !== 'PubMed')
        setRelatedArticles([...indexed, ...additional].slice(0, 3))
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setRelatedError(error instanceof Error ? error.message : 'Literature search failed.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingRelated(false)
      })

    return () => controller.abort()
  }, [edge?.id, literatureQuery])

  if (!edge) return null

  const relLabel = relationshipLabels[edge.relationship] ?? edge.relationship.replace(/-/g, ' ')

  const handleViewEvidence = () => {
    setNavigating(true)
    const params = new URLSearchParams()
    if (sourceNode) {
      params.set('sourceId', sourceNode.id)
      params.set('sourceLabel', sourceNode.label)
      params.set('sourceType', sourceNode.type)
    }
    if (targetNode) {
      params.set('targetId', targetNode.id)
      params.set('targetLabel', targetNode.label)
      params.set('targetType', targetNode.type)
    }
    params.set('relationship', edge.relationship)
    params.set('associationId', edge.id)
    if (edge.evidenceCodes && edge.evidenceCodes.length > 0) {
      params.set('evidenceCodes', edge.evidenceCodes.join(','))
    }
    if (edge.primaryKnowledgeSource) {
      params.set('knowledgeSource', edge.primaryKnowledgeSource)
    }
    navigate(`/explore?${params.toString()}`)
  }

  const detail = associationDetail
  const sources: string[] = []
  if (detail?.primaryKnowledgeSource) sources.push(detail.primaryKnowledgeSource)
  if (detail?.providedBy && detail.providedBy.length > 0) sources.push(...detail.providedBy)
  if (edge.primaryKnowledgeSource && !sources.includes(edge.primaryKnowledgeSource)) {
    sources.unshift(edge.primaryKnowledgeSource)
  }

  return (
    <aside className="kg-edge-panel" aria-live="polite">
      <div className="kg-edge-panel-top">
        <span className="kg-edge-panel-badge">Relationship</span>
        <button type="button" className="kg-panel-close" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      <div className="kg-edge-flow">
        {sourceNode && (
          <div className="kg-edge-entity">
            <span
              className="kg-edge-entity-dot"
              style={{ background: entityVisuals(sourceNode.type).color }}
            />
            <span className="kg-edge-entity-name">{sourceNode.label}</span>
            <span className="kg-edge-entity-type">{entityVisuals(sourceNode.type).abbr}</span>
          </div>
        )}
        <div className="kg-edge-rel-arrow">
          <span className="kg-edge-rel-label">{relLabel}</span>
          <ArrowRight size={14} />
        </div>
        {targetNode && (
          <div className="kg-edge-entity">
            <span
              className="kg-edge-entity-dot"
              style={{ background: entityVisuals(targetNode.type).color }}
            />
            <span className="kg-edge-entity-name">{targetNode.label}</span>
            <span className="kg-edge-entity-type">{entityVisuals(targetNode.type).abbr}</span>
          </div>
        )}
      </div>

      <section className="kg-edge-literature" aria-live="polite">
        <div className="kg-edge-literature-heading">
          <span>Literature for this relationship</span>
          {loadingRelated && <Loader2 size={13} className="kg-spin-icon" />}
        </div>
        <p className="kg-edge-literature-note">
          Search-index matches are literature leads; review the paper to confirm it supports this specific connection.
        </p>

        {relatedArticles.map((article) => {
          const assessment = assessEvidence(article)
          return (
            <article className="kg-edge-literature-item" key={article.id}>
              <a href={article.url} target="_blank" rel="noreferrer">
                {article.title} <ExternalLink size={11} />
              </a>
              <span>{article.source} · {article.year} · {article.type}</span>
              <span title={`${assessment.sourceReason} ${assessment.strengthReason}`}>
                {assessment.sourceLabel} · {assessment.strengthLabel} evidence
              </span>
              {article.abstract && (
                <p className="kg-edge-literature-abstract">
                  {article.abstract.length > 300
                    ? `${article.abstract.slice(0, 300)}…`
                    : article.abstract}
                </p>
              )}
            </article>
          )
        })}

        {relatedError && (
          <p className="kg-edge-literature-note">
            {relatedError}. Search PubMed directly for this relationship.
          </p>
        )}

        {!loadingRelated && !relatedError && relatedArticles.length === 0 && (
          <p className="kg-edge-literature-note">
            No matching papers returned; this is not evidence that no studies exist.
          </p>
        )}

        <a
          className="kg-edge-pubmed-link"
          href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(literatureQuery)}`}
          target="_blank"
          rel="noreferrer"
        >
          Search NLM PubMed <ExternalLink size={11} />
        </a>
      </section>

      <dl className="kg-edge-meta">
        {edge.evidence && <div className="kg-edge-meta-row">
          <dt>Evidence strength</dt>
          <dd>
            <span className={`kg-edge-evidence kg-edge-evidence--${edge.evidence}`}>
              {edge.evidence}
            </span>
          </dd>
        </div>}
        {edge.evidenceCodes && edge.evidenceCodes.length > 0 && <div className="kg-edge-meta-row">
          <dt>Evidence codes</dt>
          <dd>{edge.evidenceCodes.join(', ')}</dd>
        </div>}
        {sources.length > 0 && <div className="kg-edge-meta-row">
          <dt>Sources</dt>
          <dd>
            <ul className="kg-edge-sources">
              {sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </dd>
        </div>}
        {(detail?.createdDate || edge.updateDate) && <div className="kg-edge-meta-row">
          <dt>First reported</dt>
          <dd>{formatDate(detail?.createdDate || edge.updateDate || '')}</dd>
        </div>}
        {(detail?.updateDate || edge.updateDate) && <div className="kg-edge-meta-row">
          <dt>Recent evidence</dt>
          <dd>{formatDate(detail?.updateDate || edge.updateDate || '')}</dd>
        </div>}
      </dl>

      {!edge.evidence && !edge.evidenceCodes?.length && sources.length === 0 && !edge.updateDate && !detail?.createdDate && !detail?.updateDate && (
        <p className="kg-edge-literature-note kg-edge-monarch-note">
          Monarch does not provide a direct evidence grade or citation for this association. The literature above comes from independent public indexes.
        </p>
      )}

      {loadingDetail && (
        <div className="kg-edge-loading">
          <Loader2 size={14} className="kg-spin-icon" />
          <span>Loading association details…</span>
        </div>
      )}

      {detail && detail.publications.length > 0 && (
        <div className="kg-edge-pubs">
          <p className="kg-edge-pubs-title">Publications</p>
          <ul className="kg-edge-pubs-list">
            {detail.publications.slice(0, 5).map((pub, i) => (
              <li key={i}>
                {publicationUrl(pub) ? (
                  <a href={publicationUrl(pub)} target="_blank" rel="noreferrer">
                    {pub} <ExternalLink size={11} />
                  </a>
                ) : pub}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="kg-edge-view-evidence"
        onClick={handleViewEvidence}
        disabled={navigating}
      >
        {navigating ? (
          <>
            <Loader2 size={15} className="kg-spin-icon" />
            Navigating…
          </>
        ) : (
          <>
            <ExternalLink size={15} />
            View Evidence
          </>
        )}
      </button>
    </aside>
  )
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'No date supplied by Monarch'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function publicationUrl(publication: string): string | null {
  const value = publication.trim()
  const pmid = value.match(/^(?:PMID:?)?\s*(\d+)$/i)?.[1]
  if (pmid) return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`

  const pmcId = value.match(/^(?:PMC:?)?\s*(PMC\d+)$/i)?.[1]
  if (pmcId) return `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/`

  const doi = value.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
  if (/^10\.\d{4,9}\/\S+$/i.test(doi)) return `https://doi.org/${doi}`
  if (/^https?:\/\//i.test(value)) return value
  return null
}
