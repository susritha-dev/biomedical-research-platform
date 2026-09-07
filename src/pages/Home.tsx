import { ArrowRight, Dna, FlaskConical, Network, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

export function Home() {
  return (
    <div className="site-shell">
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">AI FOR BIOMEDICAL DISCOVERY</p>

            <h1>
              Connect the evidence.
              <span> Discover what matters.</span>
            </h1>

            <p className="hero-description">
              Explore relationships across diseases, genes, drugs, pathways,
              scientific literature, and clinical research in one intelligent
              research workspace.
            </p>

            <div className="hero-actions">
              <Link to="/explore" className="primary-button">
                Start Exploring
                <ArrowRight size={18} />
              </Link>

              <a href="#how-it-works" className="secondary-button">
                See how it works
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Biomedical connection network">
            <div className="network-orbit orbit-one" />
            <div className="network-orbit orbit-two" />

            <div className="network-node node-disease">
              <span>Disease</span>
              ALS
            </div>

            <div className="network-node node-gene">
              <span>Gene</span>
              SOD1
            </div>

            <div className="network-node node-pathway">
              <span>Pathway</span>
              Oxidative Stress
            </div>

            <div className="network-node node-trial">
              <span>Evidence</span>
              Clinical Research
            </div>

            <svg
              className="network-lines"
              viewBox="0 0 600 480"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="120" y1="120" x2="300" y2="220" />
              <line x1="300" y1="220" x2="470" y2="120" />
              <line x1="300" y1="220" x2="410" y2="375" />
              <line x1="120" y1="120" x2="410" y2="375" />
            </svg>
          </div>
        </section>

        <section className="intro-section" id="platform">
          <div className="section-heading">
            <p className="eyebrow">THE PLATFORM</p>

            <h2>
              Biomedical knowledge is everywhere.
              <span> Understanding it shouldn't be.</span>
            </h2>

            <p>
              Research is spread across genomic databases, scientific papers,
              clinical trials, therapeutic programs, and biological pathways.
              Helix is designed to bring those relationships together.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-item">
              <div className="feature-icon">
                <Dna size={22} />
              </div>

              <p className="feature-number">01</p>

              <h3>Explore Biology</h3>

              <p>
                Investigate diseases, genes, therapeutic targets, and the
                biological pathways connecting them.
              </p>
            </article>

            <article className="feature-item">
              <div className="feature-icon">
                <Network size={22} />
              </div>

              <p className="feature-number">02</p>

              <h3>Connect Evidence</h3>

              <p>
                Understand relationships across multiple layers of biomedical
                research instead of viewing isolated facts.
              </p>
            </article>

            <article className="feature-item">
              <div className="feature-icon">
                <FlaskConical size={22} />
              </div>

              <p className="feature-number">03</p>

              <h3>Investigate Therapeutics</h3>

              <p>
                Explore drugs, compounds, biological targets, and clinical
                research connected to disease biology.
              </p>
            </article>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-header">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>From a question to connected evidence.</h2>
          </div>

          <div className="steps">
            <article className="step">
              <span>01</span>
              <h3>Ask</h3>
              <p>
                Start with a disease, gene, drug, or biomedical research
                question.
              </p>
            </article>

            <article className="step">
              <span>02</span>
              <h3>Connect</h3>
              <p>
                Bring together relationships across different biomedical
                evidence sources.
              </p>
            </article>

            <article className="step">
              <span>03</span>
              <h3>Investigate</h3>
              <p>
                Move between targets, pathways, therapeutics, trials, and
                supporting research.
              </p>
            </article>

            <article className="step">
              <span>04</span>
              <h3>Understand</h3>
              <p>
                See the evidence behind important relationships and identify
                questions worth exploring further.
              </p>
            </article>
          </div>
        </section>

        <section className="research-section" id="research">
          <div className="research-panel">
            <div className="research-copy">
              <p className="eyebrow">RESEARCH EXPLORER</p>

              <h2>Start with a question.</h2>

              <p>
                The research workspace will eventually connect biomedical
                entities and evidence into one explorable research environment.
              </p>
            </div>

            <div className="mock-search">
              <Search size={20} />

              <span>What genes are implicated in ALS?</span>

              <Link to="/explore">
                Explore
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <p className="eyebrow">DISCOVER CONNECTIONS</p>

          <h2>Research is connected. Your tools should be too.</h2>

          <Link to="/explore" className="primary-button">
            Launch Research Explorer
            <ArrowRight size={18} />
          </Link>

          <Link to="/graph" className="secondary-button">
            View Knowledge Graph
            <Network size={18} />
          </Link>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>Helix</strong>
          <p>Biomedical research intelligence.</p>
        </div>

        <p className="footer-disclaimer">
          For research and educational purposes. Computational findings require
          independent scientific validation.
        </p>
      </footer>
    </div>
  )
}