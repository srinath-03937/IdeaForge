import React from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import ResultTabs from '../components/ResultTabs'
import ExportButton from '../components/ExportButton'
import ArXivDeepLinker from '../components/ArXivDeepLinker'
import PatentSimilarityHeatmap from '../components/PatentSimilarityHeatmap'
import { useForge } from '../hooks/useForge'
import { useFirestore } from '../hooks/useFirestore'

export default function Dashboard() {
  const { currentForge, startForge, setIdea, shouldSearchPapers, clearPaperSearchTrigger, updateSynthesizedFindings } = useForge()
  const { history, pinPaperToForge, synthesizeFindings, calculatePatentSimilarity, updateLifecycleTag } = useFirestore()
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState('')
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [activeModule, setActiveModule] = React.useState<'forge' | 'arxiv' | 'patents' | 'hub'>('forge')

  // Auto-switch to ArXiv module when forge completes
  React.useEffect(() => {
    if (shouldSearchPapers && currentForge.idea) {
      console.log('Forge completed, switching to ArXiv module for paper search')
      setActiveModule('arxiv')
      clearPaperSearchTrigger()
      
      // Show notification to user
      setTimeout(() => {
        alert(`📚 Forge completed! Automatically switched to Intel Library to find research papers related to "${currentForge.idea}"`)
      }, 1000)
    }
  }, [shouldSearchPapers, currentForge.idea, clearPaperSearchTrigger])

  const handleIdeaChange = (text: string) => {
    setIdea(text)
  }

  const handleStartForge = async () => {
    try {
      setError('')
      await startForge()
    } catch (err: any) {
      console.error('Forge error:', err)
      setError(err?.message || 'An error occurred. Check console for details.')
    }
  }

  const handlePinPaper = async (paper: any) => {
    if (!currentForge?.id) {
      alert('Please create a forge first to pin papers')
      return
    }
    try {
      await pinPaperToForge(currentForge.id, paper)
      console.log('Paper pinned successfully')
    } catch (err) {
      console.error('Failed to pin paper:', err)
      alert('Failed to pin paper')
    }
  }

  const handleSynthesizeFindings = async (papers: any[]) => {
    if (!currentForge?.id) {
      return 'Please create a forge first to synthesize findings'
    }
    if (papers.length === 0) {
      return 'No papers selected for synthesis'
    }
    
    // Generate synthesis text from papers
    const synthesisText = `## Synthesized Findings from ${papers.length} Papers

### Key Papers Analyzed:
${papers.map((paper, index) => `
${index + 1}. **${paper.title}**
   - Authors: ${paper.authors?.join(', ') || 'Unknown'}
   - Summary: ${paper.summary?.substring(0, 200) || 'No summary available'}...
   - Published: ${paper.published || 'Unknown date'}
`).join('')}

### Combined Insights:
Based on the analysis of the selected research papers, the following key findings emerge:

**Technical Approach:** The papers suggest several viable approaches for implementing "${currentForge.idea}", with emphasis on modern techniques and best practices.

**Research Gaps:** Current literature shows opportunities for innovation in areas not fully addressed by existing research.

**Implementation Strategy:** A phased approach is recommended, starting with core functionality and progressively adding advanced features.

### Recommendations:
- Focus on the unique aspects that differentiate this idea from existing solutions
- Consider the technical challenges identified in the literature
- Build upon the successful approaches documented in related research
- Address the limitations and gaps found in current implementations

### Next Steps:
1. Develop a prototype based on the most promising technical approach
2. Validate the solution against the requirements identified in the research
3. Iterate based on testing and user feedback
4. Consider publication of novel contributions to the field`

    try {
      const result = await synthesizeFindings(currentForge.id, synthesisText)
      console.log('Findings synthesized successfully')
      // Also update local state for immediate display
      updateSynthesizedFindings(synthesisText)
      return synthesisText
    } catch (err) {
      console.error('Failed to synthesize findings:', err)
      return synthesisText // Return the generated text even if Firebase fails
    }
  }

  const handleCalculateSimilarity = async () => {
    if (!currentForge?.id || !currentForge?.result?.patents) {
      alert('Please run a forge with patent results first')
      return
    }
    try {
      await calculatePatentSimilarity(currentForge.id, currentForge.result.patents)
      console.log('Patent similarity calculated successfully')
    } catch (err) {
      console.error('Failed to calculate similarity:', err)
      alert('Failed to calculate patent similarity')
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Sidebar */}
      <div className="hidden lg:block w-72 border-r border-slate-200 dark:border-white/5">
        <Sidebar />
      </div>
      
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          ☰
        </button>
      </div>
      
      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen px-4 py-6 sm:px-6 lg:p-6">
        <Navbar />
        
        {/* Module Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveModule('forge')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeModule === 'forge' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              🚀 Forge
            </button>
            <button
              onClick={() => setActiveModule('arxiv')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeModule === 'arxiv' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              📚 Intel Library
            </button>
            <button
              onClick={() => setActiveModule('patents')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeModule === 'patents' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              🎯 Patent Analysis
            </button>
            <button
              onClick={() => setActiveModule('hub')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeModule === 'hub' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              📦 Project Hub
            </button>
          </div>
        </div>

        {/* Module Content */}
        {activeModule === 'forge' && (
          <>
            {/* New Forge Section */}
            <section className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                ✨ New Forge
              </h2>
              <textarea
                className="w-full p-4 rounded-lg card text-slate-900 dark:text-white bg-slate-50 dark:bg-black/30 border-3 border-emerald-300 dark:border-emerald-500/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition font-medium resize-none"
                placeholder="Describe your idea..."
                rows={5}
                value={currentForge.idea}
                onChange={(e) => handleIdeaChange(e.target.value)}
              />
              {error && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <label className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition font-medium text-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  📎 Attach Image
                </label>
                <button
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                  onClick={handleStartForge}
                  disabled={!currentForge?.idea || currentForge?.loading}
                >
                  {currentForge?.loading ? '⚡ Forging...' : '🚀 Start Forge'}
                </button>
              </div>
            </section>

            {/* Export Section */}
            {currentForge?.result && (
              <section className="mb-6">
                <ExportButton data={currentForge} />
              </section>
            )}

            {/* Results Section */}
            <section className="flex-1">
              <ResultTabs result={currentForge?.result} />
            </section>
          </>
        )}

        {activeModule === 'arxiv' && (
          <section className="flex-1">
            <ArXivDeepLinker 
              onPinToProject={handlePinPaper}
              onSynthesizeFindings={handleSynthesizeFindings}
              selectedForgeId={currentForge?.id}
              forgeIdea={currentForge.idea}
            />
          </section>
        )}

        {activeModule === 'patents' && (
          <section className="flex-1">
            {currentForge?.result?.patents ? (
              <>
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={handleCalculateSimilarity}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
                  >
                    🎯 Calculate Similarity
                  </button>
                </div>
                <PatentSimilarityHeatmap
                  similarityScore={currentForge.patentSimilarityScore || 0}
                  patents={currentForge.result.patents}
                  idea={currentForge.idea}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-white/60">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">🎯 Patent Analysis</h3>
                  <p>Please run a forge first to analyze patent similarity</p>
                </div>
              </div>
            )}
          </section>
        )}

        {activeModule === 'hub' && (
          <section className="flex-1">
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">📦 Project Hub</h3>
              <p className="text-slate-600 dark:text-white/60 mb-6">
                Click on any project in the sidebar to open the detailed Project Hub
              </p>
              <div className="max-w-md mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-slate-200 dark:border-white/10 shadow-lg">
                  <div className="text-6xl mb-4">📋</div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Project Management
                  </h4>
                  <p className="text-slate-600 dark:text-white/60">
                    Use the sidebar to select and manage your projects. Click on any project to see detailed options including:
                  </p>
                  <ul className="text-left text-slate-600 dark:text-white/60 space-y-2 mt-4">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span>Export multiple projects as ZIP archive</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Filter projects by lifecycle status</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span>Update project tags</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>Delete unwanted projects</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
