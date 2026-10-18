import {
  ArrowRight,
  Beaker,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  LoaderCircle,
  Network,
  Sparkles,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  ResearchMap,
} from '../types/researchMap'

import {
  analyzeResearchQuestion,
} from '../utils/researchIntelligence'
import { assessEvidence } from '../utils/evidenceQuality'

import './AgentResearchWorkspace.css'

interface AgentResearchWorkspaceProps {
  map: ResearchMap
  onOpenEvidence: () => void
  onOpenConnections: () => void
  onOpenModel: () => void
}

interface EvidenceArticle {
  id: string
  title: string
  source: string
  year: string
  abstract: string
  authors: string[]
  url: string
  doi: string
  pubmedId: string
  citationCount: number
  provider: string
  type: string
  openAccessPdf: string
}

interface EvidenceApiResponse {
  ok?: boolean
  query: string
  articles: EvidenceArticle[]
  errors: string[]
}

type AgentStage =
  | 'understand'
  | 'evidence'
  | 'mechanisms'
  | 'tests'
  | 'summary'

const stageOrder: AgentStage[] = [
  'understand',
  'evidence',
  'mechanisms',
  'tests',
  'summary',
]

function getTopArticle(articles: EvidenceArticle[]) {
  return [...articles].sort(
    (a, b) => Number(b.citationCount || 0) - Number(a.citationCount || 0),
  )[0]
}

function getShortAbstract(abstract: string) {
  if (!abstract) {
    return 'No abstract was returned. Open the source to inspect the paper directly.'
  }

  if (abstract.length <= 260) {
    return abstract
  }

  return `${abstract.slice(0, 260)}…`
}

function getStageTitle(stage: AgentStage) {
  if (stage === 'understand') {
    return 'Understand the question'
  }

  if (stage === 'evidence') {
    return 'Search evidence'
  }

  if (stage === 'mechanisms') {
    return 'Generate mechanisms'
  }

  if (stage === 'tests') {
    return 'Choose next tests'
  }

  return 'Final readout'
}

function getStageProgress(stage: AgentStage) {
  if (stage === 'understand') {
    return 20
  }

  if (stage === 'evidence') {
    return 45
  }

  if (stage === 'mechanisms') {
    return 68
  }

  if (stage === 'tests') {
    return 86
  }

  return 100
}

function getNextStage(stage: AgentStage) {
  const index = stageOrder.indexOf(stage)

  return stageOrder[Math.min(index + 1, stageOrder.length - 1)]
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

export function AgentResearchWorkspace({
  map,
  onOpenEvidence,
  onOpenConnections,
  onOpenModel,
}: AgentResearchWorkspaceProps) {
  const [stage, setStage] = useState<AgentStage>('understand')
  const [completedStages, setCompletedStages] = useState<AgentStage[]>([])
  const [isRunningStage, setIsRunningStage] = useState(true)
  const [articles, setArticles] = useState<EvidenceArticle[]>([])
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false)
  const [evidenceError, setEvidenceError] = useState<string | null>(null)

  const researchAnalysis = useMemo(
    () => analyzeResearchQuestion(map.question, map),
    [map],
  )

  const evidenceQuery = researchAnalysis.evidenceQuery
  const mechanisms = researchAnalysis.mechanisms
  const connections = researchAnalysis.connections
  const topArticle = getTopArticle(articles)
  const topArticleAssessment = topArticle
    ? assessEvidence(topArticle)
    : null
  const bestMechanism = mechanisms[0]
  const bestConnection = connections[0]
  const progress = getStageProgress(stage)

  useEffect(() => {
    let cancelled = false

    async function loadEvidence() {
      setIsLoadingEvidence(true)
      setEvidenceError(null)

      try {
        const response = await fetch(
          `/api/evidence?q=${encodeURIComponent(evidenceQuery)}`,
        )

        if (!response.ok) {
          throw new Error(`Evidence API returned ${response.status}`)
        }

        const data = await response.json() as EvidenceApiResponse

        if (!cancelled) {
          setArticles(data.articles || [])
        }
      } catch (error) {
        if (!cancelled) {
          setEvidenceError(
            error instanceof Error
              ? error.message
              : 'Evidence search failed.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEvidence(false)
        }
      }
    }

    if (evidenceQuery) {
      loadEvidence()
    }

    return () => {
      cancelled = true
    }
  }, [evidenceQuery])

  useEffect(() => {
    setIsRunningStage(true)

    const finishTimer = window.setTimeout(() => {
      setIsRunningStage(false)
      setCompletedStages((current) =>
        current.includes(stage)
          ? current
          : [...current, stage],
      )
    }, 1200)

    return () => {
      window.clearTimeout(finishTimer)
    }
  }, [stage])

  useEffect(() => {
    if (isRunningStage || stage === 'summary') {
      return undefined
    }

    const nextTimer = window.setTimeout(() => {
      setStage(getNextStage(stage))
    }, 850)

    return () => {
      window.clearTimeout(nextTimer)
    }
  }, [isRunningStage, stage])

  return (
    <main className="helix-agent-page">
      <aside className="helix-agent-sidebar">
        <div className="helix-agent-brand">
          <Sparkles size={18} />

          <span>
            Helix
          </span>
        </div>

        <div className="helix-agent-sidebar-question">
          <span>
            Current investigation
          </span>

          <strong>
            {map.question}
          </strong>
        </div>

        <div className="helix-agent-stage-list">
          {stageOrder.map((item, index) => {
            const isActive = item === stage
            const isComplete = completedStages.includes(item)

            return (
              <button
                key={item}
                type="button"
                className={
                  isActive
                    ? 'helix-agent-stage-item helix-agent-stage-item-active'
                    : 'helix-agent-stage-item'
                }
                onClick={() => setStage(item)}
              >
                <span>
                  {isComplete ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>

                <div>
                  <strong>
                    {getStageTitle(item)}
                  </strong>

                  <small>
                    {isActive && isRunningStage
                      ? 'Running…'
                      : isComplete
                        ? 'Complete'
                        : 'Queued'}
                  </small>
                </div>
              </button>
            )
          })}
        </div>

        <nav className="helix-agent-nav">
          <button
            type="button"
            onClick={onOpenEvidence}
          >
            <BookOpen size={15} />

            Evidence
          </button>

          <button
            type="button"
            onClick={onOpenModel}
          >
            <FlaskConical size={15} />

            Model
          </button>

          <button
            type="button"
            onClick={onOpenConnections}
          >
            <Network size={15} />

            Connections
          </button>
        </nav>

        <div className="helix-agent-sidebar-footer">
          <span>
            {formatDomain(researchAnalysis.domain)}
          </span>

          <span>
            {articles.length} sources found
          </span>

          <span>
            {formatReliability(researchAnalysis.reliability)} reliability
          </span>
        </div>
      </aside>

      <section className="helix-agent-main">
        <header className="helix-agent-header">
          <div>
            <span>
              Helix research agent
            </span>

            <h1>
              {getStageTitle(stage)}
            </h1>
          </div>

          <div className="helix-agent-status">
            {isRunningStage ? (
              <>
                <LoaderCircle className="helix-agent-spin" size={16} />

                Running
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />

                Complete
              </>
            )}
          </div>
        </header>

        <section className="helix-agent-progress-section">
          <div className="helix-agent-progress-top">
            <span>
              Investigation progress
            </span>

            <strong>
              {progress}%
            </strong>
          </div>

          <div className="helix-agent-progress-track">
            <i style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="helix-agent-content">
          {stage === 'understand' && (
            <article className="helix-agent-panel helix-agent-panel-large">
              <span className="helix-agent-label">
                Question analysis
              </span>

              <h2>
                I’m checking how specific and reliable this investigation can be.
              </h2>

              <p>
                The topic is <strong>{researchAnalysis.topicLabel}</strong>.{' '}
                {researchAnalysis.explanation}
              </p>

              {researchAnalysis.suggestedBetterQuestion && (
                <p>
                  <strong>Suggested improvement:</strong>{' '}
                  {researchAnalysis.suggestedBetterQuestion}
                </p>
              )}

              <div className="helix-agent-grid">
                <div>
                  <span>
                    Research question
                  </span>

                  <strong>
                    {map.question}
                  </strong>
                </div>

                <div>
                  <span>
                    Question type
                  </span>

                  <strong>
                    {formatDomain(researchAnalysis.questionType)}
                  </strong>
                </div>

                <div>
                  <span>
                    Domain
                  </span>

                  <strong>
                    {formatDomain(researchAnalysis.domain)}
                  </strong>
                </div>

                <div>
                  <span>
                    Reliability
                  </span>

                  <strong>
                    {formatReliability(researchAnalysis.reliability)}
                  </strong>
                </div>
              </div>

              <div className="helix-agent-grid">
                <div>
                  <span>
                    Answer goal
                  </span>

                  <strong>
                    {researchAnalysis.shortAnswerGoal}
                  </strong>
                </div>

                <div>
                  <span>
                    Evidence query
                  </span>

                  <strong>
                    {evidenceQuery}
                  </strong>
                </div>

                <div>
                  <span>
                    Entities detected
                  </span>

                  <strong>
                    {researchAnalysis.entities.length > 0
                      ? researchAnalysis.entities
                          .map((entity) => entity.label)
                          .join(', ')
                      : 'None detected'}
                  </strong>
                </div>

                <div>
                  <span>
                    Connection claims
                  </span>

                  <strong>
                    {connections.length}
                  </strong>
                </div>
              </div>
            </article>
          )}

          {stage === 'evidence' && (
            <article className="helix-agent-panel helix-agent-panel-large">
              <span className="helix-agent-label">
                Evidence search
              </span>

              <h2>
                I’m checking whether sources support the claim.
              </h2>

              {isLoadingEvidence && (
                <p>
                  Searching scholarly metadata from the backend...
                </p>
              )}

              {evidenceError && (
                <p className="helix-agent-error">
                  Evidence error: {evidenceError}
                </p>
              )}

              {!isLoadingEvidence && !evidenceError && (
                <>
                  <p>
                    I found <strong>{articles.length}</strong> candidate
                    sources. The important question is whether those sources
                    directly support the relationship, mechanism, or claim —
                    not whether they merely mention similar words.
                  </p>

                  {topArticle && (
                    <div className="helix-agent-paper">
                      <span>
                        {topArticle.provider} · {topArticle.year} ·{' '}
                        {topArticle.citationCount} citations
                      </span>

                      {topArticleAssessment && (
                        <p>
                          Source: {topArticleAssessment.sourceLabel}.{' '}
                          Evidence: {topArticleAssessment.strengthLabel}.{' '}
                          {topArticleAssessment.strengthReason}
                        </p>
                      )}

                      <h3>
                        {topArticle.title}
                      </h3>

                      <p>
                        {getShortAbstract(topArticle.abstract)}
                      </p>

                      <a
                        href={topArticle.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open source

                        <ArrowRight size={15} />
                      </a>
                    </div>
                  )}
                </>
              )}
            </article>
          )}

          {stage === 'mechanisms' && (
            <article className="helix-agent-panel">
              <span className="helix-agent-label">
                Hypothesis portfolio
              </span>

              <h2>
                I’m separating possible mechanisms from proven claims.
              </h2>

              <p>
                These are working hypotheses. Helix should only treat them as
                stronger after the Evidence tab shows direct source support.
              </p>

              <div className="helix-agent-mechanism-list">
                {mechanisms.map((mechanism, index) => (
                  <div
                    key={mechanism.id}
                    className="helix-agent-mechanism-card"
                  >
                    <span>
                      H{index + 1} · {mechanism.confidence}% confidence
                    </span>

                    <h3>
                      {mechanism.title}
                    </h3>

                    <p>
                      {mechanism.summary}
                    </p>

                    <p>
                      <strong>Evidence needed:</strong>{' '}
                      {mechanism.evidenceNeeded}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {stage === 'tests' && (
            <article className="helix-agent-panel helix-agent-panel-large">
              <span className="helix-agent-label">
                Next best test
              </span>

              <h2>
                Now I’m choosing what would reduce uncertainty fastest.
              </h2>

              <p>
                The strongest next step is:{' '}
                <strong>{bestMechanism?.nextTest}</strong>
              </p>

              <div className="helix-agent-grid">
                <div>
                  <span>
                    Best relationship to verify
                  </span>

                  <strong>
                    {bestConnection
                      ? `${bestConnection.source} → ${bestConnection.target}`
                      : 'No specific connection detected'}
                  </strong>
                </div>

                <div>
                  <span>
                    Why it matters
                  </span>

                  <strong>
                    {bestConnection?.whyItMatters ||
                      'The question needs a more specific relationship.'}
                  </strong>
                </div>

                <div>
                  <span>
                    Evidence needed
                  </span>

                  <strong>
                    {bestConnection?.evidenceNeeded ||
                      'A source that directly supports the claim.'}
                  </strong>
                </div>

                <div>
                  <span>
                    Uncertainty
                  </span>

                  <strong>
                    {bestConnection?.uncertainty ||
                      'The current claim is low-confidence.'}
                  </strong>
                </div>
              </div>
            </article>
          )}

          {stage === 'summary' && (
            <div className="helix-results-dashboard">
              <div className="helix-results-welcome">
                <span className="helix-agent-label"><CheckCircle2 size={15} /> Investigation overview</span>
                <h2>Research overview</h2>
                <p>{map.question}</p>
              </div>

              <div className="helix-results-stats" aria-label="Research summary metrics">
                <div><span>Candidate papers</span><strong>{articles.length}</strong></div>
                <div><span>Potential mechanisms</span><strong>{mechanisms.length}</strong></div>
                <div><span>Connections explored</span><strong>{connections.length}</strong></div>
                <div><span>Analysis reliability</span><strong>{formatReliability(researchAnalysis.reliability)}</strong></div>
              </div>

              <div className="helix-results-main-grid">
                <section className="helix-results-card helix-results-finding">
                  <span className="helix-agent-label">Featured hypothesis · requires verification</span>
                  <h3>{bestMechanism?.title || 'No specific mechanism identified'}</h3>
                  <p>{bestMechanism?.summary || 'Inspect the evidence and research map to develop a more specific hypothesis.'}</p>
                  <small>Computationally suggested, not a validated scientific conclusion.</small>
                </section>
                <section className="helix-results-card">
                  <span className="helix-agent-label">Explore your results</span>
                  <div className="helix-results-links">
                    <button type="button" onClick={onOpenEvidence}>
                      <BookOpen size={19} /><span><strong>Scientific evidence</strong><small>Review publications and sources</small></span><ArrowRight size={17} />
                    </button>
                    <button type="button" onClick={onOpenModel}>
                      <Beaker size={19} /><span><strong>Biological model</strong><small>Explore an educational visualization</small></span><ArrowRight size={17} />
                    </button>
                    <button type="button" onClick={onOpenConnections}>
                      <Network size={19} /><span><strong>Research connections</strong><small>Inspect linked concepts and claims</small></span><ArrowRight size={17} />
                    </button>
                  </div>
                </section>
              </div>

              <section className="helix-results-card helix-results-notes">
                <span className="helix-agent-label">What to verify next</span>
                <p>{bestMechanism?.nextTest || 'Examine primary sources and identify testable predictions before drawing conclusions.'}</p>
                {researchAnalysis.limitations.length > 0 && (
                  <details>
                    <summary>Limitations and reliability notes ({researchAnalysis.limitations.length})</summary>
                    <ul>{researchAnalysis.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
                  </details>
                )}
              </section>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
