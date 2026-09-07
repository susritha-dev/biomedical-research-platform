import type { Edge, Node } from '@xyflow/react'
import type {
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
} from '../../types/biomedical'

export type BiomedicalNodeData = {
  entityType: GraphNode['type']
  label: string
  description?: string
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export type BiomedicalEdgeData = {
  relationship: GraphEdge['relationship']
  evidence?: GraphEdge['evidence']
  [key: string]: unknown
}

type XY = { x: number; y: number }

const GROUP_ANGLES: Record<string, number> = {
  disease: -Math.PI / 2,
  gene: 0,
  pathway: Math.PI / 2,
  drug: Math.PI,
}

function computeLayout(graph: KnowledgeGraph): Map<string, XY> {
  const positions = new Map<string, XY>()
  const groups: Record<string, GraphNode[]> = {
    disease: [],
    gene: [],
    pathway: [],
    drug: [],
  }

  graph.nodes.forEach((n) => {
    const g = groups[n.type]
    if (g) g.push(n)
  })

  const baseRadius = 280
  const innerRadius = 110

  Object.entries(groups).forEach(([type, nodes]) => {
    const angle = GROUP_ANGLES[type]
    const cx = Math.cos(angle) * baseRadius
    const cy = Math.sin(angle) * baseRadius

    if (nodes.length === 0) return
    if (nodes.length === 1) {
      positions.set(nodes[0].id, { x: cx, y: cy })
      return
    }

    const spread = Math.min(Math.PI * 0.7, 0.35 * nodes.length)
    const startAngle = angle - spread / 2
    const step = spread / (nodes.length - 1)

    nodes.forEach((node, i) => {
      const a = startAngle + step * i
      positions.set(node.id, {
        x: cx + Math.cos(a) * innerRadius,
        y: cy + Math.sin(a) * innerRadius,
      })
    })
  })

  return positions
}

export function toFlowNodes(graph: KnowledgeGraph): Node<BiomedicalNodeData>[] {
  const positions = computeLayout(graph)
  return graph.nodes.map((node) => ({
    id: node.id,
    type: 'biomedicalNode',
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: {
      entityType: node.type,
      label: node.label,
      description: node.description,
      metadata: node.metadata,
    },
  }))
}

export function toFlowEdges(graph: KnowledgeGraph): Edge<BiomedicalEdgeData>[] {
  return graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'biomedicalEdge',
    data: {
      relationship: edge.relationship,
      evidence: edge.evidence,
    },
  }))
}
