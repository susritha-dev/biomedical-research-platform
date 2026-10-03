import { Link2, X } from 'lucide-react'
import type { GraphEdge, GraphNode, SearchResult } from '../../types/biomedical'
import { entityVisuals, relationshipLabels } from './entityConfig'

interface SearchResultsPanelProps {
  result: SearchResult | null
  graphNodes: GraphNode[]
  graphEdges: GraphEdge[]
  centerNodeId: string | null
  onNodeSelect: (entityId: string) => void
  onClose: () => void
}

interface ConnectionItem {
  edge: GraphEdge
  node: GraphNode
  direction: 'outgoing' | 'incoming'
  relationshipLabel: string
}

export function SearchResultsPanel({
  result,
  graphNodes,
  graphEdges,
  centerNodeId,
  onNodeSelect,
  onClose,
}: SearchResultsPanelProps) {
  if (!result || !centerNodeId) return null

  const visual = entityVisuals(result.type as never)

  const connections: ConnectionItem[] = graphEdges
    .filter((e) => e.source === centerNodeId || e.target === centerNodeId)
    .map((e) => {
      const isOutgoing = e.source === centerNodeId
      const connectedId = isOutgoing ? e.target : e.source
      const connected = graphNodes.find((n) => n.id === connectedId)
      if (!connected) return null
      return {
        edge: e,
        node: connected,
        direction: isOutgoing ? 'outgoing' : 'incoming',
        relationshipLabel: relationshipLabels[e.relationship] ?? e.relationship.replace(/-/g, ' '),
      }
    })
    .filter((c): c is ConnectionItem => c !== null)

  return (
    <aside className="kg-search-results-panel">
      <div className="kg-srp-header">
        <div className="kg-srp-header-left">
          <Link2 size={14} className="kg-srp-header-icon" />
          <span className="kg-srp-header-label">Search Result</span>
        </div>
        <button
          type="button"
          className="kg-srp-close"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      <div className="kg-srp-selected">
        <span
          className="kg-srp-selected-badge"
          style={{ color: visual.color, background: visual.bg }}
        >
          {visual.label}
        </span>
        <h3 className="kg-srp-selected-title">{result.title}</h3>
        <p className="kg-srp-selected-desc">{result.description}</p>
      </div>

      <div className="kg-srp-connections">
        <div className="kg-srp-connections-header">
          <span>Connected Entities</span>
          <span className="kg-srp-connections-count">{connections.length}</span>
        </div>

        {connections.length > 0 ? (
          <ul className="kg-srp-connections-list">
            {connections.map((c) => {
              const cv = entityVisuals(c.node.type)
              return (
                <li key={c.edge.id}>
                  <button
                    type="button"
                    className="kg-srp-connection-item"
                    onClick={() => onNodeSelect(c.node.id)}
                  >
                    <span
                      className="kg-srp-connection-dot"
                      style={{ background: cv.color }}
                    />
                    <span className="kg-srp-connection-info">
                      <span className="kg-srp-connection-label">{c.node.label}</span>
                      <span className="kg-srp-connection-meta">
                        {cv.label} · {c.relationshipLabel}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="kg-srp-connections-empty">
            No connected entities found for this result.
          </p>
        )}
      </div>
    </aside>
  )
}
