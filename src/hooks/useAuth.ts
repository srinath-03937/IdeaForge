import { useState, useEffect } from 'react'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../firebase/config'

export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    try {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      })
    } catch (err: any) {
      console.error('Firebase auth initialization error:', err)
      setError('Firebase authentication is not properly configured')
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized')
      }
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized')
      }
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOutUser = async (): Promise<void> => {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized')
      }
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signOut: signOutUser
  }
}
