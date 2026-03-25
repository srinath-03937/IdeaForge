import React from 'react'

interface Venue {
  id: string
  name: string
  type: 'conference' | 'journal'
  field: string
  subfield: string
  impactFactor?: number
  ranking: 'A*' | 'A' | 'B' | 'C'
  acceptanceRate: number
  frequency: string
  deadline: string
  url: string
  publisher: string
  relevanceScore: number
  description: string
}

interface VenueRecommendationsProps {
  researchIdea: string
  forgeResult?: any
  selectedPapers?: any[]
}

export default function VenueRecommendations({ researchIdea, forgeResult, selectedPapers }: VenueRecommendationsProps) {
  const [venues, setVenues] = React.useState<Venue[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (researchIdea && researchIdea.trim()) {
      fetchVenues(researchIdea)
    } else {
      // Don't show venues when no research idea
      setVenues([])
    }
  }, [researchIdea])

  const fetchVenues = async (idea: string) => {
    setLoading(true)
    setError('')
    
    try {
      const relevantVenues = await getRelevantVenues(idea)
      setVenues(relevantVenues)
    } catch (err) {
      console.error('Error fetching venues:', err)
      setError('Failed to fetch venue recommendations')
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneralVenues = async () => {
    setLoading(true)
    setError('')
    
    try {
      const generalVenues = await getGeneralVenues()
      setVenues(generalVenues)
    } catch (err) {
      console.error('Error fetching general venues:', err)
      setError('Failed to fetch venue recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getRelevantVenues = async (idea: string): Promise<Venue[]> => {
    const keywords = idea.toLowerCase().split(' ').filter(word => word.length > 3)
    
    const allVenues: Venue[] = [
      // Computer Science Conferences
      {
        id: 'neurips',
        name: 'NeurIPS (Conference on Neural Information Processing Systems)',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Machine Learning',
        impactFactor: undefined,
        ranking: 'A*',
        acceptanceRate: 0.25,
        frequency: 'Annual',
        deadline: '2024-05-23',
        url: 'https://neurips.cc/',
        publisher: 'NeurIPS Foundation',
        relevanceScore: 0.95,
        description: 'Premier machine learning conference focusing on neural computation and learning systems'
      },
      {
        id: 'icml',
        name: 'ICML (International Conference on Machine Learning)',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Machine Learning',
        impactFactor: undefined,
        ranking: 'A*',
        acceptanceRate: 0.22,
        frequency: 'Annual',
        deadline: '2024-01-25',
        url: 'https://icml.cc/',
        publisher: 'International Machine Learning Society',
        relevanceScore: 0.93,
        description: 'Top international conference for machine learning research'
      },
      {
        id: 'iclr',
        name: 'ICLR (International Conference on Learning Representations)',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Deep Learning',
        impactFactor: undefined,
        ranking: 'A*',
        acceptanceRate: 0.32,
        frequency: 'Annual',
        deadline: '2024-09-27',
        url: 'https://iclr.cc/',
        publisher: 'OpenReview',
        relevanceScore: 0.91,
        description: 'Leading conference for deep learning and representation learning'
      },
      {
        id: 'cvpr',
        name: 'CVPR (Conference on Computer Vision and Pattern Recognition)',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Computer Vision',
        impactFactor: undefined,
        ranking: 'A*',
        acceptanceRate: 0.27,
        frequency: 'Annual',
        deadline: '2024-11-15',
        url: 'https://cvpr.thecvf.com/',
        publisher: 'IEEE',
        relevanceScore: 0.89,
        description: 'Premier conference for computer vision and pattern recognition'
      },
      {
        id: 'aaai',
        name: 'AAAI Conference on Artificial Intelligence',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Artificial Intelligence',
        impactFactor: undefined,
        ranking: 'A',
        acceptanceRate: 0.15,
        frequency: 'Annual',
        deadline: '2024-08-15',
        url: 'https://aaai.org/conference/aaai/',
        publisher: 'AAAI',
        relevanceScore: 0.85,
        description: 'Broad AI conference covering all aspects of artificial intelligence'
      },
      {
        id: 'ijcnn',
        name: 'IJCNN (International Joint Conference on Neural Networks)',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Neural Networks',
        impactFactor: undefined,
        ranking: 'B',
        acceptanceRate: 0.35,
        frequency: 'Annual',
        deadline: '2024-01-31',
        url: 'https://www.ijcnn.org/',
        publisher: 'IEEE Computational Intelligence Society',
        relevanceScore: 0.75,
        description: 'International conference focused on neural network research'
      },
      // Computer Science Journals
      {
        id: 'nature-ml',
        name: 'Nature Machine Intelligence',
        type: 'journal',
        field: 'Computer Science',
        subfield: 'Machine Learning',
        impactFactor: 25.8,
        ranking: 'A*',
        acceptanceRate: 0.08,
        frequency: 'Monthly',
        deadline: 'Rolling',
        url: 'https://www.nature.com/natmachintell/',
        publisher: 'Nature Publishing Group',
        relevanceScore: 0.94,
        description: 'High-impact journal covering machine learning and AI research'
      },
      {
        id: 'jmlr',
        name: 'Journal of Machine Learning Research (JMLR)',
        type: 'journal',
        field: 'Computer Science',
        subfield: 'Machine Learning',
        impactFactor: 6.9,
        ranking: 'A*',
        acceptanceRate: 0.15,
        frequency: 'Monthly',
        deadline: 'Rolling',
        url: 'https://www.jmlr.org/',
        publisher: 'MIT Press',
        relevanceScore: 0.92,
        description: 'Premier journal for machine learning research'
      },
      {
        id: 'tpami',
        name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)',
        type: 'journal',
        field: 'Computer Science',
        subfield: 'Computer Vision',
        impactFactor: 24.3,
        ranking: 'A*',
        acceptanceRate: 0.12,
        frequency: 'Monthly',
        deadline: 'Rolling',
        url: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=5349',
        publisher: 'IEEE',
        relevanceScore: 0.90,
        description: 'Top journal for pattern analysis and machine learning'
      },
      {
        id: 'tnnls',
        name: 'IEEE Transactions on Neural Networks and Learning Systems (TNNLS)',
        type: 'journal',
        field: 'Computer Science',
        subfield: 'Neural Networks',
        impactFactor: 14.3,
        ranking: 'A',
        acceptanceRate: 0.18,
        frequency: 'Monthly',
        deadline: 'Rolling',
        url: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=5962385',
        publisher: 'IEEE',
        relevanceScore: 0.88,
        description: 'Leading journal for neural networks and learning systems'
      },
      // Bioinformatics Venues
      {
        id: 'bioinformatics',
        name: 'Bioinformatics',
        type: 'journal',
        field: 'Bioinformatics',
        subfield: 'Computational Biology',
        impactFactor: 6.9,
        ranking: 'A',
        acceptanceRate: 0.20,
        frequency: 'Biweekly',
        deadline: 'Rolling',
        url: 'https://academic.oup.com/bioinformatics',
        publisher: 'Oxford University Press',
        relevanceScore: 0.82,
        description: 'Major journal for computational biology and bioinformatics'
      },
      {
        id: 'recomb',
        name: 'RECOMB (Research in Computational Molecular Biology)',
        type: 'conference',
        field: 'Bioinformatics',
        subfield: 'Computational Biology',
        impactFactor: undefined,
        ranking: 'A',
        acceptanceRate: 0.25,
        frequency: 'Annual',
        deadline: '2024-01-15',
        url: 'https://recomb.org/',
        publisher: 'RECOMB',
        relevanceScore: 0.80,
        description: 'Top conference for computational molecular biology'
      },
      // Physics Venues
      {
        id: 'nature-physics',
        name: 'Nature Physics',
        type: 'journal',
        field: 'Physics',
        subfield: 'General Physics',
        impactFactor: 22.5,
        ranking: 'A*',
        acceptanceRate: 0.10,
        frequency: 'Monthly',
        deadline: 'Rolling',
        url: 'https://www.nature.com/nphys/',
        publisher: 'Nature Publishing Group',
        relevanceScore: 0.87,
        description: 'High-impact physics journal covering all areas of physics'
      },
      {
        id: 'prl',
        name: 'Physical Review Letters (PRL)',
        type: 'journal',
        field: 'Physics',
        subfield: 'General Physics',
        impactFactor: 8.4,
        ranking: 'A*',
        acceptanceRate: 0.25,
        frequency: 'Weekly',
        deadline: 'Rolling',
        url: 'https://journals.aps.org/prl/',
        publisher: 'American Physical Society',
        relevanceScore: 0.85,
        description: 'Premier physics journal for short high-impact papers'
      }
    ]

    // Filter and rank venues based on relevance to research idea
    const relevantVenues = allVenues
      .filter(venue => {
        const ideaLower = idea.toLowerCase()
        const venueText = `${venue.name} ${venue.description} ${venue.field} ${venue.subfield}`.toLowerCase()
        return keywords.some(keyword => venueText.includes(keyword))
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8)

    return relevantVenues.length > 0 ? relevantVenues : allVenues.slice(0, 6)
  }

  const getGeneralVenues = async (): Promise<Venue[]> => {
    // Return top general venues when no research idea
    const allVenues: Venue[] = [
      {
        id: 'neurips',
        name: 'NeurIPS (Conference on Neural Information Processing Systems)',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Machine Learning',
        impactFactor: undefined,
        ranking: 'A*',
        acceptanceRate: 0.25,
        frequency: 'Annual',
        deadline: '2024-05-23',
        url: 'https://neurips.cc/',
        publisher: 'NeurIPS Foundation',
        relevanceScore: 0.95,
        description: 'Premier machine learning conference focusing on neural computation and learning systems'
      },
      {
        id: 'icml',
        name: 'ICML (International Conference on Machine Learning)',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Machine Learning',
        impactFactor: undefined,
        ranking: 'A*',
        acceptanceRate: 0.22,
        frequency: 'Annual',
        deadline: '2024-01-25',
        url: 'https://icml.cc/',
        publisher: 'International Machine Learning Society',
        relevanceScore: 0.93,
        description: 'Top international conference for machine learning research'
      },
      {
        id: 'nature-ml',
        name: 'Nature Machine Intelligence',
        type: 'journal',
        field: 'Computer Science',
        subfield: 'Machine Learning',
        impactFactor: 25.8,
        ranking: 'A*',
        acceptanceRate: 0.08,
        frequency: 'Monthly',
        deadline: 'Rolling',
        url: 'https://www.nature.com/natmachintell/',
        publisher: 'Nature Publishing Group',
        relevanceScore: 0.94,
        description: 'High-impact journal covering machine learning and AI research'
      },
      {
        id: 'jmlr',
        name: 'Journal of Machine Learning Research (JMLR)',
        type: 'journal',
        field: 'Computer Science',
        subfield: 'Machine Learning',
        impactFactor: 6.9,
        ranking: 'A*',
        acceptanceRate: 0.15,
        frequency: 'Monthly',
        deadline: 'Rolling',
        url: 'https://www.jmlr.org/',
        publisher: 'MIT Press',
        relevanceScore: 0.92,
        description: 'Premier journal for machine learning research'
      },
      {
        id: 'cvpr',
        name: 'CVPR (Conference on Computer Vision and Pattern Recognition)',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Computer Vision',
        impactFactor: undefined,
        ranking: 'A*',
        acceptanceRate: 0.27,
        frequency: 'Annual',
        deadline: '2024-11-15',
        url: 'https://cvpr.thecvf.com/',
        publisher: 'IEEE',
        relevanceScore: 0.89,
        description: 'Premier conference for computer vision and pattern recognition'
      },
      {
        id: 'aaai',
        name: 'AAAI Conference on Artificial Intelligence',
        type: 'conference',
        field: 'Computer Science',
        subfield: 'Artificial Intelligence',
        impactFactor: undefined,
        ranking: 'A',
        acceptanceRate: 0.15,
        frequency: 'Annual',
        deadline: '2024-08-15',
        url: 'https://aaai.org/conference/aaai/',
        publisher: 'AAAI',
        relevanceScore: 0.85,
        description: 'Broad AI conference covering all aspects of artificial intelligence'
      }
    ]
    
    // Calculate relevance for each venue and sort
    return allVenues
      .map(venue => {
        const venueText = `${venue.name} ${venue.description} ${venue.field} ${venue.subfield}`.toLowerCase()
        let score = 0
        
        keywords.forEach(keyword => {
          if (venueText.includes(keyword)) {
            score += 0.3
          }
        })
        
        // Bonus for field/subfield matches
        keywords.forEach(keyword => {
          if (venue.field.toLowerCase().includes(keyword)) {
            score += 0.2
          }
          if (venue.subfield.toLowerCase().includes(keyword)) {
            score += 0.2
          }
        })
        
        // Higher score for top-tier venues
        if (venue.ranking === 'A*') score += 0.1
        if (venue.ranking === 'A') score += 0.05
        
        return {
          ...venue,
          relevanceScore: Math.min(score, 1.0)
        }
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6)
  }

  const getRankingColor = (ranking: string) => {
    switch (ranking) {
      case 'A*': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'C': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'conference' ? '🎤' : '📖'
  }

  const formatAcceptanceRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Finding relevant venues...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-red-300 dark:border-red-500/30">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Recommended Publication Venues
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Top conferences and journals where your research would be most competitive and relevant
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {venues.map((venue) => (
          <div key={venue.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getTypeIcon(venue.type)}</span>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{venue.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{venue.field} • {venue.subfield}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRankingColor(venue.ranking)}`}>
                {venue.ranking}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
              {venue.description}
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Acceptance:</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatAcceptanceRate(venue.acceptanceRate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Frequency:</span>
                <span className="font-medium text-slate-900 dark:text-white">{venue.frequency}</span>
              </div>
              {venue.impactFactor && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Impact:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{venue.impactFactor}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Deadline:</span>
                <span className="font-medium text-slate-900 dark:text-white">{venue.deadline}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ⭐ {venue.relevanceScore.toFixed(2)} relevance
              </span>
              <a
                href={venue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
              >
                Visit Venue →
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {venues.length === 0 && !loading && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <span className="text-4xl mb-4 block">🎯</span>
          <p>Enter a research idea in the Forge module to see relevant publication venues.</p>
          <p className="text-sm mt-2">Venues will be matched based on your research domain and subfield.</p>
        </div>
      )}
    </div>
  )
}
