import type { BiomedicalEntityType } from '../../types/biomedical'

export interface EntityVisualConfig {
  color: string
  bg: string
  border: string
  icon: string
  label: string
  abbr: string
}

const config: Record<BiomedicalEntityType, EntityVisualConfig> = {
  disease: {
    color: '#2563eb',
    bg: '#eff4ff',
    border: '#bfdbfe',
    icon: 'disease',
    label: 'Disease',
    abbr: 'DIS',
  },
  gene: {
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    icon: 'gene',
    label: 'Gene',
    abbr: 'GEN',
  },
  pathway: {
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: 'pathway',
    label: 'Pathway',
    abbr: 'PTH',
  },
  drug: {
    color: '#9333ea',
    bg: '#faf5ff',
    border: '#e9d5ff',
    icon: 'drug',
    label: 'Drug',
    abbr: 'DRG',
  },
  phenotype: {
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: 'phenotype',
    label: 'Phenotype',
    abbr: 'PHN',
  },
  anatomy: {
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    icon: 'anatomy',
    label: 'Anatomy',
    abbr: 'ANA',
  },
  function: {
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    icon: 'function',
    label: 'Function',
    abbr: 'FNC',
  },
  variant: {
    color: '#be185d',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    icon: 'variant',
    label: 'Variant',
    abbr: 'VAR',
  },
}

export function entityVisuals(type: BiomedicalEntityType): EntityVisualConfig {
  return config[type] ?? config.function
}

export function allEntityVisuals(): { type: BiomedicalEntityType; visual: EntityVisualConfig }[] {
  return (Object.keys(config) as BiomedicalEntityType[]).map((type) => ({
    type,
    visual: config[type],
  }))
}

export const relationshipLabels: Record<string, string> = {
  'associated-with': 'associated with',
  'participates-in': 'participates in',
  involves: 'involves',
  treats: 'treats',
  targets: 'targets',
  'has-phenotype': 'has phenotype',
  'expressed-in': 'expressed in',
  causes: 'causes',
  'related-to': 'related to',
}

export const evidenceStyles: Record<string, { stroke: string; width: number; dash?: string }> = {
  strong: { stroke: '#6b7280', width: 1.8 },
  moderate: { stroke: '#9ca3af', width: 1.4 },
  limited: { stroke: '#c7c9c1', width: 1.2, dash: '5 4' },
  default: { stroke: '#b8bab2', width: 1.3 },
}
