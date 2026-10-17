import {
  createContext,
  useEffect,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  createLocalAccount,
  restoreLocalAccount,
  signInLocalAccount,
  signOutLocalAccount,
} from './localAccounts'

interface AuthSessionValue {
  isLoaded: boolean
  isSignedIn: boolean
  userId: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
}

const AuthSessionContext = createContext<AuthSessionValue>({
  isLoaded: false,
  isSignedIn: false,
  userId: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
})

export function useAuthSession() {
  return useContext(AuthSessionContext)
}

export function AuthSessionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      setUserId(restoreLocalAccount()?.id ?? null)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  async function signIn(email: string, password: string) {
    const account = await signInLocalAccount(email, password)
    setUserId(account.id)
  }

  async function signUp(email: string, password: string, name: string) {
    const account = await createLocalAccount(email, password, name)
    setUserId(account.id)
  }

  function signOut() {
    signOutLocalAccount()
    setUserId(null)
  }

  return (
    <AuthSessionContext.Provider
      value={{
        isLoaded,
        isSignedIn: Boolean(userId),
        userId,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  )
}