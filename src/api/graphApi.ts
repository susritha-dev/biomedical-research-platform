import { knowledgeGraph } from '../data/biomedicalGraphData'
import type {
  BiomedicalEntityType,
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
} from '../types/biomedical'

const nodeMap = new Map<string, GraphNode>(
  knowledgeGraph.nodes.map((node) => [node.id, node]),
)

const adjacency = new Map<string, GraphEdge[]>()
for (const edge of knowledgeGraph.edges) {
  const fromList = adjacency.get(edge.source) ?? []
  fromList.push(edge)
  adjacency.set(edge.source, fromList)

  const toList = adjacency.get(edge.target) ?? []
  toList.push(edge)
  adjacency.set(edge.target, toList)
}

export function getFullGraph(): KnowledgeGraph {
  return knowledgeGraph
}

export function getEntityDetail(
  id: string,
  type: BiomedicalEntityType,
): GraphNode | undefined {
  const node = nodeMap.get(id)
  return node && node.type === type ? node : undefined
}

export function getNeighbors(nodeId: string): {
  nodes: GraphNode[]
  edges: GraphEdge[]
} {
  const edges = adjacency.get(nodeId) ?? []
  const neighborIds = new Set<string>()

  for (const edge of edges) {
    neighborIds.add(edge.source === nodeId ? edge.target : edge.source)
  }

  const nodes = [...neighborIds]
    .map((id) => nodeMap.get(id))
    .filter((node): node is GraphNode => node !== undefined)

  return { nodes, edges }
}

export function getGraphForEntity(nodeId: string, depth = 1): KnowledgeGraph {
  if (!nodeMap.has(nodeId)) {
    return { nodes: [], edges: [] }
  }

  const visited = new Set<string>([nodeId])
  let frontier = [nodeId]

  for (let hop = 0; hop < depth; hop++) {
    const nextFrontier: string[] = []

    for (const currentId of frontier) {
      const edges = adjacency.get(currentId) ?? []

      for (const edge of edges) {
        const neighborId =
          edge.source === currentId ? edge.target : edge.source

        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          nextFrontier.push(neighborId)
        }
      }
    }

    frontier = nextFrontier
  }

  const nodes = [...visited]
    .map((id) => nodeMap.get(id))
    .filter((node): node is GraphNode => node !== undefined)

  const edges = knowledgeGraph.edges.filter(
    (edge) => visited.has(edge.source) && visited.has(edge.target),
  )

  return { nodes, edges }
}

export function getSubgraph(nodeIds: string[]): KnowledgeGraph {
  const idSet = new Set(nodeIds)

  const nodes = nodeIds
    .map((id) => nodeMap.get(id))
    .filter((node): node is GraphNode => node !== undefined)

  const edges = knowledgeGraph.edges.filter(
    (edge) => idSet.has(edge.source) && idSet.has(edge.target),
  )

  return { nodes, edges }
}
