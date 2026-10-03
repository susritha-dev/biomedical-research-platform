import type {
  AssociationDetail,
  BiomedicalEntityType,
  EntityNeighborhood,
  GraphNode,
  SearchResult,
} from '../../types/biomedical'
import type { BiomedicalDataProvider } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim()
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isBiolinkConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
const MONARCH_PROXY_URL = '/api/monarch'

interface ApiSearchResult {
  results: {
    id: string
    type: string
    title: string
    subtitle: string
    description: string
  }[]
  total: number
}

interface ApiEntity {
  id: string
  type: string
  label: string
  description?: string
  metadata?: Record<string, unknown>
}

interface ApiNeighborhood {
  center: ApiEntity
  nodes: ApiEntity[]
  edges: {
    id: string
    source: string
    target: string
    relationship: string
    evidence?: string
    evidenceCodes?: string[]
    primaryKnowledgeSource?: string
    publications?: string[]
    updateDate?: string
  }[]
}

interface ApiAssociationDetail {
  id: string
  source: string
  sourceLabel: string
  sourceCategory: string
  target: string
  targetLabel: string
  targetCategory: string
  relationship: string
  predicate: string
  associationCategory: string
  evidence?: string
  evidenceCodes: string[]
  primaryKnowledgeSource: string
  providedBy: string[]
  publications: string[]
  updateDate: string
  createdDate: string
  evidenceCount: number
}

interface MonarchAssociation {
  id: string
  subject: string
  subject_label?: string
  subject_category?: string
  object: string
  object_label?: string
  object_category?: string
  predicate?: string
  category?: string
  has_evidence?: string[]
  primary_knowledge_source?: string
  publications?: string[]
  update_date?: string
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }
}

function apiUrl(path: string): string {
  return isBiolinkConfigured
    ? `${SUPABASE_URL}/functions/v1/biolink-proxy${path}`
    : `${MONARCH_PROXY_URL}${path}`
}

const VALID_ENTITY_TYPES: Set<string> = new Set([
  'disease',
  'gene',
  'drug',
  'pathway',
  'phenotype',
  'anatomy',
  'function',
  'variant',
])

function normalizeEntityType(type: string): BiomedicalEntityType {
  const normalized = type.replace('biolink:', '').toLowerCase()
  const aliases: Record<string, BiomedicalEntityType> = {
    smallmolecule: 'drug',
    drug: 'drug',
    phenotypicfeature: 'phenotype',
    anatomicalentity: 'anatomy',
    biologicalprocess: 'function',
    molecularactivity: 'function',
    sequencevariant: 'variant',
  }
  return aliases[normalized] ?? coerceEntityType(normalized)
}

function coerceEntityType(type: string): BiomedicalEntityType {
  return (VALID_ENTITY_TYPES.has(type) ? type : 'function') as BiomedicalEntityType
}

function relationshipFor(predicate?: string, category?: string): string {
  const relationships: Record<string, string> = {
    'biolink:has_phenotype': 'has-phenotype',
    'biolink:expressed_in': 'expressed-in',
    'biolink:causes': 'causes',
    'biolink:treats': 'treats',
    'biolink:actively_involved_in': 'participates-in',
    'biolink:participates_in': 'participates-in',
    'biolink:has_participant': 'involves',
    'biolink:related_to': 'related-to',
    'biolink:associated_with': 'associated-with',
    'biolink:genetic_association': 'associated-with',
    'biolink:target_for': 'targets',
    'biolink:interacts_with': 'targets',
  }
  if (predicate && relationships[predicate]) return relationships[predicate]
  if (category?.includes('DiseaseToPhenotypicFeature')) return 'has-phenotype'
  if (category?.includes('DiseaseToGene')) return 'associated-with'
  if (category?.includes('GeneToPathway')) return 'participates-in'
  if (category?.includes('ChemicalToDisease')) return 'treats'
  return 'related-to'
}

function toGraphNode(entity: ApiEntity): GraphNode {
  return {
    id: entity.id,
    type: coerceEntityType(entity.type),
    label: entity.label,
    description: entity.description,
    metadata: entity.metadata,
  }
}

/**
 * Real biomedical data provider backed by the Monarch Initiative API v3.
 * Requests are proxied through a Supabase Edge Function (biolink-proxy) which
 * handles caching in a Postgres table to avoid redundant API calls.
 *
 * Data source: https://api-v3.monarchinitiative.org/v3/api
 * Documentation: https://monarch-app.monarchinitiative.org/FastAPI/Endpoints
 */
export const biolinkProvider: BiomedicalDataProvider = {
  async searchEntities(
    query: string,
    entityTypes?: BiomedicalEntityType[],
    limit = 20,
  ): Promise<SearchResult[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit) })
    if (entityTypes && entityTypes.length > 0) {
      params.set('categories', entityTypes.join(','))
    }

    const res = await fetch(apiUrl(`/search?${params.toString()}`), {
      headers: headers(),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? `Search failed (${res.status})`)
    }

    const data = (await res.json()) as ApiSearchResult & {
      items?: {
        id: string
        category: string
        name?: string
        symbol?: string
        full_name?: string
        description?: string
      }[]
    }
    if (data.items) {
      return data.items.map((item) => ({
        id: item.id,
        type: normalizeEntityType(item.category),
        title: item.name || item.symbol || item.id,
        subtitle: item.full_name ?? item.id,
        description: item.description ?? '',
      }))
    }
    return data.results.map((r) => ({
        id: r.id,
        type: coerceEntityType(r.type),
        title: r.title,
        subtitle: r.subtitle,
        description: r.description,
      }))
  },

  async getEntity(entityId: string): Promise<GraphNode | null> {
    const res = await fetch(apiUrl(`/entity/${encodeURIComponent(entityId)}`), {
      headers: headers(),
    })

    if (!res.ok) return null

    const entity = (await res.json()) as ApiEntity & {
      category?: string
      name?: string
      full_name?: string
    }
    return toGraphNode({
      ...entity,
      type: entity.type ?? normalizeEntityType(entity.category ?? 'function'),
      label: entity.label ?? entity.name ?? entity.full_name ?? entity.id,
    })
  },

  async getEntityNeighborhood(
    entityId: string,
    depth = 1,
  ): Promise<EntityNeighborhood> {
    if (!isBiolinkConfigured) {
      const center = await this.getEntity(entityId)
      if (!center) throw new Error(`Entity not found: ${entityId}`)

      const response = await fetch(
        apiUrl(
          `/entity/${encodeURIComponent(entityId)}/biolink%3AAssociation?limit=500`,
        ),
        { headers: headers() },
      )
      if (!response.ok) {
        throw new Error(`Failed to load connected entities (${response.status})`)
      }
      const data = (await response.json()) as { items?: MonarchAssociation[] }
      const associations = data.items ?? []
      const nodeMap = new Map<string, GraphNode>([[center.id, center]])
      const edges = associations.map((association) => {
        const source = association.subject
        const target = association.object
        const sourceLabel = association.subject_label ?? source
        const targetLabel = association.object_label ?? target
        if (!nodeMap.has(source)) {
          nodeMap.set(source, {
            id: source,
            type: normalizeEntityType(association.subject_category ?? ''),
            label: sourceLabel,
          })
        }
        if (!nodeMap.has(target)) {
          nodeMap.set(target, {
            id: target,
            type: normalizeEntityType(association.object_category ?? ''),
            label: targetLabel,
          })
        }
        return {
          id: association.id,
          source,
          target,
          relationship: relationshipFor(
            association.predicate,
            association.category,
          ) as never,
          evidenceCodes: association.has_evidence,
          primaryKnowledgeSource: association.primary_knowledge_source,
          publications: association.publications,
          updateDate: association.update_date,
        }
      })
      return { center, nodes: [...nodeMap.values()], edges }
    }

    const params = new URLSearchParams({ depth: String(depth) })
    const res = await fetch(
      apiUrl(`/neighborhood/${encodeURIComponent(entityId)}?${params.toString()}`),
      { headers: headers() },
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? `Failed to load neighborhood (${res.status})`)
    }

    const data = (await res.json()) as ApiNeighborhood

    return {
      center: toGraphNode(data.center),
      nodes: data.nodes.map(toGraphNode),
      edges: data.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        relationship: e.relationship as never,
        evidence: e.evidence as never,
        evidenceCodes: e.evidenceCodes,
        primaryKnowledgeSource: e.primaryKnowledgeSource,
        publications: e.publications,
        updateDate: e.updateDate,
      })),
    }
  },

  async getAssociation(associationId: string): Promise<AssociationDetail | null> {
    const res = await fetch(apiUrl(`/association/${encodeURIComponent(associationId)}`), {
      headers: headers(),
    })

    if (!res.ok) return null

    const data = (await res.json()) as ApiAssociationDetail
    return {
      ...data,
      evidence: data.evidence as AssociationDetail['evidence'],
    }
  },
}
