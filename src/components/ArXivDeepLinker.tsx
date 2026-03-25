import React from 'react'
import { Search, Download, Pin, ExternalLink, BookOpen } from 'lucide-react'
import { searchCrossref, ResearchPaper } from '../services/crossrefService'

interface ArXivPaper {
  id: string
  title: string
  authors: string[]
  summary?: string
  abstract?: string
  pdfUrl?: string
  arxivUrl?: string
  published?: string
  updated?: string
  categories?: string[]
  doi?: string
  comment?: string
  journal?: string
  publisher?: string
  type?: string
  url?: string
}

interface ArXivDeepLinkerProps {
  onPinToProject: (paper: ArXivPaper) => void
  onSynthesizeFindings: (papers: ArXivPaper[]) => Promise<string>
  selectedForgeId?: string
  forgeIdea?: string
}

export default function ArXivDeepLinker({ onPinToProject, onSynthesizeFindings, selectedForgeId, forgeIdea }: ArXivDeepLinkerProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [papers, setPapers] = React.useState<ArXivPaper[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [selectedPapers, setSelectedPapers] = React.useState<ArXivPaper[]>([])
  const [synthesizing, setSynthesizing] = React.useState(false)
  const [synthesisResult, setSynthesisResult] = React.useState<string>('')
  const [autoSearched, setAutoSearched] = React.useState(false)
  const [maxPapers, setMaxPapers] = React.useState(1000)
  const [usePagination, setUsePagination] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [papersPerPage, setPapersPerPage] = React.useState(10)

  // Auto-search when component receives a forge idea
  React.useEffect(() => {
    if (forgeIdea && searchQuery === '' && !autoSearched) {
      console.log('Auto-searching papers for forge idea:', forgeIdea)
      setSearchQuery(forgeIdea)
      setAutoSearched(true)
    }
  }, [forgeIdea, searchQuery, autoSearched])

  const performSearch = async () => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Use Crossref API with user-specified parameters
      const papers = await searchCrossref(searchQuery, maxPapers, usePagination)
      
      setPapers(papers)
      console.log(`Successfully loaded ${papers.length} papers from Crossref`)
      
    } catch (err) {
      console.error('Crossref search error:', err)
      setError('Failed to search papers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const searchArXiv = async () => {
    await performSearch()
  }

  const togglePaperSelection = (paper: ArXivPaper) => {
    setSelectedPapers(prev => {
      const isSelected = prev.some(p => p.id === paper.id)
      if (isSelected) {
        return prev.filter(p => p.id !== paper.id)
      } else {
        return [...prev, paper]
      }
    })
  }

  const handleSynthesizeFindings = async () => {
    if (selectedPapers.length === 0) return
    
    setSynthesizing(true)
    try {
      console.log('Synthesizing findings from', selectedPapers.length, 'papers')
      const result = await onSynthesizeFindings(selectedPapers)
      setSynthesisResult(result)
      setSelectedPapers([])
      console.log('Synthesis completed successfully')
    } catch (err) {
      console.error('Synthesis error:', err)
      setSynthesisResult('Error occurred while synthesizing findings. Please try again.')
    } finally {
      setSynthesizing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="text-emerald-600 dark:text-emerald-400" size={20} />
          📚 Intel Library - Crossref Research Database
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchArXiv()}
            placeholder="Search Crossref research papers..."
            className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition"
          />
          <button
            onClick={searchArXiv}
            disabled={loading}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search size={16} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Controls */}
        <div className="flex flex-wrap gap-4 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Papers:</label>
            <select
              value={maxPapers}
              onChange={(e) => setMaxPapers(Number(e.target.value))}
              className="px-3 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm text-slate-900 dark:text-white"
            >
              <option value={100}>100 papers</option>
              <option value={500}>500 papers</option>
              <option value={1000}>1000 papers</option>
              <option value={5000}>5000 papers</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pagination"
              checked={usePagination}
              onChange={(e) => setUsePagination(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label htmlFor="pagination" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Use pagination for large searches
            </label>
          </div>
          
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {maxPapers > 1000 && !usePagination && (
              <span className="text-amber-600 dark:text-amber-400">⚠️ Enable pagination for &gt;1000 papers</span>
            )}
            {maxPapers > 1000 && usePagination && (
              <span className="text-emerald-600 dark:text-emerald-400">✅ Pagination enabled</span>
            )}
          </div>
        </div>

        {selectedPapers.length > 0 && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {selectedPapers.length} paper{selectedPapers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSynthesizeFindings}
                  disabled={synthesizing || !selectedForgeId}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded text-white text-sm font-medium transition flex items-center gap-1"
                >
                  {synthesizing ? '⚡ Synthesizing...' : '📝 Summarize Findings'}
                </button>
                <button
                  onClick={() => setSelectedPapers([])}
                  className="px-3 py-1 bg-slate-500 hover:bg-slate-600 rounded text-white text-sm font-medium transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {papers.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                📊 Found {papers.length} research papers
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {maxPapers === 1000 && papers.length === 1000 && ' (Maximum reached - try pagination for more)'}
                {maxPapers > 1000 && usePagination && ` (Showing ${papers.length} of ${maxPapers} requested)`}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {papers.length === 0 && !loading && autoSearched && (
            <div className="text-center py-8 text-slate-500 dark:text-white/60">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">No relevant papers found for your research idea</p>
              <p className="text-sm text-slate-400 dark:text-white/40">
                Try using different keywords or broadening your search terms
              </p>
              <p className="text-xs text-slate-300 dark:text-white/30 mt-4">
                Note: Only shows papers from academic databases. No fake or placeholder papers are displayed.
              </p>
            </div>
          )}
          
          {papers.length === 0 && loading && autoSearched && (
            <div className="text-center py-8 text-slate-500 dark:text-white/60">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="mb-2">🔍 Auto-searching papers for your forge...</p>
              <p className="text-xs text-slate-400 dark:text-white/40">
                Finding relevant research papers related to "{forgeIdea}"
              </p>
            </div>
          )}
          
          {papers.length > 0 && (
            papers.map((paper) => (
              <div
                key={paper.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedPapers.some(p => p.id === paper.id)
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
                onClick={() => togglePaperSelection(paper)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex-1 pr-2">
                    {paper.title}
                  </h4>
                  <div className="flex gap-1 flex-shrink-0">
                    {paper.pdfUrl && (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </a>
                    )}
                    {paper.arxivUrl && (
                      <a
                        href={paper.arxivUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition"
                        title="View on ArXiv"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-white/70 mb-2">
                  {paper.authors.slice(0, 3).join(', ')}
                  {paper.authors.length > 3 && ' et al.'}
                </p>
                
                {paper.summary && (
                  <p className="text-sm text-slate-700 dark:text-white/80 line-clamp-3 mb-3">
                    {paper.summary}
                  </p>
                )}
                
                {paper.categories && paper.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {paper.categories.slice(0, 5).map((category, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                      >
                        {category}
                      </span>
                    ))}
                    {paper.categories.length > 5 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded">
                        +{paper.categories.length - 5} more
                      </span>
                    )}
                  </div>
                )}
                
                {/* Crossref-specific information */}
                {(paper.journal || paper.publisher) && (
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                    {paper.journal && <span>📖 {paper.journal}</span>}
                    {paper.journal && paper.publisher && <span> • </span>}
                    {paper.publisher && <span>🏢 {paper.publisher}</span>}
                  </div>
                )}
                
                {paper.comment && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mb-2 italic">
                    💡 {paper.comment}
                  </div>
                )}
                
                <div className="text-xs text-slate-500 dark:text-white/60 flex items-center justify-between">
                  <div>
                    Published: {new Date(paper.published || '').toLocaleDateString()}
                    {paper.updated && paper.updated !== paper.published && (
                      <span className="ml-2">• Updated: {new Date(paper.updated).toLocaleDateString()}</span>
                    )}
                  </div>
                  {paper.doi && (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      DOI: {paper.doi}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Synthesis Result Display */}
        {synthesisResult && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                📝 Synthesized Findings
              </h4>
              <button
                onClick={() => setSynthesisResult('')}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
              >
                ✕ Clear
              </button>
            </div>
            
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                {synthesisResult}
              </div>
            </div>
            
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
              Based on synthesis of {selectedPapers.length > 0 ? selectedPapers.length : 'multiple'} research papers
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
