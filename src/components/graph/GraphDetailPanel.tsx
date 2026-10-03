import { X } from 'lucide-react'
import type { GraphNode } from '../../types/biomedical'
import { entityVisuals } from './entityConfig'

interface ConnectionItem {
  relationship: string
  connectedLabel: string
  connectedType: string
}

interface GraphDetailPanelProps {
  node: GraphNode | null
  connections: ConnectionItem[]
  onClose: () => void
}

export function GraphDetailPanel({
  node,
  connections,
  onClose,
}: GraphDetailPanelProps) {
  if (!node) return null
  const visual = entityVisuals(node.type)
  const meta = node.metadata ?? {}

  return (
    <aside className="kg-panel" aria-live="polite">
      <div className="kg-panel-top">
        <span className="kg-panel-badge" style={{ color: visual.color, background: visual.bg }}>
          {visual.label}
        </span>
        <button type="button" className="kg-panel-close" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      <h3 className="kg-panel-title">{node.label}</h3>

      {node.description && (
        <p className="kg-panel-desc">{node.description}</p>
      )}

      {Object.keys(meta).length > 0 && (
        <dl className="kg-panel-meta">
          {Object.entries(meta).map(([key, value]) => (
            <div className="kg-panel-meta-row" key={key}>
              <dt>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</dt>
              <dd>{formatMetaValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      {connections.length > 0 && (
        <div className="kg-panel-conn">
          <p className="kg-panel-conn-title">
            Connections
            <span className="kg-panel-conn-count">{connections.length}</span>
          </p>
          <ul className="kg-panel-conn-list">
            {connections.map((c, i) => {
              const cv = entityVisuals(c.connectedType as never)
              return (
                <li key={i} className="kg-panel-conn-item">
                  <span className="kg-panel-conn-rel">{c.relationship}</span>
                  <span className="kg-panel-conn-arrow">→</span>
                  <span
                    className="kg-panel-conn-target"
                    style={{ color: cv?.color }}
                  >
                    {c.connectedLabel}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}

function formatMetaValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    return entries
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : String(v)}`)
      .join(', ')
  }
  return String(value)
}
