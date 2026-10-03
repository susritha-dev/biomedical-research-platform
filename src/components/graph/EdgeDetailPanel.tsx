import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ExternalLink, Loader2, X } from 'lucide-react'
import type { AssociationDetail, GraphEdge, GraphNode } from '../../types/biomedical'
import { entityVisuals, relationshipLabels } from './entityConfig'

interface EdgeDetailPanelProps {
  edge: GraphEdge | null
  sourceNode: GraphNode | null
  targetNode: GraphNode | null
  associationDetail: AssociationDetail | null
  loadingDetail: boolean
  onClose: () => void
}

const NOT_AVAILABLE = 'Not available from current data source'

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

      <dl className="kg-edge-meta">
        <div className="kg-edge-meta-row">
          <dt>Relationship type</dt>
          <dd>{relLabel}</dd>
        </div>
        <div className="kg-edge-meta-row">
          <dt>Evidence strength</dt>
          <dd>
            {edge.evidence ? (
              <span className={`kg-edge-evidence kg-edge-evidence--${edge.evidence}`}>
                {edge.evidence}
              </span>
            ) : (
              NOT_AVAILABLE
            )}
          </dd>
        </div>
        <div className="kg-edge-meta-row">
          <dt>Evidence codes</dt>
          <dd>
            {edge.evidenceCodes && edge.evidenceCodes.length > 0
              ? edge.evidenceCodes.join(', ')
              : NOT_AVAILABLE}
          </dd>
        </div>
        <div className="kg-edge-meta-row">
          <dt>Sources</dt>
          <dd>
            {sources.length > 0 ? (
              <ul className="kg-edge-sources">
                {sources.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              NOT_AVAILABLE
            )}
          </dd>
        </div>
        <div className="kg-edge-meta-row">
          <dt>First reported</dt>
          <dd>
            {detail?.createdDate || edge.updateDate
              ? formatDate(detail?.createdDate || edge.updateDate)
              : NOT_AVAILABLE}
          </dd>
        </div>
        <div className="kg-edge-meta-row">
          <dt>Recent evidence</dt>
          <dd>
            {detail?.updateDate || edge.updateDate
              ? formatDate(detail?.updateDate || edge.updateDate)
              : NOT_AVAILABLE}
          </dd>
        </div>
      </dl>

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
              <li key={i}>{pub}</li>
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
  if (!dateStr) return 'Not available from current data source'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}
