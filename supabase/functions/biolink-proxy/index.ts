// Biomedical data proxy for the Monarch Initiative API v3.
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MONARCH_BASE = "https://api-v3.monarchinitiative.org/v3/api";
const CACHE_TTL_SECONDS = 24 * 60 * 60;

function createSupabase() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

async function getCached(supabase: ReturnType<typeof createSupabase>, key: string) {
  const { data, error } = await supabase
    .from("biolink_api_cache")
    .select("response_body, expires_at")
    .eq("cache_key", key)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAtMs = new Date(data.expires_at).getTime();
  if (Date.now() > expiresAtMs) return null;

  return data.response_body;
}

async function setCached(
  supabase: ReturnType<typeof createSupabase>,
  key: string,
  body: unknown,
) {
  const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1000).toISOString();
  await supabase
    .from("biolink_api_cache")
    .upsert({ cache_key: key, response_body: body, expires_at: expiresAt });
}

async function monarchFetch(path: string): Promise<unknown> {
  const url = `${MONARCH_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Monarch API ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

interface MonarchEntity {
  id: string;
  category: string;
  name: string;
  description?: string;
  full_name?: string;
  symbol?: string;
  in_taxon_label?: string;
  provided_by?: string[];
}

interface MonarchAssociation {
  id: string;
  subject: string;
  subject_label?: string;
  subject_category?: string;
  object: string;
  object_label?: string;
  object_category?: string;
  predicate?: string;
  category?: string;
  has_evidence?: string[];
  primary_knowledge_source?: string;
  publications?: string[];
  provided_by?: string[];
  update_date?: string;
  created_date?: string;
  evidence_count?: number;
  has_evidence_count?: number;
  frequency_qualifier?: string;
  onset_qualifier?: string;
  severity_qualifier?: string;
}

interface MonarchSearchResponse {
  items: MonarchEntity[];
  total?: number;
  limit?: number;
  offset?: number;
}

interface MonarchAssociationResponse {
  items: MonarchAssociation[];
  total?: number;
  limit?: number;
  offset?: number;
}

const CATEGORY_MAP: Record<string, string> = {
  "biolink:Disease": "disease",
  "biolink:Gene": "gene",
  "biolink:Pathway": "pathway",
  "biolink:SmallMolecule": "drug",
  "biolink:Drug": "drug",
  "biolink:PhenotypicFeature": "phenotype",
  "biolink:AnatomicalEntity": "anatomy",
  "biolink:BiologicalProcess": "function",
  "biolink:MolecularActivity": "function",
  "biolink:SequenceVariant": "variant",
};

const REVERSE_CATEGORY_MAP: Record<string, string> = {
  disease: "biolink:Disease",
  gene: "biolink:Gene",
  pathway: "biolink:Pathway",
  drug: "biolink:SmallMolecule",
  phenotype: "biolink:PhenotypicFeature",
  anatomy: "biolink:AnatomicalEntity",
  function: "biolink:BiologicalProcess",
  variant: "biolink:SequenceVariant",
};

function mapEntityType(category: string): string {
  return CATEGORY_MAP[category] ?? "function";
}

function mapEntity(node: MonarchEntity) {
  const type = mapEntityType(node.category);
  return {
    id: node.id,
    type,
    label: node.name || node.symbol || node.full_name || node.id,
    description: node.description,
    metadata: {
      fullName: node.full_name,
      symbol: node.symbol,
      taxon: node.in_taxon_label,
      providedBy: node.provided_by,
    },
  };
}

const PREDICATE_MAP: Record<string, string> = {
  "biolink:has_phenotype": "has-phenotype",
  "biolink:expressed_in": "expressed-in",
  "biolink:causes": "causes",
  "biolink:treats": "treats",
  "biolink:actively_involved_in": "participates-in",
  "biolink:participates_in": "participates-in",
  "biolink:has_participant": "involves",
  "biolink:related_to": "related-to",
  "biolink:associated_with": "associated-with",
  "biolink:genetic_association": "associated-with",
  "biolink:target_for": "targets",
  "biolink:interacts_with": "targets",
};

function mapRelationship(predicate: string | undefined, category: string | undefined): string {
  if (predicate && PREDICATE_MAP[predicate]) return PREDICATE_MAP[predicate];
  if (category) {
    if (category.includes("DiseaseToPhenotypicFeature")) return "has-phenotype";
    if (category.includes("DiseaseToGene") || category.includes("GeneToDisease"))
      return "associated-with";
    if (category.includes("GeneToPathway") || category.includes("PathwayToGene"))
      return "participates-in";
    if (category.includes("ChemicalToDisease") || category.includes("DiseaseToChemical"))
      return "treats";
    if (category.includes("GeneToGene")) return "related-to";
    if (category.includes("Expression")) return "expressed-in";
    if (category.includes("Causal")) return "causes";
  }
  return "related-to";
}

function mapEvidence(hasEvidence: string[] | undefined): string | undefined {
  if (!hasEvidence || hasEvidence.length === 0) return undefined;
  const evidenceStr = hasEvidence.join(" ").toLowerCase();
  if (evidenceStr.includes("traceable") || evidenceStr.includes("experimental"))
    return "strong";
  if (evidenceStr.includes("biological") || evidenceStr.includes("genomic"))
    return "moderate";
  return "limited";
}

function mapAssociationDetail(assoc: MonarchAssociation) {
  return {
    id: assoc.id,
    source: assoc.subject,
    sourceLabel: assoc.subject_label ?? assoc.subject,
    sourceCategory: assoc.subject_category ?? "",
    target: assoc.object,
    targetLabel: assoc.object_label ?? assoc.object,
    targetCategory: assoc.object_category ?? "",
    relationship: mapRelationship(assoc.predicate, assoc.category),
    predicate: assoc.predicate ?? "",
    associationCategory: assoc.category ?? "",
    evidence: mapEvidence(assoc.has_evidence),
    evidenceCodes: assoc.has_evidence ?? [],
    primaryKnowledgeSource: assoc.primary_knowledge_source ?? "",
    providedBy: assoc.provided_by ?? [],
    publications: assoc.publications ?? [],
    updateDate: assoc.update_date ?? "",
    createdDate: assoc.created_date ?? "",
    evidenceCount: assoc.evidence_count ?? assoc.has_evidence_count ?? 0,
  };
}

async function handleSearch(
  params: URLSearchParams,
  supabase: ReturnType<typeof createSupabase>,
): Promise<Response> {
  const query = params.get("q") ?? "";
  const categoryFilter = params.get("categories");
  const limit = Math.min(parseInt(params.get("limit") ?? "20", 10), 50);

  if (!query.trim()) {
    return jsonResponse({ results: [] });
  }

  const monarchParams = new URLSearchParams({
    q: query,
    limit: String(limit),
    fuzzy_match: "true",
  });

  if (categoryFilter) {
    const cats = categoryFilter
      .split(",")
      .map((c) => REVERSE_CATEGORY_MAP[c])
      .filter(Boolean);
    if (cats.length > 0) {
      monarchParams.set("category", cats.join(","));
    }
  }

  const cacheKey = `search:${monarchParams.toString()}`;
  const cached = await getCached(supabase, cacheKey);
  if (cached) return jsonResponse(cached);

  const data = (await monarchFetch(
    `/search?${monarchParams.toString()}`,
  )) as MonarchSearchResponse;

  const results = (data.items ?? []).map((item) => {
    const type = mapEntityType(item.category);
    return {
      id: item.id,
      type,
      title: item.name || item.symbol || item.id,
      subtitle: item.full_name ?? item.id,
      description: item.description ?? "",
    };
  });

  const response = { results, total: data.total ?? results.length };
  await setCached(supabase, cacheKey, response);
  return jsonResponse(response);
}

async function handleEntity(
  entityId: string,
  supabase: ReturnType<typeof createSupabase>,
): Promise<Response> {
  const cacheKey = `entity:${entityId}`;
  const cached = await getCached(supabase, cacheKey);
  if (cached) return jsonResponse(cached);

  const data = (await monarchFetch(
    `/entity/${encodeURIComponent(entityId)}`,
  )) as MonarchEntity;

  const entity = mapEntity(data);
  await setCached(supabase, cacheKey, entity);
  return jsonResponse(entity);
}

async function handleAssociation(
  associationId: string,
  supabase: ReturnType<typeof createSupabase>,
): Promise<Response> {
  const cacheKey = `association:${associationId}`;
  const cached = await getCached(supabase, cacheKey);
  if (cached) return jsonResponse(cached);

  // Monarch API returns association details via the entity associations endpoint
  // with a search by association ID. We try fetching it directly.
  try {
    const data = (await monarchFetch(
      `/association/${encodeURIComponent(associationId)}`,
    )) as MonarchAssociation;

    const detail = mapAssociationDetail(data);
    await setCached(supabase, cacheKey, detail);
    return jsonResponse(detail);
  } catch {
    // Fallback: try searching associations for this ID
    return errorResponse("Association not found", 404);
  }
}

async function handleNeighborhood(
  entityId: string,
  params: URLSearchParams,
  supabase: ReturnType<typeof createSupabase>,
): Promise<Response> {
  const depth = parseInt(params.get("depth") ?? "1", 10);
  const maxDepth = Math.min(depth, 2);
  const cacheKey = `neighborhood:${entityId}:${maxDepth}`;

  const cached = await getCached(supabase, cacheKey);
  if (cached) return jsonResponse(cached);

  const centerData = (await monarchFetch(
    `/entity/${encodeURIComponent(entityId)}`,
  )) as MonarchEntity;
  const center = mapEntity(centerData);

  const nodeMap = new Map<string, { id: string; type: string; label: string; description?: string; metadata?: Record<string, unknown> }>();
  nodeMap.set(center.id, center);

  const edgeMap = new Map<string, {
    id: string;
    source: string;
    target: string;
    relationship: string;
    evidence?: string;
    evidenceCodes?: string[];
    primaryKnowledgeSource?: string;
    publications?: string[];
    updateDate?: string;
  }>();

  const visited = new Set<string>();
  let frontier = [entityId];
  const assocLimit = 25;

  for (let hop = 0; hop < maxDepth; hop++) {
    const nextFrontier: string[] = [];

    for (const currentId of frontier) {
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      try {
        const assocData = (await monarchFetch(
          `/entity/${encodeURIComponent(currentId)}/associations?limit=${assocLimit}`,
        )) as MonarchAssociationResponse;

        for (const assoc of assocData.items ?? []) {
          const neighborId = assoc.object === currentId ? assoc.subject : assoc.object;
          const neighborLabel =
            assoc.object === currentId ? assoc.subject_label : assoc.object_label;
          const neighborCategory =
            assoc.object === currentId ? assoc.subject_category : assoc.object_category;

          const rel = mapRelationship(assoc.predicate, assoc.category);
          const evidence = mapEvidence(assoc.has_evidence);

          const edgeId = assoc.id ?? `${assoc.subject}-${rel}-${assoc.object}`;
          if (!edgeMap.has(edgeId)) {
            edgeMap.set(edgeId, {
              id: edgeId,
              source: assoc.subject,
              target: assoc.object,
              relationship: rel,
              evidence,
              evidenceCodes: assoc.has_evidence ?? [],
              primaryKnowledgeSource: assoc.primary_knowledge_source ?? "",
              publications: assoc.publications ?? [],
              updateDate: assoc.update_date ?? "",
            });
          }

          if (!nodeMap.has(neighborId) && neighborCategory) {
            const neighborType = mapEntityType(neighborCategory);
            nodeMap.set(neighborId, {
              id: neighborId,
              type: neighborType,
              label: neighborLabel ?? neighborId,
            });
            nextFrontier.push(neighborId);
          }
        }
      } catch {
        // Skip entities that fail to load
      }
    }

    frontier = nextFrontier;
  }

  const response = {
    center,
    nodes: [...nodeMap.values()],
    edges: [...edgeMap.values()],
  };

  await setCached(supabase, cacheKey, response);
  return jsonResponse(response);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createSupabase();
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/biolink-proxy/, "");
    const params = url.searchParams;

    if (path === "/search" || path === "/search/") {
      return await handleSearch(params, supabase);
    }

    const entityMatch = path.match(/^\/entity\/([^/]+)$/);
    if (entityMatch) {
      const entityId = decodeURIComponent(entityMatch[1]);
      return await handleEntity(entityId, supabase);
    }

    const associationMatch = path.match(/^\/association\/([^/]+)$/);
    if (associationMatch) {
      const associationId = decodeURIComponent(associationMatch[1]);
      return await handleAssociation(associationId, supabase);
    }

    const neighborhoodMatch = path.match(
      /^\/neighborhood\/([^/]+)$/,
    );
    if (neighborhoodMatch) {
      const entityId = decodeURIComponent(neighborhoodMatch[1]);
      return await handleNeighborhood(entityId, params, supabase);
    }

    return errorResponse(`Unknown route: ${path}`, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
