import React from 'react'
import { Download, Trash2, Tag, ExternalLink, CheckCircle, Clock, Zap, Package } from 'lucide-react'
import { useFirestore, ForgeDoc } from '../hooks/useFirestore'

interface ProjectHubProps {
  onLoadForge: (forge: ForgeDoc) => void
  onCreateNewForge: () => void
}

const lifecycleTags = [
  { value: 'active_research', label: 'Active Research', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: Clock },
  { value: 'validated', label: 'Validated', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle },
  { value: 'hardware_mvp', label: 'Hardware MVP', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: Zap },
  { value: 'shelved', label: 'Shelved', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300', icon: Package }
] as const

export default function ProjectHub({ onLoadForge, onCreateNewForge }: ProjectHubProps) {
  const { history, deleteForge, updateLifecycleTag } = useFirestore()
  const [selectedForges, setSelectedForges] = React.useState<string[]>([])
  const [exporting, setExporting] = React.useState(false)
  const [filterTag, setFilterTag] = React.useState<string | null>(null)

  const filteredForges = React.useMemo(() => {
    if (!filterTag) return history
    return history.filter(forge => forge.lifecycleTag === filterTag)
  }, [history, filterTag])

  const toggleForgeSelection = (forgeId: string) => {
    setSelectedForges(prev => 
      prev.includes(forgeId) 
        ? prev.filter(id => id !== forgeId)
        : [...prev, forgeId]
    )
  }

  const selectAllForges = () => {
    setSelectedForges(filteredForges.map(forge => forge.id))
  }

  const clearSelection = () => {
    setSelectedForges([])
  }

  const exportRNDPortfolio = async () => {
    if (selectedForges.length === 0) {
      alert('Please select at least one forge to export')
      return
    }

    setExporting(true)
    try {
      // Create a comprehensive export package
      const exportData = {
        exportDate: new Date().toISOString(),
        projectCount: selectedForges.length,
        projects: history.filter(forge => selectedForges.includes(forge.id)).map(forge => ({
          id: forge.id,
          idea: forge.idea,
          title: forge.title,
          createdAt: forge.createdAt?.toMillis?.() || null,
          lifecycleTag: forge.lifecycleTag,
          result: forge.result,
          pinnedPapers: forge.pinnedPapers || [],
          synthesizedFindings: forge.synthesizedFindings,
          patentSimilarityScore: forge.patentSimilarityScore
        }))
      }

      // Create and download ZIP file
      const JSZip = (await import('jszip')).default || (window as any).JSZip
      if (!JSZip) {
        // Fallback: Create individual JSON files
        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `R&D_Portfolio_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }
      
      const zip = new JSZip()

      // Add JSON data
      zip.file('R&D_Portfolio.json', JSON.stringify(exportData, null, 2))

      // Add individual project files
      exportData.projects.forEach((project, index) => {
        const projectName = project.title || `Project_${index + 1}`
        
        // Add project summary
        const summary = `
# ${projectName}

**Idea:** ${project.idea}
**Lifecycle:** ${project.lifecycleTag}
**Created:** ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}

## Analysis Results
**Feasibility:** ${project.result?.feasibility || 'N/A'}%
**Novelty:** ${project.result?.novelty || 'N/A'}%

## Refined Concept
${project.result?.refinedConcept || 'N/A'}

## Pinned Papers (${project.pinnedPapers?.length || 0})
${project.pinnedPapers?.map((paper, i) => `
${i + 1}. ${paper.title}
   Authors: ${paper.authors?.join(', ') || 'N/A'}
   ${paper.pdfUrl ? `PDF: ${paper.pdfUrl}` : ''}
`).join('') || 'No papers pinned'}

## Synthesized Findings
${project.synthesizedFindings || 'No synthesis available'}

## Patent Similarity Score
${project.patentSimilarityScore?.toFixed(1) || 'N/A'}%
        `.trim()

        zip.file(`${projectName}/README.md`, summary)
        
        // Add Mermaid diagram if available
        if (project.result?.mermaid) {
          zip.file(`${projectName}/diagram.mmd`, project.result.mermaid)
        }

        // Add starter code if available
        if (project.result?.starterCode) {
          zip.file(`${projectName}/starter_code.${project.idea.toLowerCase().includes('python') ? 'py' : 'js'}`, project.result.starterCode)
        }
      })

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `R&D_Portfolio_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('R&D Portfolio exported successfully')
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const getLifecycleTag = (tag: string | undefined) => {
    return lifecycleTags.find(t => t.value === tag) || lifecycleTags[0]
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="text-emerald-600 dark:text-emerald-400" size={20} />
          📦 Project Hub - Management Layer
        </h3>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterTag(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              !filterTag 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Projects ({history.length})
          </button>
          {lifecycleTags.map(tag => {
            const IconComponent = tag.icon
            const count = history.filter(f => f.lifecycleTag === tag.value).length
            return (
              <button
                key={tag.value}
                onClick={() => setFilterTag(tag.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                  filterTag === tag.value 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <IconComponent size={14} />
                {tag.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Global Export Controls */}
        {selectedForges.length > 0 && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {selectedForges.length} project{selectedForges.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAllForges}
                  className="px-3 py-1 bg-slate-500 hover:bg-slate-600 rounded text-white text-sm font-medium transition"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-slate-500 hover:bg-slate-600 rounded text-white text-sm font-medium transition"
                >
                  Clear
                </button>
                <button
                  onClick={exportRNDPortfolio}
                  disabled={exporting}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded text-white text-sm font-medium transition flex items-center gap-1"
                >
                  <Download size={14} />
                  {exporting ? 'Exporting...' : 'Export R&D Portfolio'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredForges.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-white/60">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-4">
              {filterTag ? `No projects with "${getLifecycleTag(filterTag).label}" tag` : 'No projects yet'}
            </p>
            <button
              onClick={onCreateNewForge}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg text-white font-semibold transition"
            >
              Create Your First Forge
            </button>
          </div>
        ) : (
          filteredForges.map((forge: ForgeDoc) => {
            const tagInfo = getLifecycleTag(forge.lifecycleTag)
            const IconComponent = tagInfo.icon
            const isSelected = selectedForges.includes(forge.id)
            
            return (
              <div
                key={forge.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                    : 'border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
                onClick={() => toggleForgeSelection(forge.id)}
              >
                {/* Selection Checkbox */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleForgeSelection(forge.id)}
                      className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500"
                    />
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {forge.title || forge.idea.substring(0, 50) + (forge.idea.length > 50 ? '...' : '')}
                    </h4>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onLoadForge(forge)
                      }}
                      className="p-1 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition"
                      title="Load Project"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteForge(forge.id)
                      }}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Lifecycle Tag */}
                <div className="mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tagInfo.color}`}>
                    <IconComponent size={12} />
                    {tagInfo.label}
                  </span>
                </div>

                {/* Project Preview */}
                <div className="text-sm text-slate-600 dark:text-white/70 space-y-1">
                  <div className="line-clamp-2">{forge.idea}</div>
                  
                  {forge.result && (
                    <div className="flex justify-between text-xs pt-1">
                      <span>Feasibility: {forge.result.feasibility}%</span>
                      <span>Novelty: {forge.result.novelty}%</span>
                    </div>
                  )}
                  
                  {forge.createdAt && (
                    <div className="text-xs text-slate-500 dark:text-white/60">
                      {new Date(forge.createdAt.toMillis()).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-white/60">
                  {forge.pinnedPapers && forge.pinnedPapers.length > 0 && (
                    <span>📚 {forge.pinnedPapers.length} papers</span>
                  )}
                  {forge.synthesizedFindings && (
                    <span>📝 Synthesized</span>
                  )}
                  {forge.patentSimilarityScore !== undefined && (
                    <span>🎯 {forge.patentSimilarityScore.toFixed(0)}% similar</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
