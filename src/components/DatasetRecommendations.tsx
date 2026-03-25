import React from 'react'
import { searchAllDatasets } from '../services/datasetService'
import { Dataset } from '../types'

interface DatasetRecommendationsProps {
  researchIdea: string
  forgeResult?: any
  selectedPapers?: any[]
}

export default function DatasetRecommendations({ researchIdea, forgeResult, selectedPapers }: DatasetRecommendationsProps) {
  const [datasets, setDatasets] = React.useState<Dataset[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [autoSearched, setAutoSearched] = React.useState(false)

  React.useEffect(() => {
    if (researchIdea && researchIdea.trim()) {
      fetchDatasets(researchIdea)
      setAutoSearched(true)
    } else {
      // Don't show datasets when no research idea
      setDatasets([])
      setAutoSearched(false)
    }
  }, [researchIdea])

  const fetchDatasets = async (idea: string) => {
    setLoading(true)
    setError('')
    
    try {
      // Use real API service to fetch relevant datasets
      const relevantDatasets = await searchAllDatasets(idea, 20)
      setDatasets(relevantDatasets)
      console.log(`Fetched ${relevantDatasets.length} real datasets for: ${idea}`)
    } catch (err) {
      console.error('Error fetching datasets:', err)
      setError('Failed to fetch datasets')
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneralDatasets = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Show general popular datasets when no research idea
      const generalDatasets = await getGeneralDatasets()
      setDatasets(generalDatasets)
    } catch (err) {
      console.error('Error fetching general datasets:', err)
      setError('Failed to fetch datasets')
    } finally {
      setLoading(false)
    }
  }

  const getRelevantDatasets = async (idea: string): Promise<Dataset[]> => {
    // Enhanced keyword extraction with domain-specific terms
    const ideaLower = idea.toLowerCase()
    const keywords = ideaLower.split(' ').filter(word => word.length > 2)
    
    // Add domain-specific keyword mappings
    const domainMappings: { [key: string]: string[] } = {
      'machine learning': ['ml', 'artificial intelligence', 'ai', 'neural', 'deep learning', 'classification', 'regression'],
      'deep learning': ['neural network', 'cnn', 'rnn', 'transformer', 'attention', 'embedding'],
      'computer vision': ['image', 'vision', 'object detection', 'segmentation', 'cnn', 'resnet', 'imagenet'],
      'nlp': ['natural language', 'text', 'sentiment', 'language model', 'bert', 'gpt', 'embedding', 'token'],
      'medical': ['health', 'clinical', 'diagnosis', 'disease', 'patient', 'medical', 'healthcare', 'treatment'],
      'climate': ['weather', 'environmental', 'temperature', 'atmospheric', 'carbon', 'emissions', 'global warming'],
      'economic': ['finance', 'financial', 'market', 'economy', 'gdp', 'income', 'poverty', 'development'],
      'recommendation': ['recommendation system', 'collaborative filtering', 'user preference', 'rating', 'movie', 'product']
    }
    
    // Expand keywords with domain mappings
    const expandedKeywords = [...keywords]
    Object.entries(domainMappings).forEach(([domain, terms]) => {
      if (ideaLower.includes(domain)) {
        expandedKeywords.push(...terms)
      }
    })
    
    // Remove duplicates and filter meaningful terms
    const finalKeywords = [...new Set(expandedKeywords)].filter(word => 
      word.length > 2 && !['the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'will'].includes(word)
    )
    
    // Comprehensive dataset collection from the specified sources
    const allDatasets: Dataset[] = [
      // Kaggle Datasets
      {
        id: 'kg-titanic',
        name: 'Titanic - Machine Learning from Disaster',
        description: 'Classic dataset for binary classification and feature engineering',
        source: 'kaggle',
        url: 'https://www.kaggle.com/c/titanic',
        size: '59 KB',
        format: 'CSV',
        downloads: 3500000,
        lastUpdated: '2023-12-20',
        tags: ['classification', 'feature-engineering', 'beginner', 'machine-learning'],
        relevanceScore: 0.7
      },
      {
        id: 'kg-house-prices',
        name: 'House Prices - Advanced Regression Techniques',
        description: 'Predict house prices based on various features',
        source: 'kaggle',
        url: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques',
        size: '450 KB',
        format: 'CSV',
        downloads: 2800000,
        lastUpdated: '2024-01-10',
        tags: ['regression', 'real-estate', 'feature-engineering', 'machine-learning'],
        relevanceScore: 0.8
      },
      {
        id: 'kg-imdb',
        name: 'IMDB Movies Dataset',
        description: 'Movie reviews and ratings for sentiment analysis and recommendation systems',
        source: 'kaggle',
        url: 'https://www.kaggle.com/datasets/lakshmi25npathi/imdb-dataset-of-50k-movie-reviews',
        size: '84 MB',
        format: 'CSV',
        downloads: 1250000,
        lastUpdated: '2024-01-15',
        tags: ['nlp', 'sentiment-analysis', 'recommendation', 'entertainment'],
        relevanceScore: 0.9
      },
      {
        id: 'kg-covid19',
        name: 'COVID-19 Dataset',
        description: 'Comprehensive COVID-19 case and vaccination data worldwide',
        source: 'kaggle',
        url: 'https://www.kaggle.com/datasets/imdevskp/corona-virus-report',
        size: '2.5 GB',
        format: 'CSV, JSON',
        downloads: 450000,
        lastUpdated: '2024-02-10',
        tags: ['health', 'pandemic', 'time-series', 'medical'],
        relevanceScore: 0.65
      },
      // UCI Machine Learning Repository
      {
        id: 'uci-iris',
        name: 'Iris Dataset',
        description: 'Classic multiclass classification dataset with flower measurements',
        source: 'uci',
        url: 'https://archive.ics.uci.edu/ml/datasets/iris',
        size: '4 KB',
        format: 'CSV',
        downloads: 1500000,
        lastUpdated: '2023-11-15',
        tags: ['classification', 'multiclass', 'biology', 'machine-learning'],
        relevanceScore: 0.75
      },
      {
        id: 'uci-wine',
        name: 'Wine Quality Dataset',
        description: 'Wine quality ratings based on physicochemical tests',
        source: 'uci',
        url: 'https://archive.ics.uci.edu/ml/datasets/wine+quality',
        size: '254 KB',
        format: 'CSV',
        downloads: 980000,
        lastUpdated: '2023-10-30',
        tags: ['regression', 'classification', 'chemistry', 'quality'],
        relevanceScore: 0.72
      },
      {
        id: 'uci-breast-cancer',
        name: 'Breast Cancer Wisconsin Dataset',
        description: 'Diagnostic features for breast cancer classification',
        source: 'uci',
        url: 'https://archive.ics.uci.edu/ml/datasets/breast+cancer+wisconsin+(diagnostic)',
        size: '124 KB',
        format: 'CSV',
        downloads: 2100000,
        lastUpdated: '2023-09-15',
        tags: ['classification', 'medical', 'diagnostic', 'health'],
        relevanceScore: 0.85
      },
      // Hugging Face Datasets
      {
        id: 'hf-imdb',
        name: 'IMDB Movie Reviews',
        description: 'Large movie review dataset for sentiment analysis and text classification',
        source: 'huggingface',
        url: 'https://huggingface.co/datasets/imdb',
        size: '84 MB',
        format: 'CSV, JSON',
        downloads: 1250000,
        lastUpdated: '2024-01-15',
        tags: ['nlp', 'sentiment-analysis', 'text-classification', 'ai'],
        relevanceScore: 0.9
      },
      {
        id: 'hf-cifar10',
        name: 'CIFAR-10',
        description: 'Collection of images with 10 classes, used in computer vision research',
        source: 'huggingface',
        url: 'https://huggingface.co/datasets/cifar10',
        size: '170 MB',
        format: 'PNG, CSV',
        downloads: 2100000,
        lastUpdated: '2024-02-01',
        tags: ['computer-vision', 'image-classification', 'ai', 'deep-learning'],
        relevanceScore: 0.85
      },
      {
        id: 'hf-squad',
        name: 'SQuAD v2',
        description: 'Stanford Question Answering Dataset for reading comprehension',
        source: 'huggingface',
        url: 'https://huggingface.co/datasets/squad_v2',
        size: '45 MB',
        format: 'JSON',
        downloads: 890000,
        lastUpdated: '2024-01-20',
        tags: ['nlp', 'question-answering', 'reading-comprehension', 'ai'],
        relevanceScore: 0.88
      },
      // Domain Specific - Medical/Biological
      {
        id: 'pubmed-gene',
        name: 'Gene Expression Omnibus (GEO)',
        description: 'Gene expression and molecular biology datasets',
        source: 'pubmed',
        url: 'https://www.ncbi.nlm.nih.gov/geo/',
        size: '50 GB+',
        format: 'CSV, XML, JSON',
        downloads: 320000,
        lastUpdated: '2024-02-05',
        tags: ['genomics', 'gene-expression', 'molecular-biology', 'medical'],
        relevanceScore: 0.82
      },
      {
        id: 'pubmed-clinical',
        name: 'ClinicalTrials.gov Dataset',
        description: 'Clinical study information and results',
        source: 'pubmed',
        url: 'https://clinicaltrials.gov/',
        size: '10 GB',
        format: 'XML, JSON',
        downloads: 180000,
        lastUpdated: '2024-02-01',
        tags: ['clinical-trials', 'medical-research', 'health', 'pharmaceutical'],
        relevanceScore: 0.78
      },
      // NASA Earthdata
      {
        id: 'nasa-climate',
        name: 'NASA Climate Data',
        description: 'Global climate and atmospheric data from satellites',
        source: 'nasa',
        url: 'https://earthdata.nasa.gov/',
        size: '100 TB+',
        format: 'NetCDF, HDF5, CSV',
        downloads: 95000,
        lastUpdated: '2024-02-10',
        tags: ['climate', 'environmental', 'satellite', 'atmospheric'],
        relevanceScore: 0.68
      },
      {
        id: 'nasa-landsat',
        name: 'Landsat Satellite Imagery',
        description: 'Earth observation satellite imagery since 1970s',
        source: 'nasa',
        url: 'https://earthdata.nasa.gov/landsat',
        size: '500 TB+',
        format: 'GeoTIFF, HDF5',
        downloads: 76000,
        lastUpdated: '2024-01-25',
        tags: ['satellite', 'earth-observation', 'remote-sensing', 'imagery'],
        relevanceScore: 0.71
      },
      // NOAA Data
      {
        id: 'noaa-weather',
        name: 'NOAA Weather Data',
        description: 'Historical and real-time weather data from stations worldwide',
        source: 'noaa',
        url: 'https://www.ncdc.noaa.gov/data-access/',
        size: '20 TB',
        format: 'CSV, JSON, XML',
        downloads: 125000,
        lastUpdated: '2024-02-08',
        tags: ['weather', 'climate', 'meteorological', 'atmospheric'],
        relevanceScore: 0.66
      },
      {
        id: 'noaa-ocean',
        name: 'NOAA Ocean Data',
        description: 'Ocean temperature, salinity, and marine ecosystem data',
        source: 'noaa',
        url: 'https://www.ncei.noaa.gov/data/access/ocean-data',
        size: '15 TB',
        format: 'NetCDF, CSV',
        downloads: 89000,
        lastUpdated: '2024-01-30',
        tags: ['ocean', 'marine', 'temperature', 'salinity'],
        relevanceScore: 0.64
      },
      // World Bank Data
      {
        id: 'worldbank-economic',
        name: 'World Bank Development Indicators',
        description: 'Economic and development indicators for all countries',
        source: 'worldbank',
        url: 'https://data.worldbank.org/',
        size: '5 GB',
        format: 'CSV, JSON, XML',
        downloads: 450000,
        lastUpdated: '2024-01-15',
        tags: ['economics', 'development', 'indicators', 'global'],
        relevanceScore: 0.73
      },
      // IMDb Datasets
      {
        id: 'imdb-movies',
        name: 'IMDb Titles Dataset',
        description: 'Complete movie and TV show metadata with ratings',
        source: 'imdb',
        url: 'https://www.imdb.com/interfaces/',
        size: '1.2 GB',
        format: 'TSV, JSON',
        downloads: 680000,
        lastUpdated: '2024-02-01',
        tags: ['entertainment', 'movies', 'tv-shows', 'recommendation'],
        relevanceScore: 0.81
      },
      // Government Open Data
      {
        id: 'data-gov-us',
        name: 'Data.gov US Federal',
        description: 'US government datasets across hundreds of topics',
        source: 'government',
        url: 'https://www.data.gov/',
        size: '10 TB+',
        format: 'CSV, JSON, XML, KML',
        downloads: 230000,
        lastUpdated: '2024-02-05',
        tags: ['government', 'federal', 'public-data', 'us'],
        relevanceScore: 0.60
      },
      {
        id: 'data-gov-india',
        name: 'Data.gov India',
        description: 'Indian government datasets across various sectors',
        source: 'government',
        url: 'https://data.gov.in/',
        size: '2 TB',
        format: 'CSV, JSON, XML',
        downloads: 78000,
        lastUpdated: '2024-01-28',
        tags: ['government', 'india', 'public-data', 'sectors'],
        relevanceScore: 0.62
      },
      {
        id: 'eu-open-data',
        name: 'EU Open Data Portal',
        description: 'European Union institutions and agencies data',
        source: 'government',
        url: 'https://data.europa.eu/euodp/en/data/',
        size: '8 TB',
        format: 'CSV, JSON, XML',
        downloads: 156000,
        lastUpdated: '2024-02-03',
        tags: ['government', 'european-union', 'institutions', 'agencies'],
        relevanceScore: 0.61
      },
      // Papers With Code (AI Specific)
      {
        id: 'pwc-imageNet',
        name: 'ImageNet',
        description: 'Large-scale image dataset for computer vision research',
        source: 'papers-with-code',
        url: 'https://paperswithcode.com/dataset/imagenet',
        size: '150 GB',
        format: 'JPEG, CSV',
        downloads: 3200000,
        lastUpdated: '2024-01-20',
        tags: ['computer-vision', 'image-classification', 'deep-learning', 'benchmark'],
        relevanceScore: 0.92
      },
      {
        id: 'pwc-coco',
        name: 'COCO Dataset',
        description: 'Common Objects in Context - object detection and segmentation',
        source: 'papers-with-code',
        url: 'https://paperswithcode.com/dataset/coco',
        size: '25 GB',
        format: 'JSON, JPEG',
        downloads: 1850000,
        lastUpdated: '2024-01-18',
        tags: ['object-detection', 'segmentation', 'computer-vision', 'benchmark'],
        relevanceScore: 0.90
      },
      {
        id: 'pwc-glue',
        name: 'GLUE Benchmark',
        description: 'General Language Understanding Evaluation benchmark',
        source: 'papers-with-code',
        url: 'https://paperswithcode.com/dataset/glue',
        size: '2 GB',
        format: 'CSV, JSON',
        downloads: 890000,
        lastUpdated: '2024-01-22',
        tags: ['nlp', 'benchmark', 'language-understanding', 'evaluation'],
        relevanceScore: 0.87
      }
    ]

    // Enhanced relevance filtering based on research idea - STRICT MODE
    const relevantDatasets = allDatasets
      .filter(dataset => {
        const datasetText = `${dataset.name} ${dataset.description} ${dataset.tags.join(' ')} ${dataset.source}`.toLowerCase()
        
        // Calculate relevance score based on enhanced keyword matches
        let score = 0
        let hasDirectMatch = false
        let hasHighRelevance = false
        
        finalKeywords.forEach(keyword => {
          // Exact keyword matches in name/description get highest score
          if (dataset.name.toLowerCase().includes(keyword) || dataset.description.toLowerCase().includes(keyword)) {
            score += 3
            hasDirectMatch = true
            hasHighRelevance = true
          }
          // Tag matches get medium score
          else if (dataset.tags.some(tag => tag.toLowerCase().includes(keyword))) {
            score += 2
            hasHighRelevance = true
          }
          // Partial matches get low score only if they're meaningful
          else if (datasetText.includes(keyword) && keyword.length > 3) {
            score += 1
          }
        })
        
        // STRICT FILTERING: Only return datasets that meet high relevance criteria
        // Must have either direct match OR multiple tag/partial matches
        return hasHighRelevance && score >= 2
      })
      .map(dataset => {
        // Calculate final relevance score with enhanced weighting
        const directMatches = finalKeywords.filter(k => 
          dataset.name.toLowerCase().includes(k) || 
          dataset.description.toLowerCase().includes(k)
        ).length
        const tagMatches = finalKeywords.filter(k => 
          dataset.tags.some(tag => tag.toLowerCase().includes(k))
        ).length
        
        // Higher bonus for direct matches
        const finalScore = Math.min(
          dataset.relevanceScore + (directMatches * 0.2) + (tagMatches * 0.1),
          1.0
        )
        
        return {
          ...dataset,
          relevanceScore: finalScore
        }
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6) // Only top 6 most relevant

    return relevantDatasets.length > 0 ? relevantDatasets : []
  }

  const getGeneralDatasets = async (): Promise<Dataset[]> => {
    // Return popular general datasets when no research idea
    const allDatasets: Dataset[] = [
      // Hugging Face Datasets
      {
        id: 'hf-imdb',
        name: 'IMDB Movie Reviews',
        description: 'Large movie review dataset for sentiment analysis and text classification',
        source: 'huggingface',
        url: 'https://huggingface.co/datasets/imdb',
        size: '84 MB',
        format: 'CSV, JSON',
        downloads: 1250000,
        lastUpdated: '2024-01-15',
        tags: ['nlp', 'sentiment-analysis', 'text-classification'],
        relevanceScore: 0.9
      },
      {
        id: 'hf-cifar10',
        name: 'CIFAR-10',
        description: 'Collection of images with 10 classes, used in computer vision research',
        source: 'huggingface',
        url: 'https://huggingface.co/datasets/cifar10',
        size: '170 MB',
        format: 'PNG, CSV',
        downloads: 2100000,
        lastUpdated: '2024-02-01',
        tags: ['computer-vision', 'image-classification'],
        relevanceScore: 0.85
      },
      // Kaggle Datasets
      {
        id: 'kg-titanic',
        name: 'Titanic - Machine Learning from Disaster',
        description: 'Classic dataset for binary classification and feature engineering',
        source: 'kaggle',
        url: 'https://www.kaggle.com/c/titanic',
        size: '59 KB',
        format: 'CSV',
        downloads: 3500000,
        lastUpdated: '2023-12-20',
        tags: ['classification', 'feature-engineering', 'beginner'],
        relevanceScore: 0.7
      },
      {
        id: 'kg-house-prices',
        name: 'House Prices - Advanced Regression Techniques',
        description: 'Predict house prices based on various features',
        source: 'kaggle',
        url: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques',
        size: '450 KB',
        format: 'CSV',
        downloads: 2800000,
        lastUpdated: '2024-01-10',
        tags: ['regression', 'real-estate', 'feature-engineering'],
        relevanceScore: 0.8
      },
      // UCI Datasets
      {
        id: 'uci-iris',
        name: 'Iris Dataset',
        description: 'Classic multiclass classification dataset with flower measurements',
        source: 'uci',
        url: 'https://archive.ics.uci.edu/ml/datasets/iris',
        size: '4 KB',
        format: 'CSV',
        downloads: 1500000,
        lastUpdated: '2023-11-15',
        tags: ['classification', 'multiclass', 'biology'],
        relevanceScore: 0.75
      },
      {
        id: 'uci-wine',
        name: 'Wine Quality Dataset',
        description: 'Wine quality ratings based on physicochemical tests',
        source: 'uci',
        url: 'https://archive.ics.uci.edu/ml/datasets/wine+quality',
        size: '254 KB',
        format: 'CSV',
        downloads: 980000,
        lastUpdated: '2023-10-30',
        tags: ['regression', 'classification', 'chemistry'],
        relevanceScore: 0.72
      }
    ]
    
    return allDatasets.slice(0, 6)
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'huggingface': return '🤗'
      case 'kaggle': return '🏆'
      case 'uci': return '🏛️'
      case 'government': return '🏛️'
      case 'domain-specific': return '🔬'
      case 'pubmed': return '🧬'
      case 'nasa': return '🛰️'
      case 'noaa': return '🌊'
      case 'worldbank': return '🌍'
      case 'imdb': return '🎬'
      case 'papers-with-code': return '📜'
      default: return '📊'
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'huggingface': return 'text-yellow-600 dark:text-yellow-400'
      case 'kaggle': return 'text-blue-600 dark:text-blue-400'
      case 'uci': return 'text-purple-600 dark:text-purple-400'
      case 'government': return 'text-green-600 dark:text-green-400'
      case 'domain-specific': return 'text-red-600 dark:text-red-400'
      case 'pubmed': return 'text-pink-600 dark:text-pink-400'
      case 'nasa': return 'text-indigo-600 dark:text-indigo-400'
      case 'noaa': return 'text-cyan-600 dark:text-cyan-400'
      case 'worldbank': return 'text-orange-600 dark:text-orange-400'
      case 'imdb': return 'text-amber-600 dark:text-amber-400'
      case 'papers-with-code': return 'text-teal-600 dark:text-teal-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Finding relevant datasets...</p>
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
          <span className="text-2xl">📊</span>
          Public Datasets for Your Research
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Curated datasets from Hugging Face, Kaggle, UCI, government portals, and domain-specific repositories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets.map((dataset) => (
          <div key={dataset.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSourceIcon(dataset.source)}</span>
                <h4 className="font-semibold text-slate-900 dark:text-white">{dataset.name}</h4>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full bg-white dark:bg-slate-900 ${getSourceColor(dataset.source)}`}>
                {dataset.source}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
              {dataset.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {dataset.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>📦 {dataset.size}</span>
                <span>📁 {dataset.format}</span>
                <span>⬇️ {(dataset.downloads / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⭐ {dataset.relevanceScore.toFixed(2)}</span>
                <a
                  href={dataset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {datasets.length === 0 && !loading && autoSearched && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <span className="text-4xl mb-4 block">📊</span>
          <p className="mb-2">No relevant datasets found for your research idea</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Try using different keywords or broadening your search terms
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-4">
            Note: Only shows datasets from academic databases. No fake or placeholder datasets are displayed.
          </p>
        </div>
      )}
      
      {datasets.length === 0 && loading && autoSearched && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="mb-2">🔍 Searching datasets for your research...</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Finding relevant datasets related to "{researchIdea}"
          </p>
        </div>
      )}
    </div>
  )
}
