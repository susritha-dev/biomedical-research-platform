
            50% {
              transform: translateY(-18px) scale(1.25);
              opacity: 1;
            }
          }

          @keyframes helixOrbitOne {
            from {
              transform: rotateX(66deg) rotateZ(5deg);
            }

            to {
              transform: rotateX(66deg) rotateZ(365deg);
            }
          }

          @keyframes helixOrbitTwo {
            from {
              transform: rotateY(62deg) rotateZ(-18deg);
            }

            to {
              transform: rotateY(62deg) rotateZ(342deg);
            }
          }

          @keyframes helixOrbitThree {
            from {
              transform: rotateX(72deg) rotateZ(-30deg);
            }

            to {
              transform: rotateX(72deg) rotateZ(330deg);
            }
          }

          @keyframes helixCorePulse {
            0%,
            100% {
              transform: translate(-50%, -50%) scale(1);
            }

            50% {
              transform: translate(-50%, -50%) scale(1.035);
            }
          }

          @keyframes helixGlowPulse {
            0%,
            100% {
              opacity: 0.45;
              transform: scale(0.92);
            }

            50% {
              opacity: 1;
              transform: scale(1.08);
            }
          }

          @keyframes helixCardFloat {
            0%,
            100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes helixLineFlow {
            from {
              stroke-dashoffset: 0;
            }

            to {
              stroke-dashoffset: -30;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              scroll-behavior: auto !important;
              transition-duration: 0.001ms !important;
            }
          }

          @media (max-width: 980px) {
            .helix-hero,
            .helix-section-heading,
            .helix-flow-panel,
            .helix-demo-card {
              grid-template-columns: 1fr;
            }

            .helix-hero {
              min-height: auto;
              padding-top: 42px;
            }

            .helix-feature-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .helix-hero-visual {
              min-height: 560px;
            }
          }

          @media (max-width: 650px) {
            .helix-home-page main,
            .helix-home-footer {
              width: min(100% - 28px, 1220px);
            }

            .helix-hero h1 {
              letter-spacing: -2.6px;
            }

            .helix-hero-search {
              align-items: stretch;
              flex-direction: column;
              padding: 16px;
            }

            .helix-hero-search a {
              width: 100%;
            }

            .helix-feature-grid {
              grid-template-columns: 1fr;
            }

            .helix-flow-panel,
            .helix-demo-card {
              padding: 22px;
            }

            .helix-home-footer {
              flex-direction: column;
            }

            .helix-footer-note {
              text-align: left;
            }

            .helix-hero-visual {
              min-height: 610px;
            }

            .helix-network-card {
              width: 138px;
            }

            .card-one,
            .card-three {
              left: 4%;
            }

            .card-two,
            .card-four {
              right: 4%;
            }
          }
        `}
      </style>

      <Navbar />

      <main>
        <section className="helix-hero">
          <div className="helix-hero-copy">
            <p className="helix-eyebrow">
              <Sparkles size={15} />

              AI-powered scientific research explorer
            </p>

            <h1>
              Ask a question.
              <span>
                Explore the evidence.
              </span>
            </h1>

            <p className="helix-hero-description">
            
