import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface LoginProps {
  onClose?: () => void
}

export default function LoginModal({ onClose }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signInWithEmail, signUpWithEmail, error: authError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (authError) {
        setError('Firebase authentication is not properly configured. Please check your environment variables.')
        return
      }

      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      onClose?.()
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
            <div className="font-medium mb-1">Firebase Configuration Required</div>
            <div className="text-xs">To enable authentication, please configure Firebase in your .env file with real Firebase project credentials.</div>
          </div>
        )}

        {(error || authError) && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter your email"
              required
              disabled={!!authError}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              disabled={!!authError}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!authError}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent border-r-transparent animate-spin rounded-full mr-2"></span>
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : authError ? (
              'Authentication Unavailable'
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm"
            disabled={!!authError}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </div>
  )
}
