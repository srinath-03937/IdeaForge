import React from 'react'
import { Repo } from '../types'
import RepoCard from './RepoCard'
import MermaidDiagram from './MermaidDiagram'

interface PatentCardProps {
  title: string
  abstract?: string
}

function PatentCard({ title, abstract }: PatentCardProps) {
  return (
    <div className="p-3 rounded-lg bg-slate-100 dark:bg-white/5 border-2 border-cyan-200 dark:border-white/10">
      <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
      <div className="text-xs text-slate-600 dark:text-white/70 mt-1">{abstract}</div>
    </div>
  )
}

export default function ResultTabs({ result }: { result?: any }) {
  if (!result) return <div className="mt-4 text-sm text-slate-600 dark:text-white/60">No results yet.</div>
  
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({})
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  console.log('ResultTabs received:', { 
    hasRepos: !!result.validatedRepos?.length,
    reposCount: result.validatedRepos?.length || 0,
    hasPatents: !!result.patents?.length,
    patentsCount: result.patents?.length || 0,
    repos: result.validatedRepos,
    patents: result.patents
  })
  
  // Remove duplicates and ensure unique keys
  const uniqueRepos = result.validatedRepos?.filter((repo: any, index: number, self: any[]) => 
    self.findIndex((r: any) => r.full_name === repo.full_name) === index
  ) || []
  
  const uniquePatents = result.patents?.filter((patent: any, index: number, self: any[]) => 
    self.findIndex((p: any) => p.id === patent.id || p.title === patent.title) === index
  ) || []
  
  return (
    <div className="mt-4 space-y-5">
      {/* Refined Concept Section */}
      <section className="rounded-lg overflow-hidden">
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-900 dark:text-emerald-300">
          💡 Refined Concept
        </h3>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 leading-relaxed">
          {result.refinedConcept || 'Loading...'}
        </div>
      </section>

      {/* Highlighted Scores Section */}
      <section className="bg-gradient-to-br from-emerald-50 dark:from-emerald-900/30 to-cyan-50 dark:to-cyan-900/30 border-2 border-emerald-300 dark:border-emerald-500/50 rounded-lg p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-emerald-700 dark:text-emerald-300">
          📊 Analysis Scores
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-black/50 rounded-lg p-4 sm:p-6 border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
            <div className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold mb-2 uppercase tracking-wide">
              Feasibility
            </div>
            <div className="text-4xl sm:text-5xl font-bold text-emerald-600 dark:text-emerald-300">
              {result.feasibility || 0}%
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60 mt-2">
              Implementation viability
            </div>
          </div>
          <div className="bg-white dark:bg-black/50 rounded-lg p-4 sm:p-6 border border-cyan-200 dark:border-cyan-500/30 shadow-sm">
            <div className="text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm font-semibold mb-2 uppercase tracking-wide">
              Novelty
            </div>
            <div className="text-4xl sm:text-5xl font-bold text-cyan-600 dark:text-cyan-300">
              {result.novelty || 0}%
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60 mt-2">
              Innovation level
            </div>
          </div>
        </div>
      </section>

      {/* Collapsible Validated Repos Section */}
      <section className="border-2 border-emerald-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('repos')}
          className="w-full p-3 sm:p-4 bg-emerald-50 dark:bg-black/40 hover:bg-emerald-100 dark:hover:bg-black/60 flex items-center justify-between font-semibold text-slate-900 dark:text-white transition"
        >
          <span className="text-sm sm:text-base">📦 Validated Repos ({result.validatedRepos?.length || 0})</span>
          <span className="text-lg">{expandedSections['repos'] ? '▼' : '▶'}</span>
        </button>
        {expandedSections['repos'] && (
          <div className="p-3 sm:p-4 space-y-2 bg-emerald-50 dark:bg-black/20 border-t-2 border-emerald-200 dark:border-white/10">
            {uniqueRepos.length > 0 ? (
              uniqueRepos.map((r: any, idx: number) => (
                <RepoCard key={`repo-${r.full_name || r.id}-${idx}`} repo={r} />
              ))
            ) : (
              <div className="text-sm text-slate-600 dark:text-white/60">No repos found</div>
            )}
          </div>
        )}
      </section>

      {/* Collapsible Patents Section */}
      <section className="border-2 border-cyan-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('patents')}
          className="w-full p-3 sm:p-4 bg-cyan-50 dark:bg-black/40 hover:bg-cyan-100 dark:hover:bg-black/60 flex items-center justify-between font-semibold text-slate-900 dark:text-white transition"
        >
          <span className="text-sm sm:text-base">🔬 Patents ({result.patents?.length || 0})</span>
          <span className="text-lg">{expandedSections['patents'] ? '▼' : '▶'}</span>
        </button>
        {expandedSections['patents'] && (
          <div className="p-3 sm:p-4 space-y-2 bg-cyan-50 dark:bg-black/20 border-t-2 border-cyan-200 dark:border-white/10">
            {uniquePatents.length > 0 ? (
              uniquePatents.map((p: any, i: number) => (
                <PatentCard key={`patent-${p.id || p.title}-${i}`} title={p.title || 'Unknown'} abstract={p.abstract} />
              ))
            ) : (
              <div className="text-sm text-slate-600 dark:text-white/60">No patents found</div>
            )}
          </div>
        )}
      </section>

      {/* Collapsible Architecture Section */}
      <section className="border-2 border-purple-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('arch')}
          className="w-full p-3 sm:p-4 bg-purple-50 dark:bg-black/40 hover:bg-purple-100 dark:hover:bg-black/60 flex items-center justify-between font-semibold text-slate-900 dark:text-white transition"
        >
          <span className="text-sm sm:text-base">🏗️ Architecture Diagram</span>
          <span className="text-lg">{expandedSections['arch'] ? '▼' : '▶'}</span>
        </button>
        {expandedSections['arch'] && (
          <div className="p-3 sm:p-4 bg-purple-50 dark:bg-black/20 border-t-2 border-purple-200 dark:border-white/10">
            {result.mermaid ? (
              <MermaidDiagram code={result.mermaid} />
            ) : (
              <div className="text-sm text-slate-600 dark:text-white/60 p-4">No architecture diagram available</div>
            )}
          </div>
        )}
      </section>

      {/* Collapsible Starter Code Section */}
      {result.starterCode && (
        <section className="border-2 border-amber-300 dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('code')}
            className="w-full p-3 sm:p-4 bg-amber-50 dark:bg-black/40 hover:bg-amber-100 dark:hover:bg-black/60 flex items-center justify-between font-semibold text-slate-900 dark:text-white transition"
          >
            <span className="text-sm sm:text-base">💻 Starter Code</span>
            <span className="text-lg">{expandedSections['code'] ? '▼' : '▶'}</span>
          </button>
          {expandedSections['code'] && (
            <div className="p-3 sm:p-4 bg-amber-50 dark:bg-black/20 border-t-2 border-amber-200 dark:border-white/10 overflow-x-auto">
              <pre className="p-3 rounded-lg text-xs sm:text-sm overflow-auto bg-slate-900 dark:bg-black/80 border border-slate-200 dark:border-white/10 text-slate-100 dark:text-white/90 whitespace-pre font-mono leading-relaxed">
                {result.starterCode?.replace(/\\n/g, '\n').replace(/\\t/g, '\t')}
              </pre>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
