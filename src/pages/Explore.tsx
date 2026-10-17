import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  FlaskConical,
  FolderPlus,
  Home,
  LoaderCircle,
  Network,
  Search,
  Sparkles,
} from 'lucide-react'

import {
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useAuthSession } from '../auth/AuthSession'

import { AgentResearchWorkspace } from '../components/AgentResearchWorkspace'
import { EvidenceWorkspace } from '../components/EvidenceWorkspace'
import { ResearchVisualization } from '../components/ResearchVisualization'
import { generateResearchMap } from '../utils/generateResearchMap'
import { analyzeResearchQuestion } from '../utils/researchIntelligence'
import {
  createResearchProject,
  getResearchProject,
  saveResearchProject,
} from '../utils/researchProjectStorage'

import type {
  ResearchMap,
  ResearchNode,
} from '../types/researchMap'
import type { ResearchWorkspaceTab } from '../types/researchProject'

import './Explore.css'

type WorkspaceTab =
  | 'agent'
  | 'evidence'
  | 'visualize'
  | 'connections'

interface GraphEvidenceContext {
  sourceId: string
  sourceLabel: string
  sourceType: string
  targetId: string
  targetLabel: string
  targetType: string
  relationship: string
  associationId: string
  evidenceCodes: string[]
  knowledgeSource: string
  question: string
}

function readGraphEvidenceContext(params: URLSearchParams): GraphEvidenceContext | null {
  const sourceLabel = params.get('sourceLabel')?.trim()
  const targetLabel = params.get('targetLabel')?.trim()
  const relationship = params.get('relationship')?.trim()
  if (!sourceLabel || !targetLabel || !relationship) return null

  const sourceType = params.get('sourceType')?.trim() ?? ''
  const targetType = params.get('targetType')?.trim() ?? ''
  const readableRelationship = relationship.replace(/-/g, ' ')

  return {
    sourceId: params.get('sourceId') ?? '',
    sourceLabel,
    sourceType,
    targetId: params.get('targetId') ?? '',
    targetLabel,
    targetType,
    relationship,
    associationId: params.get('associationId') ?? '',
    evidenceCodes: (params.get('evidenceCodes') ?? '').split(',').filter(Boolean),
    knowledgeSource: params.get('knowledgeSource') ?? '',
    question: `What evidence supports the relationship between ${sourceLabel} and ${targetLabel} (${readableRelationship})?`,
  }
}

function createFallbackMap(question: string): ResearchMap {
  const fallbackMap = {
    question,
    domain: 'Biomedical Science',
    nodes: [
      {
        id: 'question',
        type: 'question',
        domain: 'Biomedical Science',
        label: question,
        subtitle: 'Research question',
        description:
          'The main investigation question submitted by the user.',
        evidenceStrength: 'unknown',
        sourceIds: [],
      },
      {
        id: 'mechanism',
        type: 'mechanism',
        domain: 'Biomedical Science',
        label: 'Candidate mechanism',
        subtitle: 'Possible explanation',
        description:
          'A mechanism is a possible explanation for how or why the biological relationship occurs.',
        evidenceStrength: 'unknown',
        sourceIds: [],
      },
      {
        id: 'evidence',
        type: 'evidence',
        domain: 'Biomedical Science',
        label: 'Evidence base',
        subtitle: 'Scholarly sources',
        description:
          'This concept represents the papers, abstracts, citations, and source metadata used to evaluate the claim.',
        evidenceStrength: 'unknown',
        sourceIds: [],
      },
      {
        id: 'test',
        type: 'experiment',
        domain: 'Biomedical Science',
        label: 'Testable experiment',
        subtitle: 'Next experiment',
        description:
          'A useful research agent should suggest what experiment or comparison would best test the mechanism.',
        evidenceStrength: 'limited',
        sourceIds: [],
      },
    ],
    edges: [
      {
        id: 'edge-question-mechanism',
        sourceIds: ['question'],
        targetIds: ['mechanism'],
        label: 'generates',
        explanation:
          'The research question generates a candidate mechanism that needs to be verified.',
        evidenceStrength: 'unknown',
      },
      {
        id: 'edge-mechanism-evidence',
        sourceIds: ['mechanism'],
        targetIds: ['evidence'],
        label: 'requires evidence',
        explanation:
          'A mechanism should be checked against scholarly evidence before being treated as reliable.',
        evidenceStrength: 'unknown',
      },
      {
        id: 'edge-evidence-test',
        sourceIds: ['evidence'],
        targetIds: ['test'],
        label: 'suggests',
        explanation:
          'Evidence gaps can point toward the next useful experiment or verification step.',
        evidenceStrength: 'limited',
      },
    ],
    sources: [],
  }

  return fallbackMap as unknown as ResearchMap
}

function getNodeIcon(node: ResearchNode) {
  const text = `${node.type} ${node.label}`.toLowerCase()

  if (
    text.includes('evidence') ||
    text.includes('paper') ||
    text.includes('source')
  ) {
    return <BookOpen size={18} />
  }

  if (
    text.includes('experiment') ||
    text.includes('test') ||
    text.includes('drug') ||
    text.includes('protein')
  ) {
    return <FlaskConical size={18} />
  }

  if (
    text.includes('brain') ||
    text.includes('disease') ||
    text.includes('neuro')
  ) {
    return <Brain size={18} />
  }

  return <Sparkles size={18} />
}

function getEvidenceLabel(value: ResearchNode['evidenceStrength']) {
  if (!value || value === 'unknown') {
    return 'Needs verification'
  }

  if (value === 'limited') {
    return 'Limited evidence'
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)} evidence`
}

function getEvidenceClass(value: ResearchNode['evidenceStrength']) {
  if (value === 'strong') {
    return 'helix-connection-pill-strong'
  }

  if (value === 'moderate') {
    return 'helix-connection-pill-moderate'
  }

  if (value === 'limited') {
    return 'helix-connection-pill-limited'
  }

  return 'helix-connection-pill-unknown'
}

function formatDomain(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatReliability(value: string) {
  if (value === 'specific') {
    return 'Specific'
  }

  if (value === 'partial') {
    return 'Partial'
  }

  return 'Limited'
}

function ConnectionsView({
  map,
}: {
  map: ResearchMap
}) {
  const researchAnalysis = useMemo(
    () => analyzeResearchQuestion(map.question, map),
    [map],
  )

  const visibleNodes = useMemo(
    () =>
      map.nodes
        .filter((node) => node.type !== 'question')
        .slice(0, 6),
    [map],
  )

  return (
    <main className="helix-connections-page">
      <section className="helix-connections-shell">
        <header className="helix-connections-hero">
          <span className="helix-connections-kicker">
            Evidence-aware connections
          </span>

          <h1>
            Relationship claims for {researchAnalysis.topicLabel}.
          </h1>

          <p>
            {researchAnalysis.explanation}
          </p>
        </header>

        <section className="helix-connections-question">
          <span>
            Research question
          </span>

          <strong>
            {map.question}
          </strong>
        </section>

        <section className="helix-connections-summary-grid">
          <article>
            <span>
              Domain
            </span>

            <strong>
              {formatDomain(researchAnalysis.domain)}
            </strong>
          </article>

          <article>
            <span>
              Question type
            </span>

            <strong>
              {formatDomain(researchAnalysis.questionType)}
            </strong>
          </article>

          <article>
            <span>
              Reliability
            </span>

            <strong>
              {formatReliability(researchAnalysis.reliability)}
            </strong>
          </article>

          <article>
            <span>
              Evidence query
            </span>

            <strong>
              {researchAnalysis.evidenceQuery}
            </strong>
          </article>
        </section>

        <section className="helix-connections-grid">
          <div className="helix-connections-column">
            <div className="helix-connections-section-heading">
              <span>
                Key concepts from map
              </span>

              <strong>
                {visibleNodes.length}
              </strong>
            </div>

            <div className="helix-connection-card-list">
              {visibleNodes.map((node, index) => (
                <article
                  key={node.id}
                  className="helix-connection-card"
                >
                  <div className="helix-connection-card-top">
                    <div className="helix-connection-icon">
                      {getNodeIcon(node)}
                    </div>

                    <span>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <small>
                    {node.type}
                  </small>

                  <h2>
                    {node.label}
                  </h2>

                  <p>
                    {node.description ||
                      node.subtitle ||
                      'Concept generated from the research question.'}
                  </p>

                  <em className={getEvidenceClass(node.evidenceStrength)}>
                    {getEvidenceLabel(node.evidenceStrength)}
                  </em>
                </article>
              ))}
            </div>
          </div>

          <div className="helix-connections-column">
            <div className="helix-connections-section-heading">
              <span>
                Deeper relationship claims
              </span>

              <strong>
                {researchAnalysis.connections.length}
              </strong>
            </div>

            <div className="helix-relationship-list">
              {researchAnalysis.connections.map((connection, index) => (
                <article
                  key={connection.id}
                  className="helix-relationship-card"
                >
                  <div className="helix-relationship-number">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div>
                    <h3>
                      {connection.source} → {connection.target}
                    </h3>

                    <p>
                      {connection.claim}
                    </p>

                    <div className="helix-relationship-detail-grid">
                      <section>
                        <span>
                          Why it matters
                        </span>

                        <strong>
                          {connection.whyItMatters}
                        </strong>
                      </section>

                      <section>
                        <span>
                          Evidence needed
                        </span>

                        <strong>
                          {connection.evidenceNeeded}
                        </strong>
                      </section>

                      <section>
                        <span>
                          Uncertainty
                        </span>

                        <strong>
                          {connection.uncertainty}
                        </strong>
                      </section>

                      <section>
                        <span>
                          Next verification
                        </span>

                        <strong>
                          {connection.nextVerificationStep}
                        </strong>
                      </section>
                    </div>

                    <em className="helix-relationship-confidence">
                      {connection.confidence}% confidence · hypothesis, not proven
                    </em>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default function Explore() {
  const navigate = useNavigate()
  const { projectId: routeProjectId } = useParams()
  const [searchParams] = useSearchParams()
  const { userId } = useAuthSession()
  const graphContext = useMemo(
    () => readGraphEvidenceContext(searchParams),
    [searchParams],
  )
  const graphContextKey = graphContext?.associationId || (
    graphContext
      ? `${graphContext.sourceId}:${graphContext.targetId}:${graphContext.relationship}`
      : ''
  )
  const startedGraphContext = useRef('')

  const [question, setQuestion] = useState(graphContext?.question ?? '')
  const [map, setMap] = useState<ResearchMap | null>(null)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('agent')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!graphContext || !graphContextKey || startedGraphContext.current === graphContextKey) return
    startedGraphContext.current = graphContextKey
    setQuestion(graphContext.question)
    setActiveTab('evidence')
    setIsGenerating(true)
    setError(null)

    try {
      setMap(generateResearchMap(graphContext.question))
    } catch (generationError) {
      console.error('Graph relationship investigation failed:', generationError)
      setMap(createFallbackMap(graphContext.question))
    } finally {
      setIsGenerating(false)
    }
  }, [graphContext, graphContextKey])

  useEffect(() => {
    if (!routeProjectId || !userId) {
      setCurrentProjectId(null)
      return
    }

    const project = getResearchProject(routeProjectId, userId)
    if (!project) {
      navigate('/projects', { replace: true })
      return
    }

    setCurrentProjectId(project.id)
    setQuestion(project.question)
    setMap(project.researchMap)
    setActiveTab(project.activeTab ?? 'agent')
  }, [navigate, routeProjectId, userId])

  useEffect(() => {
    if (!map || !currentProjectId || !userId) return
    saveResearchProject({
      userId,
      projectId: currentProjectId,
      map,
      expandedNodeIds: [],
      activeTab,
    })
  }, [activeTab, currentProjectId, map, userId])

  function saveProject(mapToSave: ResearchMap, tab: ResearchWorkspaceTab = activeTab) {
    if (!userId) return

    const project = currentProjectId
      ? saveResearchProject({
          userId,
          projectId: currentProjectId,
          map: mapToSave,
          expandedNodeIds: [],
          activeTab: tab,
        })
      : createResearchProject({
          userId,
          map: mapToSave,
          expandedNodeIds: [],
          activeTab: tab,
        })

    if (!project) {
      setError('This saved project is no longer available in your account.')
      return
    }

    setCurrentProjectId(project.id)
    setSaveMessage('Saved to Projects')
    if (routeProjectId !== project.id) {
      navigate(`/explore/${project.id}`, { replace: true })
    }
  }

  function saveQuestion() {
    const cleanedQuestion = question.trim()
    if (!cleanedQuestion) return
    const questionMap = createFallbackMap(cleanedQuestion)
    setMap(questionMap)
    setActiveTab('agent')
    saveProject(questionMap, 'agent')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanedQuestion = question.trim()

    if (!cleanedQuestion) {
      setError('Enter a research question first.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const generatedMap = await generateResearchMap(cleanedQuestion)

      setMap(generatedMap)
      setActiveTab('agent')
      if (currentProjectId && userId) {
        saveResearchProject({
          userId,
          projectId: currentProjectId,
          map: generatedMap,
          expandedNodeIds: [],
          activeTab: 'agent',
        })
      }
    } catch (generationError) {
      console.error('Research map generation failed:', generationError)

      setMap(createFallbackMap(cleanedQuestion))
      setActiveTab('agent')
    } finally {
      setIsGenerating(false)
    }
  }

  function startNewQuestion() {
    setCurrentProjectId(null)
    setSaveMessage('')
    setQuestion('')
    setMap(null)
    setActiveTab('agent')
    setError(null)
    if (routeProjectId || graphContext) navigate('/explore', { replace: true })
  }

  if (!map) {
    return (
      <main className="helix-explore-entry">
        <header className="helix-explore-entry-nav">
          <Link
            to="/"
            className="helix-explore-brand"
          >
            Helix
          </Link>

          <nav>
            <Link to="/projects">
              Projects
            </Link>

            <Link to="/hypotheses">
              Hypotheses
            </Link>
          </nav>
        </header>

        <section className="helix-explore-entry-center">
          {graphContext && <GraphContextBanner context={graphContext} />}
          <div className="helix-explore-kicker">
            <Sparkles size={16} />

            AI research agent
          </div>

          <h1>
            Ask Helix to investigate a scientific question.
          </h1>

          <p>
            Helix turns a research question into a step-by-step investigation:
            question parsing, evidence search, mechanism generation, tests,
            and a final readout.
          </p>

          <form
            className="helix-explore-form"
            onSubmit={handleSubmit}
          >
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: What evidence connects SOD1 to ALS?"
              rows={5}
            />

            <button
              type="submit"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <LoaderCircle
                    className="helix-explore-spin"
                    size={18}
                  />

                  Starting investigation...
                </>
              ) : (
                <>
                  <Search size={18} />

                  Start investigation
                </>
              )}
            </button>

            <button
              type="button"
              className="helix-explore-save-question"
              onClick={saveQuestion}
              disabled={!question.trim()}
            >
              <FolderPlus size={17} />
              Save question to Projects
            </button>
          </form>

          {error && (
            <p className="helix-explore-error">
              {error}
            </p>
          )}

          <div className="helix-explore-examples">
            <button
              type="button"
              onClick={() => setQuestion('What evidence connects SOD1 to ALS?')}
            >
              SOD1 and ALS
            </button>

            <button
              type="button"
              onClick={() => setQuestion('How does CRISPR-Cas9 target DNA?')}
            >
              CRISPR-Cas9
            </button>

            <button
              type="button"
              onClick={() => setQuestion('How does traumatic brain injury affect the brain?')}
            >
              TBI and brain injury
            </button>

            <button
              type="button"
              onClick={() => setQuestion('How does a drug bind to a protein receptor?')}
            >
              Drug-receptor binding
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="helix-explore-workspace">
      <header className="helix-explore-topbar">
        <div className="helix-explore-topbar-left">
          <button
            type="button"
            onClick={startNewQuestion}
          >
            <ArrowLeft size={16} />

            New question
          </button>

          <Link to="/">
            <Home size={16} />

            Home
          </Link>

          <button
            type="button"
            onClick={() => navigate('/projects')}
          >
            Projects
          </button>

          <button
            type="button"
            onClick={() => map && saveProject(map)}
          >
            {currentProjectId ? <Check size={16} /> : <FolderPlus size={16} />}
            {currentProjectId ? 'Save changes' : 'Save to Projects'}
          </button>
          {saveMessage && <span role="status">{saveMessage}</span>}
        </div>

        <nav className="helix-explore-tabs">
          <button
            type="button"
            className={activeTab === 'agent' ? 'helix-explore-tab-active' : ''}
            onClick={() => setActiveTab('agent')}
          >
            <Sparkles size={16} />

            Agent
          </button>

          <button
            type="button"
            className={activeTab === 'evidence' ? 'helix-explore-tab-active' : ''}
            onClick={() => setActiveTab('evidence')}
          >
            <BookOpen size={16} />

            Evidence
          </button>

          <button
            type="button"
            className={activeTab === 'visualize' ? 'helix-explore-tab-active' : ''}
            onClick={() => setActiveTab('visualize')}
          >
            <FlaskConical size={16} />

            Model
          </button>

          <button
            type="button"
            className={activeTab === 'connections' ? 'helix-explore-tab-active' : ''}
            onClick={() => setActiveTab('connections')}
          >
            <Network size={16} />

            Connections
          </button>
        </nav>
      </header>

      <section className="helix-explore-content">
        {graphContext && <GraphContextBanner context={graphContext} />}
        {activeTab === 'agent' && (
          <AgentResearchWorkspace
            map={map}
            onOpenEvidence={() => setActiveTab('evidence')}
            onOpenConnections={() => setActiveTab('connections')}
            onOpenModel={() => setActiveTab('visualize')}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceWorkspace
            map={map}
            onOpenMap={() => setActiveTab('connections')}
          />
        )}

        {activeTab === 'visualize' && (
          <ResearchVisualization
            map={map}
            onOpenMap={() => setActiveTab('connections')}
          />
        )}

        {activeTab === 'connections' && (
          <ConnectionsView map={map} />
        )}
      </section>
    </main>
  )
}

function GraphContextBanner({ context }: { context: GraphEvidenceContext }) {
  return (
    <aside className="helix-graph-evidence-context" aria-label="Relationship from knowledge graph">
      <span>From Knowledge Graph</span>
      <strong>
        {context.sourceLabel}{context.sourceType ? ` (${context.sourceType})` : ''}
        {' '}{context.relationship.replace(/-/g, ' ')}{' '}
        {context.targetLabel}{context.targetType ? ` (${context.targetType})` : ''}
      </strong>
      {(context.evidenceCodes.length > 0 || context.knowledgeSource) && (
        <small>
          {context.evidenceCodes.length > 0 && `Evidence codes: ${context.evidenceCodes.join(', ')}`}
          {context.evidenceCodes.length > 0 && context.knowledgeSource && ' · '}
          {context.knowledgeSource && `Knowledge source: ${context.knowledgeSource}`}
        </small>
      )}
    </aside>
  )
}
