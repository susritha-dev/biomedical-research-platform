import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Database } from 'lucide-react'
import { KnowledgeGraphView } from '../components/graph/KnowledgeGraphView'
import { GraphSearchBar } from '../components/GraphSearchBar'
import { SearchResultsPanel } from '../components/graph/SearchResultsPanel'
import { useGraphData } from '../hooks/useGraphData'
import type { SearchResult } from '../types/biomedical'
import './GraphPage.css'

export function GraphPage() {
  const {
    graph,
    loading,
    error,
    empty,
    searchResults,
    searching,
    searchError,
    loadNeighborhood,
    search,
    clearSearch,
    centerEntityId,
  } = useGraphData('biolink')

  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result)
    loadNeighborhood(result.id, 1)
  }

  const handleNodeExpand = (entityId: string) => {
    loadNeighborhood(entityId, 1)
  }

  const handleClosePanel = () => {
    setSelectedResult(null)
  }

  return (
    <div className="kg-page">
      <header className="kg-header">
        <div className="kg-header-left">
          <Link to="/" className="kg-header-brand">Helix</Link>
          <span className="kg-header-sep">/</span>
          <span className="kg-header-title">Knowledge Graph</span>
        </div>
        <Link to="/" className="kg-header-back">
          <ArrowLeft size={13} />
          Back
        </Link>
      </header>

      <div className="kg-search-bar">
        <GraphSearchBar
          searchResults={searchResults}
          searching={searching}
          searchError={searchError}
          onSearch={search}
          onSelect={handleSelectResult}
          onClear={clearSearch}
        />
      </div>

      <main className="kg-main">
        <KnowledgeGraphView
          graph={graph}
          loading={loading}
          error={error}
          empty={empty}
          onNodeExpand={handleNodeExpand}
          searchResultsPanel={
            selectedResult && graph ? (
              <SearchResultsPanel
                result={selectedResult}
                graphNodes={graph.nodes}
                graphEdges={graph.edges}
                centerNodeId={centerEntityId}
                onNodeSelect={handleNodeExpand}
                onClose={handleClosePanel}
              />
            ) : null
          }
        />
      </main>

      <footer className="kg-footer">
        <span className="kg-footer-source">
          <Database size={11} />
          Monarch Initiative API
        </span>
        <span className="kg-footer-note">
          Data from the Monarch Knowledge Graph. For research and educational use only.
        </span>
      </footer>
    </div>
  )
}
