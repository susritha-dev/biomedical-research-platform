# 🧬 Helix — Biomedical Research Explorer

**Explore the science. Connect the evidence. Investigate new possibilities.**

Helix is an interactive biomedical research platform that brings together scientific literature search, evidence inspection, biological visualizations, knowledge graphs, hypothesis exploration, and saved investigations in one workspace. It is designed for students, early-stage researchers, and curious learners investigating complex biomedical questions.

> **Research and educational use only.** Retrieved articles and generated interpretations are not verified scientific conclusions, clinical recommendations, or substitutes for reviewing primary literature and independently validating hypotheses.

## ✨ Features

- **Guided research agent:** Break down biomedical questions into research stages, mechanisms, and suggested next steps.
- **Multi-source evidence discovery:** Search scholarly metadata through PubMed, OpenAlex, Semantic Scholar, and Crossref; rank candidate records by their match to the research question and show source availability.
- **Research visualizations:** Explore biological concepts through interactive visualization interfaces.
- **Knowledge graph and connections:** Investigate relationships among genes, diseases, pathways, and biomedical concepts.
- **Hypothesis exploration:** Organize candidate research relationships and questions that need scientific verification.
- **Saved projects:** Keep and revisit investigations in the same browser.

## 🛠️ Built With — Technical Stack

### Frontend
- **React 19** — Component-based application interface and research workspaces.
- **TypeScript 5.8** — Typed components, state, and biomedical data models.
- **Vite 6** and **@vitejs/plugin-react** — Local development, React integration, and optimized frontend builds.
- **React Router 7** — Navigation between the homepage, authentication, Explorer, Projects, and graph views.
- **CSS3 and HTML5** — Custom responsive styling, scientific-themed layouts, and animations.
- **Lucide React** — Interface iconography.

### Scientific and Interactive Visualization
- **Three.js** — 3D graphics library used by the project's visualization stack.
- **React Three Fiber** (`@react-three/fiber`) — React-based rendering for Three.js.
- **React Three Drei** (`@react-three/drei`) — Helpers and components for 3D scenes.
- **React Flow** (`@xyflow/react`) — Interactive node-and-edge graph interfaces.
- **Dagre** — Graph layout and node positioning.

### Backend and Data Processing
- **Node.js** — JavaScript runtime for the API server.
- **Express 5** — HTTP backend serving the evidence-search endpoint.
- **REST APIs and Fetch** — Requests to scholarly research and biomedical data services.
- **fast-xml-parser** — Parsing PubMed XML abstract responses.
- **Custom JavaScript retrieval pipeline** — Question-term extraction, parallel source querying, duplicate consolidation, and keyword-based relevance ranking. These techniques aid discovery; they do **not** establish scientific truth or paper quality.

### Scholarly and Biomedical Sources
- **NCBI PubMed E-utilities** — Biomedical paper records, publication details, and abstracts.
- **OpenAlex API** — Scholarly metadata, abstracts when available, and citations.
- **Semantic Scholar API** — Paper metadata, abstracts, and citation information.
- **Crossref REST API** — DOI and bibliographic metadata.
- **Monarch Initiative API** — Biomedical graph-related data integration.

These services have different coverage, response limits, and metadata quality. Helix cannot guarantee access to every scientific publication, every full text, or a fully comprehensive evidence review.

### Authentication and Project Persistence
- **React Context** — In-app authentication/session state.
- **Browser `localStorage`** — Local accounts, sessions, and saved research projects.

**Important limitation:** Account records and projects are specific to the browser and device; they are not cloud-synchronized. This is **not server-verified authentication**. People with access to the browser's local storage can inspect or modify those records. Do not use it for confidential research or sensitive personal/medical information.

### Development and Deployment
- **Git and GitHub** — Source control and collaboration.
- **npm** — Dependency and script management.
- **ESLint / TypeScript ESLint** — Linting and code checks.
- **Vercel** — Web deployment.
- **Supabase JavaScript SDK** — Listed as a project dependency; this README does not claim it is the current production storage or authentication backend.

## 🔬 Research Integrity

Helix is intended to help users **find, organize, and explore** biomedical information. A publication appearing in search results does not mean it supports a claim, and keyword matching is not a substitute for assessing study methods, conflicting findings, applicability, and source validity. Computational mechanisms and proposed hypotheses require independent review and experimental confirmation.

**Helix is not a medical device and does not provide diagnosis or treatment advice.**
