import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Dna, FlaskConical, GitBranch, Stethoscope } from 'lucide-react'
import type { BiomedicalNodeData } from './graphAdapter'
import { entityVisuals } from './entityConfig'

const iconMap = {
  disease: Stethoscope,
  gene: Dna,
  pathway: GitBranch,
  drug: FlaskConical,
} as const

function BiomedicalNode({ data, selected }: NodeProps) {
  const nodeData = data as BiomedicalNodeData
  const visual = entityVisuals[nodeData.entityType]
  const Icon = iconMap[visual.icon]

  return (
    <div
      className={`kg-node ${selected ? 'kg-node--selected' : ''}`}
      style={{
        borderColor: selected ? visual.color : visual.border,
        background: visual.bg,
      }}
    >
      <Handle type="target" position={Position.Top} className="kg-handle" />
      <Handle type="source" position={Position.Bottom} className="kg-handle" />
      <Handle type="target" position={Position.Left} className="kg-handle" />
      <Handle type="source" position={Position.Right} className="kg-handle" />

      <div className="kg-node-row">
        <span className="kg-node-icon" style={{ color: visual.color }}>
          <Icon size={13} />
        </span>
        <span className="kg-node-type" style={{ color: visual.color }}>
          {visual.abbr}
        </span>
      </div>
      <span className="kg-node-label">{nodeData.label}</span>
    </div>
  )
}

export default memo(BiomedicalNode)
