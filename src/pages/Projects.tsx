import {
    FolderKanban,
    Plus,
    Search,
    Sparkles,
  } from 'lucide-react'
  
  import {
    Link,
    useNavigate,
  } from 'react-router-dom'
  
  import {
    ProjectCard,
  } from '../components/ProjectCard'
  import { useAuthSession } from '../auth/AuthSession'
  
import {
  clearActiveProjectId,
  deleteResearchProject,
  getResearchProjectSummaries,
  renameResearchProject,
  setActiveProjectId,
  } from '../utils/researchProjectStorage'
  
  import {
    useMemo,
    useState,
  } from 'react'
  
  import type {
    ResearchProjectSummary,
  } from '../types/researchProject'
  
  import './Projects.css'
  
  export function Projects() {
    const navigate =
      useNavigate()
    const { userId } = useAuthSession()
    const accountId = userId ?? ''
  
    const [
      search,
      setSearch,
    ] =
      useState(
        '',
      )
  
    const [
      projects,
      setProjects,
    ] =
      useState<
        ResearchProjectSummary[]
      >(
        () =>
          getResearchProjectSummaries(accountId),
      )
  
    const filteredProjects =
      useMemo(
        () => {
          const query =
            search
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
                ),
          )
        },
        [
          projects,
          search,
        ],
      )
  
    function refreshProjects() {
      setProjects(
        getResearchProjectSummaries(accountId),
      )
    }
  
    function openProject(
      project:
        ResearchProjectSummary,
    ) {
      setActiveProjectId(
        project.id,
        accountId,
      )
  
      navigate(
        `/explore/${project.id}`,
      )
    }
  
    function startNewProject() {
      clearActiveProjectId(accountId)
  
      navigate(
        '/explore',
      )
    }
  
    function renameProject(
      project:
        ResearchProjectSummary,
    ) {
      const title =
        window.prompt(
          'Rename this investigation:',
          project.title,
        )
  
      if (
        title ===
        null
      ) {
        return
      }
  
      renameResearchProject(
        project.id,
        title,
        accountId,
      )
  
      refreshProjects()
    }
  
    function removeProject(
      project:
        ResearchProjectSummary,
    ) {
      const confirmed =
        window.confirm(
          `Delete "${project.title}" from this account on this browser?`,
        )
  
      if (
        !confirmed
      ) {
        return
      }
  
      deleteResearchProject(
        project.id,
        accountId,
      )
  
      refreshProjects()
    }
  
    return (
      <div className="helix-projects-page">
        <header className="helix-projects-nav">
          <Link
            to="/"
            className="helix-wordmark"
          >
            Helix
          </Link>
  
          <div className="helix-projects-nav-actions">
            <Link
              to="/explore"
              className="helix-projects-nav-link"
            >
              Research Explorer
            </Link>
  
            <Link
              to="/hypotheses"
              className="helix-projects-nav-link"
            >
              Hypotheses
            </Link>
          </div>
        </header>
  
        <main className="helix-projects-main">
          <section className="helix-projects-hero">
            <div>
              <span className="helix-projects-eyebrow">
                <FolderKanban size={15} />
  
                Research library
              </span>
  
              <h1>
                Your saved investigations
              </h1>
  
              <p>
                Continue previous Helix projects, reopen research maps,
                and keep building evidence-backed investigations from
                this browser.
              </p>
            </div>
  
            <button
              type="button"
              onClick={
                startNewProject
              }
            >
              <Plus size={18} />
  
              New investigation
            </button>
          </section>
  
          <section className="helix-projects-toolbar">
            <div className="helix-projects-search">
              <Search size={18} />
  
              <input
                value={
                  search
                }
                onChange={
                  (
                    event,
                  ) =>
                    setSearch(
                      event.target.value,
                    )
                }
                placeholder="Search saved investigations..."
              />
            </div>
  
            <span>
              {
                filteredProjects.length
              }{' '}
              shown
            </span>
          </section>
  
          {
            filteredProjects.length >
              0
              ? (
                <section className="helix-project-grid">
                  {
                    filteredProjects.map(
                      (
                        project,
                      ) => (
                        <ProjectCard
                          key={
                            project.id
                          }
                          project={
                            project
                          }
                          onOpen={
                            () =>
                              openProject(
                                project,
                              )
                          }
                          onRename={
                            () =>
                              renameProject(
                                project,
                              )
                          }
                          onDelete={
                            () =>
                              removeProject(
                                project,
                              )
                          }
                        />
                      ),
                    )
                  }
                </section>
              )
              : (
                <section className="helix-projects-empty">
                  <Sparkles size={34} />
  
                  <h2>
                    No saved investigations yet
                  </h2>
  
                  <p>
                    Save a research question or investigation from
                    Research Explorer to continue it later.
                  </p>
  
                  <button
                    type="button"
                    onClick={
                      startNewProject
                    }
                  >
                    Start researching
                  </button>
                </section>
              )
          }
        </main>
      </div>
    )
  }