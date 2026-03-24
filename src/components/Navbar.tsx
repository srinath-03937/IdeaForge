import React, { useState } from 'react'
import { Sun, Moon, User, LogOut, AlertCircle } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import LoginModal from './LoginModal'

export default function Navbar(){
  const { theme, toggleTheme } = useTheme()
  const { user, signOut, error } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-slate-900/50 dark:to-slate-800/50 border-2 border-emerald-300 dark:border-emerald-500/30 shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-slate-600" />
            )}
          </button>
          
          <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-400 bg-clip-text text-transparent">
            IdeaForge Vision
          </div>
        </div>
          
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle size={12} />
              <span>Auth Error</span>
            </div>
          )}
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User size={16} />
                )}
                <span className="font-medium">{user.displayName || user.email}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                title="Sign out"
              >
                <LogOut size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium rounded-lg transition text-sm"
                disabled={!!error}
              >
                {error ? 'Auth Unavailable' : 'Sign In'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}
    </>
  )
}
