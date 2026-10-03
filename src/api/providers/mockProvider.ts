import type {
  AssociationDetail,
  BiomedicalEntityType,
  EntityNeighborhood,
  GraphNode,
  KnowledgeGraph,
  SearchResult,
} from '../../types/biomedical'
import type { BiomedicalDataProvider } from './types'
import { getFullGraph, getEntityDetail, getGraphForEntity } from '../graphApi'

/**
 * Mock/demo data provider using hardcoded biomedical data.
 * Serves as a fallback when the real API is unavailable.
 */
export const mockProvider: BiomedicalDataProvider = {
  async searchEntities(
    query: string,
    _entityTypes?: BiomedicalEntityType[],
  ): Promise<SearchResult[]> {
    const graph = getFullGraph()
    const q = query.toLowerCase()
    return graph.nodes
      .filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.id.toLowerCase().includes(q),
      )
      .slice(0, 20)
      .map((n) => ({
        id: n.id,
        type: n.type,
        title: n.label,
        subtitle: n.id,
        description: n.description ?? '',
      }))
  },

  async getEntity(entityId: string): Promise<GraphNode | null> {
    const graph = getFullGraph()
    return graph.nodes.find((n) => n.id === entityId) ?? null
  },

  async getEntityNeighborhood(
    entityId: string,
    depth = 1,
  ): Promise<EntityNeighborhood> {
    const subgraph: KnowledgeGraph = getGraphForEntity(entityId, depth)
    const center =
      getEntityDetail(entityId, 'disease') ??
      subgraph.nodes.find((n) => n.id === entityId)

    if (!center) {
      throw new Error(`Entity not found: ${entityId}`)
    }

    return {
      center,
      nodes: subgraph.nodes,
      edges: subgraph.edges,
    }
  },

  async getAssociation(_associationId: string): Promise<AssociationDetail | null> {
    return null
  },
}
