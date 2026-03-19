import React from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, sendPasswordResetEmail, User, GoogleAuthProvider, signInWithPopup, signInAnonymously as fbSignInAnonymously } from 'firebase/auth'
import { initFirebase, getFirebaseAuth } from '../services/firebaseConfig'

initFirebase()

const AuthContext = React.createContext<{
  user: User | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInAnonymously: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  loading: boolean
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    try {
      const auth = getFirebaseAuth()
      if (!auth) {
        setError('Firebase not configured. Please add credentials to public/config.js')
        return
      }
      return onAuthStateChanged(auth, u => setUser(u), err => setError(err.message))
    } catch (err: any) {
      setError(err?.message || 'Auth error')
    }
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Firebase not configured')
      console.log('Signing in with email:', email)
      await signInWithEmailAndPassword(auth, email, password)
      console.log('Sign in successful')
    } catch (err: any) {
      console.error('Sign-in error:', err)
      setError(err?.message || 'Sign-in failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Firebase not configured')
      console.log('Creating account with email:', email)
      await createUserWithEmailAndPassword(auth, email, password)
      console.log('Sign up successful')
    } catch (err: any) {
      console.error('Sign-up error:', err)
      setError(err?.message || 'Sign-up failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Firebase not configured')
      
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      console.log('Signing in with Google...')
      await signInWithPopup(auth, provider)
      console.log('Google sign in successful')
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      setError(err?.message || 'Google sign-in failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInAnonymously = async () => {
    try {
      setLoading(true)
      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Firebase not configured')
      
      console.log('Signing in anonymously...')
      await fbSignInAnonymously(auth)
      console.log('Anonymous sign in successful')
    } catch (err: any) {
      console.error('Anonymous sign-in error:', err)
      setError(err?.message || 'Anonymous sign-in failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const auth = getFirebaseAuth()
      if (!auth) return
      await fbSignOut(auth)
      console.log('Sign out successful')
    } catch (err: any) {
      console.error('Sign-out error:', err)
      setError(err?.message || 'Sign-out failed')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Firebase not configured')
      await sendPasswordResetEmail(auth, email)
      console.log('Password reset email sent')
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err?.message || 'Password reset failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="p-8 rounded-lg bg-red-900/20 border border-red-500">
          <h1 className="text-xl text-red-400 mb-2">Configuration Error</h1>
          <p className="text-sm text-white/80">{error}</p>
          <p className="text-xs text-white/60 mt-3">
            Please add Firebase credentials to <code>public/config.js</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      signInWithEmail, 
      signUpWithEmail, 
      signInWithGoogle,
      signInAnonymously,
      signOut, 
      resetPassword,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

export default useAuth
