import React from 'react'

interface Methodology {
  id: string
  name: string
  description: string
  type: 'quantitative' | 'qualitative' | 'mixed'
  category: 'experimental' | 'observational' | 'theoretical' | 'computational' | 'review'
  suitability: number
  requirements: string[]
  strengths: string[]
  limitations: string[]
  examples: string[]
  complexity: 'low' | 'medium' | 'high'
  timeframe: string
}

interface MethodologyRecommendationsProps {
  researchIdea: string
  forgeResult?: any
  selectedPapers?: any[]
}

export default function MethodologyRecommendations({ researchIdea, forgeResult, selectedPapers }: MethodologyRecommendationsProps) {
  const [methodologies, setMethodologies] = React.useState<Methodology[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (researchIdea && researchIdea.trim()) {
      fetchMethodologies(researchIdea)
    } else {
      // Don't show methodologies when no research idea
      setMethodologies([])
    }
  }, [researchIdea])

  const fetchMethodologies = async (idea: string) => {
    setLoading(true)
    setError('')
    
    try {
      const relevantMethodologies = await getRelevantMethodologies(idea)
      setMethodologies(relevantMethodologies)
    } catch (err) {
      console.error('Error fetching methodologies:', err)
      setError('Failed to fetch methodology recommendations')
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneralMethodologies = async () => {
    setLoading(true)
    setError('')
    
    try {
      const generalMethodologies = await getGeneralMethodologies()
      setMethodologies(generalMethodologies)
    } catch (err) {
      console.error('Error fetching general methodologies:', err)
      setError('Failed to fetch methodology recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getRelevantMethodologies = async (idea: string): Promise<Methodology[]> => {
    const keywords = idea.toLowerCase().split(' ')
    
    const allMethodologies: Methodology[] = [
      {
        id: 'systematic-review',
        name: 'Systematic Literature Review',
        description: 'Comprehensive, structured review of existing literature using predefined protocols',
        type: 'mixed',
        category: 'review',
        suitability: 0.85,
        requirements: ['Clear research question', 'Search strategy', 'Inclusion/exclusion criteria', 'Quality assessment'],
        strengths: ['Comprehensive coverage', 'Reproducible methodology', 'Evidence synthesis', 'Identifies research gaps'],
        limitations: ['Time-consuming', 'Requires large literature base', 'Publication bias', 'Limited to existing research'],
        examples: ['Cochrane reviews', 'PRISMA-guided reviews', 'Meta-analyses'],
        complexity: 'high',
        timeframe: '6-12 months'
      },
      {
        id: 'controlled-experiment',
        name: 'Controlled Experiment',
        description: 'Scientific test with controlled variables to determine cause-effect relationships',
        type: 'quantitative',
        category: 'experimental',
        suitability: 0.90,
        requirements: ['Hypothesis', 'Control group', 'Experimental group', 'Randomization', 'Statistical power analysis'],
        strengths: ['Causal inference', 'High internal validity', 'Replicable', 'Statistical rigor'],
        limitations: ['Artificial environment', 'Limited generalizability', 'Ethical constraints', 'Resource intensive'],
        examples: ['A/B testing', 'Clinical trials', 'Laboratory experiments'],
        complexity: 'medium',
        timeframe: '3-6 months'
      },
      {
        id: 'survey-research',
        name: 'Survey Research',
        description: 'Collection of data from respondents through questionnaires or interviews',
        type: 'mixed',
        category: 'observational',
        suitability: 0.75,
        requirements: ['Target population', 'Sampling frame', 'Validated instrument', 'Response rate considerations'],
        strengths: ['Large sample sizes', 'Cost-effective', 'Generalizable', 'Quantifiable data'],
        limitations: ['Self-reporting bias', 'Limited depth', 'Response rates', 'Superficial insights'],
        examples: ['Cross-sectional surveys', 'Longitudinal surveys', 'Online questionnaires'],
        complexity: 'low',
        timeframe: '2-4 months'
      },
      {
        id: 'case-study',
        name: 'Case Study Research',
        description: 'In-depth investigation of a single case or multiple cases in real-world context',
        type: 'qualitative',
        category: 'observational',
        suitability: 0.70,
        requirements: ['Clear case definition', 'Multiple data sources', 'Theoretical framework', 'Triangulation'],
        strengths: ['Real-world context', 'Detailed insights', 'Theory building', 'Practical relevance'],
        limitations: ['Limited generalizability', 'Researcher bias', 'Time intensive', 'Small sample size'],
        examples: ['Single case studies', 'Multiple case studies', 'Instrumental case studies'],
        complexity: 'medium',
        timeframe: '4-8 months'
      },
      {
        id: 'benchmark-evaluation',
        name: 'Benchmark Evaluation',
        description: 'Comparative assessment of methods or systems using standardized datasets and metrics',
        type: 'quantitative',
        category: 'computational',
        suitability: 0.95,
        requirements: ['Baseline methods', 'Standardized datasets', 'Evaluation metrics', 'Statistical significance testing'],
        strengths: ['Objective comparison', 'Reproducible results', 'Performance metrics', 'Community standards'],
        limitations: ['Dataset dependent', 'Metric limitations', 'Overfitting risk', 'Scope constraints'],
        examples: ['Algorithm benchmarks', 'System performance tests', 'Comparative studies'],
        complexity: 'medium',
        timeframe: '3-5 months'
      },
      {
        id: 'ethnographic-study',
        name: 'Ethnographic Study',
        description: 'Immersive observation and participation in a social setting to understand behavior and culture',
        type: 'qualitative',
        category: 'observational',
        suitability: 0.65,
        requirements: ['Field access', 'Participant observation', 'Field notes', 'Cultural sensitivity'],
        strengths: ['Deep cultural insights', 'Natural behavior', 'Contextual understanding', 'Rich data'],
        limitations: ['Time intensive', 'Limited generalizability', 'Researcher bias', 'Access challenges'],
        examples: ['Participant observation', 'Field studies', 'Cultural anthropology'],
        complexity: 'high',
        timeframe: '8-12 months'
      },
      {
        id: 'simulation-study',
        name: 'Simulation Study',
        description: 'Computer-based modeling of real-world systems to understand behavior and test interventions',
        type: 'quantitative',
        category: 'computational',
        suitability: 0.80,
        requirements: ['Validated model', 'Computational resources', 'Parameter calibration', 'Sensitivity analysis'],
        strengths: ['Cost-effective', 'Controlled environment', 'Scenario testing', 'Risk-free experimentation'],
        limitations: ['Model validity', 'Computational complexity', 'Assumption dependence', 'Limited realism'],
        examples: ['Monte Carlo simulations', 'Agent-based models', 'System dynamics'],
        complexity: 'high',
        timeframe: '4-6 months'
      },
      {
        id: 'delphi-study',
        name: 'Delphi Study',
        description: 'Structured communication process with expert panel to achieve consensus',
        type: 'mixed',
        category: 'observational',
        suitability: 0.72,
        requirements: ['Expert panel', 'Anonymized responses', 'Iterative rounds', 'Statistical aggregation'],
        strengths: ['Expert consensus', 'Anonymized process', 'Structured approach', 'Reliability'],
        limitations: ['Expert availability', 'Time consuming', 'Potential bias', 'Limited to expert opinions'],
        examples: ['Technology forecasting', 'Policy development', 'Consensus building'],
        complexity: 'medium',
        timeframe: '3-5 months'
      },
      {
        id: 'quasi-experiment',
        name: 'Quasi-Experimental Design',
        description: 'Research design that tests causal hypotheses without random assignment',
        type: 'quantitative',
        category: 'experimental',
        suitability: 0.78,
        requirements: ['Comparison groups', 'Pre-post measurements', 'Statistical controls', 'Validity threats'],
        strengths: ['Real-world settings', 'Causal inference', 'Practical relevance', 'Ethical feasibility'],
        limitations: ['Selection bias', 'Confounding variables', 'Limited internal validity', 'Statistical complexity'],
        examples: ['Natural experiments', 'Interrupted time series', 'Nonequivalent groups'],
        complexity: 'medium',
        timeframe: '4-6 months'
      },
      {
        id: 'meta-analysis',
        name: 'Meta-Analysis',
        description: 'Statistical synthesis of results from multiple independent studies',
        type: 'quantitative',
        category: 'review',
        suitability: 0.88,
        requirements: ['Multiple studies', 'Effect size data', 'Statistical expertise', 'Homogeneity assessment'],
        strengths: ['Statistical power', 'Effect size estimation', 'Generalizability', 'Evidence synthesis'],
        limitations: ['Publication bias', 'Study heterogeneity', 'Quality dependence', 'Statistical complexity'],
        examples: ['Effect size meta-analysis', 'Meta-regression', 'Network meta-analysis'],
        complexity: 'high',
        timeframe: '6-9 months'
      },
      {
        id: 'grounded-theory',
        name: 'Grounded Theory',
        description: 'Systematic generation of theory from data through iterative data collection and analysis',
        type: 'qualitative',
        category: 'observational',
        suitability: 0.68,
        requirements: ['Theoretical sampling', 'Constant comparison', 'Memo writing', 'Theoretical saturation'],
        strengths: ['Theory generation', 'Data-driven', 'Iterative process', 'Rich insights'],
        limitations: ['Time intensive', 'Researcher dependent', 'Limited generalizability', 'Complex analysis'],
        examples: ['Healthcare research', 'Organizational studies', 'Social research'],
        complexity: 'high',
        timeframe: '8-12 months'
      },
      {
        id: 'rct',
        name: 'Randomized Controlled Trial (RCT)',
        description: 'Gold standard experimental design with random assignment to treatment and control groups',
        type: 'quantitative',
        category: 'experimental',
        suitability: 0.92,
        requirements: ['Randomization', 'Control group', 'Blinding', 'Sample size calculation', 'Ethical approval'],
        strengths: ['Causal inference', 'High internal validity', 'Bias minimization', 'Statistical rigor'],
        limitations: ['Costly', 'Ethical constraints', 'Artificial settings', 'Limited external validity'],
        examples: ['Clinical trials', 'Educational interventions', 'Policy evaluations'],
        complexity: 'high',
        timeframe: '6-12 months'
      }
    ]

    // Filter and rank methodologies based on relevance to research idea
    const relevantMethodologies = allMethodologies
      .filter(methodology => {
        const ideaLower = idea.toLowerCase()
        const methodText = `${methodology.name} ${methodology.description} ${methodology.requirements.join(' ')} ${methodology.examples.join(' ')}`.toLowerCase()
        return keywords.some(keyword => methodText.includes(keyword))
      })
      .sort((a, b) => b.suitability - a.suitability)
      .slice(0, 8)

    return relevantMethodologies.length > 0 ? relevantMethodologies : allMethodologies.slice(0, 6)
  }

  const getGeneralMethodologies = async (): Promise<Methodology[]> => {
    // Return common methodologies when no research idea
    const allMethodologies: Methodology[] = [
      {
        id: 'systematic-review',
        name: 'Systematic Literature Review',
        description: 'Comprehensive, structured review of existing literature using predefined protocols',
        type: 'mixed',
        category: 'review',
        suitability: 0.85,
        requirements: ['Clear research question', 'Search strategy', 'Inclusion/exclusion criteria', 'Quality assessment'],
        strengths: ['Comprehensive coverage', 'Reproducible methodology', 'Evidence synthesis', 'Identifies research gaps'],
        limitations: ['Time-consuming', 'Requires large literature base', 'Publication bias', 'Limited to existing research'],
        examples: ['Cochrane reviews', 'PRISMA-guided reviews', 'Meta-analyses'],
        complexity: 'high',
        timeframe: '6-12 months'
      },
      {
        id: 'controlled-experiment',
        name: 'Controlled Experiment',
        description: 'Scientific test with controlled variables to determine cause-effect relationships',
        type: 'quantitative',
        category: 'experimental',
        suitability: 0.90,
        requirements: ['Hypothesis', 'Control group', 'Experimental group', 'Randomization', 'Statistical power analysis'],
        strengths: ['Causal inference', 'High internal validity', 'Replicable', 'Statistical rigor'],
        limitations: ['Artificial environment', 'Limited generalizability', 'Ethical constraints', 'Resource intensive'],
        examples: ['A/B testing', 'Clinical trials', 'Laboratory experiments'],
        complexity: 'medium',
        timeframe: '3-6 months'
      },
      {
        id: 'survey-research',
        name: 'Survey Research',
        description: 'Collection of data from respondents through questionnaires or interviews',
        type: 'mixed',
        category: 'observational',
        suitability: 0.75,
        requirements: ['Target population', 'Sampling frame', 'Validated instrument', 'Response rate considerations'],
        strengths: ['Large sample sizes', 'Cost-effective', 'Generalizable', 'Quantifiable data'],
        limitations: ['Self-reporting bias', 'Limited depth', 'Response rates', 'Superficial insights'],
        examples: ['Cross-sectional surveys', 'Longitudinal surveys', 'Online questionnaires'],
        complexity: 'low',
        timeframe: '2-4 months'
      },
      {
        id: 'case-study',
        name: 'Case Study Research',
        description: 'In-depth investigation of a single case or multiple cases in real-world context',
        type: 'qualitative',
        category: 'observational',
        suitability: 0.70,
        requirements: ['Clear case definition', 'Multiple data sources', 'Theoretical framework', 'Triangulation'],
        strengths: ['Real-world context', 'Detailed insights', 'Theory building', 'Practical relevance'],
        limitations: ['Limited generalizability', 'Researcher bias', 'Time intensive', 'Small sample size'],
        examples: ['Single case studies', 'Multiple case studies', 'Instrumental case studies'],
        complexity: 'medium',
        timeframe: '4-8 months'
      },
      {
        id: 'benchmark-evaluation',
        name: 'Benchmark Evaluation',
        description: 'Comparative assessment of methods or systems using standardized datasets and metrics',
        type: 'quantitative',
        category: 'computational',
        suitability: 0.95,
        requirements: ['Baseline methods', 'Standardized datasets', 'Evaluation metrics', 'Statistical significance testing'],
        strengths: ['Objective comparison', 'Reproducible results', 'Performance metrics', 'Community standards'],
        limitations: ['Dataset dependent', 'Metric limitations', 'Overfitting risk', 'Scope constraints'],
        examples: ['Algorithm benchmarks', 'System performance tests', 'Comparative studies'],
        complexity: 'medium',
        timeframe: '3-5 months'
      },
      {
        id: 'simulation-study',
        name: 'Simulation Study',
        description: 'Computer-based modeling of real-world systems to understand behavior and test interventions',
        type: 'quantitative',
        category: 'computational',
        suitability: 0.80,
        requirements: ['Validated model', 'Computational resources', 'Parameter calibration', 'Sensitivity analysis'],
        strengths: ['Cost-effective', 'Controlled environment', 'Scenario testing', 'Risk-free experimentation'],
        limitations: ['Model validity', 'Computational complexity', 'Assumption dependence', 'Limited realism'],
        examples: ['Monte Carlo simulations', 'Agent-based models', 'System dynamics'],
        complexity: 'high',
        timeframe: '4-6 months'
      }
    ]
    
    return allMethodologies.slice(0, 6)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quantitative': return '📊'
      case 'qualitative': return '💬'
      case 'mixed': return '🔄'
      default: return '📋'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experimental': return '🧪'
      case 'observational': return '👁️'
      case 'theoretical': return '🧠'
      case 'computational': return '💻'
      case 'review': return '📚'
      default: return '📋'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getSuitabilityColor = (suitability: number) => {
    if (suitability >= 0.85) return 'text-emerald-600 dark:text-emerald-400'
    if (suitability >= 0.75) return 'text-blue-600 dark:text-blue-400'
    if (suitability >= 0.65) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Analyzing research methodologies...</p>
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
          <span className="text-2xl">🔬</span>
          Recommended Research Methodologies
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Most appropriate research methods based on your domain and specific problem
        </p>
      </div>

      <div className="space-y-4">
        {methodologies.map((methodology) => (
          <div key={methodology.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getTypeIcon(methodology.type)}</span>
                <span className="text-lg">{getCategoryIcon(methodology.category)}</span>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{methodology.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {methodology.type} • {methodology.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getComplexityColor(methodology.complexity)}`}>
                  {methodology.complexity}
                </span>
                <span className={`text-sm font-medium ${getSuitabilityColor(methodology.suitability)}`}>
                  {(methodology.suitability * 100).toFixed(0)}% fit
                </span>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {methodology.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Requirements:</h5>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {methodology.requirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="text-emerald-500">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Strengths:</h5>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {methodology.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="text-blue-500">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>⏱️ {methodology.timeframe}</span>
                <span>📝 {methodology.examples[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600 dark:text-amber-400">⚠️ {methodology.limitations[0]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {methodologies.length === 0 && !loading && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <span className="text-4xl mb-4 block">🔬</span>
          <p>Enter a research idea in the Forge module to see relevant research methodologies.</p>
          <p className="text-sm mt-2">Methods will be matched based on your research problem and domain.</p>
        </div>
      )}
    </div>
  )
}
