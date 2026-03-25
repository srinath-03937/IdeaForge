import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Tag, Filter, CheckSquare, Square, ArrowLeft, Trash2 } from 'lucide-react'
import { useFirestore } from '../hooks/useFirestore'
import { useForge } from '../hooks/useForge'
import APIUsageDisplay from '../components/APIUsageDisplay'

export default function ProjectHubPage() {
  const navigate = useNavigate()
  const { history, updateLifecycleTag } = useFirestore()
  const { currentForge, loadForgeFromHistory } = useForge()
  const [selectedForFilter, setSelectedForFilter] = React.useState<string>('all')
  const [selectedForExport, setSelectedForExport] = React.useState<string[]>([])
  const [showExportOptions, setShowExportOptions] = React.useState(false)

  const handleLoadForge = (forge: any) => {
    loadForgeFromHistory(forge)
    navigate('/') // Go back to main dashboard with Forge module
  }

  const handleDeleteForge = async (e: React.MouseEvent, forgeId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this forge?')) {
      // await deleteForge(forgeId) // Function not available in current useFirestore
      console.log('Delete functionality not implemented')
    }
  }

  const handleBackToDashboard = () => {
    navigate('/')
  }

  const handleLifecycleChange = async (e: React.MouseEvent, forgeId: string, tag: string) => {
    e.stopPropagation()
    try {
      await updateLifecycleTag(forgeId, tag as any)
    } catch (err) {
      console.error('Failed to update lifecycle tag:', err)
    }
  }

  const toggleExportSelection = (forgeId: string) => {
    setSelectedForExport(prev => 
      prev.includes(forgeId) 
        ? prev.filter(id => id !== forgeId)
        : [...prev, forgeId]
    )
  }

  const toggleSelectAll = () => {
    const filteredIds = filteredFor.map(f => f.id)
    setSelectedForExport(
      selectedForExport.length === filteredIds.length ? [] : filteredIds
    )
  }

  const handleExport = async () => {
    if (selectedForExport.length === 0) {
      alert('Please select at least one project to export')
      return
    }
    
    try {
      // await exportForges(selectedForExport) // Function not available in current useFirestore
      console.log('Export functionality not implemented')
      setShowExportOptions(false)
      setSelectedForExport([])
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed. Please try again.')
    }
  }

  const lifecycleOptions = ['active_research', 'validated', 'hardware_mvp', 'shelved']
  const lifecycleColors = {
    active_research: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    validated: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    hardware_mvp: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    shelved: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400'
  }

  const lifecycleLabels = {
    active_research: 'Active Research',
    validated: 'Validated',
    hardware_mvp: 'Hardware MVP',
    shelved: 'Shelved'
  }

  const filteredFor = selectedForFilter === 'all' 
    ? history 
    : history.filter(f => f.lifecycleTag === selectedForFilter)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="bg-emerald-500 dark:bg-emerald-600 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-white hover:text-emerald-200 transition"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">📦 Project Hub</h1>
          </div>
        </div>
      </div>

      {/* API Usage Display */}
      <div className="mb-6">
        <APIUsageDisplay />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Filters and Export */}
          <div className="xl:col-span-1 space-y-4">
            {/* Export Options */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-white/10 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Download size={20} className="text-emerald-600 dark:text-emerald-400" />
                Export Projects
              </h3>
              
              <div className="mb-4">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Export Projects ({selectedForExport.length})
                </button>
                
                {showExportOptions && (
                  <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-white">Select All</span>
                      <button
                        onClick={toggleSelectAll}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                      >
                        {selectedForExport.length === filteredFor.length ? <Square size={20} /> : <CheckSquare size={20} />}
                      </button>
                    </div>
                    
                    <button
                      onClick={handleExport}
                      disabled={selectedForExport.length === 0}
                      className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition"
                    >
                      Download ZIP Archive
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Lifecycle Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-white/10 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter size={20} className="text-emerald-600 dark:text-emerald-400" />
                Filter by Status
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedForFilter('all')}
                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition ${
                    selectedForFilter === 'all'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  All ({history.length})
                </button>
                {lifecycleOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setSelectedForFilter(option)}
                    className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition ${
                      selectedForFilter === option
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {lifecycleLabels[option as keyof typeof lifecycleLabels]} ({history.filter(f => f.lifecycleTag === option).length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Project Grid */}
          <div className="xl:col-span-3">
            {filteredFor.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-white/50">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">
                  {selectedForFilter === 'all' ? 'No projects yet. Create one!' : `No projects with status: ${lifecycleLabels[selectedForFilter as keyof typeof lifecycleLabels]}`}
                </h3>
                <p className="text-slate-600 dark:text-white/60">
                  Go to the main dashboard to create your first forge
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredFor.map(forge => {
                  const isSelected = selectedForExport.includes(forge.id)
                  const ideaPreview = forge.idea?.substring(0, 50) || forge.title || 'Untitled Project'
                  const currentLifecycle = forge.lifecycleTag || 'active_research'
                  
                  return (
                    <div 
                      key={forge.id}
                      className={`relative bg-white dark:bg-slate-900 rounded-xl border-2 cursor-pointer transition-all hover:shadow-xl group overflow-hidden ${
                        currentForge?.id === forge.id
                          ? 'border-emerald-400 dark:border-emerald-500/50 ring-2 ring-emerald-200 dark:ring-emerald-800/40'
                          : 'border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                      onClick={() => handleLoadForge(forge)}
                    >
                      {/* Header with Status Badge */}
                      <div className={`px-4 py-3 border-b border-slate-100 dark:border-white/5 ${lifecycleColors[currentLifecycle as keyof typeof lifecycleColors]}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {lifecycleLabels[currentLifecycle as keyof typeof lifecycleLabels]}
                            </span>
                            {forge.result && (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white">
                                  📊 {forge.result.feasibility || 0}%
                                </span>
                                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white">
                                  🎯 {forge.result.novelty || 0}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Lifecycle Tag */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const currentIndex = lifecycleOptions.indexOf(currentLifecycle)
                                const nextIndex = (currentIndex + 1) % lifecycleOptions.length
                                handleLifecycleChange(e, forge.id, lifecycleOptions[nextIndex])
                              }}
                              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition text-white"
                              title="Change lifecycle status"
                            >
                              <Tag size={14} />
                            </button>
                            
                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDeleteForge(e, forge.id)}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition text-white"
                              title="Delete project"
                            >
                              <Trash2 size={14} className="text-red-200" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="p-4">
                        {/* Export Checkbox */}
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExportSelection(forge.id)
                            }}
                            className={`p-2 rounded-lg transition shadow-md ${
                              isSelected 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600'
                            }`}
                          >
                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                        </div>

                        {/* Project Title */}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 pr-12">
                          {ideaPreview}
                        </h3>

                        {/* Project Details */}
                        <div className="space-y-3">
                          {/* Feasibility and Novelty */}
                          {forge.result && (
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600 dark:text-slate-400">Feasibility</span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {forge.result.feasibility || 0}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-emerald-500 h-2 rounded-full transition-all"
                                    style={{ width: `${forge.result.feasibility || 0}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600 dark:text-slate-400">Novelty</span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {forge.result.novelty || 0}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${forge.result.novelty || 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Creation Date */}
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span>📅</span>
                            <span>Created: {forge.createdAt ? new Date(typeof forge.createdAt === 'object' && 'toMillis' in forge.createdAt ? forge.createdAt.toMillis() : forge.createdAt).toLocaleDateString() : ''}</span>
                          </div>

                          {/* Additional Info */}
                          {forge.pinnedPapers && forge.pinnedPapers.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <span>📚</span>
                              <span>{forge.pinnedPapers.length} pinned papers</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
