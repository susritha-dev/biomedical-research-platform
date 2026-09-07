import { diseases, drugs, genes, pathways } from './biomedicalData'
import type {
  EvidenceStrength,
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
  RelationshipType,
} from '../types/biomedical'

function buildDiseaseNodes(): GraphNode[] {
  return diseases.map((disease) => ({
    id: disease.id,
    type: 'disease' as const,
    label: disease.name,
    description: disease.description,
    metadata: {
      abbreviation: disease.abbreviation,
      evidence: disease.evidence,
    },
  }))
}

function buildGeneNodes(): GraphNode[] {
  return genes.map((gene) => ({
    id: gene.id,
    type: 'gene' as const,
    label: gene.symbol,
    description: gene.description,
    metadata: {
      name: gene.name,
      chromosome: gene.chromosome,
    },
  }))
}

function buildDrugNodes(): GraphNode[] {
  return drugs.map((drug) => ({
    id: drug.id,
    type: 'drug' as const,
    label: drug.name,
    description: drug.description,
    metadata: {
      developmentStatus: drug.developmentStatus,
    },
  }))
}

function buildPathwayNodes(): GraphNode[] {
  return pathways.map((pathway) => ({
    id: pathway.id,
    type: 'pathway' as const,
    label: pathway.name,
    description: pathway.description,
  }))
}

function edgeId(
  source: string,
  relationship: RelationshipType,
  target: string,
): string {
  return `${source}-${relationship}-${target}`
}

function buildEdges(): GraphEdge[] {
  const edgeMap = new Map<string, GraphEdge>()

  function addEdge(
    source: string,
    target: string,
    relationship: RelationshipType,
    evidence?: EvidenceStrength,
  ) {
    const id = edgeId(source, relationship, target)
    if (!edgeMap.has(id)) {
      edgeMap.set(id, { id, source, target, relationship, evidence })
    }
  }

  diseases.forEach((disease) => {
    disease.genes.forEach((geneId) => {
      addEdge(disease.id, geneId, 'associated-with', disease.evidence.genetics)
    })

    disease.pathways.forEach((pathwayId) => {
      addEdge(disease.id, pathwayId, 'involves', disease.evidence.pathway)
    })

    disease.drugs.forEach((drugId) => {
      addEdge(drugId, disease.id, 'treats', disease.evidence.clinical)
    })
  })

  genes.forEach((gene) => {
    gene.pathways.forEach((pathwayId) => {
      addEdge(gene.id, pathwayId, 'participates-in')
    })
  })

  return [...edgeMap.values()]
}

export const knowledgeGraph: KnowledgeGraph = {
  nodes: [
    ...buildDiseaseNodes(),
    ...buildGeneNodes(),
    ...buildDrugNodes(),
    ...buildPathwayNodes(),
  ],
  edges: buildEdges(),
}
