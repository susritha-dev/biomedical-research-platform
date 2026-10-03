import type {
  AssociationDetail,
  BiomedicalEntityType,
  EntityNeighborhood,
  GraphNode,
  SearchResult,
} from '../../types/biomedical'

export interface BiomedicalDataProvider {
  searchEntities(
    query: string,
    entityTypes?: BiomedicalEntityType[],
    limit?: number,
  ): Promise<SearchResult[]>

  getEntityNeighborhood(
    entityId: string,
    depth?: number,
  ): Promise<EntityNeighborhood>

  getEntity(entityId: string): Promise<GraphNode | null>

  getAssociation(associationId: string): Promise<AssociationDetail | null>
}
