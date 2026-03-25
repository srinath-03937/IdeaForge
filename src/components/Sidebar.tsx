import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ExternalLink } from 'lucide-react'
import { useFirestore } from '../hooks/useFirestore'
import { useForge } from '../hooks/useForge'

export default function Sidebar(){
  const navigate = useNavigate()
  const { history, deleteForge } = useFirestore()
  const { currentForge, loadForgeFromHistory } = useForge()
  
  const handleLoadForge = (forge: any) => {
    loadForgeFromHistory(forge)
  }

  const handleDeleteForge = async (e: React.MouseEvent, forgeId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this forge?')) {
      await deleteForge(forgeId)
    }
  }

  const handleOpenProjectHub = () => {
    navigate('/project-hub')
  }

  return (
    <aside className="p-4 h-full overflow-y-auto">
      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-emerald-300">
        📚 Forge History
      </h3>
      
      {/* Project Hub Link */}
      <div className="mb-4">
        <button
          onClick={handleOpenProjectHub}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition"
        >
          <ExternalLink size={16} />
          Open Project Hub
        </button>
      </div>
      
      <div className="flex flex-col gap-2">
        {history.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-white/50 p-3 text-center">
            No forges yet. Create one!
          </div>
        ) : (
          history.map(h=> {
            const isActive = currentForge?.id === h.id
            const ideaPreview = h.idea?.substring(0, 40) || h.title || 'Untitled Forge'
            return (
              <div 
                key={h.id}
                onClick={() => handleLoadForge(h)}
                className={`p-3 rounded-lg cursor-pointer transition group ${
                  isActive 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 dark:border-emerald-500/50 shadow-md' 
                    : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-2 border-slate-300 dark:border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {ideaPreview}
                    </div>
                    {h.result && (
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                        📊 {h.result.feasibility || 0}% feasible
                      </div>
                    )}
                    <div className="text-xs text-slate-500 dark:text-white/40 mt-1">
                      {h.createdAt ? new Date(typeof h.createdAt === 'object' && 'toMillis' in h.createdAt ? h.createdAt.toMillis() : h.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteForge(e, h.id)}
                    className="p-1.5 hover:bg-red-200 dark:hover:bg-red-900/40 rounded transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Delete forge"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
