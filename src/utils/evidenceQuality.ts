export type SourceCredibility = 'high' | 'moderate' | 'limited' | 'unverified'
export type AssessedEvidenceStrength = 'strong' | 'moderate' | 'limited' | 'unrated'

export interface EvidenceCandidate {
  provider?: string
  source?: string
  url?: string
  type?: string
}

export interface EvidenceAssessment {
  sourceCredibility: SourceCredibility
  sourceLabel: string
  sourceReason: string
  strength: AssessedEvidenceStrength
  strengthLabel: string
  strengthReason: string
}

function sourceTrust(candidate: EvidenceCandidate) {
  const provider = candidate.provider?.toLowerCase() ?? ''
  const source = candidate.source?.toLowerCase() ?? ''
  let hostname = ''

  try {
    hostname = candidate.url ? new URL(candidate.url).hostname.toLowerCase() : ''
  } catch {
    hostname = ''
  }

  if (
    /(^|\.)(tiktok\.com|instagram\.com|facebook\.com|youtube\.com)$/.test(hostname)
  ) {
    return {
      level: 'limited' as const,
      label: 'Social media source',
      reason: 'Social-media content is not independently peer reviewed.',
    }
  }

  if (
    provider === 'pubmed' ||
    hostname === 'pubmed.ncbi.nlm.nih.gov' ||
    hostname === 'pmc.ncbi.nlm.nih.gov' ||
    hostname === 'clinicaltrials.gov' ||
    hostname.endsWith('.gov') ||
    hostname === 'who.int' ||
    hostname.endsWith('.who.int') ||
    hostname.endsWith('cochranelibrary.com') ||
    source.includes('national library of medicine') ||
    source.includes('cochrane database')
  ) {
    return {
      level: 'high' as const,
      label: 'High traceability',
      reason: 'Indexed by or hosted at a recognized public biomedical source; this does not endorse the findings.',
    }
  }

  if (['crossref', 'openalex', 'semantic scholar'].includes(provider)) {
    return {
      level: 'moderate' as const,
      label: 'Scholarly metadata index',
      reason: 'This service helps identify publications but does not certify their methods or conclusions.',
    }
  }

  return {
    level: 'unverified' as const,
    label: 'Source unverified',
    reason: 'The publisher or source could not be verified from the available metadata.',
  }
}

function studyDesign(type = ''): 'strong' | 'moderate' | 'limited' | 'unknown' {
  const normalized = type.toLowerCase()

  if (/case report|case series|editorial|letter|commentary|news|in vitro|animal study|preprint/.test(normalized)) {
    return 'limited'
  }

  if (/systematic review|meta-analysis|randomi[sz]ed controlled trial|clinical practice guideline/.test(normalized)) {
    return 'strong'
  }

  if (/cohort|case-control|observational|controlled clinical trial|clinical trial|comparative study|review/.test(normalized)) {
    return 'moderate'
  }

  return 'unknown'
}

export function assessEvidence(candidate: EvidenceCandidate): EvidenceAssessment {
  const trust = sourceTrust(candidate)
  const design = studyDesign(candidate.type)

  let strength: AssessedEvidenceStrength = 'unrated'
  let strengthReason = 'Publication type or study design was not available.'

  if (trust.level === 'limited' || design === 'limited') {
    strength = 'limited'
    strengthReason = design === 'limited'
      ? 'The listed publication type is preliminary, non-peer-reviewed, or lower-level evidence.'
      : 'The source is social-media content rather than a vetted biomedical publication.'
  } else if (design === 'strong') {
    strength = trust.level === 'high' ? 'strong' : 'moderate'
    strengthReason = trust.level === 'high'
      ? 'A higher-level study design is listed and the record is traceable to a recognized public source.'
      : 'A higher-level study design is listed, but source metadata is not independently verified.'
  } else if (design === 'moderate') {
    strength = trust.level === 'high' ? 'moderate' : 'limited'
    strengthReason = trust.level === 'high'
      ? 'The publication type is identifiable in a traceable public source, but is not a high-level design by itself.'
      : 'The listed design and source metadata do not establish strong evidence on their own.'
  }

  return {
    sourceCredibility: trust.level,
    sourceLabel: trust.label,
    sourceReason: trust.reason,
    strength,
    strengthLabel: strength === 'unrated'
      ? 'Unrated'
      : `${strength.charAt(0).toUpperCase()}${strength.slice(1)}`,
    strengthReason,
  }
}