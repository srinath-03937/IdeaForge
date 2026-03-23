import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Navbar(){
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-slate-900/50 dark:to-slate-800/50 border-2 border-emerald-300 dark:border-emerald-500/30 shadow-md">
      <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-400 bg-clip-text text-transparent">
        IdeaForge Vision
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold text-slate-700 dark:text-white/80">
          <span>Active</span>
          <span className="ml-2 text-xs px-2 py-1 bg-emerald-600/20 dark:bg-emerald-400/30 rounded-full">
            Ready
          </span>
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
      </div>
    </div>
  )
}
