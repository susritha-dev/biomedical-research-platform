import {
  lazy,
  Suspense,
  useMemo,
  useState,
} from 'react'

import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  FolderKanban,
  FlaskConical,
  Home as HomeIcon,
  Lightbulb,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'

import {
  Home,
} from './pages/Home'

import Explore from './pages/Explore'
import { Auth } from './pages/Auth'
import { AuthCallback } from './pages/AuthCallback'
import { Projects } from './pages/Projects'
import { useAuthSession } from './auth/AuthSession'

import './App.css'

interface ResearchNode {
  id: string
  label: string
  subtitle?: string
  description?: string
  type?: string
  domain?: string
  evidenceStrength?: string
  metadata?: Record<string, unknown>
}

interface ResearchEdge {
  id: string
  sourceId: string
  targetId: string
  label: string
  explanation?: string
  evidenceStrength?: string
}

interface ResearchMap {
  question: string
  domain: string
  nodes: ResearchNode[]
  edges: ResearchEdge[]
}

interface StoredResearchProject {
  version: 1
  id: string
  title: string
  question: string
  researchMap: ResearchMap
  expandedNodeIds: string[]
  createdAt: string
  updatedAt: string
}

type GraphNodeType =
  | 'disease'
  | 'gene'
  | 'pathway'
  | 'drug'

interface DiscoveryNode {
  id: string
  label: string
  type: GraphNodeType
  description: string
  x: number
  y: number
}

interface DiscoveryEdge {
  id: string
  sourceId: string
  targetId: string
  label: string
}

const PROJECTS_KEY =
  'helix.researchProjects.v1'

const GraphPage = lazy(() =>
  import('./pages/GraphPage').then(({ GraphPage }) => ({
    default: GraphPage,
  })),
)

const ACTIVE_PROJECT_ID_KEY =
  'helix.activeProjectId.v1'

const discoveryNodes: DiscoveryNode[] = [
  {
    id: 'als',
    label: 'ALS',
    type: 'disease',
    description:
      'A neurodegenerative disease affecting motor neurons and movement.',
    x: 50,
    y: 18,
  },
  {
    id: 'parkinsons',
    label: "Parkinson's Disease",
    type: 'disease',
    description:
      'A neurodegenerative disease connected to motor symptoms and protein-related mechanisms.',
    x: 63,
    y: 24,
  },
  {
    id: 'sod1',
    label: 'SOD1',
    type: 'gene',
    description:
      'A gene associated with some inherited forms of ALS.',
    x: 75,
    y: 42,
  },
  {
    id: 'fus',
    label: 'FUS',
    type: 'gene',
    description:
      'A gene linked to RNA biology and some ALS-related research.',
    x: 82,
    y: 55,
  },
  {
    id: 'tardbp',
    label: 'TARDBP',
    type: 'gene',
    description:
      'A gene connected to TDP-43 biology and neurodegeneration research.',
    x: 77,
    y: 68,
  },
  {
    id: 'lrrk2',
    label: 'LRRK2',
    type: 'gene',
    description:
      'A gene strongly studied in Parkinson’s disease research.',
    x: 63,
    y: 72,
  },
  {
    id: 'oxidative',
    label: 'Oxidative Stress',
    type: 'pathway',
    description:
      'A biological stress pathway often studied in neurodegeneration.',
    x: 41,
    y: 82,
  },
  {
    id: 'protein',
    label: 'Protein Homeostasis',
    type: 'pathway',
    description:
      'The system cells use to maintain protein folding, quality control, and clearance.',
    x: 28,
    y: 75,
  },
  {
    id: 'amyloid',
    label: 'Amyloid Processing',
    type: 'pathway',
    description:
      'A pathway relevant to protein aggregation and neurodegenerative disease research.',
    x: 23,
    y: 58,
  },
  {
    id: 'riluzole',
    label: 'Riluzole',
    type: 'drug',
    description:
      'A drug used in ALS care and commonly discussed in therapeutic research.',
    x: 20,
    y: 34,
  },
  {
    id: 'edaravone',
    label: 'Edaravone',
    type: 'drug',
    description:
      'A therapy studied in ALS with connections to oxidative stress.',
    x: 31,
    y: 26,
  },
]

const discoveryEdges: DiscoveryEdge[] = [
  {
    id: 'als-sod1',
    sourceId: 'als',
    targetId: 'sod1',
    label: 'associated with',
  },
  {
    id: 'als-fus',
    sourceId: 'als',
    targetId: 'fus',
    label: 'associated with',
  },
  {
    id: 'als-tardbp',
    sourceId: 'als',
    targetId: 'tardbp',
    label: 'associated with',
  },
  {
    id: 'parkinsons-lrrk2',
    sourceId: 'parkinsons',
    targetId: 'lrrk2',
    label: 'associated with',
  },
  {
    id: 'sod1-oxidative',
    sourceId: 'sod1',
    targetId: 'oxidative',
    label: 'participates in',
  },
  {
    id: 'fus-protein',
    sourceId: 'fus',
    targetId: 'protein',
    label: 'connected to',
  },
  {
    id: 'tardbp-protein',
    sourceId: 'tardbp',
    targetId: 'protein',
    label: 'connected to',
  },
  {
    id: 'lrrk2-protein',
    sourceId: 'lrrk2',
    targetId: 'protein',
    label: 'connected to',
  },
  {
    id: 'protein-amyloid',
    sourceId: 'protein',
    targetId: 'amyloid',
    label: 'overlaps with',
  },
  {
    id: 'riluzole-als',
    sourceId: 'riluzole',
    targetId: 'als',
    label: 'used in',
  },
  {
    id: 'edaravone-als',
    sourceId: 'edaravone',
    targetId: 'als',
    label: 'used in',
  },
  {
    id: 'edaravone-oxidative',
    sourceId: 'edaravone',
    targetId: 'oxidative',
    label: 'related to',
  },
]

function canUseStorage() {
  return (
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  )
}

function readProjects() {
  if (
    !canUseStorage()
  ) {
    return []
  }

  try {
    const raw =
      window.localStorage.getItem(
        PROJECTS_KEY,
      )

    if (
      !raw
    ) {
      return []
    }

    const parsed =
      JSON.parse(
        raw,
      ) as StoredResearchProject[]

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return []
    }

    return parsed.filter(
      (
        project,
      ): project is StoredResearchProject =>
        Boolean(
          project,
        ) &&
        project.version ===
          1 &&
        typeof project.id ===
          'string' &&
        Boolean(
          project.researchMap,
        ),
    )
  } catch {
    return []
  }
}

function writeProjects(
  projects:
    StoredResearchProject[],
) {
  if (
    !canUseStorage()
  ) {
    return
  }

  window.localStorage.setItem(
    PROJECTS_KEY,
    JSON.stringify(
      projects,
    ),
  )
}

function deleteProject(
  projectId:
    string,
) {
  const projects =
    readProjects()

  writeProjects(
    projects.filter(
      (
        project,
      ) =>
        project.id !==
        projectId,
    ),
  )

  if (
    canUseStorage() &&
    window.localStorage.getItem(
      ACTIVE_PROJECT_ID_KEY,
    ) ===
      projectId
  ) {
    window.localStorage.removeItem(
      ACTIVE_PROJECT_ID_KEY,
    )
  }
}

function formatDate(
  value:
    string,
) {
  try {
    return new Intl.DateTimeFormat(
      undefined,
      {
        month:
          'short',

        day:
          'numeric',

        year:
          'numeric',
      },
    ).format(
      new Date(
        value,
      ),
    )
  } catch {
    return 'Recently'
  }
}

function getProjectDomain(
  project:
    StoredResearchProject,
) {
  return (
    project.researchMap.domain ||
    'Scientific Research'
  )
}

function getProjectStats(
  project:
    StoredResearchProject,
) {
  return {
    concepts:
      project.researchMap.nodes.length,

    links:
      project.researchMap.edges.length,

    expanded:
      project.expandedNodeIds.length,
  }
}

function getGraphNodeColor(
  type:
    GraphNodeType,
) {
  if (
    type ===
    'disease'
  ) {
    return {
      fill:
        '#eaf0ff',

      stroke:
        '#6d8df5',

      text:
        '#253b75',
    }
  }

  if (
    type ===
    'gene'
  ) {
    return {
      fill:
        '#e6fbf1',

      stroke:
        '#55b98b',

      text:
        '#146b4a',
    }
  }

  if (
    type ===
    'pathway'
  ) {
    return {
      fill:
        '#fff3d8',

      stroke:
        '#e2a83d',

      text:
        '#815a12',
    }
  }

  return {
    fill:
      '#f4eaff',

    stroke:
      '#9b65df',

    text:
      '#5d2f9b',
  }
}

function getGraphTypeLabel(
  type:
    GraphNodeType,
) {
  if (
    type ===
    'disease'
  ) {
    return 'Disease'
  }

  if (
    type ===
    'gene'
  ) {
    return 'Gene'
  }

  if (
    type ===
    'pathway'
  ) {
    return 'Pathway'
  }

  return 'Drug'
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home />
        }
      />

      <Route
        path="/auth"
        element={<Auth />}
      />

      <Route
        path="/auth/callback"
        element={<AuthCallback />}
      />

      <Route
        path="/explore"
        element={
          <RequireAuthentication>
            <Explore />
          </RequireAuthentication>
        }
      />

      <Route
        path="/explore/:projectId"
        element={
          <RequireAuthentication>
            <Explore />
          </RequireAuthentication>
        }
      />

      <Route
        path="/projects"
        element={
          <RequireAuthentication>
            <Projects />
          </RequireAuthentication>
        }
      />

      <Route
        path="/graph"
        element={
          <RequireAuthentication>
            <Suspense fallback={<div role="status">Loading knowledge graph…</div>}>
              <GraphPage />
            </Suspense>
          </RequireAuthentication>
        }
      />

      <Route
        path="/hypotheses"
        element={
          <RequireAuthentication>
            <HypothesesPage />
          </RequireAuthentication>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  )
}

function RequireAuthentication({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuthSession()
  const location = useLocation()

  if (!isLoaded) {
    return <div role="status">Checking your account…</div>
  }

  if (!isSignedIn) {
    const destination = `${location.pathname}${location.search}${location.hash}`
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(destination)}`}
        replace
      />
    )
  }

  return <>{children}</>
}

function ExploreProjectsShortcut() {
  const location =
    useLocation()

  if (
    !location.pathname.startsWith(
      '/explore',
    )
  ) {
    return null
  }

  return (
    <Link
      to="/projects"
      style={{
        position:
          'fixed',

        right:
          22,

        bottom:
          22,

        zIndex:
          80,

        display:
          'inline-flex',

        alignItems:
          'center',

        gap:
          9,

        minHeight:
          44,

        padding:
          '0 16px',

        borderRadius:
          999,

        border:
          '1px solid #dfe4dc',

        background:
          'rgba(255, 254, 249, 0.94)',

        color:
          '#253b75',

        textDecoration:
          'none',

        fontSize:
          13,

        fontWeight:
          850,

        boxShadow:
          '0 18px 45px rgba(29, 36, 27, 0.12)',

        backdropFilter:
          'blur(14px)',
      }}
    >
      <FolderKanban size={17} />

      Projects
    </Link>
  )
}

export function ProjectsPage() {
  const navigate =
    useNavigate()

  const [
    projects,
    setProjects,
  ] =
    useState<
      StoredResearchProject[]
    >(
      () =>
        readProjects(),
    )

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState(
      '',
    )

  const filteredProjects =
    useMemo(
      () => {
        const query =
          searchTerm
            .trim()
            .toLowerCase()

        if (
          !query
        ) {
          return projects
        }

        return projects.filter(
          (
            project,
          ) =>
            project.title
              .toLowerCase()
              .includes(
                query,
              ) ||
            project.question
              .toLowerCase()
              .includes(
                query,
              ) ||
            getProjectDomain(
              project,
            )
              .toLowerCase()
              .includes(
                query,
              ),
        )
      },
      [
        projects,
        searchTerm,
      ],
    )

  function handleDelete(
    projectId:
      string,
  ) {
    deleteProject(
      projectId,
    )

    setProjects(
      readProjects(),
    )
  }

  function handleContinue(
    projectId:
      string,
  ) {
    if (
      canUseStorage()
    ) {
      window.localStorage.setItem(
        ACTIVE_PROJECT_ID_KEY,
        projectId,
      )
    }

    navigate(
      `/explore/${projectId}`,
    )
  }

  return (
    <div className="helix-projects-page">
      <style>
        {`
          .helix-projects-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at 16% 6%, rgba(74, 101, 219, 0.14), transparent 32%),
              radial-gradient(circle at 88% 14%, rgba(45, 98, 130, 0.1), transparent 30%),
              #f8f7f1;
            color: #232822;
          }

          .helix-projects-header {
            width: min(1220px, calc(100% - 40px));
            margin: 0 auto;
            padding: 28px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .helix-projects-brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #20251f;
            text-decoration: none;
            font-size: 21px;
            font-weight: 900;
            letter-spacing: -0.7px;
          }

          .helix-projects-brand span {
            color: #8c9488;
            font-size: 15px;
            font-weight: 700;
          }

          .helix-projects-nav {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .helix-projects-nav a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 42px;
            padding: 0 14px;
            border: 1px solid #dfe4dc;
            border-radius: 14px;
            background: rgba(255, 254, 249, 0.82);
            color: #242923;
            text-decoration: none;
            font-size: 13px;
            font-weight: 800;
          }

          .helix-projects-main {
            width: min(1220px, calc(100% - 40px));
            margin: 0 auto;
            padding: 34px 0 72px;
          }

          .helix-projects-hero {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 340px;
            gap: 18px;
            margin-bottom: 20px;
          }

          .helix-projects-copy,
          .helix-projects-summary {
            border: 1px solid #dfe4dc;
            border-radius: 30px;
            background: rgba(255, 254, 249, 0.9);
            box-shadow: 0 24px 70px rgba(29, 36, 27, 0.07);
          }

          .helix-projects-copy {
            padding: 30px;
          }

          .helix-projects-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #3655a5;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.7px;
            text-transform: uppercase;
          }

          .helix-projects-copy h1 {
            max-width: 820px;
            margin: 16px 0 10px;
            color: #20251f;
            font-size: clamp(42px, 7vw, 76px);
            line-height: 0.95;
            letter-spacing: -3.2px;
          }

          .helix-projects-copy p {
            max-width: 720px;
            margin: 0;
            color: #657062;
            font-size: 16px;
            line-height: 1.7;
          }

          .helix-projects-summary {
            padding: 24px;
            display: grid;
            align-content: center;
            gap: 16px;
          }

          .helix-projects-summary strong {
            color: #20251f;
            font-size: 34px;
            line-height: 1;
          }

          .helix-projects-summary span {
            color: #657062;
            font-size: 13px;
            font-weight: 750;
          }

          .helix-projects-create {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            min-height: 46px;
            padding: 0 16px;
            border: 1px solid #253b75;
            border-radius: 15px;
            background: #253b75;
            color: white;
            text-decoration: none;
            font-size: 14px;
            font-weight: 850;
          }

          .helix-projects-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            margin: 22px 0;
          }

          .helix-projects-search {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 50px;
            padding: 0 15px;
            border: 1px solid #dfe4dc;
            border-radius: 16px;
            background: rgba(255, 254, 249, 0.88);
          }

          .helix-projects-search svg {
            color: #3655a5;
          }

          .helix-projects-search input {
            width: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: #232822;
            font-size: 15px;
          }

          .helix-project-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }

          .helix-project-card {
            display: flex;
            flex-direction: column;
            min-height: 280px;
            padding: 20px;
            border: 1px solid #dfe4dc;
            border-radius: 24px;
            background: rgba(255, 254, 249, 0.92);
            box-shadow: 0 20px 60px rgba(29, 36, 27, 0.06);
          }

          .helix-project-card-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .helix-project-domain {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            width: fit-content;
            padding: 7px 9px;
            border-radius: 999px;
            background: #edf1ff;
            color: #3655a5;
            font-size: 11px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .helix-project-delete {
            display: grid;
            place-items: center;
            width: 36px;
            height: 36px;
            border: 1px solid #eadfd8;
            border-radius: 12px;
            background: #fff6f1;
            color: #a14e27;
            cursor: pointer;
          }

          .helix-project-card h2 {
            margin: 18px 0 10px;
            color: #20251f;
            font-size: 23px;
            line-height: 1.12;
            letter-spacing: -0.7px;
          }

          .helix-project-question {
            margin: 0;
            color: #657062;
            font-size: 13px;
            line-height: 1.55;
          }

          .helix-project-stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
            margin: 18px 0;
          }

          .helix-project-stat {
            padding: 10px;
            border: 1px solid #e7ebe3;
            border-radius: 14px;
            background: #fbfbf6;
          }

          .helix-project-stat strong {
            display: block;
            color: #20251f;
            font-size: 18px;
          }

          .helix-project-stat span {
            display: block;
            margin-top: 3px;
            color: #757e71;
            font-size: 10px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .helix-project-card-footer {
            margin-top: auto;
            display: grid;
            gap: 12px;
          }

          .helix-project-date {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #737b70;
            font-size: 12px;
            font-weight: 700;
          }

          .helix-project-continue {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 44px;
            border: 1px solid #253b75;
            border-radius: 14px;
            background: #253b75;
            color: white;
            font-size: 13px;
            font-weight: 850;
            cursor: pointer;
          }

          .helix-empty-projects {
            padding: 42px;
            border: 1px solid #dfe4dc;
            border-radius: 28px;
            background: rgba(255, 254, 249, 0.9);
            text-align: center;
          }

          .helix-empty-projects h2 {
            margin: 12px 0 8px;
            color: #20251f;
            font-size: 30px;
            letter-spacing: -1px;
          }

          .helix-empty-projects p {
            max-width: 540px;
            margin: 0 auto 20px;
            color: #657062;
            line-height: 1.6;
          }

          @media (max-width: 980px) {
            .helix-projects-hero {
              grid-template-columns: 1fr;
            }

            .helix-project-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 650px) {
            .helix-projects-header,
            .helix-projects-main {
              width: min(100% - 28px, 1220px);
            }

            .helix-projects-header,
            .helix-projects-toolbar {
              align-items: stretch;
              flex-direction: column;
            }

            .helix-projects-nav {
              flex-wrap: wrap;
            }

            .helix-project-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <header className="helix-projects-header">
        <Link
          to="/"
          className="helix-projects-brand"
        >
          Helix

          <span>
            /
          </span>

          Projects
        </Link>

        <nav className="helix-projects-nav">
          <Link to="/">
            <HomeIcon size={16} />

            Home
          </Link>

          <Link to="/graph">
            <Network size={16} />

            Discovery Graph
          </Link>

          <Link to="/explore">
            <Plus size={16} />

            New Investigation
          </Link>
        </nav>
      </header>

      <main className="helix-projects-main">
        <section className="helix-projects-hero">
          <div className="helix-projects-copy">
            <span className="helix-projects-eyebrow">
              <FolderKanban size={16} />

              Saved investigations
            </span>

            <h1>
              Continue your research where you left off.
            </h1>

            <p>
              Projects save your research question, generated concept map,
              expanded nodes, and investigation state locally in your browser.
            </p>
          </div>

          <aside className="helix-projects-summary">
            <div>
              <strong>
                {
                  projects.length
                }
              </strong>

              <span>
                Saved research projects
              </span>
            </div>

            <Link
              to="/explore"
              className="helix-projects-create"
            >
              <Plus size={17} />

              Start new research
            </Link>
          </aside>
        </section>

        <div className="helix-projects-toolbar">
          <label className="helix-projects-search">
            <Search size={18} />

            <input
              value={
                searchTerm
              }
              onChange={
                (
                  event,
                ) =>
                  setSearchTerm(
                    event.target.value,
                  )
              }
              placeholder="Search projects by title, question, or domain..."
            />
          </label>
        </div>

        {
          filteredProjects.length >
            0
            ? (
              <section className="helix-project-grid">
                {
                  filteredProjects.map(
                    (
                      project,
                    ) => {
                      const stats =
                        getProjectStats(
                          project,
                        )

                      return (
                        <article
                          key={
                            project.id
                          }
                          className="helix-project-card"
                        >
                          <div className="helix-project-card-top">
                            <span className="helix-project-domain">
                              <Sparkles size={13} />

                              {
                                getProjectDomain(
                                  project,
                                )
                              }
                            </span>

                            <button
                              type="button"
                              className="helix-project-delete"
                              aria-label={`Delete ${project.title}`}
                              onClick={
                                () =>
                                  handleDelete(
                                    project.id,
                                  )
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <h2>
                            {
                              project.title
                            }
                          </h2>

                          <p className="helix-project-question">
                            {
                              project.question
                            }
                          </p>

                          <div className="helix-project-stats">
                            <div className="helix-project-stat">
                              <strong>
                                {
                                  stats.concepts
                                }
                              </strong>

                              <span>
                                Concepts
                              </span>
                            </div>

                            <div className="helix-project-stat">
                              <strong>
                                {
                                  stats.links
                                }
                              </strong>

                              <span>
                                Links
                              </span>
                            </div>

                            <div className="helix-project-stat">
                              <strong>
                                {
                                  stats.expanded
                                }
                              </strong>

                              <span>
                                Expanded
                              </span>
                            </div>
                          </div>

                          <div className="helix-project-card-footer">
                            <span className="helix-project-date">
                              <Calendar size={14} />

                              Updated {
                                formatDate(
                                  project.updatedAt,
                                )
                              }
                            </span>

                            <button
                              type="button"
                              className="helix-project-continue"
                              onClick={
                                () =>
                                  handleContinue(
                                    project.id,
                                  )
                              }
                            >
                              Continue investigation

                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </article>
                      )
                    },
                  )
                }
              </section>
            )
            : (
              <section className="helix-empty-projects">
                <FolderKanban size={34} />

                <h2>
                  No saved projects yet.
                </h2>

                <p>
                  Start a research question in the Explorer. Helix will
                  save your investigation so you can come back to it later.
                </p>

                <Link
                  to="/explore"
                  className="helix-projects-create"
                >
                  <Plus size={17} />

                  Start first project
                </Link>
              </section>
            )
        }
      </main>
    </div>
  )
}

export function DiscoveryGraphPage() {
  const navigate =
    useNavigate()

  const [
    selectedNodeId,
    setSelectedNodeId,
  ] =
    useState(
      'als',
    )

  const selectedNode =
    discoveryNodes.find(
      (
        node,
      ) =>
        node.id ===
        selectedNodeId,
    ) ??
    discoveryNodes[0]

  const connectedEdges =
    discoveryEdges.filter(
      (
        edge,
      ) =>
        edge.sourceId ===
          selectedNode.id ||
        edge.targetId ===
          selectedNode.id,
    )

  const connectedNodes =
    connectedEdges
      .map(
        (
          edge,
        ) => {
          const otherId =
            edge.sourceId ===
            selectedNode.id
              ? edge.targetId
              : edge.sourceId

          return discoveryNodes.find(
            (
              node,
            ) =>
              node.id ===
              otherId,
          )
        },
      )
      .filter(
        (
          node,
        ): node is DiscoveryNode =>
          Boolean(
            node,
          ),
      )

  function startInvestigation() {
    navigate(
      '/explore',
    )
  }

  return (
    <div className="helix-discovery-page">
      <style>
        {`
          .helix-discovery-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at 14% 6%, rgba(74, 101, 219, 0.14), transparent 32%),
              radial-gradient(circle at 88% 14%, rgba(45, 98, 130, 0.1), transparent 30%),
              #f8f7f1;
            color: #232822;
          }

          .helix-discovery-header {
            width: min(1280px, calc(100% - 40px));
            margin: 0 auto;
            padding: 24px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .helix-discovery-brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #20251f;
            text-decoration: none;
            font-size: 21px;
            font-weight: 900;
            letter-spacing: -0.7px;
          }

          .helix-discovery-brand span {
            color: #8c9488;
            font-size: 15px;
            font-weight: 700;
          }

          .helix-discovery-back {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 42px;
            padding: 0 14px;
            border: 1px solid #dfe4dc;
            border-radius: 14px;
            background: rgba(255, 254, 249, 0.82);
            color: #242923;
            text-decoration: none;
            font-size: 13px;
            font-weight: 800;
          }

          .helix-discovery-main {
            width: min(1280px, calc(100% - 40px));
            margin: 0 auto;
            padding: 24px 0 64px;
          }

          .helix-discovery-hero {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 360px;
            gap: 18px;
            margin-bottom: 18px;
          }

          .helix-discovery-copy,
          .helix-discovery-stats,
          .helix-discovery-panel,
          .helix-discovery-graph-card {
            border: 1px solid #dfe4dc;
            background: rgba(255, 254, 249, 0.92);
            box-shadow: 0 24px 70px rgba(29, 36, 27, 0.07);
          }

          .helix-discovery-copy {
            padding: 30px;
            border-radius: 30px;
          }

          .helix-discovery-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #3655a5;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.7px;
            text-transform: uppercase;
          }

          .helix-discovery-copy h1 {
            max-width: 900px;
            margin: 16px 0 10px;
            color: #20251f;
            font-size: clamp(42px, 7vw, 76px);
            line-height: 0.95;
            letter-spacing: -3.2px;
          }

          .helix-discovery-copy p {
            max-width: 760px;
            margin: 0;
            color: #657062;
            font-size: 16px;
            line-height: 1.7;
          }

          .helix-discovery-stats {
            display: grid;
            align-content: center;
            gap: 12px;
            padding: 24px;
            border-radius: 30px;
          }

          .helix-discovery-stat-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .helix-discovery-stat {
            padding: 14px;
            border: 1px solid #e7ebe3;
            border-radius: 17px;
            background: #fbfbf6;
          }

          .helix-discovery-stat strong {
            display: block;
            color: #20251f;
            font-size: 26px;
            line-height: 1;
          }

          .helix-discovery-stat span {
            display: block;
            margin-top: 7px;
            color: #727a6f;
            font-size: 10px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .helix-discovery-layout {
            display: grid;
            grid-template-columns: 330px minmax(0, 1fr);
            gap: 18px;
            align-items: stretch;
          }

          .helix-discovery-panel {
            border-radius: 28px;
            padding: 22px;
          }

          .helix-node-type-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            width: fit-content;
            padding: 7px 9px;
            border-radius: 999px;
            background: #edf1ff;
            color: #3655a5;
            font-size: 11px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .helix-discovery-panel h2 {
            margin: 18px 0 10px;
            color: #20251f;
            font-size: 31px;
            line-height: 1.05;
            letter-spacing: -1.1px;
          }

          .helix-discovery-panel p {
            margin: 0;
            color: #657062;
            font-size: 14px;
            line-height: 1.6;
          }

          .helix-connected-list {
            display: grid;
            gap: 10px;
            margin-top: 20px;
          }

          .helix-connected-list h3 {
            margin: 0 0 2px;
            color: #20251f;
            font-size: 15px;
          }

          .helix-connected-button {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            align-items: center;
            width: 100%;
            padding: 12px;
            border: 1px solid #e7ebe3;
            border-radius: 16px;
            background: #fbfbf6;
            color: #20251f;
            text-align: left;
            cursor: pointer;
          }

          .helix-connected-button strong {
            display: block;
            font-size: 13px;
          }

          .helix-connected-button span {
            display: block;
            margin-top: 3px;
            color: #727a6f;
            font-size: 11px;
            font-weight: 750;
            text-transform: uppercase;
          }

          .helix-discovery-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            min-height: 44px;
            width: 100%;
            margin-top: 20px;
            border: 1px solid #253b75;
            border-radius: 15px;
            background: #253b75;
            color: white;
            font-size: 13px;
            font-weight: 850;
            cursor: pointer;
          }

          .helix-discovery-graph-card {
            position: relative;
            min-height: 620px;
            overflow: hidden;
            border-radius: 28px;
            background:
              radial-gradient(circle at 50% 42%, rgba(71, 99, 180, 0.14), transparent 30%),
              linear-gradient(145deg, rgba(255, 254, 249, 0.98), rgba(242, 244, 238, 0.96));
          }

          .helix-discovery-legend {
            position: absolute;
            left: 18px;
            top: 18px;
            z-index: 3;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 10px;
            border: 1px solid #dfe4dc;
            border-radius: 16px;
            background: rgba(255, 254, 249, 0.92);
            box-shadow: 0 16px 36px rgba(29, 36, 27, 0.08);
          }

          .helix-discovery-legend span {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #5f685d;
            font-size: 12px;
            font-weight: 800;
          }

          .helix-discovery-legend i {
            width: 10px;
            height: 10px;
            border-radius: 3px;
            display: block;
          }

          .legend-disease {
            background: #6d8df5;
          }

          .legend-gene {
            background: #55b98b;
          }

          .legend-pathway {
            background: #e2a83d;
          }

          .legend-drug {
            background: #9b65df;
          }

          .helix-discovery-graph-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
          }

          .helix-graph-grid {
            stroke: rgba(100, 108, 95, 0.08);
            stroke-width: 1;
          }

          .helix-graph-edge {
            stroke: rgba(81, 91, 78, 0.35);
            stroke-width: 1.4;
            stroke-dasharray: 6 7;
          }

          .helix-graph-edge-active {
            stroke: #253b75;
            stroke-width: 2.2;
            stroke-dasharray: 0;
          }

          .helix-graph-edge-label {
            fill: #657062;
            font-size: 10px;
            font-weight: 750;
          }

          .helix-graph-node {
            cursor: pointer;
          }

          .helix-graph-node rect {
            transition:
              filter 170ms ease,
              transform 170ms ease;
          }

          .helix-graph-node:hover rect,
          .helix-graph-node-active rect {
            filter: drop-shadow(0 12px 18px rgba(29, 36, 27, 0.16));
          }

          .helix-graph-node-label {
            font-size: 12px;
            font-weight: 850;
            fill: #20251f;
            pointer-events: none;
          }

          .helix-graph-node-type {
            font-size: 8px;
            font-weight: 850;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            pointer-events: none;
          }

          .helix-discovery-footer {
            position: absolute;
            left: 18px;
            right: 18px;
            bottom: 18px;
            z-index: 3;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 14px;
            border: 1px solid #dfe4dc;
            border-radius: 16px;
            background: rgba(255, 254, 249, 0.92);
            color: #657062;
            font-size: 12px;
            font-weight: 750;
          }

          .helix-discovery-footer strong {
            color: #253b75;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }

          @media (max-width: 1050px) {
            .helix-discovery-hero,
            .helix-discovery-layout {
              grid-template-columns: 1fr;
            }

            .helix-discovery-panel {
              order: 2;
            }
          }

          @media (max-width: 650px) {
            .helix-discovery-header,
            .helix-discovery-main {
              width: min(100% - 28px, 1280px);
            }

            .helix-discovery-header {
              align-items: stretch;
              flex-direction: column;
            }

            .helix-discovery-graph-card {
              min-height: 720px;
            }

            .helix-discovery-footer {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}
      </style>

      <header className="helix-discovery-header">
        <Link
          to="/"
          className="helix-discovery-brand"
        >
          Helix

          <span>
            /
          </span>

          Discovery Graph
        </Link>

        <Link
          to="/"
          className="helix-discovery-back"
        >
          <ArrowLeft size={16} />

          Back home
        </Link>
      </header>

      <main className="helix-discovery-main">
        <section className="helix-discovery-hero">
          <div className="helix-discovery-copy">
            <span className="helix-discovery-eyebrow">
              <Network size={16} />

              Scientific network
            </span>

            <h1>
              Explore the broader research network.
            </h1>

            <p>
              The Research Explorer starts with one question. The Discovery
              Graph shows the larger scientific network behind many
              investigations, connecting diseases, genes, pathways, drugs,
              and evidence areas.
            </p>
          </div>

          <aside className="helix-discovery-stats">
            <div className="helix-discovery-stat-grid">
              <div className="helix-discovery-stat">
                <strong>
                  {
                    discoveryNodes.length
                  }
                </strong>

                <span>
                  Demo nodes
                </span>
              </div>

              <div className="helix-discovery-stat">
                <strong>
                  {
                    discoveryEdges.length
                  }
                </strong>

                <span>
                  Links
                </span>
              </div>

              <div className="helix-discovery-stat">
                <strong>
                  4
                </strong>

                <span>
                  Node types
                </span>
              </div>

              <div className="helix-discovery-stat">
                <strong>
                  1
                </strong>

                <span>
                  Network
                </span>
              </div>
            </div>
          </aside>
        </section>

        <section className="helix-discovery-layout">
          <aside className="helix-discovery-panel">
            <span className="helix-node-type-pill">
              <Sparkles size={13} />

              {
                getGraphTypeLabel(
                  selectedNode.type,
                )
              }
            </span>

            <h2>
              {
                selectedNode.label
              }
            </h2>

            <p>
              {
                selectedNode.description
              }
            </p>

            <div className="helix-connected-list">
              <h3>
                Connected concepts
              </h3>

              {
                connectedNodes.map(
                  (
                    node,
                  ) => (
                    <button
                      key={
                        node.id
                      }
                      type="button"
                      className="helix-connected-button"
                      onClick={
                        () =>
                          setSelectedNodeId(
                            node.id,
                          )
                      }
                    >
                      <div>
                        <strong>
                          {
                            node.label
                          }
                        </strong>

                        <span>
                          {
                            getGraphTypeLabel(
                              node.type,
                            )
                          }
                        </span>
                      </div>

                      <ArrowRight size={15} />
                    </button>
                  ),
                )
              }
            </div>

            <button
              type="button"
              className="helix-discovery-action"
              onClick={
                startInvestigation
              }
            >
              Start investigation

              <ArrowRight size={16} />
            </button>
          </aside>

          <section className="helix-discovery-graph-card">
            <div className="helix-discovery-legend">
              <span>
                <i className="legend-disease" />

                Disease
              </span>

              <span>
                <i className="legend-gene" />

                Gene
              </span>

              <span>
                <i className="legend-pathway" />

                Pathway
              </span>

              <span>
                <i className="legend-drug" />

                Drug
              </span>
            </div>

            <svg
              className="helix-discovery-graph-svg"
              viewBox="0 0 1000 660"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Scientific discovery graph showing relationships between diseases, genes, pathways, and drugs."
            >
              {
                Array.from(
                  {
                    length:
                      18,
                  },
                  (
                    _,
                    index,
                  ) => (
                    <line
                      key={`vertical-${index}`}
                      className="helix-graph-grid"
                      x1={
                        40 +
                        index *
                          54
                      }
                      y1="40"
                      x2={
                        40 +
                        index *
                          54
                      }
                      y2="620"
                    />
                  ),
                )
              }

              {
                Array.from(
                  {
                    length:
                      11,
                  },
                  (
                    _,
                    index,
                  ) => (
                    <line
                      key={`horizontal-${index}`}
                      className="helix-graph-grid"
                      x1="40"
                      y1={
                        50 +
                        index *
                          54
                      }
                      x2="960"
                      y2={
                        50 +
                        index *
                          54
                      }
                    />
                  ),
                )
              }

              {
                discoveryEdges.map(
                  (
                    edge,
                  ) => {
                    const source =
                      discoveryNodes.find(
                        (
                          node,
                        ) =>
                          node.id ===
                          edge.sourceId,
                      )

                    const target =
                      discoveryNodes.find(
                        (
                          node,
                        ) =>
                          node.id ===
                          edge.targetId,
                      )

                    if (
                      !source ||
                      !target
                    ) {
                      return null
                    }

                    const active =
                      edge.sourceId ===
                        selectedNode.id ||
                      edge.targetId ===
                        selectedNode.id

                    const sourceX =
                      source.x *
                      10

                    const sourceY =
                      source.y *
                      6.6

                    const targetX =
                      target.x *
                      10

                    const targetY =
                      target.y *
                      6.6

                    const midX =
                      (
                        sourceX +
                        targetX
                      ) /
                      2

                    const midY =
                      (
                        sourceY +
                        targetY
                      ) /
                      2

                    return (
                      <g key={edge.id}>
                        <line
                          className={
                            active
                              ? 'helix-graph-edge helix-graph-edge-active'
                              : 'helix-graph-edge'
                          }
                          x1={
                            sourceX
                          }
                          y1={
                            sourceY
                          }
                          x2={
                            targetX
                          }
                          y2={
                            targetY
                          }
                        />

                        {
                          active && (
                            <text
                              className="helix-graph-edge-label"
                              x={
                                midX
                              }
                              y={
                                midY -
                                8
                              }
                              textAnchor="middle"
                            >
                              {
                                edge.label
                              }
                            </text>
                          )
                        }
                      </g>
                    )
                  },
                )
              }

              {
                discoveryNodes.map(
                  (
                    node,
                  ) => {
                    const palette =
                      getGraphNodeColor(
                        node.type,
                      )

                    const active =
                      node.id ===
                      selectedNode.id

                    const x =
                      node.x *
                      10

                    const y =
                      node.y *
                      6.6

                    return (
                      <g
                        key={
                          node.id
                        }
                        className={
                          active
                            ? 'helix-graph-node helix-graph-node-active'
                            : 'helix-graph-node'
                        }
                        onClick={
                          () =>
                            setSelectedNodeId(
                              node.id,
                            )
                        }
                        role="button"
                        tabIndex={0}
                      >
                        <rect
                          x={
                            x -
                            66
                          }
                          y={
                            y -
                            26
                          }
                          width="132"
                          height="52"
                          rx="12"
                          fill={
                            palette.fill
                          }
                          stroke={
                            active
                              ? '#253b75'
                              : palette.stroke
                          }
                          strokeWidth={
                            active
                              ? 2.5
                              : 1.2
                          }
                        />

                        <text
                          className="helix-graph-node-type"
                          x={
                            x -
                            50
                          }
                          y={
                            y -
                            7
                          }
                          fill={
                            palette.text
                          }
                        >
                          {
                            getGraphTypeLabel(
                              node.type,
                            )
                          }
                        </text>

                        <text
                          className="helix-graph-node-label"
                          x={
                            x -
                            50
                          }
                          y={
                            y +
                            12
                          }
                        >
                          {
                            node.label.length >
                            17
                              ? `${node.label.slice(
                                  0,
                                  15,
                                )}…`
                              : node.label
                          }
                        </text>
                      </g>
                    )
                  },
                )
              }
            </svg>

            <div className="helix-discovery-footer">
              <strong>
                Educational research network
              </strong>

              <span>
                Demo graph for research exploration. Relationships require
                independent scientific validation.
              </span>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

function HypothesesPage() {
  return (
    <div className="helix-hypotheses-page">
      <style>
        {`
          .helix-hypotheses-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at 16% 8%, rgba(74, 101, 219, 0.14), transparent 32%),
              #f8f7f1;
            color: #232822;
          }

          .helix-hypotheses-shell {
            width: min(1050px, calc(100% - 40px));
            margin: 0 auto;
            padding: 32px 0 80px;
          }

          .helix-hypotheses-nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 34px;
          }

          .helix-hypotheses-nav a {
            color: #232822;
            text-decoration: none;
            font-weight: 850;
          }

          .helix-hypotheses-card {
            padding: 34px;
            border: 1px solid #dfe4dc;
            border-radius: 32px;
            background: rgba(255, 254, 249, 0.92);
            box-shadow: 0 24px 70px rgba(29, 36, 27, 0.07);
          }

          .helix-hypotheses-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #3655a5;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.7px;
            text-transform: uppercase;
          }

          .helix-hypotheses-card h1 {
            margin: 16px 0 12px;
            color: #20251f;
            font-size: clamp(42px, 7vw, 76px);
            line-height: 0.95;
            letter-spacing: -3.2px;
          }

          .helix-hypotheses-card p {
            max-width: 760px;
            color: #657062;
            font-size: 16px;
            line-height: 1.7;
          }

          .helix-hypotheses-list {
            display: grid;
            gap: 12px;
            margin-top: 26px;
          }

          .helix-hypothesis-item {
            display: grid;
            grid-template-columns: 46px 1fr;
            gap: 14px;
            align-items: start;
            padding: 16px;
            border: 1px solid #e7ebe3;
            border-radius: 20px;
            background: #fbfbf6;
          }

          .helix-hypothesis-icon {
            display: grid;
            place-items: center;
            width: 46px;
            height: 46px;
            border-radius: 16px;
            background: #edf1ff;
            color: #3655a5;
          }

          .helix-hypothesis-item h2 {
            margin: 0;
            color: #20251f;
            font-size: 18px;
          }

          .helix-hypothesis-item p {
            margin: 5px 0 0;
            font-size: 13px;
            line-height: 1.5;
          }
        `}
      </style>

      <main className="helix-hypotheses-shell">
        <nav className="helix-hypotheses-nav">
          <Link to="/">
            Helix
          </Link>

          <Link to="/explore">
            Open Explorer →
          </Link>
        </nav>

        <section className="helix-hypotheses-card">
          <span className="helix-hypotheses-eyebrow">
            <Lightbulb size={16} />

            Hypothesis workspace
          </span>

          <h1>
            Turn research connections into testable ideas.
          </h1>

          <p>
            This page explains how Helix can help users move from a
            research map to possible hypotheses. It is for educational
            organization only, not scientific proof or clinical guidance.
          </p>

          <div className="helix-hypotheses-list">
            <article className="helix-hypothesis-item">
              <span className="helix-hypothesis-icon">
                <Network size={20} />
              </span>

              <div>
                <h2>
                  Find connected concepts
                </h2>

                <p>
                  Use the research map and Discovery Graph to identify
                  diseases, genes, pathways, and therapies that appear
                  connected.
                </p>
              </div>
            </article>

            <article className="helix-hypothesis-item">
              <span className="helix-hypothesis-icon">
                <ShieldCheck size={20} />
              </span>

              <div>
                <h2>
                  Review the evidence
                </h2>

                <p>
                  Separate stronger evidence from limited or uncertain
                  claims before treating a connection as important.
                </p>
              </div>
            </article>

            <article className="helix-hypothesis-item">
              <span className="helix-hypothesis-icon">
                <FlaskConical size={20} />
              </span>

              <div>
                <h2>
                  Frame a research question
                </h2>

                <p>
                  Convert a pattern into a question that could be
                  investigated with sources, experiments, or datasets.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />

      <ExploreProjectsShortcut />
    </BrowserRouter>
  )
}
