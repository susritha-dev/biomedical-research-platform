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
  isCenter?: boolean
  [key: string]: unknown
}

export type BiomedicalEdgeData = {
  relationship: GraphEdge['relationship']
  evidence?: GraphEdge['evidence']
  evidenceCodes?: string[]
  primaryKnowledgeSource?: string
  publications?: string[]
  updateDate?: string
  [key: string]: unknown
}

type XY = { x: number; y: number }

const SECTOR_ORDER = [
  'disease',
  'gene',
  'pathway',
  'drug',
  'phenotype',
  'anatomy',
  'function',
  'variant',
]

function computeLayout(graph: KnowledgeGraph): Map<string, XY> {
  const positions = new Map<string, XY>()

  const centerNode = graph.nodes[0]
  if (!centerNode) return positions

  positions.set(centerNode.id, { x: 0, y: 0 })

  const neighbors = graph.nodes.slice(1)
  if (neighbors.length === 0) return positions

  const byType = new Map<string, GraphNode[]>()
  for (const n of neighbors) {
    const arr = byType.get(n.type) ?? []
    arr.push(n)
    byType.set(n.type, arr)
  }

  const sectorCount = byType.size
  if (sectorCount === 0) return positions

  const sectorAngle = (Math.PI * 2) / sectorCount
  let sectorIndex = 0
  const baseRadius = 200
  const ringGap = 70

  for (const type of SECTOR_ORDER) {
    const nodesOfType = byType.get(type)
    if (!nodesOfType || nodesOfType.length === 0) continue

    const sectorCenter = sectorIndex * sectorAngle - Math.PI / 2

    nodesOfType.forEach((node, i) => {
      const ring = Math.floor(i / 6)
      const indexInRing = i % 6
      const itemsInThisRing = Math.min(6, nodesOfType.length - ring * 6)
      const radius = baseRadius + ring * ringGap

      const spread = Math.min(sectorAngle * 0.8, 0.4 * itemsInThisRing)
      const startAngle = sectorCenter - spread / 2
      const step = itemsInThisRing > 1 ? spread / (itemsInThisRing - 1) : 0
      const a = startAngle + step * indexInRing

      positions.set(node.id, {
        x: Math.cos(a) * radius,
        y: Math.sin(a) * radius,
      })
    })

    sectorIndex++
  }

  // Any remaining types not in SECTOR_ORDER get placed in remaining sectors
  for (const [type, nodesOfType] of byType) {
    if (SECTOR_ORDER.includes(type)) continue

    const sectorCenter = sectorIndex * sectorAngle - Math.PI / 2

    nodesOfType.forEach((node, i) => {
      const ring = Math.floor(i / 6)
      const indexInRing = i % 6
      const itemsInThisRing = Math.min(6, nodesOfType.length - ring * 6)
      const radius = baseRadius + ring * ringGap

      const spread = Math.min(sectorAngle * 0.8, 0.4 * itemsInThisRing)
      const startAngle = sectorCenter - spread / 2
      const step = itemsInThisRing > 1 ? spread / (itemsInThisRing - 1) : 0
      const a = startAngle + step * indexInRing

      positions.set(node.id, {
        x: Math.cos(a) * radius,
        y: Math.sin(a) * radius,
      })
    })

    sectorIndex++
  }

  return positions
}

export function toFlowNodes(graph: KnowledgeGraph): Node<BiomedicalNodeData>[] {
  const positions = computeLayout(graph)
  return graph.nodes.map((node, i) => ({
    id: node.id,
    type: 'biomedicalNode',
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: {
      entityType: node.type,
      label: node.label,
      description: node.description,
      metadata: node.metadata,
      isCenter: i === 0,
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
      evidenceCodes: edge.evidenceCodes,
      primaryKnowledgeSource: edge.primaryKnowledgeSource,
      publications: edge.publications,
      updateDate: edge.updateDate,
    },
  }))
}
