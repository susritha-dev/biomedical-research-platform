import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { KnowledgeGraphView } from '../components/graph/KnowledgeGraphView'
import './GraphPage.css'

export function GraphPage() {
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

      <main className="kg-main">
        <KnowledgeGraphView />
      </main>

      <footer className="kg-footer">
        <span className="kg-footer-label">Development dataset</span>
        <span className="kg-footer-note">
          For research and educational use. Relationships require independent scientific validation.
        </span>
      </footer>
    </div>
  )
}
