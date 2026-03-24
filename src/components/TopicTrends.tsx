import React from 'react'

interface TopicTrend {
  topic: string
  trendData: Array<{
    year: number
    publications: number
    citations: number
    breakthroughs: string[]
    events: string[]
  }>
  currentStatus: 'growing' | 'saturating' | 'declining' | 'emerging'
  growthRate: number
  totalPublications: number
  totalCitations: number
  keyBreakthroughs: Array<{
    year: number
    title: string
    impact: 'high' | 'medium' | 'low'
  }>
  prediction: {
    next5Years: string
    confidence: number
  }
}

interface TopicTrendsProps {
  researchIdea: string
  forgeResult?: any
  selectedPapers?: any[]
}

export default function TopicTrends({ researchIdea, forgeResult, selectedPapers }: TopicTrendsProps) {
  const [trends, setTrends] = React.useState<TopicTrend[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (researchIdea && researchIdea.trim()) {
      fetchTrends(researchIdea)
    } else {
      // Don't show trends when no research idea
      setTrends([])
    }
  }, [researchIdea])

  const fetchTrends = async (idea: string) => {
    setLoading(true)
    setError('')
    
    try {
      const relevantTrends = await getTopicTrends(idea)
      setTrends(relevantTrends)
    } catch (err) {
      console.error('Error fetching topic trends:', err)
      setError('Failed to fetch topic trends')
    } finally {
      setLoading(false)
    }
  }

  const getTopicTrends = async (idea: string): Promise<TopicTrend[]> => {
    // If no papers available, return empty
    if (!selectedPapers || selectedPapers.length === 0) {
      return []
    }
    
    // Analyze actual research papers to generate trend data
    const papersByYear: { [year: number]: any[] } = {}
    const keywords = idea.toLowerCase().split(' ').filter(word => word.length > 2)
    
    // Group papers by publication year
    selectedPapers.forEach(paper => {
      const year = paper.published?.split('-')[0] || paper.year || '2024'
      const yearNum = parseInt(year)
      if (!papersByYear[yearNum]) {
        papersByYear[yearNum] = []
      }
      papersByYear[yearNum].push(paper)
    })
    
    // Get the last 7 years of data
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 6; i >= 0; i--) {
      years.push(currentYear - i)
    }
    
    // Generate trend data based on actual papers
    const trendData = years.map(year => {
      const yearPapers = papersByYear[year] || []
      const publications = yearPapers.length
      
      // Calculate citations (simulated based on paper age and relevance)
      const citations = yearPapers.reduce((total, paper) => {
        const paperAge = currentYear - year
        const baseCitations = paper.citationCount || Math.floor(Math.random() * 100) + 10
        const ageMultiplier = Math.max(1, paperAge * 2)
        return total + (baseCitations * ageMultiplier)
      }, 0)
      
      // Extract breakthroughs from paper titles/abstracts
      const breakthroughs = yearPapers
        .filter(paper => {
          const text = `${paper.title || ''} ${paper.abstract || ''}`.toLowerCase()
          return keywords.some(keyword => text.includes(keyword)) && 
                 (text.includes('novel') || text.includes('new') || text.includes('breakthrough') || text.includes('state-of-the-art'))
        })
        .slice(0, 2)
        .map(paper => paper.title?.split(':').pop()?.trim() || 'New Approach')
      
      // Extract events/conferences from paper venues
      const events = yearPapers
        .filter(paper => paper.venue || paper.journal)
        .slice(0, 2)
        .map(paper => paper.venue || paper.journal || 'Conference')
      
      return {
        year,
        publications,
        citations,
        breakthroughs: breakthroughs.length > 0 ? breakthroughs : ['Research Progress'],
        events: events.length > 0 ? events : ['Academic Publication']
      }
    })
    
    // Calculate overall statistics
    const totalPublications = trendData.reduce((sum, data) => sum + data.publications, 0)
    const totalCitations = trendData.reduce((sum, data) => sum + data.citations, 0)
    
    // Determine growth trend
    const recentYears = trendData.slice(-3)
    const olderYears = trendData.slice(0, 3)
    const recentAvg = recentYears.reduce((sum, data) => sum + data.publications, 0) / recentYears.length
    const olderAvg = olderYears.reduce((sum, data) => sum + data.publications, 0) / olderYears.length
    const growthRate = recentAvg > olderAvg ? (recentAvg - olderAvg) / olderAvg : 0
    
    // Determine current status
    let currentStatus: 'growing' | 'saturating' | 'declining' | 'emerging'
    if (growthRate > 0.2) currentStatus = 'growing'
    else if (growthRate > 0.05) currentStatus = 'saturating'
    else if (growthRate < -0.1) currentStatus = 'declining'
    else currentStatus = 'emerging'
    
    // Extract key breakthroughs from all papers
    const allBreakthroughs = selectedPapers
      .filter(paper => {
        const text = `${paper.title || ''} ${paper.abstract || ''}`.toLowerCase()
        return text.includes('novel') || text.includes('breakthrough') || text.includes('state-of-the-art')
      })
      .slice(0, 4)
      .map(paper => ({
        year: parseInt(paper.published?.split('-')[0] || paper.year || '2024'),
        title: paper.title || 'Unknown',
        impact: (paper.citationCount > 50 ? 'high' : 'medium') as 'high' | 'medium' | 'low'
      }))
    
    // Generate prediction based on trend
    const prediction = {
      next5Years: currentStatus === 'growing' 
        ? 'Continued growth expected with increasing research interest and publications'
        : currentStatus === 'saturating'
        ? 'Stable research activity with potential for breakthrough innovations'
        : currentStatus === 'declining'
        ? 'Declining interest, research may shift to related emerging areas'
        : 'Emerging field with potential for rapid growth and innovation',
      confidence: currentStatus === 'growing' ? 0.85 : currentStatus === 'saturating' ? 0.75 : 0.65
    }
    
    return [{
      topic: keywords[0]?.charAt(0).toUpperCase() + keywords[0]?.slice(1) || 'Research Topic',
      trendData,
      currentStatus,
      growthRate,
      totalPublications,
      totalCitations,
      keyBreakthroughs: allBreakthroughs,
      prediction
    }]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      case 'saturating': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'declining': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      case 'emerging': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Analyzing research trends...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-red-300 dark:border-red-500/30">
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
      <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
        📈 Research Topic Trends
      </h3>

      {trends.length === 0 && !loading && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <span className="text-4xl mb-4 block">📈</span>
          <p>Enter a research idea in Forge module to see relevant topic trends.</p>
          <p className="text-sm mt-2">Trends will be matched based on your research domain and keywords.</p>
        </div>
      )}

      {trends.map((trend, index) => (
        <div key={index} className="space-y-6">
          {/* Topic Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                {trend.topic}
              </h4>
              <div className="flex items-center gap-4 mt-1">
                <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(trend.currentStatus)}`}>
                  {trend.currentStatus.charAt(0).toUpperCase() + trend.currentStatus.slice(1)}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Growth: {(trend.growthRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {(trend.totalPublications / 1000).toFixed(0)}K papers
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {(trend.totalCitations / 1000000).toFixed(1)}M citations
              </div>
            </div>
          </div>

          {/* Simple trend chart visualization */}
          <div className="mb-4">
            <div className="relative h-32 bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                {trend.trendData.slice(-7).map((data, index) => {
                  const maxPublications = Math.max(...trend.trendData.map(d => d.publications))
                  const heightInPixels = (data.publications / maxPublications) * 100 // Max 100px height
                  return (
                    <div key={data.year} className="flex flex-col items-center flex-1 mx-1">
                      <div 
                        className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-t transition-all hover:bg-emerald-600 dark:hover:bg-emerald-300"
                        style={{ height: `${Math.max(heightInPixels, 8)}px` }}
                        title={`${data.year}: ${data.publications.toLocaleString()} publications`}
                      ></div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {data.year.toString().slice(-2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Key Breakthroughs */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Breakthroughs:</h5>
            <div className="flex flex-wrap gap-2">
              {trend.keyBreakthroughs.slice(0, 4).map((breakthrough, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-1 rounded ${getImpactColor(breakthrough.impact)}`}>
                    {breakthrough.year}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {breakthrough.title.length > 50 ? breakthrough.title.substring(0, 50) + '...' : breakthrough.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">🔮 5-Year Prediction:</h5>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              {trend.prediction.next5Years}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-500 dark:text-blue-500">Confidence:</span>
              <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all"
                  style={{ width: `${trend.prediction.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {(trend.prediction.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
