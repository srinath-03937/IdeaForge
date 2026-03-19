import React from 'react'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface PatentSimilarityHeatmapProps {
  similarityScore: number
  patents: any[]
  idea: string
}

export default function PatentSimilarityHeatmap({ similarityScore, patents, idea }: PatentSimilarityHeatmapProps) {
  const [analysis, setAnalysis] = React.useState<{
    similarityScore: number
    analysis: string
    recommendations: string[]
    patentBreakdown: Array<{
      patent: any
      similarity: number
      conflictingClaims: string[]
      novelAspects: string[]
    }>
  } | null>(null)
  const [analyzing, setAnalyzing] = React.useState(false)

  // Debug logging
  React.useEffect(() => {
    console.log('PatentSimilarityHeatmap received:', {
      similarityScore,
      patentsCount: patents?.length || 0,
      idea: idea?.substring(0, 50),
      patents: patents?.slice(0, 2).map(p => ({ title: p.title, id: p.id }))
    })
  }, [similarityScore, patents, idea])

  const performDetailedAnalysis = async () => {
    if (!idea || patents.length === 0) {
      console.warn('Cannot perform analysis: missing idea or patents')
      return
    }
    
    console.log('Starting detailed patent analysis...')
    setAnalyzing(true)
    try {
      // Analyze each patent for detailed comparison
      const patentAnalysis = patents.map((patent, index) => {
        console.log(`Analyzing patent ${index + 1}:`, patent.title)
        
        // Calculate individual patent similarity
        const patentSimilarity = calculatePatentSimilarity(idea, patent)
        
        // Identify conflicting claims
        const conflictingClaims = identifyConflictingClaims(idea, patent)
        
        // Identify novel aspects
        const novelAspects = identifyNovelAspects(idea, patent)
        
        return {
          patent,
          similarity: patentSimilarity,
          conflictingClaims,
          novelAspects
        }
      })
      
      console.log('Patent analysis completed:', patentAnalysis)
      
      // Generate overall analysis
      const overallAnalysis = generateOverallAnalysis(idea, patentAnalysis)
      
      setAnalysis({
        similarityScore: similarityScore,
        analysis: overallAnalysis.summary,
        recommendations: overallAnalysis.recommendations,
        patentBreakdown: patentAnalysis
      })
    } catch (err) {
      console.error('Patent analysis error:', err)
      setAnalysis({
        similarityScore: similarityScore,
        analysis: `Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        recommendations: ['Please try again or check patent data'],
        patentBreakdown: []
      })
    } finally {
      setAnalyzing(false)
    }
  }

  // Calculate similarity between idea and individual patent
  const calculatePatentSimilarity = (idea: string, patent: any): number => {
    if (!idea || !patent?.title) return 0
    
    const ideaKeywords = extractKeywords(idea.toLowerCase())
    const patentText = `${patent.title || ''} ${patent.abstract || ''}`.toLowerCase()
    
    // Calculate keyword overlap
    const patentKeywords = extractKeywords(patentText)
    const commonKeywords = ideaKeywords.filter(keyword => patentKeywords.includes(keyword))
    
    // Calculate similarity score (0-100)
    const keywordSimilarity = (commonKeywords.length / Math.max(ideaKeywords.length, patentKeywords.length)) * 100
    const conceptualSimilarity = calculateConceptualSimilarity(idea, patentText)
    
    return Math.min(100, Math.round((keywordSimilarity * 0.6) + (conceptualSimilarity * 0.4)))
  }

  // Extract keywords from text
  const extractKeywords = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter((word, index, array) => array.indexOf(word) === index)
      .slice(0, 10)
  }

  // Calculate conceptual similarity
  const calculateConceptualSimilarity = (idea: string, patentText: string): number => {
    const ideaWords = new Set(extractKeywords(idea))
    const patentWords = new Set(extractKeywords(patentText))
    
    const intersection = new Set([...ideaWords].filter(word => patentWords.has(word)))
    const union = new Set([...ideaWords, ...patentWords])
    
    return (intersection.size / union.size) * 100
  }

  // Identify potentially conflicting claims
  const identifyConflictingClaims = (idea: string, patent: any): string[] => {
    const conflicts: string[] = []
    
    // Check for direct concept overlap
    if (patent.abstract && patent.abstract.toLowerCase().includes(idea.toLowerCase().substring(0, 20))) {
      conflicts.push('Direct conceptual overlap detected')
    }
    
    // Check for similar technical implementations
    if (patent.title && idea.toLowerCase().includes(patent.title.toLowerCase().substring(0, 15))) {
      conflicts.push('Similar technical implementation')
    }
    
    return conflicts
  }

  // Identify novel aspects
  const identifyNovelAspects = (idea: string, patent: any): string[] => {
    const novelAspects: string[] = []
    
    // Check for unique combinations
    const ideaCombinations = generateCombinations(idea.toLowerCase())
    const patentCombinations = generateCombinations(`${patent.title || ''} ${patent.abstract || ''}`.toLowerCase())
    
    const uniqueCombinations = ideaCombinations.filter(combo => !patentCombinations.includes(combo))
    
    if (uniqueCombinations.length > 0) {
      novelAspects.push(`Unique concept combinations detected (${uniqueCombinations.length})`)
    }
    
    // Check for novel applications
    const ideaApplications = extractApplications(idea)
    const patentApplications = extractApplications(`${patent.title || ''} ${patent.abstract || ''}`)
    const uniqueApplications = ideaApplications.filter(app => !patentApplications.includes(app))
    
    if (uniqueApplications.length > 0) {
      novelAspects.push(`Novel applications: ${uniqueApplications.join(', ')}`)
    }
    
    return novelAspects
  }

  // Generate combinations of words
  const generateCombinations = (text: string): string[] => {
    const words = extractKeywords(text)
    const combinations: string[] = []
    
    for (let i = 0; i < words.length - 1; i++) {
      for (let j = i + 1; j < words.length; j++) {
        combinations.push(`${words[i]} ${words[j]}`)
      }
    }
    
    return combinations
  }

  // Extract potential applications
  const extractApplications = (text: string): string[] => {
    const applicationPatterns = [
      'system', 'platform', 'service', 'tool', 'device', 'method', 'process',
      'algorithm', 'framework', 'interface', 'protocol', 'architecture'
    ]
    
    const words = extractKeywords(text.toLowerCase())
    return words.filter(word => 
      applicationPatterns.some(pattern => word.includes(pattern))
    )
  }

  // Generate overall analysis
  const generateOverallAnalysis = (idea: string, patentAnalysis: any[]) => {
    const avgSimilarity = patentAnalysis.reduce((sum, p) => sum + p.similarity, 0) / patentAnalysis.length
    const highRiskPatents = patentAnalysis.filter(p => p.similarity > 70)
    const lowRiskPatents = patentAnalysis.filter(p => p.similarity < 30)
    
    const recommendations: string[] = []
    
    if (highRiskPatents.length > 0) {
      recommendations.push('Consider significant design modifications to avoid patent conflicts')
    }
    
    if (lowRiskPatents.length > 0) {
      recommendations.push('Focus on unique aspects that differentiate from existing patents')
    }
    
    if (avgSimilarity > 50) {
      recommendations.push('Conduct prior art search to refine novelty assessment')
    }
    
    return {
      summary: `Analysis of ${patentAnalysis.length} patents reveals ${avgSimilarity.toFixed(1)}% average similarity. ${highRiskPatents.length} high-risk patents detected (${(highRiskPatents.length / patentAnalysis.length * 100).toFixed(1)}%).`,
      recommendations
    }
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400'
    if (score >= 60) return 'text-orange-600 dark:text-orange-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 20) return 'text-blue-600 dark:text-blue-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
          🎯 Patent Analysis
        </h3>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 dark:text-white/80">
            Overall Similarity: <span className={`font-bold text-lg ${getSimilarityColor(similarityScore)}`}>{similarityScore.toFixed(1)}%</span>
          </span>
          <span className="text-sm text-slate-500 dark:text-white/60">
            Based on {patents.length} patents analyzed
          </span>
        </div>
      </div>

      {/* Patent Breakdown */}
      {analysis?.patentBreakdown && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">📊 Patent Similarity Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.patentBreakdown.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-slate-900 dark:text-white truncate">
                      {item.patent.title || `Patent ${index + 1}`}
                    </h5>
                    <div className="text-xs text-slate-500 dark:text-white/60 mt-1">
                      {item.patent.abstract?.substring(0, 100) || 'No abstract available'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getSimilarityColor(item.similarity)}`}>
                      {item.similarity.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Conflicting Claims */}
                {item.conflictingClaims && item.conflictingClaims.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <h6 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">⚠️ Potential Conflicts</h6>
                    <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                      {item.conflictingClaims.map((claim, i) => (
                        <li key={i}>• {claim}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Novel Aspects */}
                {item.novelAspects && item.novelAspects.length > 0 && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <h6 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">✨ Novel Aspects</h6>
                    <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                      {item.novelAspects.map((aspect, i) => (
                        <li key={i}>• {aspect}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Analysis */}
      {analysis && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${
            similarityScore >= 70 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
              : similarityScore >= 40 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-center mb-2">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {similarityScore >= 70 ? '🚫 High Risk' : similarityScore >= 40 ? '⚠️ Moderate Risk' : '✅ Low Risk'}
                </h4>
                <p className="text-sm text-slate-600 dark:text-white/80 mt-1">
                  {analysis.analysis}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Recommendations</h4>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Analyze Button */}
      <div className="mt-6">
        <button
          onClick={performDetailedAnalysis}
          disabled={analyzing}
          className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white dark:text-white font-semibold transition flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing patents...
            </>
          ) : (
            <>
              <TrendingUp size={16} />
              Perform Detailed Analysis
            </>
          )}
        </button>
      </div>
    </div>
  )
}
