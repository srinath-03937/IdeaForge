import React from 'react'
import { Search, Download, Pin, ExternalLink, BookOpen } from 'lucide-react'

interface ArXivPaper {
  id: string
  title: string
  authors: string[]
  summary?: string
  abstract?: string
  pdfUrl?: string
  arxivUrl?: string
  published?: string
}

interface ArXivDeepLinkerProps {
  onPinToProject: (paper: ArXivPaper) => void
  onSynthesizeFindings: (papers: ArXivPaper[]) => Promise<string> // Return synthesis result
  selectedForgeId?: string
  forgeIdea?: string
}

export default function ArXivDeepLinker({ onPinToProject, onSynthesizeFindings, selectedForgeId, forgeIdea }: ArXivDeepLinkerProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [papers, setPapers] = React.useState<ArXivPaper[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedPapers, setSelectedPapers] = React.useState<ArXivPaper[]>([])
  const [synthesizing, setSynthesizing] = React.useState(false)
  const [synthesisResult, setSynthesisResult] = React.useState<string>('')
  const [autoSearched, setAutoSearched] = React.useState(false)

  // Auto-search when component receives a forge idea
  React.useEffect(() => {
    if (forgeIdea && searchQuery === '' && !autoSearched) {
      console.log('Auto-searching papers for forge idea:', forgeIdea)
      setSearchQuery(forgeIdea)
      setAutoSearched(true)
      // Trigger search after setting the query
      setTimeout(() => {
        performSearch(forgeIdea)
      }, 500)
    }
  }, [forgeIdea, searchQuery, autoSearched])

  const performSearch = async (query: string) => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      // Use Vite proxy to avoid CORS issues
      const proxyUrl = `/api/arxiv/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10&sortBy=relevance&sort_order=descending`
      
      const response = await fetch(proxyUrl)
      const text = await response.text()
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from ArXiv API')
      }
      
      // Parse ArXiv XML response
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      const entries = xmlDoc.getElementsByTagName('entry')
      
      if (entries.length === 0) {
        throw new Error('No papers found')
      }
      
      const parsedPapers: ArXivPaper[] = Array.from(entries).map((entry: any) => {
        const id = entry.getElementsByTagName('id')[0]?.textContent?.split('/').pop() || ''
        const title = entry.getElementsByTagName('title')[0]?.textContent || ''
        const summary = entry.getElementsByTagName('summary')[0]?.textContent || ''
        const published = entry.getElementsByTagName('published')[0]?.textContent || ''
        
        // Extract authors
        const authors = Array.from(entry.getElementsByTagName('author')).map((author: any) => 
          author.getElementsByTagName('name')[0]?.textContent || ''
        )
        
        // Extract PDF URL
        const links = entry.getElementsByTagName('link')
        let pdfUrl = ''
        let arxivUrl = ''
        
        Array.from(links).forEach((link: any) => {
          const href = link.getAttribute('href') || ''
          const type = link.getAttribute('type') || ''
          
          if (href.includes('arxiv.org/abs/')) {
            arxivUrl = href
          }
          if (type === 'application/pdf') {
            pdfUrl = href
          }
        })
        
        // If no PDF URL found, construct it from arxiv URL
        if (!pdfUrl && arxivUrl) {
          pdfUrl = arxivUrl.replace('/abs/', '/pdf/') + '.pdf'
        }
        
        return {
          id,
          title,
          authors,
          summary,
          published,
          pdfUrl,
          arxivUrl
        }
      })
      
      setPapers(parsedPapers)
      console.log(`Successfully loaded ${parsedPapers.length} papers from ArXiv`)
      
    } catch (err) {
      console.error('ArXiv search error:', err)
      
      // Enhanced fallback with more relevant mock data based on search query
      const mockPapers: ArXivPaper[] = [
        {
          id: '2401.00001',
          title: `${query} - A Comprehensive Survey and Analysis`,
          authors: ['Dr. Sarah Chen', 'Prof. Michael Rodriguez', 'Dr. Emily Watson'],
          summary: `This comprehensive survey examines the latest developments in ${query.toLowerCase()}. We analyze state-of-the-art techniques, identify current challenges, and propose future research directions. Our analysis covers theoretical foundations, practical applications, and emerging trends in the field.`,
          published: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          pdfUrl: 'https://arxiv.org/pdf/2401.00001.pdf',
          arxivUrl: 'https://arxiv.org/abs/2401.00001'
        },
        {
          id: '2401.00002',
          title: `Advanced Machine Learning Approaches for ${query}`,
          authors: ['Alex Thompson', 'Maria Garcia', 'James Liu'],
          summary: `We present novel machine learning approaches for addressing challenges in ${query.toLowerCase()}. Our method combines deep learning with traditional techniques to achieve state-of-the-art performance. Extensive experiments demonstrate significant improvements over existing baselines.`,
          published: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
          pdfUrl: 'https://arxiv.org/pdf/2401.00002.pdf',
          arxivUrl: 'https://arxiv.org/abs/2401.00002'
        },
        {
          id: '2401.00003',
          title: `Real-world Applications and Case Studies in ${query}`,
          authors: ['Dr. Jennifer Park', 'Robert Kim', 'Lisa Anderson'],
          summary: `This paper presents real-world applications and case studies of ${query.toLowerCase()} in various domains. We analyze deployment challenges, performance metrics, and practical considerations. Our findings provide valuable insights for practitioners and researchers.`,
          published: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
          pdfUrl: 'https://arxiv.org/pdf/2401.00003.pdf',
          arxivUrl: 'https://arxiv.org/abs/2401.00003'
        }
      ]
      
      setPapers(mockPapers)
      console.log('Using enhanced mock data due to API limitations')
      
      // Show user-friendly message
      alert(`ArXiv API temporarily unavailable. Showing relevant mock papers for "${query}". In production, this would fetch real papers from ArXiv.`)
    } finally {
      setLoading(false)
    }
  }

  const searchArXiv = async () => {
    await performSearch(searchQuery)
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
          📚 Intel Library - Advanced R&D
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchArXiv()}
            placeholder="Search ArXiv papers..."
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
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {papers.length === 0 && !loading ? (
          <div className="text-center py-8 text-slate-500 dark:text-white/60">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-2">Search for academic papers to analyze and pin to your projects</p>
            <p className="text-xs text-slate-400 dark:text-white/40">
              Note: Uses Vite proxy to handle CORS. Real ArXiv data when available.
            </p>
          </div>
        ) : papers.length === 0 && loading && autoSearched ? (
          <div className="text-center py-8 text-slate-500 dark:text-white/60">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="mb-2">🔍 Auto-searching papers for your forge...</p>
            <p className="text-xs text-slate-400 dark:text-white/40">
              Finding relevant research papers related to "{forgeIdea}"
            </p>
          </div>
        ) : (
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
                  {selectedForgeId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPinToProject(paper)
                      }}
                      className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition"
                      title="Pin to Project"
                    >
                      <Pin size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-slate-600 dark:text-white/70 mb-2">
                {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 && ' et al.'}
              </div>
              
              {paper.summary && (
                <p className="text-sm text-slate-700 dark:text-white/80 line-clamp-3">
                  {paper.summary}
                </p>
              )}
              
              {paper.published && (
                <div className="text-xs text-slate-500 dark:text-white/60 mt-2">
                  Published: {new Date(paper.published).toLocaleDateString()}
                </div>
              )}
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
  )
}
