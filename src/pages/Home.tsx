
import {
  ArrowRight,
  Atom,
  BookOpen,
  Dna,
  FolderKanban,
  FlaskConical,
  Network,
  Orbit,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

export function Home() {
  const [activeLayer, setActiveLayer] = useState(2)
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>('.helix-explode-stage')
    const section = document.querySelector<HTMLElement>('.helix-layer-section')
    if (!stage || !section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.style.setProperty('--explode', '1')
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const start = window.innerHeight * .90
      const distance = Math.max(1, window.innerHeight * .90 + rect.height * .45)
      const progress = Math.max(0, Math.min(1, (start - rect.top) / distance))
      const eased = progress * progress * (3 - 2 * progress)
      stage.style.setProperty('--explode', String(eased))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
    const root = document.querySelector('.helix-home-page')
    if (!root) return
    const targets = root.querySelectorAll<HTMLElement>(
      '.helix-product-heading, .helix-workspace-preview, .helix-lab-heading, .helix-home-lab-image, .helix-feature-card, .helix-layer-intro, .helix-layer-item, .helix-usecase, .helix-flow-panel, .helix-faq-heading, .helix-faq-list, .helix-demo-card'
    )
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' })
    targets.forEach((target) => {
      target.classList.add('helix-reveal')
      observer.observe(target)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="site-shell helix-home-page">
      <style>
        {`
          .helix-home-page {
            min-height: 100vh;
            overflow-x: hidden;
            background:
              radial-gradient(circle at 12% 6%, rgba(74, 101, 219, 0.13), transparent 32%),
              radial-gradient(circle at 88% 14%, rgba(45, 98, 130, 0.09), transparent 30%),
              #f8f7f1;
            color: #232822;
          }

          .helix-home-page * {
            box-sizing: border-box;
          }

          .helix-home-main {
            width: min(1220px, calc(100% - 40px));
            margin: 0 auto;
          }

          .helix-hero {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
            align-items: center;
            gap: 36px;
            padding: 70px 0 80px;
          }

          .helix-hero-copy {
            min-width: 0;
            animation: helixFadeUp 700ms ease both;
          }

          .helix-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            margin: 0 0 18px;
            color: #3655a5;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.8px;
            text-transform: uppercase;
          }

          .helix-hero h1 {
            margin: 0;
            color: #20251f;
            font-size: clamp(44px, 7vw, 88px);
            line-height: 0.98;
            letter-spacing: -3px;
          }

          .helix-hero h1 span {
            display: block;
            margin-top: 10px;
            color: #3655a5;
            background: linear-gradient(90deg, #3655a5, #6484ed);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .helix-hero-description {
            max-width: 620px;
            margin: 25px 0 0;
            color: #657062;
            font-size: 17px;
            line-height: 1.75;
          }

          .helix-hero-search {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 30px;
            padding: 9px 9px 9px 18px;
            border: 1px solid #dfe4dc;
            border-radius: 20px;
            background: #fffef9;
            box-shadow: 0 20px 50px rgba(29, 36, 27, 0.08);
          }

          .helix-hero-search > svg {
            flex-shrink: 0;
            color: #3655a5;
          }

          .helix-hero-search > span {
            flex: 1;
            min-width: 0;
            color: #657062;
            font-size: 14px;
          }

          .helix-hero-search a,
          .helix-primary-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            min-height: 46px;
            padding: 0 17px;
            border: 1px solid #253b75;
            border-radius: 14px;
            background: #253b75;
            color: white;
            font-size: 13px;
            font-weight: 800;
            text-decoration: none;
            white-space: nowrap;
            transition: transform 180ms ease, background 180ms ease;
          }

          .helix-hero-search a:hover,
          .helix-primary-button:hover {
            transform: translateY(-2px);
            background: #1d3065;
          }

          .helix-hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
          }

          .helix-secondary-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            min-height: 46px;
            padding: 0 16px;
            border: 1px solid #dbe0d7;
            border-radius: 14px;
            background: #fffef9;
            color: #242923;
            font-size: 13px;
            font-weight: 800;
            text-decoration: none;
            transition: transform 180ms ease;
          }

          .helix-secondary-button:hover {
            transform: translateY(-2px);
          }

          .helix-hero-visual {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 530px;
            overflow: hidden;
            border: 1px solid #dfe4dc;
            border-radius: 34px;
            background:
              radial-gradient(circle at center, rgba(71, 99, 180, 0.20), transparent 40%),
              linear-gradient(145deg, #fffef9, #f1f3ed);
            box-shadow: 0 30px 75px rgba(29, 36, 27, 0.09);
          }

          .helix-visual-grid {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(93, 102, 90, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(93, 102, 90, 0.06) 1px, transparent 1px);
            background-size: 35px 35px;
          }

          .helix-orbit {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 300px;
            height: 300px;
            margin: -150px;
            border: 1px solid rgba(54, 85, 165, 0.25);
            border-radius: 50%;
            animation: helixRotate 18s linear infinite;
          }

          .helix-orbit-two {
            width: 410px;
            height: 220px;
            margin: -110px -205px;
            transform: rotate(-35deg);
            animation: helixOrbitFloat 9s ease-in-out infinite alternate;
          }

          .helix-core {
            position: relative;
            z-index: 3;
            display: grid;
            place-items: center;
            width: 110px;
            height: 110px;
            border: 1px solid #d8dfd4;
            border-radius: 32px;
            background: #fffef9;
            color: #253b75;
            box-shadow: 0 20px 60px rgba(37, 59, 117, 0.18);
            animation: helixPulse 3s ease-in-out infinite;
          }

          .helix-core svg {
            width: 46px;
            height: 46px;
          }

          .helix-network-card {
            position: absolute;
            z-index: 4;
            width: 145px;
            padding: 14px;
            border: 1px solid #dfe4dc;
            border-radius: 19px;
            background: rgba(255, 254, 249, 0.96);
            box-shadow: 0 15px 40px rgba(29, 36, 27, 0.1);
            animation: helixCardFloat 5s ease-in-out infinite;
          }

          .helix-network-card span {
            display: block;
            color: #3655a5;
            font-size: 10px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .helix-network-card strong {
            display: block;
            margin-top: 6px;
            color: #232822;
            font-size: 14px;
            line-height: 1.25;
          }

          .helix-network-card p {
            margin: 7px 0 0;
            color: #657062;
            font-size: 11px;
            line-height: 1.4;
          }

          .card-one { top: 9%; left: 7%; }
          .card-two { top: 11%; right: 6%; animation-delay: 0.7s; }
          .card-three { bottom: 10%; left: 6%; animation-delay: 1.4s; }
          .card-four { bottom: 9%; right: 7%; animation-delay: 2s; }


          /* Animated DNA hero — consistent with Helix's light blue / ivory theme */
          .helix-hero-visual {
            isolation: isolate;
            background:
              radial-gradient(ellipse at 50% 48%, rgba(100, 148, 245, .21) 0%, transparent 48%),
              radial-gradient(circle at 85% 15%, rgba(130, 209, 245, .18), transparent 42%),
              linear-gradient(145deg, #ffffff, #edf3fc);
          }
          .helix-visual-grid { opacity: .55; }
          .helix-dna-stage {
            position: relative;
            z-index: 2;
            width: min(53%, 245px);
            height: 430px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
          }
          .helix-dna-aura {
            position: absolute;
            inset: 15% -20%;
            border-radius: 50%;
            background: radial-gradient(ellipse, rgba(95, 143, 240, .28), transparent 68%);
            filter: blur(18px);
            animation: helixDnaBreathe 5s ease-in-out infinite;
          }
          .helix-dna-svg {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: visible;
            filter: drop-shadow(0 18px 24px rgba(39, 77, 155, .22));
            animation: helixDnaFloat 7s ease-in-out infinite;
          }
          .helix-dna-rung {
            animation: helixDnaShimmer 3.4s ease-in-out infinite;
          }
          .helix-dna-label {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            padding: 8px 12px;
            border: 1px solid rgba(69, 109, 197, .2);
            border-radius: 999px;
            background: rgba(255, 255, 255, .83);
            color: #3157a7;
            font-size: 9px;
            font-weight: 850;
            letter-spacing: 1px;
            box-shadow: 0 12px 24px rgba(40, 64, 127, .07);
          }
          .helix-live-dot {
            display: inline-block;
            width: 7px;
            height: 7px;
            margin-right: 6px;
            background: #36b8ac;
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(54, 184, 172, .15);
          }
          @keyframes helixDnaFloat {
            0%, 100% { transform: translateY(0) rotate(-3deg) scale(1); }
            50% { transform: translateY(-15px) rotate(3deg) scale(1.035); }
          }
          @keyframes helixDnaBreathe {
            0%, 100% { opacity: .55; transform: scale(.9); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes helixDnaShimmer {
            0%, 100% { opacity: .55; }
            50% { opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .helix-dna-svg, .helix-dna-aura, .helix-dna-rung,
            .helix-orbit, .helix-network-card { animation: none !important; }
          }
          @media (max-width: 520px) {
            .helix-dna-stage { width: 45%; height: 340px; }
            .helix-dna-label { font-size: 7px; letter-spacing: .3px; }
          }

          .helix-lab-showcase {
            padding: 40px 0 85px;
          }

          .helix-lab-heading {
            max-width: 800px;
            margin-bottom: 28px;
          }

          .helix-lab-heading h2 {
            margin: 0 0 16px;
            color: #20251f;
            font-size: clamp(38px, 5vw, 65px);
            line-height: 1.04;
            letter-spacing: -2px;
          }

          .helix-lab-heading > p:last-child {
            margin: 0;
            color: #657062;
            font-size: 17px;
            line-height: 1.7;
          }

          .helix-home-lab-image {
            position: relative;
            width: 100%;
            overflow: hidden;
            border: 1px solid #dfe4dc;
            border-radius: 30px;
            background: #e8edee;
            box-shadow: 0 28px 70px rgba(29, 36, 27, 0.12);
          }

          .helix-home-lab-image img {
            display: block;
            width: 100%;
            height: 460px;
            object-fit: cover;
            object-position: center;
          }

          .helix-lab-caption {
            position: absolute;
            right: 20px;
            bottom: 20px;
            left: 20px;
            width: fit-content;
            max-width: calc(100% - 40px);
            padding: 12px 16px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 14px;
            background: rgba(22, 34, 51, 0.78);
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            backdrop-filter: blur(10px);
          }

          .helix-section {
            padding: 65px 0;
          }

          .helix-section-heading {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            align-items: end;
            gap: 30px;
            margin-bottom: 26px;
          }

          .helix-section-heading h2 {
            margin: 0;
            color: #232822;
            font-size: clamp(36px, 5vw, 64px);
            line-height: 1.04;
            letter-spacing: -2px;
          }

          .helix-section-heading > p {
            margin: 0;
            color: #657062;
            font-size: 16px;
            line-height: 1.75;
          }

          .helix-feature-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
          }

          .helix-feature-card {
            min-height: 240px;
            padding: 23px;
            border: 1px solid #dfe4dc;
            border-radius: 25px;
            background: #fffef9;
            box-shadow: 0 18px 48px rgba(29, 36, 27, 0.05);
            transition: transform 180ms ease, box-shadow 180ms ease;
          }

          .helix-feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 60px rgba(29, 36, 27, 0.1);
          }

          .helix-feature-icon {
            display: grid;
            place-items: center;
            width: 46px;
            height: 46px;
            border-radius: 15px;
            background: #edf1ff;
            color: #3655a5;
          }

          .helix-feature-card small {
            display: block;
            margin-top: 22px;
            color: #3655a5;
            font-size: 11px;
            font-weight: 850;
          }

          .helix-feature-card h3 {
            margin: 10px 0;
            color: #232822;
            font-size: 20px;
            line-height: 1.2;
          }

          .helix-feature-card p {
            margin: 0;
            color: #657062;
            font-size: 13px;
            line-height: 1.65;
          }

          .helix-flow-section {
            padding: 75px 0;
          }

          .helix-flow-panel {
            display: grid;
            grid-template-columns: 0.85fr 1fr;
            align-items: center;
            gap: 30px;
            padding: 34px;
            border: 1px solid #dfe4dc;
            border-radius: 32px;
            background: #fffef9;
            box-shadow: 0 24px 65px rgba(29, 36, 27, 0.07);
          }

          .helix-flow-panel h2 {
            margin: 0;
            font-size: clamp(35px, 5vw, 60px);
            line-height: 1.05;
            letter-spacing: -2px;
          }

          .helix-flow-panel > div > p:last-child {
            margin-top: 16px;
            color: #657062;
            font-size: 15px;
            line-height: 1.75;
          }

          .helix-steps {
            display: grid;
            gap: 12px;
          }

          .helix-step {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding: 16px;
            border: 1px solid #e5e9e1;
            border-radius: 19px;
            background: #fbfbf6;
          }

          .helix-step-number {
            display: grid;
            flex-shrink: 0;
            place-items: center;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            background: #253b75;
            color: #fff;
            font-size: 13px;
            font-weight: 850;
          }

          .helix-step h3 {
            margin: 0;
            color: #232822;
            font-size: 17px;
          }

          .helix-step p {
            margin: 5px 0 0;
            color: #657062;
            font-size: 13px;
            line-height: 1.55;
          }

          .helix-demo-section {
            padding: 75px 0 90px;
          }

          .helix-demo-card {
            display: grid;
            grid-template-columns: 1fr 300px;
            align-items: center;
            gap: 30px;
            padding: 36px;
            border-radius: 32px;
            background:
              radial-gradient(circle at 18% 15%, rgba(85, 110, 220, 0.25), transparent 35%),
              #232822;
            color: white;
            box-shadow: 0 30px 80px rgba(29, 36, 27, 0.16);
          }

          .helix-demo-card .helix-eyebrow {
            color: #cfd9ff;
          }

          .helix-demo-card h2 {
            margin: 0;
            font-size: clamp(34px, 5vw, 58px);
            line-height: 1.05;
            letter-spacing: -2px;
          }

          .helix-demo-card p {
            margin: 16px 0 0;
            color: rgba(255,255,255,0.75);
            font-size: 15px;
            line-height: 1.7;
          }

          .helix-demo-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .helix-demo-actions a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-height: 48px;
            padding: 0 14px;
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 14px;
            color: white;
            font-size: 13px;
            font-weight: 800;
            text-decoration: none;
          }

          .helix-demo-actions a:first-child {
            border-color: white;
            background: white;
            color: #232822;
          }

          .helix-home-footer {
            display: flex;
            justify-content: space-between;
            gap: 25px;
            width: min(1220px, calc(100% - 40px));
            margin: 0 auto;
            padding: 28px 0 40px;
            border-top: 1px solid #dfe4dc;
            color: #657062;
          }

          .helix-home-footer strong {
            color: #232822;
            font-size: 18px;
          }

          .helix-home-footer p {
            margin: 6px 0 0;
            font-size: 13px;
            line-height: 1.6;
          }

          .helix-footer-note {
            max-width: 550px;
            text-align: right;
          }


          /* Helix hybrid design system — cinematic navy and luminous ivory */
          .helix-home-page {
            background:
              radial-gradient(circle at 7% 5%, rgba(92, 136, 242, .14), transparent 31%),
              radial-gradient(circle at 92% 35%, rgba(113, 188, 235, .11), transparent 30%),
              #f8fafc;
          }
          .helix-hero { gap: clamp(24px, 4vw, 54px); padding-top: 76px; }
          .helix-hero h1 { color: #101e39; letter-spacing: -3.5px; }
          .helix-hero h1 span {
            background: linear-gradient(95deg, #2444a6 5%, #4381e0 68%, #56b5d9);
            -webkit-background-clip: text;
            background-clip: text;
          }
          .helix-eyebrow { letter-spacing: 1.45px; color: #4167b6; }
          .helix-hero-description { color: #52637e; }
          .helix-hero-search {
            background: #fff;
            border-color: rgba(112, 137, 192, .22);
            box-shadow: 0 20px 65px rgba(26, 55, 113, .1);
          }
          .helix-primary-button, .helix-hero-search a {
            background: linear-gradient(135deg, #234798, #426bd8);
            border-color: #3157ad;
          }
          .helix-hero-visual {
            border-color: rgba(136, 184, 255, .24);
            background:
              radial-gradient(ellipse at 49% 48%, rgba(30, 114, 212, .42), transparent 48%),
              radial-gradient(circle at 95% 2%, rgba(20, 189, 211, .18), transparent 44%),
              linear-gradient(150deg, #07152e 0%, #0d2754 55%, #163f7b 100%);
            box-shadow: 0 38px 90px rgba(12, 36, 82, .22), inset 0 0 75px rgba(43, 91, 179, .08);
          }
          .helix-hero-visual::before {
            content: '';
            position: absolute;
            z-index: 1;
            inset: 0;
            border-radius: inherit;
            background: radial-gradient(circle at 50% 50%, transparent 20%, rgba(4, 11, 29, .35) 100%);
            pointer-events: none;
          }
          .helix-visual-grid {
            opacity: 1;
            background-image:
              linear-gradient(rgba(139, 183, 255, .09) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 183, 255, .09) 1px, transparent 1px);
            mask-image: radial-gradient(ellipse at center, black 20%, transparent 86%);
          }
          .helix-orbit { border-color: rgba(120, 205, 254, .32); }
          .helix-dna-aura {
            background: radial-gradient(ellipse, rgba(65, 150, 255, .66), transparent 70%);
          }
          .helix-dna-svg {
            filter: drop-shadow(0 0 30px rgba(82, 169, 250, .65));
          }
          .helix-dna-label {
            border-color: rgba(155, 207, 255, .22);
            background: rgba(5, 26, 61, .84);
            color: #b8eaff;
            box-shadow: 0 12px 30px rgba(3, 10, 33, .35);
          }
          .helix-network-card {
            border: 1px solid rgba(185, 218, 255, .2);
            background: rgba(11, 36, 77, .87);
            box-shadow: 0 18px 42px rgba(0, 7, 26, .25);
            backdrop-filter: blur(16px);
          }
          .helix-network-card span { color: #85cfff; }
          .helix-network-card strong { color: #f1f7ff; }
          .helix-network-card p { color: #b2c9e9; }
          .helix-lab-showcase { padding-top: 65px; }
          .helix-lab-heading h2, .helix-section-heading h2, .helix-flow-panel h2 {
            color: #122544;
          }
          .helix-home-lab-image {
            border: 6px solid white;
            border-radius: 32px;
            box-shadow: 0 30px 85px rgba(17, 39, 75, .15);
          }
          .helix-home-lab-image::after {
            content: '';
            position: absolute;
            inset: 45% 0 0;
            background: linear-gradient(0deg, rgba(6, 21, 47, .36), transparent);
            pointer-events: none;
          }
          .helix-lab-caption { z-index: 1; }
          .helix-feature-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .helix-feature-card {
            position: relative;
            min-height: 268px;
            overflow: hidden;
            border-color: rgba(127, 151, 202, .17);
            background: linear-gradient(155deg, #fff 0%, #f4f7fe 100%);
            box-shadow: 0 18px 50px rgba(21, 47, 96, .06);
            transition: transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease;
          }
          .helix-feature-card:hover {
            transform: translateY(-7px);
            border-color: rgba(80, 132, 223, .4);
            box-shadow: 0 25px 60px rgba(18, 56, 121, .14);
          }
          .helix-feature-card:first-child {
            grid-column: span 2;
            background:
              radial-gradient(circle at 100% 0%, rgba(114, 193, 255, .26), transparent 55%),
              linear-gradient(140deg, #10295b, #204a93);
            border-color: #315baa;
          }
          .helix-feature-card:first-child .helix-feature-icon {
            background: rgba(163, 213, 255, .16);
            color: #ace8ff;
          }
          .helix-feature-card:first-child small { color: #98cbff; }
          .helix-feature-card:first-child h3 { color: #fff; font-size: 27px; }
          .helix-feature-card:first-child p { color: #c7ddfb; max-width: 430px; font-size: 14px; }
          .helix-feature-card:nth-child(4) { grid-column: span 2; }
          .helix-feature-card h3 { color: #142a4c; }
          .helix-feature-card p { color: #62718b; }
          .helix-feature-icon { background: #e7eeff; color: #315ec1; }
          .helix-flow-panel {
            border-color: rgba(111, 147, 208, .2);
            background: linear-gradient(140deg, #fff, #f1f6ff);
            box-shadow: 0 30px 75px rgba(22, 51, 111, .08);
          }
          .helix-step {
            background: rgba(255, 255, 255, .86);
            border-color: rgba(120, 156, 212, .2);
            transition: transform 200ms ease, border-color 200ms ease;
          }
          .helix-step:hover { transform: translateX(4px); border-color: rgba(66, 113, 210, .4); }
          .helix-demo-card {
            background:
              radial-gradient(circle at 12% 12%, rgba(60, 131, 238, .37), transparent 38%),
              radial-gradient(circle at 90% 90%, rgba(28, 182, 206, .13), transparent 45%),
              linear-gradient(140deg, #091b3b, #183e80);
            box-shadow: 0 35px 80px rgba(13, 40, 88, .22);
          }
          .helix-demo-actions a { transition: transform 180ms ease, background 180ms ease; }
          .helix-demo-actions a:hover { transform: translateY(-3px); background: rgba(255,255,255,.12); }
          .helix-demo-actions a:first-child { color: #153775; }
          .helix-demo-actions a:first-child:hover { background: #eef5ff; }
          @media (max-width: 980px) {
            .helix-feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .helix-feature-card:first-child, .helix-feature-card:nth-child(4) { grid-column: span 1; }
          }
          @media (max-width: 650px) {
            .helix-hero { padding-top: 48px; }
            .helix-feature-grid { grid-template-columns: 1fr; }
            .helix-feature-card:first-child, .helix-feature-card:nth-child(4) { grid-column: auto; }
            .helix-hero h1 { letter-spacing: -2px; }
          }


          /* Product-led startup sections */
          .helix-trust-strip {
            display: flex; align-items: center; justify-content: space-between;
            gap: 16px; flex-wrap: wrap; margin: -18px 0 70px;
            padding: 21px 25px; border: 1px solid #e1e8f4;
            border-radius: 18px; background: rgba(255,255,255,.87);
            color: #6b7891; box-shadow: 0 16px 48px rgba(25,53,106,.045);
          }
          .helix-trust-strip strong { color: #19345c; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
          .helix-trust-points { display: flex; flex-wrap: wrap; gap: 12px 22px; }
          .helix-trust-points span { display: inline-flex; gap: 7px; align-items: center; font-size: 12px; font-weight: 750; }
          .helix-trust-points svg { color: #2d7a9c; }
          .helix-product-section { padding: 40px 0 105px; }
          .helix-product-heading { text-align: center; max-width: 790px; margin: 0 auto 38px; }
          .helix-product-heading h2, .helix-usecase-heading h2, .helix-faq-heading h2 {
            margin: 10px 0 16px; color: #102442; font-size: clamp(36px, 5vw, 64px); letter-spacing: -2px; line-height: 1.06;
          }
          .helix-product-heading > p:last-child, .helix-usecase-heading > p:last-child, .helix-faq-heading > p:last-child {
            color: #62738d; font-size: 16px; line-height: 1.8;
          }
          .helix-workspace-preview {
            overflow: hidden; border-radius: 24px; border: 1px solid #d7e2f0;
            background: white; box-shadow: 0 35px 90px rgba(16,38,82,.13);
          }
          .helix-workspace-top {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            padding: 13px 20px; background: #f6f8fc; border-bottom: 1px solid #e3eaf4;
          }
          .helix-workspace-dots { display: flex; gap: 6px; }
          .helix-workspace-dots i { width: 9px; height: 9px; background: #b9c5d8; border-radius: 50%; }
          .helix-workspace-dots i:first-child { background: #f3aaa4; }
          .helix-workspace-dots i:nth-child(2) { background: #f2ce83; }
          .helix-workspace-dots i:last-child { background: #91d5bc; }
          .helix-workspace-top span { font-size: 11px; font-weight: 750; color: #63738d; }
          .helix-workspace-layout { display: grid; grid-template-columns: 190px minmax(0,1fr); min-height: 390px; }
          .helix-workspace-sidebar { background: #10254b; padding: 24px 16px; color: #e5edff; }
          .helix-workspace-sidebar strong { font-size: 17px; letter-spacing: -.5px; }
          .helix-workspace-sidebar p { margin: 5px 0 26px; font-size: 10px; color: #9bb4db; }
          .helix-workspace-sidebar span {
            display: block; padding: 10px 12px; margin: 5px 0; border-radius: 9px;
            font-size: 12px; color: #aec6e8; font-weight: 750;
          }
          .helix-workspace-sidebar .is-active { background: rgba(112,167,255,.18); color: #fff; }
          .helix-workspace-content { min-width: 0; padding: clamp(18px,3vw,36px); background: linear-gradient(150deg,#fff,#f7faff); }
          .helix-workspace-overline { color: #3e69ad; font-size: 10px; font-weight: 850; letter-spacing: 1px; text-transform: uppercase; }
          .helix-workspace-content h3 { margin: 9px 0 12px; font-size: clamp(20px,3vw,30px); color: #152e51; letter-spacing: -.7px; }
          .helix-workspace-content > p { color: #6c7c92; font-size: 13px; line-height: 1.65; }
          .helix-workspace-tabs { display: flex; gap: 7px; flex-wrap: wrap; margin: 24px 0 20px; }
          .helix-workspace-tabs span { padding: 8px 13px; border: 1px solid #e1e9f4; background: #fff; border-radius: 9px; font-size: 11px; font-weight: 800; color: #5d6f8c; }
          .helix-workspace-tabs span:first-child { background: #204684; color: #fff; border-color: #204684; }
          .helix-preview-cards { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; }
          .helix-preview-card { border: 1px solid #e2e9f3; border-radius: 14px; padding: 17px; background: #fff; }
          .helix-preview-card > span { display: block; font-size: 10px; color: #4c71b4; text-transform: uppercase; font-weight: 850; letter-spacing: .6px; }
          .helix-preview-card strong { display: block; margin: 12px 0 7px; color: #193555; font-size: 15px; }
          .helix-preview-card p { margin: 0; color: #738199; font-size: 11px; line-height: 1.6; }
          .helix-preview-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 24px; color: #2856aa; font-size: 13px; font-weight: 850; text-decoration: none; }
          .helix-usecase-section { padding: 65px 0 95px; }
          .helix-usecase-heading { max-width: 760px; margin-bottom: 30px; }
          .helix-usecase-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
          .helix-usecase { padding: 30px; border: 1px solid #dce5f1; border-radius: 23px; background: #fff; box-shadow: 0 18px 50px rgba(23,56,105,.045); transition: transform .2s, box-shadow .2s; }
          .helix-usecase:hover { transform: translateY(-5px); box-shadow: 0 28px 60px rgba(23,56,105,.10); }
          .helix-usecase-num { display: inline-grid; place-items: center; height: 42px; width: 42px; border-radius: 13px; background: #eaf0ff; color: #3b63ae; font-size: 14px; font-weight: 900; }
          .helix-usecase h3 { margin: 22px 0 10px; color: #183253; font-size: 21px; letter-spacing: -.4px; }
          .helix-usecase p { margin: 0; color: #64758e; font-size: 13px; line-height: 1.8; }
          .helix-usecase a { display: inline-flex; gap: 7px; align-items: center; color: #345faf; font-size: 12px; font-weight: 850; margin-top: 22px; text-decoration: none; }
          .helix-faq-section { padding: 45px 0 95px; display: grid; grid-template-columns: .85fr 1.15fr; gap: 55px; align-items: start; }
          .helix-faq-list { border-top: 1px solid #dce4ef; }
          .helix-faq-list details { padding: 20px 0; border-bottom: 1px solid #dce4ef; }
          .helix-faq-list summary { cursor: pointer; color: #183251; font-size: 15px; font-weight: 850; }
          .helix-faq-list details p { margin: 13px 0 0; color: #64758e; font-size: 13px; line-height: 1.75; }
          @media(max-width:860px) {
            .helix-workspace-layout { grid-template-columns: 145px minmax(0,1fr); }
            .helix-preview-cards { grid-template-columns: 1fr; }
            .helix-usecase-grid { grid-template-columns: 1fr; }
            .helix-faq-section { grid-template-columns: 1fr; gap: 20px; }
          }
          @media(max-width:560px) {
            .helix-trust-strip { margin-top: 0; }
            .helix-workspace-layout { grid-template-columns: 1fr; }
            .helix-workspace-sidebar { display: none; }
            .helix-workspace-top { padding: 12px; }
          }

          /* Memorable-inspired editorial / technical visual language */
          .helix-home-page { background-color: #f5f6f3; }
          .helix-hero { min-height: 660px; padding-bottom: 80px; }
          .helix-hero-copy { position: relative; z-index: 2; }
          .helix-hero .helix-eyebrow {
            display: inline-flex; padding: 9px 13px; border: 1px solid #b9cbea;
            border-radius: 4px; background: rgba(255,255,255,.64); color: #163d81;
          }
          .helix-hero h1 { font-weight: 900; font-size: clamp(54px, 6.2vw, 94px); letter-spacing: -.065em; line-height: .98; }
          .helix-hero h1 span { margin-top: 13px; }
          .helix-hero-description { max-width: 520px; font-size: 17px; line-height: 1.8; }
          .helix-hero-visual { border-radius: 12px; }
          .helix-network-card { border-radius: 9px; }
          .helix-workspace-preview, .helix-feature-card, .helix-flow-panel, .helix-usecase, .helix-demo-card { border-radius: 14px; }
          .helix-kinetic-band {
            display: flex; overflow: hidden; user-select: none; margin: 20px calc((min(1220px, 100vw - 40px) - 100vw)/2) 80px;
            padding: 17px 0; background: #10254b; color: #c8e7ff;
            border-top: 1px solid rgba(255,255,255,.11); border-bottom: 1px solid rgba(255,255,255,.11);
          }
          .helix-kinetic-track { display: flex; align-items: center; flex-shrink: 0; gap: 38px; min-width: max-content; animation: helixMarquee 36s linear infinite; }
          .helix-kinetic-track span { display: inline-flex; align-items: center; gap: 38px; font-size: 12px; text-transform: uppercase; font-weight: 850; letter-spacing: .16em; }
          .helix-kinetic-track b { color: #53a7de; font-weight: 600; }
          @keyframes helixMarquee { to { transform: translateX(-100%); } }
          .helix-kinetic-band:hover .helix-kinetic-track { animation-play-state: paused; }
          .helix-layer-section {
            position: relative; padding: 78px 0 104px; border-top: 1px solid #d6dfeb; border-bottom: 1px solid #d6dfeb;
          }
          .helix-layer-intro { display: grid; grid-template-columns: .8fr 1.2fr; gap: 45px; align-items: start; margin-bottom: 52px; }
          .helix-layer-index { color: #3b65aa; font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
          .helix-layer-intro h2 { margin: 0; font-size: clamp(44px, 6.5vw, 88px); line-height: .99; letter-spacing: -.067em; color: #132b4f; }
          .helix-layer-intro h2 em { font-style: normal; color: #4775d0; }
          .helix-layer-list { border-top: 1px solid #b6c7dc; }
          .helix-layer-item {
            display: grid; grid-template-columns: 90px 1.1fr 1fr 36px; gap: 25px; align-items: center;
            padding: 30px 6px; border-bottom: 1px solid #cbd7e7; transition: background .2s, padding .2s;
          }
          .helix-layer-item:hover { background: rgba(225,237,253,.54); padding-left: 18px; padding-right: 18px; }
          .helix-layer-item .layer-n { font-size: 13px; font-weight: 900; color: #416cae; letter-spacing: .1em; }
          .helix-layer-item h3 { font-size: clamp(25px,3vw,39px); color: #173355; line-height: 1.1; letter-spacing: -.045em; margin: 0; }
          .helix-layer-item p { font-size: 13px; line-height: 1.7; color: #61718a; margin: 0; }
          .helix-layer-item svg { color: #4774bb; }
          .helix-technical-label { font-size: 10px; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; color: #4a6a9b; }
          .helix-layer-cta { margin-top: 28px; display: inline-flex; align-items: center; gap: 12px; padding: 14px 20px; border-radius: 5px; background: #173d7e; color: white; font-size: 13px; font-weight: 850; text-decoration: none; transition: transform .2s; }
          .helix-layer-cta:hover { transform: translateY(-3px); }
          .helix-product-heading h2, .helix-usecase-heading h2, .helix-faq-heading h2, .helix-section-heading h2 { letter-spacing: -.065em; }
          .helix-product-section { padding-top: 70px; }
          .helix-trust-strip { border-radius: 7px; }
          @media (max-width: 900px) {
            .helix-layer-intro { grid-template-columns: 1fr; gap: 18px; }
            .helix-layer-item { grid-template-columns: 46px 1fr 32px; gap: 12px; }
            .helix-layer-item p { grid-column: 2 / 3; grid-row: 2; }
            .helix-layer-item > svg { grid-column: 3; grid-row: 1; }
          }
          @media (max-width: 650px) {
            .helix-hero { min-height: 0; }
            .helix-kinetic-band { margin-left: -20px; margin-right: -20px; margin-bottom: 40px; }
            .helix-layer-section { padding: 55px 0 70px; }
            .helix-layer-intro h2 { font-size: clamp(40px,11vw,68px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .helix-kinetic-track { animation: none !important; }
          }

          /* V3: tighter, more cinematic product-first composition */
          .helix-home-main { width: min(1280px, calc(100% - 48px)); }
          .helix-hero {
            min-height: 0; gap: 24px; padding: 34px 0 30px !important;
            grid-template-columns: minmax(0, .94fr) minmax(0, 1.06fr);
          }
          .helix-hero h1 { font-size: clamp(52px, 6vw, 86px); line-height: .96; }
          .helix-hero-description { margin-top: 18px; font-size: 15px; line-height: 1.7; }
          .helix-hero-search { margin-top: 21px; }
          .helix-hero-actions { margin-top: 12px; }
          .helix-hero-visual { min-height: 470px; }
          .helix-dna-stage { height: 385px; }
          .helix-network-card { width: 138px; padding: 12px; }
          .helix-kinetic-band {
            margin-top: 4px; margin-bottom: 25px; padding: 12px 0;
          }
          .helix-trust-strip {
            margin: 0 0 20px; padding: 13px 19px; border-radius: 6px;
          }
          .helix-product-section { padding: 28px 0 36px !important; }
          .helix-product-heading { margin-bottom: 22px; }
          .helix-product-heading h2,
          .helix-usecase-heading h2, .helix-faq-heading h2,
          .helix-section-heading h2 { font-size: clamp(32px, 4.2vw, 55px); margin-bottom: 10px; }
          .helix-product-heading > p:last-child,
          .helix-usecase-heading > p:last-child,
          .helix-faq-heading > p:last-child { margin: 8px 0 0; font-size: 14px; line-height: 1.6; }
          .helix-workspace-layout { min-height: 315px; }
          .helix-workspace-content { padding: 24px; }
          .helix-workspace-content h3 { margin: 7px 0; }
          .helix-workspace-tabs { margin: 14px 0; }
          .helix-preview-card { padding: 13px; }
          .helix-preview-link { margin-top: 14px; }
          .helix-lab-showcase { padding: 30px 0 38px !important; }
          .helix-lab-heading { margin-bottom: 16px; }
          .helix-lab-heading h2 { font-size: clamp(32px, 4.5vw, 58px); margin-bottom: 8px; }
          .helix-lab-heading > p:last-child { font-size: 14px; line-height: 1.65; }
          .helix-home-lab-image img { height: 310px; }
          .helix-section { padding: 34px 0 !important; }
          .helix-section-heading { margin-bottom: 18px; }
          .helix-feature-grid { gap: 12px; }
          .helix-feature-card { min-height: 205px; padding: 20px; }
          .helix-feature-card small { margin-top: 14px; }
          .helix-feature-card h3 { margin: 7px 0; }
          .helix-layer-section { padding: 45px 0 48px !important; }
          .helix-layer-intro { margin-bottom: 23px; }
          .helix-layer-intro h2 { font-size: clamp(45px, 5.7vw, 76px); }
          .helix-layer-item { padding: 19px 6px; }
          .helix-layer-item h3 { font-size: clamp(24px, 2.5vw, 35px); }
          .helix-layer-cta { margin-top: 20px; }
          .helix-usecase-section { padding: 39px 0 40px !important; }
          .helix-usecase-heading { margin-bottom: 18px; }
          .helix-usecase-grid { gap: 12px; }
          .helix-usecase { padding: 23px; }
          .helix-usecase h3 { margin-top: 14px; }
          .helix-flow-section { padding: 36px 0 !important; }
          .helix-flow-panel { padding: 25px; gap: 22px; }
          .helix-step { padding: 11px 14px; }
          .helix-faq-section { padding: 38px 0 42px !important; gap: 35px; }
          .helix-faq-list details { padding: 15px 0; }
          .helix-demo-section { padding: 30px 0 48px !important; }
          .helix-demo-card { padding: 29px; }
          .helix-home-footer { padding: 20px 0 25px; }
          /* Decorative interface detail gives the page a designed, editorial rhythm. */
          .helix-product-heading::before {
            content: '01 / PRODUCT'; display: block; color: #4c72b2; font-size: 11px;
            font-weight: 900; letter-spacing: .18em; margin-bottom: 9px;
          }
          .helix-lab-heading::before {
            content: '02 / THE SCIENCE'; display: block; color: #4c72b2; font-size: 11px;
            font-weight: 900; letter-spacing: .18em; margin-bottom: 8px;
          }
          .helix-feature-card:first-child { background-image:
            radial-gradient(circle at 85% 12%, rgba(61,174,242,.23) 0 1px, transparent 2px),
            radial-gradient(circle at 70% 58%, rgba(108,201,251,.24) 0 1px, transparent 2px),
            linear-gradient(140deg,#0b234b,#1f4d91);
            background-size: 29px 29px, 39px 39px, auto;
          }
          .helix-workspace-preview { border-radius: 13px; }
          .helix-home-lab-image { border-radius: 15px; }
          @media(max-width: 980px) {
            .helix-hero { grid-template-columns: 1fr; }
            .helix-hero-visual { min-height: 410px; }
            .helix-dna-stage { height: 345px; }
          }
          @media(max-width: 650px) {
            .helix-home-main { width: calc(100% - 32px); }
            .helix-hero { padding-top: 24px !important; }
            .helix-hero-visual { min-height: 370px; }
            .helix-kinetic-band { margin-left: -16px; margin-right: -16px; }
            .helix-trust-strip { padding: 15px; }
            .helix-home-lab-image img { height: 230px; }
            .helix-workspace-content { padding: 17px; }
            .helix-layer-section { padding: 34px 0 !important; }
            .helix-usecase-section { padding: 28px 0 !important; }
            .helix-flow-panel { padding: 20px; }
          }

          /* Studio-grade startup motion system */
          .helix-home-page { --helix-ease: cubic-bezier(.22, 1, .36, 1); }
          .helix-reveal {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
            transition: opacity .78s var(--helix-ease), transform .78s var(--helix-ease);
          }
          .helix-reveal.is-in-view { opacity: 1; transform: translate3d(0,0,0); }
          .helix-feature-card.helix-reveal:nth-child(2),
          .helix-layer-item.helix-reveal:nth-child(2),
          .helix-usecase.helix-reveal:nth-child(2) { transition-delay: .09s; }
          .helix-feature-card.helix-reveal:nth-child(3),
          .helix-layer-item.helix-reveal:nth-child(3),
          .helix-usecase.helix-reveal:nth-child(3) { transition-delay: .16s; }
          .helix-feature-card.helix-reveal:nth-child(4),
          .helix-layer-item.helix-reveal:nth-child(4) { transition-delay: .23s; }
          .helix-hero-visual::after {
            content: ''; position: absolute; inset: -60%; z-index: 1; pointer-events: none;
            background: conic-gradient(from 0deg, transparent 0deg, rgba(68,169,246,.085) 55deg, transparent 110deg, transparent 220deg, rgba(93,212,245,.075) 290deg, transparent 360deg);
            animation: helixAuroraSpin 28s linear infinite;
          }
          .helix-hero-spark-field { position: absolute; inset: 0; pointer-events: none; z-index: 2; overflow: hidden; }
          .helix-hero-spark-field i {
            position: absolute; width: 3px; height: 3px; border-radius: 50%;
            background: #c1eeff; box-shadow: 0 0 11px 2px rgba(105,200,255,.7);
            animation: helixSparkFloat 5s ease-in-out infinite;
          }
          .helix-hero-visual .helix-dna-stage { z-index: 3; }
          .helix-hero-visual .helix-network-card { z-index: 5; }
          .helix-hero-visual { transition: box-shadow .4s ease, border-color .4s ease; }
          .helix-hero-visual:hover {
            box-shadow: 0 42px 105px rgba(12,36,82,.3), inset 0 0 95px rgba(63,129,224,.13);
            border-color: rgba(117,203,255,.5);
          }
          .helix-hero-visual:hover .helix-dna-svg { animation-duration: 4.6s; }
          .helix-hero-search { transition: box-shadow .28s ease, border-color .28s ease, transform .28s ease; }
          .helix-hero-search:hover { box-shadow: 0 24px 65px rgba(32,76,153,.19); border-color: #8fabdd; transform: translateY(-2px); }
          .helix-feature-card::after, .helix-usecase::after {
            content: ''; position: absolute; left: -35%; top: -75%; width: 70%; height: 220%;
            background: linear-gradient(105deg, transparent 35%, rgba(138,200,255,.11) 50%, transparent 65%);
            transform: rotate(16deg) translateX(-230%); pointer-events: none;
            transition: transform .85s var(--helix-ease);
          }
          .helix-feature-card:hover::after, .helix-usecase:hover::after { transform: rotate(16deg) translateX(360%); }
          .helix-usecase { position: relative; overflow: hidden; }
          .helix-workspace-preview { transition: transform .55s var(--helix-ease), box-shadow .55s ease; }
          .helix-workspace-preview:hover { transform: translateY(-5px); box-shadow: 0 42px 100px rgba(16,38,82,.2); }
          .helix-workspace-tabs span { transition: transform .2s ease, background .2s ease; }
          .helix-workspace-tabs span:hover { transform: translateY(-2px); }
          .helix-preview-card { transition: transform .25s var(--helix-ease), border-color .25s ease; }
          .helix-preview-card:hover { transform: translateY(-4px); border-color: #9dc5fa; }
          .helix-home-lab-image img { transition: transform 1.3s var(--helix-ease); }
          .helix-home-lab-image:hover img { transform: scale(1.045); }
          .helix-layer-item > svg { transition: transform .3s var(--helix-ease); }
          .helix-layer-item:hover > svg { transform: translateX(7px) rotate(-25deg); }
          .helix-hero .helix-eyebrow > svg { animation: helixIconTwinkle 3.2s ease-in-out infinite; }
          .helix-primary-button, .helix-hero-search a, .helix-layer-cta, .helix-demo-actions a { position: relative; overflow: hidden; }
          @keyframes helixAuroraSpin { to { transform: rotate(360deg); } }
          @keyframes helixSparkFloat {
            0%,100% { transform: translateY(5px) scale(.6); opacity: .25; }
            50% { transform: translateY(-13px) scale(1.6); opacity: .95; }
          }
          @keyframes helixIconTwinkle {
            0%,100% { transform: scale(1) rotate(0deg); opacity: .75; }
            50% { transform: scale(1.2) rotate(18deg); opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .helix-reveal, .helix-reveal.is-in-view { opacity: 1 !important; transform: none !important; transition: none !important; }
            .helix-hero-visual::after, .helix-hero-spark-field i, .helix-hero .helix-eyebrow > svg { animation: none !important; }
            .helix-home-page * { scroll-behavior: auto !important; }
          }

          /* Interactive exploded scientific research engine */
          .helix-explode-layout { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr); gap: 42px; align-items: center; margin: 8px 0 28px; }
          .helix-explode-stage { --explode: .7; position: relative; min-height: 535px; overflow: hidden; isolation: isolate; border: 1px solid #234d91; border-radius: 14px; background: radial-gradient(ellipse at 52% 55%,rgba(54,112,213,.36),transparent 53%),linear-gradient(145deg,#07172f,#0e305f 73%,#103c71); box-shadow: 0 30px 75px rgba(10,32,75,.22); }
          .helix-explode-stage::before { content: ''; position: absolute; inset:0; background-image:linear-gradient(rgba(122,180,246,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(122,180,246,.08) 1px,transparent 1px); background-size:27px 27px; mask-image:radial-gradient(circle,black 15%,transparent 78%); pointer-events:none; }
          .helix-explode-head,.helix-explode-foot { position:absolute; left:19px;right:19px;display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:8;color:#9cc0ea;font-size:9px;font-weight:850;letter-spacing:.12em; }
          .helix-explode-head { top:18px; } .helix-explode-foot { bottom:17px; opacity:.68; }
          .helix-explode-head > span { display:flex;align-items:center;gap:7px; }
          .helix-explode-space { position:absolute;inset:38px 0 28px; perspective:900px; transform-style:preserve-3d; }
          .helix-explode-halo { position:absolute;left:50%;top:50%;width:280px;height:280px;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(73,168,250,.45),transparent 72%);filter:blur(25px);animation:helixAura 5s ease-in-out infinite; }
          .helix-explode-axis { position:absolute;left:50%;top:14%;height:72%;width:1px;background:linear-gradient(transparent,#70c9ff,transparent);opacity:.46;box-shadow:0 0 13px 2px rgba(91,184,250,.45); }
          .helix-explode-layer { position:absolute;left:50%;top:50%;width:min(63%,330px);height:174px;transform-style:preserve-3d;transition:filter .35s ease,opacity .35s ease;filter:drop-shadow(0 16px 13px rgba(0,5,26,.38)); }
          .helix-explode-layer.layer-0 { transform:translate(-50%,calc(-50% - 147px * var(--explode))) rotateX(57deg) rotateZ(-31deg);z-index:6; }
          .helix-explode-layer.layer-1 { transform:translate(-50%,calc(-50% - 47px * var(--explode))) rotateX(57deg) rotateZ(-31deg);z-index:5; }
          .helix-explode-layer.layer-2 { transform:translate(-50%,calc(-50% + 55px * var(--explode))) rotateX(57deg) rotateZ(-31deg);z-index:4; }
          .helix-explode-layer.layer-3 { transform:translate(-50%,calc(-50% + 157px * var(--explode))) rotateX(57deg) rotateZ(-31deg);z-index:3; }
          .helix-explode-layer.selected { filter:drop-shadow(0 0 18px rgba(96,206,255,.84)) drop-shadow(0 17px 16px rgba(0,5,26,.3)); }
          .helix-explode-plane { width:100%;height:100%;position:relative;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(161,222,255,.62);border-radius:14px;background:linear-gradient(150deg,rgba(37,110,193,.62),rgba(7,37,83,.85));box-shadow:inset 0 1px 0 rgba(204,240,255,.32),0 7px 0 #09254e,0 14px 28px rgba(0,7,35,.3); }
          .helix-explode-layer.layer-1 .helix-explode-plane { background:linear-gradient(145deg,rgba(41,149,179,.72),rgba(7,49,80,.9)); }
          .helix-explode-layer.layer-2 .helix-explode-plane { background:linear-gradient(145deg,rgba(77,83,189,.77),rgba(20,33,90,.92)); }
          .helix-explode-layer.layer-3 .helix-explode-plane { background:linear-gradient(145deg,rgba(23,99,162,.75),rgba(7,29,64,.93)); }
          .helix-explode-grid {position:absolute;inset:0;background-image:linear-gradient(rgba(165,219,255,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(165,219,255,.16) 1px,transparent 1px);background-size:19px 19px;opacity:.6;}
          .helix-plane-center {z-index:2;display:grid;place-items:center;gap:7px;color:#c5f0ff;}.helix-plane-center span {font-size:9px;font-weight:850;letter-spacing:.18em;}
          .helix-plane-dna,.helix-plane-network {position:relative;color:#ccedff;filter:drop-shadow(0 0 12px rgba(124,220,255,.5));}
          .helix-plane-evidence {position:relative;display:grid;grid-template-columns:repeat(3,31px);gap:11px;transform:rotate(-6deg);}
          .helix-plane-evidence i {height:24px;border:1px solid rgba(166,242,254,.78);background:rgba(160,236,255,.22);border-radius:4px;box-shadow:0 0 12px rgba(117,219,255,.24);}
          .helix-plane-tag {position:absolute;top:-18px;right:0;font-size:10px;color:#c6eaff;font-weight:900;letter-spacing:.09em;text-shadow:0 1px 7px #051b38;white-space:nowrap;}
          .helix-explode-description h3 {font-size:clamp(30px,4vw,48px);margin:7px 0 13px;color:#12294f;letter-spacing:-.055em;line-height:1.05;}
          .helix-explode-description h3 span {color:#487bd1;}.helix-explode-lede {font-size:14px;color:#5f728e;line-height:1.7;margin:0 0 20px;}
          .helix-explode-option {border:0;border-top:1px solid #cbd8e8;background:transparent;padding:16px 9px;width:100%;display:grid;grid-template-columns:35px 1fr 20px;gap:12px;text-align:left;align-items:center;color:#284972;cursor:pointer;transition:background .2s,padding .2s;}
          .helix-explode-option:last-child {border-bottom:1px solid #cbd8e8;}.helix-explode-option.active {background:#e5efff;padding-left:15px;border-radius:8px;}.helix-explode-option:hover {background:#ecf4ff;}
          .helix-explode-option-number {font-size:11px;font-weight:900;color:#416db5;}.helix-explode-option-copy {display:grid;gap:5px;}.helix-explode-option-copy strong {font-size:15px;color:#1a3459;}.helix-explode-option-copy small {font-size:12px;color:#60748d;line-height:1.5;}.helix-explode-option > svg {transition:transform .2s;}.helix-explode-option:hover > svg {transform:translateX(4px);}
          @keyframes helixAura {50%{opacity:.65;transform:translate(-50%,-50%) scale(1.2)}}
          @media(max-width:950px){.helix-explode-layout{grid-template-columns:1fr;gap:24px;}.helix-explode-stage{min-height:495px;}.helix-explode-description{max-width:650px;}}
          @media(max-width:600px){.helix-explode-stage{min-height:440px;}.helix-explode-layer{width:69%;height:138px;}.helix-explode-layer.layer-0{transform:translate(-50%,calc(-50% - 122px * var(--explode))) rotateX(57deg) rotateZ(-31deg)}.helix-explode-layer.layer-1{transform:translate(-50%,calc(-50% - 42px * var(--explode))) rotateX(57deg) rotateZ(-31deg)}.helix-explode-layer.layer-2{transform:translate(-50%,calc(-50% + 40px * var(--explode))) rotateX(57deg) rotateZ(-31deg)}.helix-explode-layer.layer-3{transform:translate(-50%,calc(-50% + 122px * var(--explode))) rotateX(57deg) rotateZ(-31deg)}.helix-explode-head,.helix-explode-foot{font-size:8px;left:12px;right:12px;}.helix-explode-head>span:last-child{display:none;}}
          @media(prefers-reduced-motion:reduce){.helix-explode-halo{animation:none!important;}.helix-explode-option,.helix-explode-layer{transition:none!important;}}

          /* Focused layout: centered editorial heading + prominent exploded object */
          .helix-layer-section { padding: 45px 0 52px !important; }
          .helix-layer-intro { display: flex !important; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0; max-width: 900px; margin: 0 auto 20px !important; }
          .helix-layer-intro h2 { margin: 10px auto 9px; font-size: clamp(43px, 6vw, 80px); width: 100%; max-width: 850px; letter-spacing: -.068em; }
          .helix-layer-intro > p { color: #5f718c; margin: 0; font-size: 15px; line-height: 1.6; }
          .helix-explode-layout { grid-template-columns: minmax(0,1.25fr) minmax(0,.75fr); gap: 22px; margin: 0 0 12px; }
          .helix-explode-stage { min-height: 625px; border-radius: 8px; }
          .helix-explode-space { perspective: 1200px; }
          .helix-explode-layer { width: min(69%,425px); height: 200px; }
          .helix-explode-layer.layer-0 { transform: translate(-50%,calc(-50% - 207px * var(--explode))) rotateX(60deg) rotateZ(-31deg); }
          .helix-explode-layer.layer-1 { transform: translate(-50%,calc(-50% - 69px * var(--explode))) rotateX(60deg) rotateZ(-31deg); }
          .helix-explode-layer.layer-2 { transform: translate(-50%,calc(-50% + 69px * var(--explode))) rotateX(60deg) rotateZ(-31deg); }
          .helix-explode-layer.layer-3 { transform: translate(-50%,calc(-50% + 207px * var(--explode))) rotateX(60deg) rotateZ(-31deg); }
          .helix-explode-plane { border: 1.5px solid rgba(174,226,255,.84); box-shadow: inset 0 1px 0 rgba(228,250,255,.44),0 9px 0 #071a3a,0 12px 0 rgba(86,195,255,.22),0 22px 40px rgba(0,6,29,.45); }
          .helix-explode-layer.selected .helix-explode-plane { border-color: #9cf3ff; box-shadow: inset 0 0 45px rgba(57,171,244,.17),0 9px 0 #071a3a,0 12px 0 #61b9ff,0 0 40px rgba(96,206,255,.55); }
          .helix-explode-description h3 { font-size: clamp(29px,3.2vw,42px); }
          .helix-explode-option { padding: 12px 8px; }
          .helix-explode-option-copy small { font-size: 11px; }
          .helix-layer-cta { margin-top: 7px; }
          @media(max-width:950px) { .helix-explode-layout { grid-template-columns: 1fr; gap: 18px; } .helix-explode-stage { min-height: 590px; } }
          @media(max-width:600px) {
            .helix-layer-intro { margin-bottom: 16px !important; }
            .helix-explode-stage { min-height: 465px; }
            .helix-explode-layer { width: 70%; height: 142px; }
            .helix-explode-layer.layer-0 { transform: translate(-50%,calc(-50% - 135px * var(--explode))) rotateX(60deg) rotateZ(-31deg); }
            .helix-explode-layer.layer-1 { transform: translate(-50%,calc(-50% - 45px * var(--explode))) rotateX(60deg) rotateZ(-31deg); }
            .helix-explode-layer.layer-2 { transform: translate(-50%,calc(-50% + 45px * var(--explode))) rotateX(60deg) rotateZ(-31deg); }
            .helix-explode-layer.layer-3 { transform: translate(-50%,calc(-50% + 135px * var(--explode))) rotateX(60deg) rotateZ(-31deg); }
          }
          @keyframes helixFadeUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes helixRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes helixOrbitFloat {
            from { transform: rotate(-35deg) scale(1); }
            to { transform: rotate(35deg) scale(1.06); }
          }

          @keyframes helixPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          @keyframes helixCardFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-9px); }
          }

          @media (max-width: 980px) {
            .helix-hero,
            .helix-section-heading,
            .helix-flow-panel,
            .helix-demo-card {
              grid-template-columns: 1fr;
            }

            .helix-hero {
              padding: 48px 0 65px;
            }

            .helix-hero-visual {
              min-height: 510px;
            }

            .helix-feature-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 650px) {
            .helix-home-main,
            .helix-home-footer {
              width: calc(100% - 28px);
            }

            .helix-hero h1 {
              letter-spacing: -2px;
            }

            .helix-hero-search {
              align-items: stretch;
              flex-direction: column;
              padding: 15px;
            }

            .helix-hero-search a {
              width: 100%;
            }

            .helix-hero-visual {
              min-height: 490px;
            }

            .helix-network-card {
              width: 128px;
              padding: 10px;
            }

            .card-one, .card-three { left: 3%; }
            .card-two, .card-four { right: 3%; }

            .helix-lab-showcase {
              padding: 25px 0 50px;
            }

            .helix-home-lab-image img {
              height: 265px;
            }

            .helix-feature-grid {
              grid-template-columns: 1fr;
            }

            .helix-flow-panel,
            .helix-demo-card {
              padding: 23px;
            }

            .helix-home-footer {
              flex-direction: column;
            }

            .helix-footer-note {
              text-align: left;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .helix-home-page *,
            .helix-home-page *::before,
            .helix-home-page *::after {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>

      <Navbar />

      <main className="helix-home-main">
        <section className="helix-hero">
          <div className="helix-hero-copy">
            <p className="helix-eyebrow">
              <Sparkles size={15} />
              AI-powered scientific research explorer
            </p>

            <h1>
              Ask a question.
              <span>Explore the evidence.</span>
            </h1>

            <p className="helix-hero-description">
              Helix helps students, innovators, and researchers
              investigate complex scientific questions using
              structured AI research workflows, scientific
              evidence, interactive models, and connected concepts.
            </p>

            <div className="helix-hero-search">
              <Search size={22} />
              <span>
                What evidence connects SOD1 to ALS?
              </span>

              <Link to="/explore">
                Start researching
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="helix-hero-actions">
              <Link
                to="/projects"
                className="helix-secondary-button"
              >
                <FolderKanban size={18} />
                View saved projects
              </Link>

              <a
                href="#how-it-works"
                className="helix-secondary-button"
              >
                See how it works
              </a>
            </div>
          </div>

          <div
            className="helix-hero-visual"
            aria-label="Helix research visualization preview"
          >
            <div className="helix-visual-grid" />
            <div className="helix-hero-spark-field" aria-hidden="true">
              {Array.from({ length: 18 }, (_, i) => (
                <i key={i} style={{
                  left: `${8 + (i * 47) % 84}%`,
                  top: `${6 + (i * 31) % 86}%`,
                  animationDelay: `${i * -0.39}s`,
                  animationDuration: `${3.2 + (i % 5) * 0.7}s`,
                }} />
              ))}
            </div>
            <div className="helix-orbit" />
            <div className="helix-orbit helix-orbit-two" />

            <div className="helix-dna-stage" aria-hidden="true">
              <div className="helix-dna-aura" />
              <svg className="helix-dna-svg" viewBox="0 0 260 430" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="dna-strand-a" x1="40" y1="0" x2="215" y2="420">
                    <stop stopColor="#3B6BDB" />
                    <stop offset=".5" stopColor="#91D8FF" />
                    <stop offset="1" stopColor="#3761C6" />
                  </linearGradient>
                  <linearGradient id="dna-strand-b" x1="210" y1="0" x2="45" y2="420">
                    <stop stopColor="#92B7FF" />
                    <stop offset=".5" stopColor="#4768D0" />
                    <stop offset="1" stopColor="#9DE9FF" />
                  </linearGradient>
                  <filter id="dna-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" />
                  </filter>
                </defs>
                <g className="helix-dna-glow" filter="url(#dna-glow)" opacity=".45">
                  <path d="M78 20 C210 75 210 135 130 210 C50 285 50 345 182 410" stroke="#518AFF" strokeWidth="17" strokeLinecap="round" />
                  <path d="M182 20 C50 75 50 135 130 210 C210 285 210 345 78 410" stroke="#8FE9FF" strokeWidth="17" strokeLinecap="round" />
                </g>
                {Array.from({ length: 17 }, (_, i) => {
                  const y = 24 + i * 24;
                  const x1 = 130 - 68 * Math.cos((i / 16) * Math.PI * 2);
                  const x2 = 130 + 68 * Math.cos((i / 16) * Math.PI * 2);
                  return (
                    <g key={i} className="helix-dna-rung" style={{ animationDelay: `${i * -0.13}s` }}>
                      <line x1={x1} x2={x2} y1={y} y2={y} stroke={i % 2 ? '#79CCF8' : '#86A3F5'} strokeWidth="5" strokeLinecap="round" opacity=".72" />
                      <circle cx={x1} cy={y} r="4" fill="#B4E9FF" />
                      <circle cx={x2} cy={y} r="4" fill="#8FA9FF" />
                    </g>
                  );
                })}
                <path d="M78 20 C210 75 210 135 130 210 C50 285 50 345 182 410" stroke="url(#dna-strand-a)" strokeWidth="11" strokeLinecap="round" />
                <path d="M182 20 C50 75 50 135 130 210 C210 285 210 345 78 410" stroke="url(#dna-strand-b)" strokeWidth="11" strokeLinecap="round" />
                <path d="M78 20 C210 75 210 135 130 210 C50 285 50 345 182 410" stroke="#D5F3FF" strokeWidth="2" strokeLinecap="round" opacity=".75" />
              </svg>
              <div className="helix-dna-label"><span className="helix-live-dot" /> LIVE RESEARCH VISUALIZATION</div>
            </div>

            <article className="helix-network-card card-one">
              <span>Research question</span>
              <strong>SOD1 and ALS</strong>
              <p>Start with a scientific question.</p>
            </article>

            <article className="helix-network-card card-two">
              <span>Connections</span>
              <strong>Genes and pathways</strong>
              <p>Explore related mechanisms.</p>
            </article>

            <article className="helix-network-card card-three">
              <span>Scientific model</span>
              <strong>Interactive learning</strong>
              <p>Understand complex biology.</p>
            </article>

            <article className="helix-network-card card-four">
              <span>Evidence</span>
              <strong>Review and verify</strong>
              <p>Investigate scientific sources.</p>
            </article>
          </div>
        </section>



        <div className="helix-kinetic-band" aria-label="Research themes explored in Helix">
          {[0, 1].map((repeat) => (
            <div className="helix-kinetic-track" key={repeat} aria-hidden={repeat === 1}>
              {['GENES & PATHWAYS', 'SCIENTIFIC EVIDENCE', 'BIOLOGICAL MODELS', 'MECHANISMS', 'KNOWLEDGE GRAPHS', 'RESEARCH QUESTIONS'].map((item) => (
                <span key={item}>{item}<b>✳</b></span>
              ))}
            </div>
          ))}
        </div>
        <div className="helix-trust-strip" aria-label="Helix platform principles">
          <strong>Built for curious minds</strong>
          <div className="helix-trust-points">
            <span><ShieldCheck size={15} /> Evidence-aware exploration</span>
            <span><Network size={15} /> Connected concepts</span>
            <span><FolderKanban size={15} /> Save and revisit research</span>
          </div>
        </div>

        <section className="helix-product-section" aria-labelledby="workspace-preview-title">
          <div className="helix-product-heading">
            <p className="helix-eyebrow"><Sparkles size={15} /> Meet your research workspace</p>
            <h2 id="workspace-preview-title">One question. A clearer path through the science.</h2>
            <p>Go from a complex biomedical question to a structured investigation. Explore mechanisms, inspect supporting literature, visualize key ideas, and keep your work organized.</p>
          </div>
          <div className="helix-workspace-preview" aria-label="Illustrative preview of the Helix research workspace">
            <div className="helix-workspace-top">
              <div className="helix-workspace-dots" aria-hidden="true"><i /><i /><i /></div>
              <span>HELIX / RESEARCH WORKSPACE</span>
              <span>Illustrative preview</span>
            </div>
            <div className="helix-workspace-layout">
              <aside className="helix-workspace-sidebar">
                <strong>Helix</strong>
                <p>Biomedical research explorer</p>
                <span className="is-active">Research Agent</span>
                <span>Evidence</span>
                <span>Science Models</span>
                <span>Connections</span>
              </aside>
              <div className="helix-workspace-content">
                <span className="helix-workspace-overline">Example investigation</span>
                <h3>How is SOD1 connected to ALS?</h3>
                <p>Follow a research question from its biological context to evidence and mechanisms. This is an interface illustration, not a research result.</p>
                <div className="helix-workspace-tabs"><span>Research plan</span><span>Evidence</span><span>Model</span><span>Connections</span></div>
                <div className="helix-preview-cards">
                  <div className="helix-preview-card"><span>01 / Understand</span><strong>Frame the question</strong><p>Identify the concepts, scope, and research direction.</p></div>
                  <div className="helix-preview-card"><span>02 / Investigate</span><strong>Examine sources</strong><p>Explore relevant literature and verify important claims.</p></div>
                  <div className="helix-preview-card"><span>03 / Connect</span><strong>Build a model</strong><p>Visualize relationships and possible mechanisms.</p></div>
                </div>
                <Link className="helix-preview-link" to="/explore">Open the real workspace <ArrowRight size={15} /></Link>
              </div>
            </div>
          </div>
        </section>
        <section className="helix-lab-showcase">
          <div className="helix-lab-heading">
            <p className="helix-eyebrow">
              <FlaskConical size={15} />
              Inspired by scientific discovery
            </p>

            <h2>
              Research begins with curiosity.
            </h2>

            <p>
              From molecular biology to biomedical innovation,
              Helix helps turn complex scientific questions
              into structured, evidence-informed investigations.
              Explore the science behind discovery.
            </p>
          </div>

          <div className="helix-home-lab-image">
            <img
              src="/shs-biomed-1280x720-20251020-site-marketing-020.webp"
              alt="Biomedical laboratory research environment"
              loading="lazy"
            />

            <span className="helix-lab-caption">
              Exploring the science behind tomorrow's discoveries.
            </span>
          </div>
        </section>

        <section
          className="helix-section"
          id="platform"
        >
          <div className="helix-section-heading">
            <div>
              <p className="helix-eyebrow">
                <Atom size={15} />
                The platform
              </p>

              <h2>
                A research workflow built for understanding.
              </h2>
            </div>

            <p>
              Scientific information is often scattered across
              papers, databases, and diagrams. Helix brings these
              resources into an organized investigation workspace.
            </p>
          </div>

          <div className="helix-feature-grid">
            <article className="helix-feature-card">
              <div className="helix-feature-icon">
                <Sparkles size={22} />
              </div>

              <small>01 / AGENT</small>
              <h3>AI Research Agent</h3>

              <p>
                Turn scientific questions into structured
                investigations with research steps, mechanisms,
                hypotheses, and summaries.
              </p>
            </article>

            <article className="helix-feature-card">
              <div className="helix-feature-icon">
                <BookOpen size={22} />
              </div>

              <small>02 / EVIDENCE</small>
              <h3>Evidence Explorer</h3>

              <p>
                Discover relevant scientific literature, review
                source information, and identify claims that
                require further verification.
              </p>
            </article>

            <article className="helix-feature-card">
              <div className="helix-feature-icon">
                <Orbit size={22} />
              </div>

              <small>03 / MODEL</small>
              <h3>Interactive Science Models</h3>

              <p>
                Explore scientific mechanisms with interactive
                diagrams, guided steps, and educational
                explanations.
              </p>
            </article>

            <article className="helix-feature-card">
              <div className="helix-feature-icon">
                <Network size={22} />
              </div>

              <small>04 / CONNECTIONS</small>
              <h3>Scientific Connections</h3>

              <p>
                Examine relationships between genes, pathways,
                biological processes, and research concepts.
              </p>
            </article>
          </div>
        </section>



        <section className="helix-layer-section" aria-labelledby="layers-title">
          <div className="helix-layer-intro">
            <span className="helix-layer-index">INSIDE HELIX / AN INTERACTIVE BREAKDOWN</span>
            <h2 id="layers-title">The anatomy of <em>discovery.</em></h2>
            <p>One research engine. Four connected layers. Scroll to pull it apart.</p>
          </div>
          <div className="helix-explode-layout">
            <div className="helix-explode-stage" aria-label="Interactive exploded view of the four-layer Helix research engine">
              <div className="helix-explode-head">
                <span><span className="helix-live-dot" /> SYSTEM ARCHITECTURE / LIVE MODEL</span>
                <span>SCROLL TO EXPLORE <ArrowRight size={12} /></span>
              </div>
              <div className="helix-explode-space">
                <div className="helix-explode-halo" />
                <div className="helix-explode-axis" />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`helix-explode-layer layer-${i} ${activeLayer === i ? 'selected' : ''}`}>
                    <div className="helix-explode-plane">
                      <div className="helix-explode-grid" />
                      {i === 0 ? <div className="helix-plane-center"><Search size={33} /><span>RESEARCH QUERY</span></div> : null}
                      {i === 1 ? <div className="helix-plane-evidence"><i /><i /><i /><i /><i /><i /></div> : null}
                      {i === 2 ? <div className="helix-plane-dna"><Dna size={70} strokeWidth={1.3} /></div> : null}
                      {i === 3 ? <div className="helix-plane-network"><Network size={68} strokeWidth={1.2} /></div> : null}
                    </div>
                    <span className="helix-plane-tag">0{i + 1} / {['QUESTION', 'EVIDENCE', 'MECHANISM', 'CONNECTIONS'][i]}</span>
                  </div>
                ))}
              </div>
              <div className="helix-explode-foot"><span>HELIX / RESEARCH ENGINE</span><span>04 INTEGRATED LAYERS</span></div>
            </div>
            <div className="helix-explode-description">
              <p className="helix-technical-label">EXPLORE THE ARCHITECTURE</p>
              <h3>Every discovery has <span>layers.</span></h3>
              <p className="helix-explode-lede">Select a layer to reveal its role in the research process.</p>
              {[
                ['Start with a question', 'Turn curiosity about a gene, disease, or pathway into a focused research direction.'],
                ['Examine the evidence', 'Explore scientific literature, inspect sources, and separate supported claims from uncertainty.'],
                ['Visualize the biology', 'Use educational models to understand mechanisms and biological processes.'],
                ['Connect the discoveries', 'Map relationships between concepts, develop hypotheses, and save your research.'],
              ].map(([name, description], i) => (
                <button key={name} type="button" onClick={() => setActiveLayer(i)}
                  className={`helix-explode-option ${activeLayer === i ? 'active' : ''}`}
                  aria-pressed={activeLayer === i}>
                  <span className="helix-explode-option-number">0{i + 1}</span>
                  <span className="helix-explode-option-copy"><strong>{name}</strong><small>{description}</small></span>
                  <ArrowRight size={18} />
                </button>
              ))}
            </div>
          </div>
          <Link className="helix-layer-cta" to="/explore">ENTER THE RESEARCH EXPLORER <ArrowRight size={16} /></Link>
        </section>
        <section className="helix-faq-section" aria-labelledby="faq-title">
          <div className="helix-faq-heading">
            <p className="helix-eyebrow"><ShieldCheck size={15} /> The details</p>
            <h2 id="faq-title">Research clearly. Think critically.</h2>
            <p>Helix is designed to support scientific learning and exploration—not replace primary literature, expert review, or experimental validation.</p>
          </div>
          <div className="helix-faq-list">
            <details open>
              <summary>What can I investigate with Helix?</summary>
              <p>Try questions about genes, diseases, molecular mechanisms, cellular pathways, and other biomedical topics. The workspace helps organize your exploration.</p>
            </details>
            <details>
              <summary>Does Helix verify every scientific claim?</summary>
              <p>No. AI-generated interpretations can be incorrect. Review the original sources and independently validate important claims before relying on them.</p>
            </details>
            <details>
              <summary>Can I return to a research project later?</summary>
              <p>Helix supports locally saved investigations in your browser. Storage is device- and browser-specific, so it is not the same as cloud synchronization.</p>
            </details>
            <details>
              <summary>Is Helix intended for medical advice?</summary>
              <p>No. Helix is an educational research tool and does not provide diagnosis, treatment advice, or clinical decision support.</p>
            </details>
          </div>
        </section>
        <section className="helix-demo-section">
          <div className="helix-demo-card">
            <div>
              <p className="helix-eyebrow">
                <BookOpen size={15} />
                Try the full workflow
              </p>

              <h2>
                Your next discovery starts with a question.
              </h2>

              <p>
                Launch Helix, investigate a scientific topic,
                explore its evidence and models, and save your
                research to revisit later.
              </p>
            </div>

            <div className="helix-demo-actions">
              <Link to="/explore">
                Launch Research Explorer
                <ArrowRight size={18} />
              </Link>

              <Link to="/projects">
                View Projects
                <FolderKanban size={18} />
              </Link>

              <Link to="/graph">
                View Knowledge Graph
                <Network size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="helix-home-footer">
        <div>
          <strong>Helix</strong>

          <p>
            Scientific research intelligence for learning,
            exploration, and evidence organization.
          </p>
        </div>

        <p className="helix-footer-note">
          For research and educational purposes only.
          Computational findings and generated relationships
          require independent scientific validation.
        </p>
      </footer>
    </div>
  )
}
