import {
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FlaskConical,
  Lock,
  Mail,
  Network,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'

import {
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { useAuthSession } from '../auth/AuthSession'

import './Auth.css'


type AuthMode =
  | 'login'
  | 'signup'


export function Auth() {
  const { isLoaded, isSignedIn } = useAuthSession()

  if (!isLoaded) {
    return <div role="status">Loading account…</div>
  }

  if (isSignedIn) {
    return <Navigate to="/explore" replace />
  }

  return <AuthForm />
}

function AuthForm() {
  const navigate =
    useNavigate()
  const [searchParams] = useSearchParams()
  const requestedRedirect = searchParams.get('redirect')
  const redirectTo = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
    ? requestedRedirect
    : '/explore'
  const { signIn, signUp } = useAuthSession()


  const [
    mode,
    setMode,
  ] =
    useState<AuthMode>(
      searchParams.get('mode') === 'signup' ? 'signup' : 'login',
    )

  const [
    name,
    setName,
  ] =
    useState('')

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    password,
    setPassword,
  ] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('')

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState('')

  const [
    loading,
    setLoading,
  ] =
    useState(false)


  function switchMode(
    nextMode: AuthMode,
  ) {
    setMode(
      nextMode,
    )

    setMessage('')
    setPassword('')
    setConfirmPassword('')
  }


  function getAuthErrorMessage(
    error: unknown,
  ) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'errors' in error
    ) {
      const clerkError =
        error as {
          errors?: Array<{
            longMessage?: string
            message?: string
          }>
        }

      return (
        clerkError
          .errors?.[0]
          ?.longMessage ??
        clerkError
          .errors?.[0]
          ?.message ??
        'Something went wrong.'
      )
    }


    if (
      error instanceof Error
    ) {
      return error.message
    }


    return (
      'Something went wrong.'
    )
  }


  async function handleLogin() {
    await signIn(email.trim(), password)
    navigate(redirectTo, { replace: true })
  }


  async function handleSignup() {
    await signUp(email.trim(), password, name.trim())
    navigate(redirectTo, { replace: true })
  }


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setMessage('')

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setMessage(
        'Enter your email and password.',
      )

      return
    }


    if (
      mode === 'signup'
    ) {
      if (
        !name.trim()
      ) {
        setMessage(
          'Enter your name.',
        )

        return
      }


      if (password.length < 8) {
        setMessage(
          'Password must contain at least 8 characters.',
        )

        return
      }


      if (
        password !==
        confirmPassword
      ) {
        setMessage(
          'Passwords do not match.',
        )

        return
      }
    }


    setLoading(true)


    try {
      if (
        mode === 'login'
      ) {
        await handleLogin()
      } else {
        await handleSignup()
      }
    } catch (error) {
      setMessage(
        getAuthErrorMessage(
          error,
        ),
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="auth-page">

      <div className="auth-background">

        <div className="auth-grid" />

        <div className="auth-orb auth-orb-one" />

        <div className="auth-orb auth-orb-two" />

      </div>


      <header className="auth-nav">

        <Link
          to="/"
          className="auth-brand"
        >
          <img src="/helix-logo.jpg" alt="" width={44} height={44} />
          <span>Helix</span>
        </Link>


        <Link
          to="/"
          className="auth-back"
        >

          <ArrowLeft size={15} />

          Back to home

        </Link>

      </header>


      <main className="auth-main">

        <section className="auth-story">

          <div className="auth-story-inner">

            <div className="auth-eyebrow">

              <Sparkles size={14} />

              BIOMEDICAL RESEARCH INTELLIGENCE

            </div>


            <h1>

              Research biology

              <span>
                {' '}as a connected system.
              </span>

            </h1>


            <p className="auth-story-description">

              Explore diseases,
              genes, pathways,
              therapeutics,
              scientific evidence,
              and live biomedical
              literature from one
              research environment.

            </p>


            <div className="auth-feature-list">

              <div className="auth-feature">

                <div className="auth-feature-icon">

                  <Network size={18} />

                </div>


                <div>

                  <strong>
                    Connected biology
                  </strong>

                  <p>
                    Navigate relationships
                    between biomedical
                    entities and research
                    evidence.
                  </p>

                </div>

              </div>


              <div className="auth-feature">

                <div className="auth-feature-icon">

                  <FlaskConical size={18} />

                </div>


                <div>

                  <strong>
                    Evidence-grounded research
                  </strong>

                  <p>
                    Inspect structured evidence,
                    PubMed literature,
                    and computational
                    hypotheses.
                  </p>

                </div>

              </div>


              <div className="auth-feature">

                <div className="auth-feature-icon">

                  <ShieldCheck size={18} />

                </div>


                <div>

                  <strong>
                    Traceable sources
                  </strong>

                  <p>
                    Follow research claims
                    back to identifiable
                    scientific sources.
                  </p>

                </div>

              </div>

            </div>


            <div className="auth-story-note">

              <Check size={15} />

              <span>
                Built for biomedical
                research exploration,
                not clinical diagnosis.
              </span>

            </div>

          </div>

        </section>


        <section className="auth-panel">

          <div className="auth-card">

            <div className="auth-card-heading">

              <p className="auth-card-eyebrow">
                HELIX ACCOUNT
              </p>


              <h2>

                {
                  mode === 'login'
                    ? 'Welcome back.'
                    : 'Create your workspace.'
                }

              </h2>


              <p>

                {
                  mode === 'login'
                    ? 'Sign in to continue your biomedical research.'
                    : 'Create an account to begin exploring Helix.'
                }

              </p>

            </div>


            <div className="auth-tabs">

              <button
                type="button"
                className={
                  mode === 'login'
                    ? 'auth-tab auth-tab-active'
                    : 'auth-tab'
                }
                onClick={
                  () =>
                    switchMode(
                      'login',
                    )
                }
              >

                Log in

              </button>


              <button
                type="button"
                className={
                  mode === 'signup'
                    ? 'auth-tab auth-tab-active'
                    : 'auth-tab'
                }
                onClick={
                  () =>
                    switchMode(
                      'signup',
                    )
                }
              >

                Sign up

              </button>

            </div>


            <form
              className="auth-form"
              onSubmit={
                handleSubmit
              }
            >

              {
                mode === 'signup' && (

                  <label className="auth-field">

                    <span>
                      Name
                    </span>


                    <div className="auth-input-wrap">

                      <User size={17} />


                      <input
                        type="text"
                        value={name}
                        onChange={
                          (event) =>
                            setName(
                              event.target.value,
                            )
                        }
                        placeholder="Your name"
                        autoComplete="name"
                      />

                    </div>

                  </label>

                )
              }


              <label className="auth-field">

                <span>
                  Email
                </span>


                <div className="auth-input-wrap">

                  <Mail size={17} />


                  <input
                    type="email"
                    value={email}
                    onChange={
                      (event) =>
                        setEmail(
                          event.target.value,
                        )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>

              </label>

              <label className="auth-field">

                <div className="auth-field-top">

                  <span>
                    Password
                  </span>

                </div>


                <div className="auth-input-wrap">

                  <Lock size={17} />


                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      password
                    }
                    onChange={
                      (event) =>
                        setPassword(
                          event.target.value,
                        )
                    }
                    placeholder={
                      mode === 'signup'
                        ? 'At least 8 characters'
                        : 'Enter your password'
                    }
                    autoComplete={
                      mode === 'signup'
                        ? 'new-password'
                        : 'current-password'
                    }
                  />


                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={
                      () =>
                        setShowPassword(
                          (
                            current,
                          ) =>
                            !current,
                        )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >

                    {
                      showPassword
                        ? (
                          <EyeOff size={16} />
                        )
                        : (
                          <Eye size={16} />
                        )
                    }

                  </button>

                </div>

              </label>


              {
                mode === 'signup' && (

                  <label className="auth-field">

                    <span>
                      Confirm password
                    </span>


                    <div className="auth-input-wrap">

                      <Lock size={17} />


                      <input
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        value={
                          confirmPassword
                        }
                        onChange={
                          (event) =>
                            setConfirmPassword(
                              event.target.value,
                            )
                        }
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                      />

                    </div>

                  </label>

                )
              }


              {
                message && (

                  <div className="auth-message">
                    {message}
                  </div>

                )
              }


              <button
                type="submit"
                className="auth-submit"
                disabled={
                  loading
                }
              >

                {
                  loading
                    ? (
                      mode === 'login'
                        ? 'Logging in...'
                        : 'Creating account...'
                    )
                    : (
                      mode === 'login'
                        ? 'Log in to Helix'
                        : 'Create account'
                    )
                }


                <ArrowRight size={16} />

              </button>

            </form>


            <p className="auth-legal">
              Accounts and projects stay in this browser with no server-side recovery or cross-device sync. This separates local users but is not server-verified identity; browser storage can be inspected or changed by someone with device access.
            </p>


            <p className="auth-switch-copy">

              {
                mode === 'login'
                  ? 'New to Helix?'
                  : 'Already have an account?'
              }


              <button
                type="button"
                onClick={
                  () =>
                    switchMode(
                      mode === 'login'
                        ? 'signup'
                        : 'login',
                    )
                }
              >

                {
                  mode === 'login'
                    ? 'Create an account'
                    : 'Log in'
                }

              </button>

            </p>


            <div className="auth-legal">

              By continuing,
              you agree to use
              Helix for research
              and educational
              purposes.

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}
