import { useCallback, useRef, useState } from 'react'
import type {
  EntityNeighborhood,
  KnowledgeGraph,
  SearchResult,
} from '../types/biomedical'
import { createDataProvider } from '../api/providers'
import type { DataProviderType } from '../types/biomedical'
import { getFullGraph } from '../api/graphApi'

interface UseGraphDataState {
  graph: KnowledgeGraph | null
  loading: boolean
  error: string | null
  empty: boolean
  searchResults: SearchResult[]
  searching: boolean
  searchError: string | null
  centerEntityId: string | null
}

export function useGraphData(providerType: DataProviderType = 'biolink') {
  const provider = useRef(createDataProvider(providerType)).current

  const [state, setState] = useState<UseGraphDataState>({
    graph: getFullGraph(),
    loading: false,
    error: null,
    empty: false,
    searchResults: [],
    searching: false,
    searchError: null,
    centerEntityId: null,
  })

  const loadNeighborhood = useCallback(
    async (entityId: string, depth = 1) => {
      setState((s) => ({
        ...s,
        loading: true,
        error: null,
        empty: false,
        centerEntityId: entityId,
      }))

      try {
        const hood: EntityNeighborhood =
          await provider.getEntityNeighborhood(entityId, depth)
        const graph: KnowledgeGraph = {
          nodes: [hood.center, ...hood.nodes.filter((n) => n.id !== hood.center.id)],
          edges: hood.edges,
        }

        setState((s) => ({
          ...s,
          graph,
          loading: false,
          empty: graph.nodes.length <= 1 && graph.edges.length === 0,
        }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load graph data'
        setState((s) => ({
          ...s,
          graph: null,
          loading: false,
          error: message,
          empty: false,
        }))
      }
    },
    [provider],
  )

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setState((s) => ({ ...s, searchResults: [], searchError: null }))
        return
      }

      setState((s) => ({ ...s, searching: true, searchError: null }))

      try {
        const results = await provider.searchEntities(query)
        setState((s) => ({
          ...s,
          searchResults: results,
          searching: false,
        }))
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Search failed'
        setState((s) => ({
          ...s,
          searchResults: [],
          searching: false,
          searchError: message,
        }))
      }
    },
    [provider],
  )

  const clearSearch = useCallback(() => {
    setState((s) => ({
      ...s,
      searchResults: [],
      searchError: null,
      searching: false,
    }))
  }, [])

  return {
    ...state,
    loadNeighborhood,
    search,
    clearSearch,
  }
}
