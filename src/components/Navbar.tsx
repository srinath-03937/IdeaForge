import React from 'react'
import { Sun, Moon, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useNavigate } from 'react-router-dom'

export default function Navbar(){
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const handleSignIn = () => {
    navigate('/login')
  }
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-slate-900/50 dark:to-slate-800/50 border-2 border-emerald-300 dark:border-emerald-500/30 shadow-md">
      <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-400 bg-clip-text text-transparent">
        IdeaForge Vision
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold text-slate-700 dark:text-white/80">
          {user ? (
            <>
              <span>{user.email}</span>
              <span className="ml-2 text-xs px-2 py-1 bg-emerald-600/20 dark:bg-emerald-400/30 rounded-full">
                Active
              </span>
            </>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
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
        
        {/* Auth Button */}
        {user ? (
          <button 
            className="px-3 py-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded text-white dark:text-white font-semibold transition" 
            onClick={handleSignOut}
          >
            <LogOut size={16} />
          </button>
        ) : (
          <button 
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded text-white dark:text-white font-semibold transition flex items-center gap-2" 
            onClick={handleSignIn}
          >
            <LogIn size={16} />
            Sign in
          </button>
        )}
      </div>
    </div>
  )
}
