
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

import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

export function Home() {
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

        <section
          className="helix-flow-section"
          id="how-it-works"
        >
          <div className="helix-flow-panel">
            <div>
              <p className="helix-eyebrow">
                <Dna size={15} />
                How it works
              </p>

              <h2>
                From question to investigation.
              </h2>

              <p>
                Helix guides users through a scientific research
                workflow that combines question analysis,
                evidence exploration, visual learning,
                and critical evaluation.
              </p>
            </div>

            <div className="helix-steps">
              <article className="helix-step">
                <span className="helix-step-number">
                  01
                </span>

                <div>
                  <h3>Ask</h3>
                  <p>
                    Enter a scientific or biomedical
                    research question.
                  </p>
                </div>
              </article>

              <article className="helix-step">
                <span className="helix-step-number">
                  02
                </span>

                <div>
                  <h3>Investigate</h3>
                  <p>
                    Let Helix organize concepts,
                    mechanisms, and research directions.
                  </p>
                </div>
              </article>

              <article className="helix-step">
                <span className="helix-step-number">
                  03
                </span>

                <div>
                  <h3>Explore</h3>
                  <p>
                    Navigate evidence, interactive models,
                    and scientific connections.
                  </p>
                </div>
              </article>

              <article className="helix-step">
                <span className="helix-step-number">
                  04
                </span>

                <div>
                  <h3>Save and continue</h3>
                  <p>
                    Save investigations locally and
                    return to them later.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="helix-section">
          <div className="helix-section-heading">
            <div>
              <p className="helix-eyebrow">
                <ShieldCheck size={15} />
                Responsible research
              </p>

              <h2>
                Explore ideas. Question evidence.
              </h2>
            </div>

            <p>
              Helix is designed for research and education.
              It does not diagnose diseases, recommend medical
              treatments, or independently prove scientific
              claims. Generated findings require
              scientific verification.
            </p>
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
