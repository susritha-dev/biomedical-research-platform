import {
  ArrowRight,
  Atom,
  BookOpen,
  Brain,
  Dna,
  FolderKanban,
  FlaskConical,
  Network,
  Orbit,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

import {
  Navbar,
} from '../components/Navbar'

export function Home() {
  return (
    <div className="site-shell helix-home-page">
      <style>
        {`
          .helix-home-page {
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
            background:
              radial-gradient(circle at 12% 6%, rgba(74, 101, 219, 0.16), transparent 32%),
              radial-gradient(circle at 88% 14%, rgba(45, 98, 130, 0.12), transparent 30%),
              #f8f7f1;
            color: #232822;
          }

          .helix-home-page::before {
            content: "";
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background:
              radial-gradient(circle at var(--x, 20%) var(--y, 20%), rgba(73, 104, 220, 0.12), transparent 28%),
              radial-gradient(circle at 70% 80%, rgba(45, 100, 130, 0.08), transparent 30%);
            animation: helixAmbientShift 12s ease-in-out infinite alternate;
          }

          .helix-home-page > * {
            position: relative;
            z-index: 1;
          }

          .helix-home-page main {
            width: min(1220px, calc(100% - 40px));
            margin: 0 auto;
          }

          .helix-hero {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.95fr);
            gap: 32px;
            align-items: center;
            min-height: calc(100vh - 84px);
            padding: 58px 0 70px;
          }

          .helix-hero-copy {
            position: relative;
            z-index: 2;
            animation: helixFadeUp 780ms ease both;
          }

          .helix-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            width: fit-content;
            margin: 0 0 18px;
            color: #3655a5;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.75px;
            text-transform: uppercase;
          }

          .helix-eyebrow svg {
            animation: helixSparklePulse 1.8s ease-in-out infinite;
          }

          .helix-hero h1 {
            max-width: 760px;
            margin: 0;
            
