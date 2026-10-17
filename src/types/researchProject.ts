import type {
    ResearchMap,
  } from './researchMap'

  export type ResearchWorkspaceTab =
    | 'agent'
    | 'evidence'
    | 'visualize'
    | 'connections'
  
  export interface ResearchProject {
    version: 1
    id: string
    ownerId: string
    title: string
    question: string
    researchMap: ResearchMap
    expandedNodeIds: string[]
    activeTab?: ResearchWorkspaceTab
    createdAt: string
    updatedAt: string
  }
  
  export interface ResearchProjectSummary {
    id: string
    title: string
    question: string
    conceptCount: number
    relationshipCount: number
    sourceCount: number
    trialCount: number
    createdAt: string
    updatedAt: string
  }
  