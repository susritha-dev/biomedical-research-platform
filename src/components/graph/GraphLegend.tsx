import type { BiomedicalEntityType } from '../../types/biomedical'
import { entityVisuals } from './entityConfig'

interface GraphLegendProps {
  visibleTypes: Set<BiomedicalEntityType>
  onToggleType: (type: BiomedicalEntityType) => void
}

const ENTITY_TYPES: BiomedicalEntityType[] = ['disease', 'gene', 'pathway', 'drug']

export function GraphLegend({ visibleTypes, onToggleType }: GraphLegendProps) {
  return (
    <div className="kg-legend" role="group" aria-label="Entity type filters">
      {ENTITY_TYPES.map((type) => {
        const visual = entityVisuals[type]
        const isVisible = visibleTypes.has(type)
        return (
          <button
            key={type}
            type="button"
            className={`kg-legend-item ${isVisible ? '' : 'is-off'}`}
            onClick={() => onToggleType(type)}
            aria-pressed={isVisible}
          >
            <span
              className="kg-legend-dot"
              style={{
                background: isVisible ? visual.color : 'transparent',
                borderColor: visual.color,
              }}
            />
            {visual.label}
          </button>
        )
      })}
    </div>
  )
}
