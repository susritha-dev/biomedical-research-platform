import {
  AlertTriangle,
  ArrowRight,
  Beaker,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Lightbulb,
  Microscope,
  Network,
  ShieldCheck,
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

import { AnatomyModel3D } from './AnatomyModel3D'
import './ResearchVisualization.css'

interface ResearchVisualizationProps {
  project?: unknown
  map: ResearchMap
  onOpenMap: () => void
}

type VisualKind =
  | 'sod1-als'
  | 'tbi'
  | 'crispr'
  | 'drug'
  | 'general'

interface LearningStep {
  id: string
  label: string
  title: string
  studentPrompt: string
  explanation: string
  evidenceNeeded: string
  uncertainty: string
  nextTest: string
  x: number
  y: number
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getVisualKind(question: string): VisualKind {
  const normalized = normalizeText(question)

  if (normalized.includes('sod1') && normalized.includes('als')) {
    return 'sod1-als'
  }

  if (
    normalized.includes('tbi') ||
    normalized.includes('traumatic brain injury') ||
    normalized.includes('brain injury') ||
    normalized.includes('concussion')
  ) {
    return 'tbi'
  }

  if (
    normalized.includes('crispr') ||
    normalized.includes('cas9') ||
    normalized.includes('guide rna') ||
    normalized.includes('gene editing')
  ) {
    return 'crispr'
  }

  if (
    normalized.includes('drug') ||
    normalized.includes('receptor') ||
    normalized.includes('binding') ||
    normalized.includes('ligand') ||
    normalized.includes('compound')
  ) {
    return 'drug'
  }

  return 'general'
}

function getVisualTitle(kind: VisualKind) {
  if (kind === 'sod1-als') {
    return 'SOD1 and ALS research model'
  }

  if (kind === 'tbi') {
    return 'Traumatic brain injury cascade model'
  }

  if (kind === 'crispr') {
    return 'CRISPR-Cas9 targeting model'
  }

  if (kind === 'drug') {
    return 'Drug-receptor binding model'
  }

  return 'Science research model'
}

function getVisualSubtitle(kind: VisualKind) {
  if (kind === 'sod1-als') {
    return 'Follow the pathway from SOD1 biology to motor neuron vulnerability and ALS evidence.'
  }

  if (kind === 'tbi') {
    return 'Follow the pathway from mechanical impact to secondary injury and symptoms.'
  }

  if (kind === 'crispr') {
    return 'Follow how guide RNA, PAM recognition, Cas9 cleavage, and DNA repair work together.'
  }

  if (kind === 'drug') {
    return 'Follow the path from compound binding to target engagement, pathway response, and validation.'
  }

  return 'Follow the research process from claim to mechanism, evidence, uncertainty, and next test.'
}

function getLearningSteps(kind: VisualKind): LearningStep[] {
  if (kind === 'sod1-als') {
    return [
      {
        id: 'sod1',
        label: '1',
        title: 'Identify the named biological target',
        studentPrompt: 'What is the first thing the question names?',
        explanation:
          'The question names SOD1. Helix treats SOD1 as the starting biological target, usually discussed as a gene or protein.',
        evidenceNeeded:
          'A source should clearly discuss SOD1 mutation, dysfunction, altered protein behavior, or SOD1-linked ALS.',
        uncertainty:
          'SOD1 is not automatically the explanation for every ALS case. The app must avoid overgeneralizing.',
        nextTest:
          'Check whether the strongest papers are specifically about SOD1-linked ALS or broad ALS biology.',
        x: 16,
        y: 30,
      },
      {
        id: 'protein-stress',
        label: '2',
        title: 'Propose the mechanism',
        studentPrompt: 'How could the target create a biological problem?',
        explanation:
          'A possible mechanism is that SOD1 dysfunction contributes to protein stress, misfolding, aggregation, oxidative stress, or cell stress.',
        evidenceNeeded:
          'Evidence should connect SOD1 changes to measurable stress pathways or protein-quality-control problems.',
        uncertainty:
          'A source that only mentions SOD1 is not enough. It needs to explain the mechanism.',
        nextTest:
          'Compare papers about SOD1 misfolding, oxidative stress, aggregation, proteostasis, and toxicity.',
        x: 40,
        y: 44,
      },
      {
        id: 'motor-neuron',
        label: '3',
        title: 'Connect mechanism to the affected system',
        studentPrompt: 'Which cell type or system must be affected?',
        explanation:
          'For ALS, the mechanism must connect to motor neurons, because motor neuron dysfunction or loss is central to the disease.',
        evidenceNeeded:
          'Evidence should show effects in motor neurons, ALS models, tissue, or disease-relevant cellular systems.',
        uncertainty:
          'General cell stress evidence is weaker if it does not connect to motor neurons.',
        nextTest:
          'Look for studies using motor-neuron models, ALS patient-derived cells, or disease-relevant systems.',
        x: 66,
        y: 57,
      },
      {
        id: 'als-outcome',
        label: '4',
        title: 'Check the disease outcome',
        studentPrompt: 'What claim would prove the connection matters?',
        explanation:
          'The final connection is whether SOD1-related biology helps explain ALS pathology, progression, or disease features.',
        evidenceNeeded:
          'Strong evidence should connect SOD1 biology to ALS outcomes, not just molecular changes.',
        uncertainty:
          'The app should label this as a supported hypothesis unless sources directly prove the relationship.',
        nextTest:
          'Separate human evidence, animal-model evidence, and cell-culture evidence before making a claim.',
        x: 84,
        y: 32,
      },
    ]
  }

  if (kind === 'tbi') {
    return [
      {
        id: 'impact',
        label: '1',
        title: 'Start with the triggering event',
        studentPrompt: 'What starts the system changing?',
        explanation:
          'TBI begins with a mechanical force, such as impact, acceleration, deceleration, or blast exposure.',
        evidenceNeeded:
          'Evidence should describe the physical injury mechanism or biomechanics.',
        uncertainty:
          'The exact injury depends on force, direction, location, severity, and patient context.',
        nextTest:
          'Identify whether the source is discussing mild TBI, severe TBI, concussion, blast injury, or another type.',
        x: 24,
        y: 30,
      },
      {
        id: 'primary-injury',
        label: '2',
        title: 'Locate the primary injury',
        studentPrompt: 'What is damaged first?',
        explanation:
          'Primary injury can include tissue disruption, vascular injury, direct neural damage, or stretching of neural connections.',
        evidenceNeeded:
          'Evidence should show immediate damage patterns or injury markers.',
        uncertainty:
          'A diagram cannot represent a specific patient brain without imaging or clinical data.',
        nextTest:
          'Check whether sources describe structural injury, bleeding, axonal strain, or regional brain effects.',
        x: 42,
        y: 52,
      },
      {
        id: 'secondary-cascade',
        label: '3',
        title: 'Follow the secondary cascade',
        studentPrompt: 'What continues after the first injury?',
        explanation:
          'Secondary injury may involve inflammation, metabolic stress, oxidative stress, vascular changes, and diffuse axonal injury.',
        evidenceNeeded:
          'Evidence should connect these processes to time after injury, biomarkers, or outcomes.',
        uncertainty:
          'Different secondary mechanisms may dominate in different cases.',
        nextTest:
          'Compare evidence for inflammation, axonal injury, vascular damage, and metabolic crisis separately.',
        x: 64,
        y: 38,
      },
      {
        id: 'symptoms',
        label: '4',
        title: 'Connect biology to function',
        studentPrompt: 'How would the mechanism show up in the person?',
        explanation:
          'The model should connect biological changes to symptoms such as memory, attention, mood, movement, or recovery changes.',
        evidenceNeeded:
          'Evidence should link biological markers to measured symptoms or recovery outcomes.',
        uncertainty:
          'Symptoms are not specific to one mechanism, so the claim needs careful support.',
        nextTest:
          'Check whether studies link mechanisms to cognitive, behavioral, neurological, or recovery outcomes.',
        x: 78,
        y: 68,
      },
    ]
  }

  if (kind === 'crispr') {
    return [
      {
        id: 'guide-rna',
        label: '1',
        title: 'Use the guide RNA as the address',
        studentPrompt: 'What tells Cas9 where to go?',
        explanation:
          'The guide RNA contains sequence information that helps direct Cas9 to a matching DNA target.',
        evidenceNeeded:
          'Evidence should explain guide RNA complementarity and target recognition.',
        uncertainty:
          'A matching guide does not guarantee perfect specificity.',
        nextTest:
          'Check whether sources discuss mismatch tolerance and off-target effects.',
        x: 20,
        y: 67,
      },
      {
        id: 'pam',
        label: '2',
        title: 'Check the PAM requirement',
        studentPrompt: 'What rule controls whether Cas9 can bind?',
        explanation:
          'Cas9 usually needs a nearby PAM sequence before it can bind and cut the target DNA.',
        evidenceNeeded:
          'Evidence should identify the PAM rule for the specific Cas system being discussed.',
        uncertainty:
          'PAM rules differ across Cas proteins and engineered variants.',
        nextTest:
          'Verify whether the question is about standard SpCas9 or another CRISPR system.',
        x: 43,
        y: 34,
      },
      {
        id: 'cas9-cut',
        label: '3',
        title: 'Model the cutting step',
        studentPrompt: 'What does Cas9 actually do?',
        explanation:
          'Cas9 creates a DNA break near the target site. Cutting is not the same as guaranteeing a final edit.',
        evidenceNeeded:
          'Evidence should distinguish target binding from DNA cleavage.',
        uncertainty:
          'Cutting efficiency depends on guide design, chromatin context, cell type, and experimental setup.',
        nextTest:
          'Look for sources measuring cleavage efficiency and specificity.',
        x: 58,
        y: 51,
      },
      {
        id: 'repair',
        label: '4',
        title: 'Explain the final editing outcome',
        studentPrompt: 'What determines the final edit?',
        explanation:
          'Cellular DNA repair pathways determine whether the result is an indel, disruption, insertion, or precise repair.',
        evidenceNeeded:
          'Evidence should discuss repair pathways such as NHEJ or HDR.',
        uncertainty:
          'Repair outcomes vary across cell types and experimental conditions.',
        nextTest:
          'Separate evidence about Cas9 cutting from evidence about final DNA repair outcomes.',
        x: 80,
        y: 35,
      },
    ]
  }

  if (kind === 'drug') {
    return [
      {
        id: 'compound',
        label: '1',
        title: 'Identify the compound',
        studentPrompt: 'What molecule is being tested?',
        explanation:
          'The compound or drug is the candidate molecule. The first research task is to verify whether it actually binds a target.',
        evidenceNeeded:
          'Evidence should include binding assays, affinity data, structural evidence, or target engagement.',
        uncertainty:
          'Predicted binding is weaker than measured experimental binding.',
        nextTest:
          'Check whether the source reports experimental binding or only computational prediction.',
        x: 20,
        y: 38,
      },
      {
        id: 'receptor',
        label: '2',
        title: 'Find the biological target',
        studentPrompt: 'Where does the molecule act?',
        explanation:
          'The receptor or protein target is the biological structure the compound may bind or modify.',
        evidenceNeeded:
          'Evidence should identify the receptor, protein, enzyme, or pathway target.',
        uncertainty:
          'A compound can bind multiple targets, and target identity may be uncertain.',
        nextTest:
          'Look for selectivity, target engagement, or structure-function data.',
        x: 45,
        y: 52,
      },
      {
        id: 'signal',
        label: '3',
        title: 'Connect binding to function',
        studentPrompt: 'Does binding actually change biology?',
        explanation:
          'A useful drug mechanism needs evidence that binding changes a pathway, signal, phenotype, or cellular response.',
        evidenceNeeded:
          'Evidence should show functional response, pathway readout, dose response, or phenotype change.',
        uncertainty:
          'Binding alone does not prove therapeutic effect.',
        nextTest:
          'Separate binding evidence from functional assay evidence.',
        x: 66,
        y: 34,
      },
      {
        id: 'validation',
        label: '4',
        title: 'Validate the claim',
        studentPrompt: 'What evidence would make the claim stronger?',
        explanation:
          'The strongest claim needs multiple evidence types: binding, function, reproducibility, and biological relevance.',
        evidenceNeeded:
          'Evidence should include experimental validation beyond a single prediction.',
        uncertainty:
          'Early evidence may not translate to clinical usefulness.',
        nextTest:
          'Check whether the evidence is computational, cell-based, animal-based, or clinical.',
        x: 82,
        y: 64,
      },
    ]
  }

  return [
    {
      id: 'claim',
      label: '1',
      title: 'Define the research claim',
      studentPrompt: 'What exactly is the question asking?',
      explanation:
        'Helix first turns the user’s question into a claim that can be checked with evidence.',
      evidenceNeeded:
        'The question should include a named disease, process, gene, protein, pathway, compound, or outcome.',
      uncertainty:
        'If the question is broad, detailed diagrams may become misleading.',
      nextTest:
        'Ask a more specific question using a named biological target and outcome.',
      x: 20,
      y: 38,
    },
    {
      id: 'mechanism',
      label: '2',
      title: 'Propose a mechanism',
      studentPrompt: 'How might the relationship work?',
      explanation:
        'A mechanism explains how or why a relationship could happen.',
      evidenceNeeded:
        'Evidence should describe a direct process, pathway, experiment, or causal explanation.',
      uncertainty:
        'Topic similarity is not the same as a mechanism.',
      nextTest:
        'Search for papers that directly explain the relationship.',
      x: 42,
      y: 58,
    },
    {
      id: 'evidence',
      label: '3',
      title: 'Check source support',
      studentPrompt: 'What evidence would support the mechanism?',
      explanation:
        'The Evidence tab should verify whether sources directly support the relationship.',
      evidenceNeeded:
        'Look for direct evidence, not just keyword overlap.',
      uncertainty:
        'A paper may mention both terms without proving a relationship.',
      nextTest:
        'Compare abstracts and source types before making a conclusion.',
      x: 64,
      y: 38,
    },
    {
      id: 'uncertainty',
      label: '4',
      title: 'Decide what is still unknown',
      studentPrompt: 'What should be tested next?',
      explanation:
        'Good research clearly identifies what is not yet proven.',
      evidenceNeeded:
        'The next experiment should target the biggest missing piece.',
      uncertainty:
        'Without uncertainty, the app may sound more confident than the evidence allows.',
      nextTest:
        'Choose the next test that would most reduce uncertainty.',
      x: 82,
      y: 58,
    },
  ]
}

function formatValue(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function SOD1Diagram({
  activeStepId,
}: {
  activeStepId: string
}) {
  return (
    <svg viewBox="0 0 1000 560" className="helix-learning-svg" role="img" aria-label="SOD1 to ALS pathway model">
      <defs>
        <marker id="helix-arrow" markerWidth="12" markerHeight="12" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" />
        </marker>
      </defs>

      <rect x="54" y="112" width="190" height="118" rx="28" className={activeStepId === 'sod1' ? 'svg-node svg-active' : 'svg-node'} />
      <text x="149" y="160" textAnchor="middle" className="svg-title">SOD1</text>
      <text x="149" y="188" textAnchor="middle" className="svg-small">gene / protein</text>

      <path d="M322 190 C345 105, 470 95, 512 176 C550 249, 453 306, 365 265 C318 243, 297 222, 322 190Z" className={activeStepId === 'protein-stress' ? 'svg-cell svg-active-stroke' : 'svg-cell'} />
      <circle cx="412" cy="190" r="37" className="svg-nucleus" />
      <path d="M360 245 C390 210, 435 245, 466 212" className="svg-squiggle" />
      <text x="410" y="335" textAnchor="middle" className="svg-title">Cell stress</text>
      <text x="410" y="363" textAnchor="middle" className="svg-small">misfolding / oxidation</text>

      <path d="M616 116 C668 86, 747 123, 744 191 C742 252, 662 285, 612 242 C573 208, 574 142, 616 116Z" className={activeStepId === 'motor-neuron' ? 'svg-neuron svg-active-stroke' : 'svg-neuron'} />
      <circle cx="670" cy="176" r="24" className="svg-nucleus" />
      <path d="M719 220 C785 232, 842 263, 910 304" className="svg-axon" />
      <path d="M617 146 C570 112, 535 102, 492 88" className="svg-dendrite" />
      <path d="M615 235 C572 286, 534 316, 485 344" className="svg-dendrite" />
      <text x="700" y="355" textAnchor="middle" className="svg-title">Motor neuron</text>

      <rect x="780" y="82" width="160" height="105" rx="26" className={activeStepId === 'als-outcome' ? 'svg-danger svg-active' : 'svg-danger'} />
      <text x="860" y="127" textAnchor="middle" className="svg-title">ALS</text>
      <text x="860" y="154" textAnchor="middle" className="svg-small">outcome</text>

      <path d="M245 170 C278 171, 295 182, 322 194" className="svg-arrow" />
      <path d="M512 195 C552 195, 575 184, 611 174" className="svg-arrow" />
      <path d="M743 154 C760 143, 770 136, 780 132" className="svg-arrow" />

      <text x="282" y="142" className="svg-label">dysfunction?</text>
      <text x="526" y="164" className="svg-label">stress?</text>
      <text x="733" y="111" className="svg-label">disease link?</text>
    </svg>
  )
}

function TBIDiagram({
  activeStepId,
}: {
  activeStepId: string
}) {
  return (
    <svg viewBox="0 0 1000 560" className="helix-learning-svg" role="img" aria-label="Traumatic brain injury cascade model">
      <defs>
        <marker id="helix-arrow" markerWidth="12" markerHeight="12" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" />
        </marker>
      </defs>

      <path d="M258 105 C142 125, 105 248, 170 358 C232 462, 383 456, 477 376 C570 295, 548 164, 432 120 C380 100, 318 94, 258 105Z" className="svg-brain" />
      <path d="M250 170 C312 132, 390 145, 425 210" className="svg-brain-line" />
      <path d="M185 266 C276 228, 340 252, 430 316" className="svg-brain-line" />
      <path d="M250 380 C315 336, 395 346, 470 370" className="svg-brain-line" />

      <path d="M95 132 L190 200" className={activeStepId === 'impact' ? 'svg-impact svg-active-stroke' : 'svg-impact'} />
      <path d="M110 205 L205 238" className={activeStepId === 'impact' ? 'svg-impact svg-active-stroke' : 'svg-impact'} />
      <path d="M145 290 L220 270" className={activeStepId === 'impact' ? 'svg-impact svg-active-stroke' : 'svg-impact'} />

      <circle cx="360" cy="255" r="66" className={activeStepId === 'primary-injury' ? 'svg-injury-zone svg-active-stroke' : 'svg-injury-zone'} />
      <text x="360" y="250" textAnchor="middle" className="svg-title">Primary</text>
      <text x="360" y="280" textAnchor="middle" className="svg-title">injury</text>

      <rect x="620" y="94" width="270" height="84" rx="24" className={activeStepId === 'secondary-cascade' ? 'svg-secondary svg-active' : 'svg-secondary'} />
      <text x="755" y="129" textAnchor="middle" className="svg-title">Inflammation</text>
      <text x="755" y="156" textAnchor="middle" className="svg-small">secondary cascade</text>

      <rect x="620" y="235" width="270" height="84" rx="24" className={activeStepId === 'secondary-cascade' ? 'svg-secondary svg-active' : 'svg-secondary'} />
      <text x="755" y="270" textAnchor="middle" className="svg-title">Axonal injury</text>
      <text x="755" y="297" textAnchor="middle" className="svg-small">connection damage</text>

      <rect x="620" y="378" width="270" height="84" rx="24" className={activeStepId === 'symptoms' ? 'svg-danger svg-active' : 'svg-danger'} />
      <text x="755" y="413" textAnchor="middle" className="svg-title">Symptoms</text>
      <text x="755" y="440" textAnchor="middle" className="svg-small">function / recovery</text>

      <path d="M438 238 C520 166, 560 138, 620 136" className="svg-arrow" />
      <path d="M456 275 C522 275, 560 276, 620 277" className="svg-arrow" />
      <path d="M430 326 C520 390, 560 418, 620 420" className="svg-arrow" />
    </svg>
  )
}

function CRISPRDiagram({
  activeStepId,
}: {
  activeStepId: string
}) {
  return (
    <svg viewBox="0 0 1000 560" className="helix-learning-svg" role="img" aria-label="CRISPR Cas9 targeting model">
      <defs>
        <marker id="helix-arrow" markerWidth="12" markerHeight="12" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" />
        </marker>
      </defs>

      <path d="M85 250 C170 180, 250 320, 335 250 C420 180, 500 320, 585 250 C670 180, 750 320, 835 250 C882 211, 915 225, 940 250" className="svg-dna-a" />
      <path d="M85 310 C170 380, 250 240, 335 310 C420 380, 500 240, 585 310 C670 380, 750 240, 835 310 C882 349, 915 335, 940 310" className="svg-dna-b" />

      {[145, 225, 305, 385, 465, 545, 625, 705, 785, 865].map((x) => (
        <line key={x} x1={x} y1="247" x2={x} y2="313" className="svg-dna-rung" />
      ))}

      <path d="M150 420 C235 370, 320 370, 405 420" className={activeStepId === 'guide-rna' ? 'svg-guide svg-active-stroke' : 'svg-guide'} />
      <text x="280" y="464" textAnchor="middle" className="svg-title">guide RNA</text>

      <rect x="492" y="155" width="155" height="140" rx="38" className={activeStepId === 'cas9-cut' ? 'svg-cas9 svg-active' : 'svg-cas9'} />
      <text x="570" y="218" textAnchor="middle" className="svg-title">Cas9</text>
      <text x="570" y="248" textAnchor="middle" className="svg-small">cutting enzyme</text>

      <rect x="690" y="165" width="110" height="50" rx="18" className={activeStepId === 'pam' ? 'svg-pam svg-active' : 'svg-pam'} />
      <text x="745" y="198" textAnchor="middle" className="svg-title">PAM</text>

      <rect x="720" y="390" width="205" height="82" rx="24" className={activeStepId === 'repair' ? 'svg-node svg-active' : 'svg-node'} />
      <text x="823" y="424" textAnchor="middle" className="svg-title">Repair</text>
      <text x="823" y="452" textAnchor="middle" className="svg-small">NHEJ / HDR</text>

      <path d="M400 407 C455 350, 480 300, 515 268" className="svg-arrow" />
      <path d="M647 205 C668 195, 678 195, 690 195" className="svg-arrow" />
      <path d="M610 293 C650 350, 706 392, 770 430" className="svg-arrow" />
    </svg>
  )
}

function DrugDiagram({
  activeStepId,
}: {
  activeStepId: string
}) {
  return (
    <svg viewBox="0 0 1000 560" className="helix-learning-svg" role="img" aria-label="Drug receptor binding model">
      <defs>
        <marker id="helix-arrow" markerWidth="12" markerHeight="12" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" />
        </marker>
      </defs>

      <rect x="80" y="300" width="840" height="55" rx="24" className="svg-membrane" />

      <g className={activeStepId === 'compound' ? 'svg-active-group' : ''}>
        <circle cx="185" cy="225" r="35" className="svg-drug" />
        <circle cx="238" cy="185" r="22" className="svg-drug" />
        <circle cx="246" cy="260" r="25" className="svg-drug" />
        <line x1="210" y1="210" x2="225" y2="195" className="svg-bond" />
        <line x1="210" y1="238" x2="225" y2="252" className="svg-bond" />
      </g>

      <text x="215" y="330" textAnchor="middle" className="svg-title">compound</text>

      <path d="M430 150 C355 190, 345 310, 415 355 C485 400, 590 360, 595 275 C600 190, 510 105, 430 150Z" className={activeStepId === 'receptor' ? 'svg-receptor svg-active-stroke' : 'svg-receptor'} />
      <path d="M448 210 C478 190, 525 205, 535 245 C545 285, 500 310, 465 290" className="svg-pocket" />
      <text x="510" y="120" textAnchor="middle" className="svg-title">receptor</text>

      <path d="M280 225 C340 210, 385 220, 440 245" className="svg-arrow" />

      <path d="M600 245 C665 210, 740 210, 805 245" className={activeStepId === 'signal' ? 'svg-signal svg-active-stroke' : 'svg-signal'} />
      <path d="M600 270 C665 310, 740 310, 805 270" className={activeStepId === 'signal' ? 'svg-signal svg-active-stroke' : 'svg-signal'} />
      <text x="720" y="180" textAnchor="middle" className="svg-title">pathway signal</text>

      <rect x="720" y="380" width="210" height="76" rx="22" className={activeStepId === 'validation' ? 'svg-node svg-active' : 'svg-node'} />
      <text x="825" y="414" textAnchor="middle" className="svg-title">validation</text>
      <text x="825" y="438" textAnchor="middle" className="svg-small">assay evidence</text>

      <path d="M755 304 C770 340, 790 365, 820 380" className="svg-arrow" />
    </svg>
  )
}

function GeneralDiagram({
  activeStepId,
}: {
  activeStepId: string
}) {
  return (
    <svg viewBox="0 0 1000 560" className="helix-learning-svg" role="img" aria-label="General science research model">
      <defs>
        <marker id="helix-arrow" markerWidth="12" markerHeight="12" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" />
        </marker>
      </defs>

      <rect x="90" y="170" width="180" height="120" rx="30" className={activeStepId === 'claim' ? 'svg-node svg-active' : 'svg-node'} />
      <text x="180" y="220" textAnchor="middle" className="svg-title">Claim</text>
      <text x="180" y="250" textAnchor="middle" className="svg-small">what is tested</text>

      <rect x="325" y="310" width="190" height="120" rx="30" className={activeStepId === 'mechanism' ? 'svg-secondary svg-active' : 'svg-secondary'} />
      <text x="420" y="360" textAnchor="middle" className="svg-title">Mechanism</text>
      <text x="420" y="390" textAnchor="middle" className="svg-small">how it works</text>

      <rect x="560" y="170" width="190" height="120" rx="30" className={activeStepId === 'evidence' ? 'svg-node svg-active' : 'svg-node'} />
      <text x="655" y="220" textAnchor="middle" className="svg-title">Evidence</text>
      <text x="655" y="250" textAnchor="middle" className="svg-small">source support</text>

      <rect x="790" y="310" width="150" height="120" rx="30" className={activeStepId === 'uncertainty' ? 'svg-danger svg-active' : 'svg-danger'} />
      <text x="865" y="360" textAnchor="middle" className="svg-title">Unknown</text>
      <text x="865" y="390" textAnchor="middle" className="svg-small">next test</text>

      <path d="M270 235 C320 245, 345 290, 365 315" className="svg-arrow" />
      <path d="M515 365 C560 345, 610 300, 635 290" className="svg-arrow" />
      <path d="M750 245 C800 270, 830 300, 850 315" className="svg-arrow" />
    </svg>
  )
}

function ModelDiagram({
  kind,
  activeStepId,
}: {
  kind: VisualKind
  activeStepId: string
}) {
  if (kind === 'sod1-als') {
    return <SOD1Diagram activeStepId={activeStepId} />
  }

  if (kind === 'tbi') {
    return <TBIDiagram activeStepId={activeStepId} />
  }

  if (kind === 'crispr') {
    return <CRISPRDiagram activeStepId={activeStepId} />
  }

  if (kind === 'drug') {
    return <DrugDiagram activeStepId={activeStepId} />
  }

  return <GeneralDiagram activeStepId={activeStepId} />
}

function getStatusIcon(status: string) {
  if (status === 'reasonable_starting_point') {
    return <CheckCircle2 size={16} />
  }

  if (status === 'needs_evidence') {
    return <Beaker size={16} />
  }

  return <AlertTriangle size={16} />
}

function getStatusText(status: string) {
  if (status === 'reasonable_starting_point') {
    return 'Starting point'
  }

  if (status === 'needs_evidence') {
    return 'Needs evidence'
  }

  return 'Unresolved'
}

export function ResearchVisualization({
  map,
  onOpenMap,
}: ResearchVisualizationProps) {
  const researchAnalysis = useMemo(
    () => analyzeResearchQuestion(map.question, map),
    [map],
  )

  const visualKind = useMemo(
    () => getVisualKind(map.question),
    [map.question],
  )

  const learningSteps = useMemo(
    () => getLearningSteps(visualKind),
    [visualKind],
  )

  const [activeStepId, setActiveStepId] = useState(learningSteps[0]?.id || '')
  const [viewMode, setViewMode] = useState<'3d' | 'diagram'>('3d')

  useEffect(() => {
    setActiveStepId(learningSteps[0]?.id || '')
  }, [learningSteps])

  const activeStep =
    learningSteps.find((step) => step.id === activeStepId) ||
    learningSteps[0]

  const activeIndex = Math.max(
    0,
    learningSteps.findIndex((step) => step.id === activeStep?.id),
  )

  const bestMechanism = researchAnalysis.mechanisms[0]
  const bestConnection = researchAnalysis.connections[0]

  function goToPreviousStep() {
    const nextIndex = Math.max(activeIndex - 1, 0)
    setActiveStepId(learningSteps[nextIndex]?.id || activeStepId)
  }

  function goToNextStep() {
    const nextIndex = Math.min(activeIndex + 1, learningSteps.length - 1)
    setActiveStepId(learningSteps[nextIndex]?.id || activeStepId)
  }

  return (
    <main className="helix-model-page">
      <section className="helix-model-shell">
        <header className="helix-model-hero">
          <div>
            <span className="helix-model-kicker">
              <ShieldCheck size={16} />

              Interactive science model
            </span>

            <h1>
              {getVisualTitle(visualKind)}
            </h1>

            <p>
              {getVisualSubtitle(visualKind)}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenMap}
            className="helix-model-secondary-button"
          >
            Open connections

            <ArrowRight size={17} />
          </button>
        </header>

        <section className="helix-model-warning">
          <AlertTriangle size={18} />

          <p>
            This is a PLTW-style learning model for science research. It is not
            a diagnosis, clinical recommendation, patient-specific model, or
            validated molecular simulation. Use the Evidence tab to verify
            claims.
          </p>
        </section>

        <section className="helix-model-learning-layout">
          <aside className="helix-model-step-sidebar">
            <span className="helix-model-sidebar-label">
              Model walkthrough
            </span>

            <h2>
              Step-by-step investigation
            </h2>

            <div className="helix-model-step-buttons">
              {learningSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={
                    step.id === activeStep?.id
                      ? 'helix-model-step-button helix-model-step-button-active'
                      : 'helix-model-step-button'
                  }
                  onClick={() => setActiveStepId(step.id)}
                >
                  <span>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <strong>
                      {step.title}
                    </strong>

                    <small>
                      {step.studentPrompt}
                    </small>
                  </div>
                </button>
              ))}
            </div>

            <div className="helix-model-mini-stats">
              <article>
                <small>
                  Domain
                </small>

                <strong>
                  {formatValue(researchAnalysis.domain)}
                </strong>
              </article>

              <article>
                <small>
                  Reliability
                </small>

                <strong>
                  {formatValue(researchAnalysis.reliability)}
                </strong>
              </article>
            </div>
          </aside>

          <section className="helix-model-visual-stage">
            <div className="helix-model-visual-top">
              <div>
                <span>Interactive learning model</span>
                <strong>{viewMode === '3d' ? 'Drag to rotate, scroll to zoom, or select a highlighted structure.' : 'Choose a numbered marker or lesson step.'}</strong>
              </div>
              <div className="helix-model-view-switch" role="group" aria-label="Model viewing mode">
                <button type="button" aria-pressed={viewMode === '3d'} onClick={() => setViewMode('3d')}>3D model</button>
                <button type="button" aria-pressed={viewMode === 'diagram'} onClick={() => setViewMode('diagram')}>Diagram</button>
              </div>

              <div className="helix-model-step-counter">
                Step {activeIndex + 1} / {learningSteps.length}
              </div>
            </div>

            <div className="helix-model-visual-canvas">
              {viewMode === '3d' ? (
                <AnatomyModel3D kind={visualKind} activeIndex={activeIndex}
                  onSelect={(index) => setActiveStepId(learningSteps[index]?.id || activeStepId)} />
              ) : (
                <>
                  <ModelDiagram kind={visualKind} activeStepId={activeStep?.id || ''} />
                  {learningSteps.map((step) => (
                    <button key={step.id} type="button"
                      className={step.id === activeStep?.id ? 'helix-model-hotspot helix-model-hotspot-active' : 'helix-model-hotspot'}
                      style={{left: `${step.x}%`,top: `${step.y}%`}}
                      onClick={() => setActiveStepId(step.id)} aria-label={step.title}>
                      {step.label}
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="helix-model-visual-controls">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={activeIndex === 0}
              >
                Previous
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                disabled={activeIndex === learningSteps.length - 1}
              >
                Next step
              </button>
            </div>
          </section>

          <aside className="helix-model-explain-panel">
            <span className="helix-model-sidebar-label">
              Active label
            </span>

            <h2>
              {activeStep?.title}
            </h2>

            <p className="helix-model-student-prompt">
              {activeStep?.studentPrompt}
            </p>

            <section className="helix-model-explain-card">
              <div>
                <Lightbulb size={18} />
              </div>

              <article>
                <span>
                  What it means
                </span>

                <p>
                  {activeStep?.explanation}
                </p>
              </article>
            </section>

            <section className="helix-model-explain-card">
              <div>
                <BookOpen size={18} />
              </div>

              <article>
                <span>
                  Evidence needed
                </span>

                <p>
                  {activeStep?.evidenceNeeded}
                </p>
              </article>
            </section>

            <section className="helix-model-explain-card">
              <div>
                <AlertTriangle size={18} />
              </div>

              <article>
                <span>
                  Uncertainty
                </span>

                <p>
                  {activeStep?.uncertainty}
                </p>
              </article>
            </section>

            <section className="helix-model-next-test">
              <span>
                Next research test
              </span>

              <strong>
                {activeStep?.nextTest}
              </strong>
            </section>
          </aside>
        </section>

        <section className="helix-model-research-grid">
          <article className="helix-model-research-card">
            <div>
              <Sparkles size={20} />
            </div>

            <h3>
              Leading mechanism
            </h3>

            <p>
              {bestMechanism?.summary ||
                'No specific mechanism was detected yet. The question may need a clearer research target.'}
            </p>
          </article>

          <article className="helix-model-research-card">
            <div>
              <Network size={20} />
            </div>

            <h3>
              Best connection
            </h3>

            <p>
              {bestConnection
                ? `${bestConnection.source} → ${bestConnection.target}: ${bestConnection.claim}`
                : 'No specific connection was detected yet.'}
            </p>
          </article>

          <article className="helix-model-research-card">
            <div>
              <Microscope size={20} />
            </div>

            <h3>
              Evidence query
            </h3>

            <p>
              {researchAnalysis.evidenceQuery}
            </p>
          </article>

          <article className="helix-model-research-card">
            <div>
              <FlaskConical size={20} />
            </div>

            <h3>
              Verification rule
            </h3>

            <p>
              Evidence must directly support the relationship. Mentioning
              similar keywords is not enough.
            </p>
          </article>
        </section>

        <section className="helix-model-flow">
          {researchAnalysis.modelSteps.map((step, index) => (
            <article
              key={step.id}
              className="helix-model-flow-step"
            >
              <div className="helix-model-flow-step-top">
                <span>
                  {String(index + 1).padStart(2, '0')}
                </span>

                <em className={`helix-model-status-${step.status}`}>
                  {getStatusIcon(step.status)}

                  {getStatusText(step.status)}
                </em>
              </div>

              <small>
                {step.label}
              </small>

              <h2>
                {step.title}
              </h2>

              <p>
                {step.description}
              </p>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}
