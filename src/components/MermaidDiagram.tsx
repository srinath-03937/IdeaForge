import React from 'react'
import mermaid from 'mermaid'
import { useTheme } from '../hooks/useTheme'

export default function MermaidDiagram({ code }: { code: string }){
  const { theme } = useTheme()
  const [error, setError] = React.useState<string | null>(null)
  const [renderKey, setRenderKey] = React.useState(0)
  const svgRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!code || !svgRef.current) return
    
    const renderDiagram = async () => {
      if (!code || !svgRef.current) return
      
      try {
        setError(null)
        
        // Validate and clean the mermaid code
        let cleanCode = code
        
        // Remove any characters that might cause SVG path issues
        cleanCode = cleanCode.replace(/[^\w\s\-\.\[\]()"<>\/\n:;=]/g, '')
        
        // Remove any remaining problematic characters
        cleanCode = cleanCode.replace(/[0-9]+/g, '')
        
        // Ensure proper mermaid syntax
        if (!cleanCode.includes('flowchart') && !cleanCode.includes('graph')) {
          cleanCode = `flowchart TD\n    A["Idea"]\n    B["Process"]\n    C["Result"]\n    A --> B\n    B --> C`
        }
        
        const mermaidTheme = theme === 'dark' ? 'dark' : 'default'
        mermaid.initialize({ 
          startOnLoad: true, 
          theme: mermaidTheme,
          securityLevel: 'loose',
          flowchart: { 
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        })
        
        // Use unique ID for each render
        const diagramId = `mermaid-diagram-${renderKey}`
        
        try {
          const { svg } = await mermaid.render(diagramId, cleanCode)
          
          if (svgRef.current) {
            svgRef.current.innerHTML = svg
            setError(null)
          }
        } catch (renderErr) {
          console.error('Mermaid render error, trying fallback:', renderErr)
          
          // Try with a simpler diagram
          const fallbackCode = `flowchart TD\n    A["💡 Idea"]\n    B["🔍 Research"]\n    C["📊 Results"]\n    A --> B\n    B --> C\n    style A fill:#10B981\n    style B fill:#3B82F6\n    style C fill:#F59E0B`
          
          const { svg } = await mermaid.render(`${diagramId}-fallback`, fallbackCode)
          
          if (svgRef.current) {
            svgRef.current.innerHTML = svg
            setError(null)
          }
        }
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        // Retry with a different key
        setRenderKey(k => k + 1)
      }
    }
    
    renderDiagram()
  }, [code, theme, renderKey])
  
  // Enhanced fallback with cleaner UI
  if (error) {
    return (
      <div className="p-6 card rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black/40 dark:to-black/60 border-2 border-purple-300 dark:border-purple-500/30 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white/80">
          <span>📊</span>
          <span>Architecture Flow</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border-2 border-emerald-400 dark:border-emerald-500/40 text-center font-semibold text-sm text-emerald-900 dark:text-emerald-300">
            Idea
          </div>
          
          <div className="flex items-center justify-center">
            <div className="flex-1 h-0.5 bg-slate-300 dark:bg-white/20"></div>
            <span className="px-2 text-xs text-slate-500 dark:text-white/40">→</span>
            <div className="flex-1 h-0.5 bg-slate-300 dark:bg-white/20"></div>
          </div>
          
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-400 dark:border-blue-500/40 text-center font-semibold text-sm text-blue-900 dark:text-blue-300">
            GitHub Search
          </div>
          
          <div className="flex items-center justify-center">
            <div className="flex-1 h-0.5 bg-slate-300 dark:bg-white/20"></div>
            <span className="px-2 text-xs text-slate-500 dark:text-white/40">→</span>
            <div className="flex-1 h-0.5 bg-slate-300 dark:bg-white/20"></div>
          </div>
          
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border-2 border-purple-400 dark:border-purple-500/40 text-center font-semibold text-sm text-purple-900 dark:text-purple-300">
            Analysis
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg border-2 border-cyan-400 dark:border-cyan-500/40 text-center text-xs font-medium text-cyan-900 dark:text-cyan-300">
            Repositories
          </div>
          
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border-2 border-amber-400 dark:border-amber-500/40 text-center text-xs font-medium text-amber-900 dark:text-amber-300">
            Results
          </div>
          
          <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg border-2 border-pink-400 dark:border-pink-500/40 text-center text-xs font-medium text-pink-900 dark:text-pink-300">
            Patents
          </div>
        </div>
        
        <div className="text-xs text-slate-600 dark:text-white/60 pt-2 border-t border-slate-200 dark:border-white/10">
          <details>
            <summary className="cursor-pointer font-medium hover:text-slate-800 dark:hover:text-white">Technical Details</summary>
            <pre className="mt-2 p-2 bg-slate-900/20 dark:bg-white/5 rounded text-xs overflow-auto text-slate-700 dark:text-white/70">
{error}
            </pre>
          </details>
        </div>
      </div>
    )
  }
  
  return (
    <div className="mt-3 p-4 card rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black/40 dark:to-black/60 border-2 border-purple-300 dark:border-purple-500/30 overflow-auto shadow-sm" style={{ maxHeight: '600px' }}>
      <div 
        ref={svgRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '200px'
        }}
      />
    </div>
  )
}
