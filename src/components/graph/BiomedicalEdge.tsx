import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import { evidenceStyles, relationshipLabels } from './entityConfig'
import type { BiomedicalEdgeData } from './graphAdapter'

function BiomedicalEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as BiomedicalEdgeData | undefined
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const evKey = edgeData?.evidence ?? 'default'
  const ev = evidenceStyles[evKey] ?? evidenceStyles.default
  const label = edgeData
    ? relationshipLabels[edgeData.relationship] ?? edgeData.relationship
    : ''

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: selected ? '#2563eb' : ev.stroke,
          strokeWidth: selected ? 2.2 : ev.width,
          strokeDasharray: ev.dash,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className={`kg-edge-label ${selected ? 'kg-edge-label--active' : ''}`}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const BiomedicalEdge = memo(BiomedicalEdgeComponent)
