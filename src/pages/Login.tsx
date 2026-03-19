import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Brain, Sparkles, Rocket, Shield, Zap, ArrowRight } from 'lucide-react'

export default function Login(){
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, signInAnonymously, signOut, resetPassword, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isSignUp, setIsSignUp] = React.useState(false)
  const [error, setError] = React.useState('')
  const [showReset, setShowReset] = React.useState(false)
  const [resetMessage, setResetMessage] = React.useState('')
  const nav = useNavigate()

  React.useEffect(()=>{ if(user) nav('/dashboard') },[user,nav])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      console.log(`${isSignUp ? 'Signing up' : 'Signing in'} with email...`)
      
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      
      console.log('Authentication successful')
    } catch (err: any) {
      console.error('Auth error:', err)
      const message = err?.message || 'Authentication failed'
      setError(message)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      await signInWithGoogle()
      console.log('Google authentication successful')
    } catch (err: any) {
      console.error('Google auth error:', err)
      const message = err?.message || 'Google sign-in failed'
      setError(message)
    }
  }

  const handleAnonymousSignIn = async () => {
    try {
      setError('')
      await signInAnonymously()
      console.log('Anonymous authentication successful')
    } catch (err: any) {
      console.error('Anonymous auth error:', err)
      const message = err?.message || 'Anonymous sign-in failed'
      setError(message)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      setResetMessage('')
      await resetPassword(email)
      setResetMessage('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err?.message || 'Password reset failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Main Login Card */}
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="text-center md:text-left space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  IdeaForge Vision
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/70 mt-1">
                  AI-Powered Innovation Platform
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700 dark:text-white/80">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Driven Analysis</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Advanced patent and research analysis</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700 dark:text-white/80">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Rocket className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Rapid Innovation</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Transform ideas into reality</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700 dark:text-white/80">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure Platform</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60">Enterprise-grade security</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
              <p className="text-sm text-slate-600 dark:text-white/60">
                Join thousands of innovators turning ideas into impact
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-white/70">
                {isSignUp ? 'Start your innovation journey today' : 'Continue your innovation journey'}
              </p>
            </div>

            {/* Quick Access Options */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.5-2.25-.5H9c-.42 0-.75.25-.75.75v4.5c0 .41.34.75.75.75h4.5c.83 0 1.5.67 1.5 1.5v1.5c0 .83-.67 1.5-1.5 1.5h-4.5c-.42 0-.75-.25-.75-.75v-4.5c0-.41.34-.75-.75-.75H9c-.83 0-1.5.67-1.5-1.5v-1.5c0-.83.67-1.5 1.5-1.5h4.5c.42 0 .75.25.75.75v4.5c0 .41-.34.75-.75.75h4.5c.83 0 1.5-.67 1.5-1.5v-1.5c0-.83-.67-1.5-1.5-1.5h-4.5c-.42 0-.75-.25-.75-.75v-4.5c0-.41.34-.75-.75-.75H9c-.83 0-1.5.67-1.5-1.5v-1.5c0-.83.67-1.5 1.5-1.5z"/>
                </svg>
                <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleAnonymousSignIn}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl"
              >
                <Zap className="w-5 h-5" />
                <span>{loading ? 'Connecting...' : 'Quick Start (No Account)'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <div className="relative text-center">
                <span className="px-4 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-white/70">Or continue with email</span>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
                <span className="font-semibold">Error: </span>{error}
              </div>
            )}

            {resetMessage && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-300 text-sm border border-green-200 dark:border-green-800">
                <span className="font-semibold">Success: </span>{resetMessage}
              </div>
            )}

            {/* Email Form */}
            {showReset ? (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/30 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? '⏳ Sending...' : '📧 Send Reset Email'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowReset(false)
                    setError('')
                    setResetMessage('')
                  }}
                  className="w-full px-4 py-2 text-sm text-slate-600 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition"
                >
                  ← Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/30 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/30 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? '⏳ Loading...' : isSignUp ? '✨ Create Account' : '🔓 Sign In'}
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="mt-6 text-center border-t border-slate-200 dark:border-white/10 pt-6">
              {!showReset && (
                <>
                  <p className="text-sm text-slate-600 dark:text-white/70 mb-3">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setError('')
                    }}
                    className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition mb-3 block"
                  >
                    {isSignUp ? 'Sign In Instead' : 'Create New Account'}
                  </button>
                  
                  {!isSignUp && (
                    <button
                      onClick={() => {
                        setShowReset(true)
                        setError('')
                        setResetMessage('')
                      }}
                      className="text-sm text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/80 transition"
                    >
                      Forgot Password?
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
