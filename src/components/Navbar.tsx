import {
  ArrowUpRight,
  FolderKanban,
  Home,
  Lightbulb,
  Network,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'
import { useAuthSession } from '../auth/AuthSession'

export function Navbar() {
  const { isSignedIn, signOut } = useAuthSession()

  return (
    <header className="navbar helix-premium-navbar">
      <style>
        {`
          .helix-premium-navbar {
            position: sticky;
            top: 0;
            z-index: 50;
            width: 100%;
            border-bottom: 1px solid rgba(223, 228, 220, 0.78);
            background: rgba(248, 247, 241, 0.82);
            backdrop-filter: blur(18px);
          }

          .helix-premium-navbar .navbar-inner {
            width: min(1220px, calc(100% - 40px));
            min-height: 86px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
          }

          .helix-premium-navbar .brand {
            display: inline-flex;
            align-items: center;
            gap: 13px;
            color: #20251f;
            font-size: 29px;
            font-weight: 900;
            letter-spacing: -0.9px;
            text-decoration: none;
          }

          .helix-brand-mark {
            display: grid;
            place-items: center;
            width: 46px;
            height: 46px;
            border-radius: 14px;
            background:
              radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.92), transparent 38%),
              #253b75;
            color: #ffffff;
            box-shadow: 0 14px 30px rgba(37, 59, 117, 0.2);
            overflow: hidden;
            flex-shrink: 0;
          }

          .helix-brand-mark img {
            display: block;
            width: 100%;
            height: 100%;
          }

          .helix-premium-navbar .nav-links {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px;
            border: 1px solid rgba(223, 228, 220, 0.9);
            border-radius: 999px;
            background: rgba(255, 254, 249, 0.72);
          }

          .helix-premium-navbar .nav-links a {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            min-height: 34px;
            padding: 0 11px;
            border-radius: 999px;
            color: #596457;
            font-size: 12px;
            font-weight: 800;
            text-decoration: none;
            transition:
              background 170ms ease,
              color 170ms ease,
              transform 170ms ease;
          }

          .helix-premium-navbar .nav-links a:hover {
            background: #edf1ff;
            color: #253b75;
            transform: translateY(-1px);
          }

          .helix-premium-navbar .nav-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 42px;
            padding: 0 15px;
            border: 1px solid #253b75;
            border-radius: 14px;
            background: #253b75;
            color: #ffffff;
            font-size: 13px;
            font-weight: 850;
            text-decoration: none;
            box-shadow: 0 16px 34px rgba(37, 59, 117, 0.2);
            transition:
              transform 170ms ease,
              box-shadow 170ms ease,
              background 170ms ease;
          }

          .helix-premium-navbar .nav-cta:hover {
            transform: translateY(-2px);
            background: #1f3269;
            box-shadow: 0 20px 44px rgba(37, 59, 117, 0.25);
          }

          @media (max-width: 860px) {
            .helix-premium-navbar .navbar-inner {
              width: min(100% - 28px, 1220px);
              min-height: auto;
              padding: 14px 0;
              align-items: flex-start;
              flex-direction: column;
            }

            .helix-premium-navbar .nav-links {
              width: 100%;
              overflow-x: auto;
              justify-content: flex-start;
            }

            .helix-premium-navbar .nav-cta {
              width: 100%;
            }
          }

          @media (max-width: 520px) {
            .helix-premium-navbar .nav-links a {
              flex: none;
            }
          }
        `}
      </style>

      <div className="navbar-inner">
        <Link
          to="/"
          className="brand"
        >
          <span className="helix-brand-mark">
            <img src="/helix-logo.jpg" alt="" width={46} height={46} />
          </span>

          Helix
        </Link>

        <nav
          className="nav-links"
          aria-label="Main navigation"
        >
          <Link to="/">
            <Home size={14} />

            Home
          </Link>

          <Link to="/explore">
            <Network size={14} />

            Explorer
          </Link>

          <Link to="/projects">
            <FolderKanban size={14} />

            Projects
          </Link>

          <Link to="/hypotheses">
            <Lightbulb size={14} />

            Hypotheses
          </Link>
        </nav>

        {isSignedIn ? (
          <button
            type="button"
            className="nav-cta"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        ) : (
          <Link
            to="/auth"
            className="nav-cta"
          >
            Log in / Sign up

            <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
    </header>
  )
}
