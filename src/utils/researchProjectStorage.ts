import type {
    ResearchMap,
  } from '../types/researchMap'
  
  import type {
    ResearchProject,
    ResearchProjectSummary,
  } from '../types/researchProject'
  
  const PROJECTS_KEY =
    'helix.researchProjects.v1'
  
  const ACTIVE_PROJECT_ID_KEY =
    'helix.activeProjectId.v1'
  
  function canUseStorage() {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    )
  }
  
  function makeProjectId() {
    if (
      typeof crypto !== 'undefined' &&
      'randomUUID' in crypto
    ) {
      return crypto.randomUUID()
    }
  
    return `project-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  }
  
  function makeProjectTitle(
    question:
      string,
  ) {
    const cleaned =
      question.trim()
  
    if (
      cleaned.length <=
      70
    ) {
      return cleaned
    }
  
    return `${cleaned.slice(
      0,
      67,
    )}...`
  }
  
  function projectsStorageKey(userId: string) {
    return `${PROJECTS_KEY}:${encodeURIComponent(userId)}`
  }

  function activeProjectStorageKey(userId: string) {
    return `${ACTIVE_PROJECT_ID_KEY}:${encodeURIComponent(userId)}`
  }

  function readProjects(userId: string) {
    if (!userId) return []

    if (
      !canUseStorage()
    ) {
      return []
    }
  
    try {
      const raw =
        window.localStorage.getItem(
          projectsStorageKey(userId),
        )
  
      if (
        !raw
      ) {
        return []
      }
  
      const parsed =
        JSON.parse(
          raw,
        ) as ResearchProject[]
  
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
        ) =>
          project &&
          project.version ===
            1 &&
          typeof project.id ===
            'string' &&
          project.ownerId ===
            userId &&
          Boolean(
            project.researchMap,
          ),
      )
    } catch {
      return []
    }
  }
  
  function writeProjects(
    userId: string,
    projects:
      ResearchProject[],
  ) {
    if (
      !userId ||
      !canUseStorage()
    ) {
      return
    }
  
    window.localStorage.setItem(
      projectsStorageKey(userId),
      JSON.stringify(
        projects,
      ),
    )
  }
  
  function summarizeProject(
    project:
      ResearchProject,
  ): ResearchProjectSummary {
    const trialCount =
      project.researchMap.nodes.filter(
        (
          node,
        ) =>
          String(
            node.type,
          ) ===
          'clinical-trial',
      ).length
  
    return {
      id:
        project.id,
  
      title:
        project.title,
  
      question:
        project.question,
  
      conceptCount:
        project.researchMap.nodes.length,
  
      relationshipCount:
        project.researchMap.edges.length,
  
      sourceCount:
        project.researchMap.sources.length,
  
      trialCount,
  
      createdAt:
        project.createdAt,
  
      updatedAt:
        project.updatedAt,
    }
  }
  
  export function getResearchProjects(userId: string) {
    return readProjects(userId).sort(
      (
        a,
        b,
      ) =>
        new Date(
          b.updatedAt,
        ).getTime() -
        new Date(
          a.updatedAt,
        ).getTime(),
    )
  }
  
  export function getResearchProjectSummaries(userId: string) {
    return getResearchProjects(userId).map(
      summarizeProject,
    )
  }
  
  export function getResearchProject(
    projectId:
      string,
    userId: string,
  ) {
    return (
      readProjects(userId).find(
        (
          project,
        ) =>
          project.id ===
          projectId,
      ) ??
      null
    )
  }
  
  export function getActiveProjectId(userId: string) {
    if (
      !userId ||
      !canUseStorage()
    ) {
      return null
    }
  
    return window.localStorage.getItem(
      activeProjectStorageKey(userId),
    )
  }
  
  export function setActiveProjectId(
    projectId:
      string,
    userId: string,
  ) {
    if (
      !userId ||
      !canUseStorage()
    ) {
      return
    }
  
    window.localStorage.setItem(
      activeProjectStorageKey(userId),
      projectId,
    )
  }
  
  export function clearActiveProjectId(userId: string) {
    if (
      !userId ||
      !canUseStorage()
    ) {
      return
    }
  
    window.localStorage.removeItem(
      activeProjectStorageKey(userId),
    )
  }
  
  export function createResearchProject({
    userId,
    map,
    expandedNodeIds =
      [],
    activeTab = 'agent',
    title,
  }: {
    userId: string

    map:
      ResearchMap
  
    expandedNodeIds?:
      string[]

    activeTab?: ResearchProject['activeTab']
  
    title?:
      string
  }) {
    const now =
      new Date().toISOString()
  
    const project:
      ResearchProject = {
        version:
          1,
  
        id:
          makeProjectId(),

        ownerId:
          userId,
  
        title:
          title ??
          makeProjectTitle(
            map.question,
          ),
  
        question:
          map.question,
  
        researchMap:
          map,
  
        expandedNodeIds,

        activeTab,
  
        createdAt:
          now,
  
        updatedAt:
          now,
      }
  
    const projects =
      readProjects(userId)
  
    writeProjects(userId, [
      project,
      ...projects,
    ])
  
    setActiveProjectId(
      project.id,
      userId,
    )
  
    return project
  }
  
  export function saveResearchProject({
    userId,
    projectId,
    map,
    expandedNodeIds,
    activeTab,
  }: {
    userId: string

    projectId:
      string
  
    map:
      ResearchMap
  
    expandedNodeIds:
      string[]

    activeTab?: ResearchProject['activeTab']
  }) {
    const projects =
      readProjects(userId)
  
    const existing =
      projects.find(
        (
          project,
        ) =>
          project.id ===
          projectId,
      )
  
    if (
      !existing
    ) {
      return null
    }
  
    const updated:
      ResearchProject = {
        ...existing,
  
        question:
          map.question,
  
        researchMap:
          map,
  
        expandedNodeIds,

        activeTab:
          activeTab ?? existing.activeTab,
  
        updatedAt:
          new Date().toISOString(),
      }
  
    writeProjects(
      userId,
      projects.map(
        (
          project,
        ) =>
          project.id ===
          projectId
            ? updated
            : project,
      ),
    )
  
    return updated
  }
  
  export function renameResearchProject(
    projectId:
      string,
  
    title:
      string,
    userId: string,
  ) {
    const cleaned =
      title.trim()
  
    if (
      !cleaned
    ) {
      return null
    }
  
    const projects =
      readProjects(userId)
  
    const existing =
      projects.find(
        (
          project,
        ) =>
          project.id ===
          projectId,
      )
  
    if (
      !existing
    ) {
      return null
    }
  
    const updated:
      ResearchProject = {
        ...existing,
  
        title:
          cleaned,
  
        updatedAt:
          new Date().toISOString(),
      }
  
    writeProjects(
      userId,
      projects.map(
        (
          project,
        ) =>
          project.id ===
          projectId
            ? updated
            : project,
      ),
    )
  
    return updated
  }
  
  export function deleteResearchProject(
    projectId:
      string,
    userId: string,
  ) {
    const projects =
      readProjects(userId)
  
    writeProjects(
      userId,
      projects.filter(
        (
          project,
        ) =>
          project.id !==
          projectId,
      ),
    )
  
    if (
      getActiveProjectId(userId) ===
      projectId
    ) {
      clearActiveProjectId(userId)
    }
  }
  