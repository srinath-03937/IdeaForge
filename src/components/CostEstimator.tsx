import React, { useState } from 'react'
import { Calculator, DollarSign, Clock, Users, Package, AlertCircle, TrendingUp, Settings, Code, Smartphone, Globe, Server } from 'lucide-react'

interface CostBreakdown {
  category: string
  estimatedCost: number
  description: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
  factors: string[]
  specificCosts: Array<{ item: string; cost: number; reason: string }>
}

interface CostEstimationProps {
  idea: string
  forgeResult?: any
  selectedPapers?: any[]
  patents?: any[]
}

export default function CostEstimator({ idea, forgeResult, selectedPapers = [], patents = [] }: CostEstimationProps) {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>('USD')
  const [timeframe, setTimeframe] = useState<'1-month' | '3-months' | '6-months' | '1-year'>('3-months')
  const [teamSize, setTeamSize] = useState<'1-person' | '2-3-people' | '4-6-people' | '7+-people'>('2-3-people')
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate')
  const [platform, setPlatform] = useState<'web' | 'mobile' | 'web+mobile'>('web')

  // Dynamic cost calculation with specific itemized costs
  const calculateCosts = (): CostBreakdown[] => {
    const baseCosts = {
      '1-month': { USD: 500, EUR: 450, GBP: 400, INR: 40000 },
      '3-months': { USD: 1200, EUR: 1080, GBP: 960, INR: 96000 },
      '6-months': { USD: 2000, EUR: 1800, GBP: 1600, INR: 160000 },
      '1-year': { USD: 3500, EUR: 3150, GBP: 2800, INR: 280000 }
    }

    const complexityMultipliers = {
      'simple': 0.6,
      'moderate': 1,
      'complex': 1.8
    }

    const platformMultipliers = {
      'web': 1,
      'mobile': 1.4,
      'web+mobile': 2.2
    }

    const baseCost = baseCosts[timeframe][currency] * complexityMultipliers[complexity] * platformMultipliers[platform]

    // Dynamic factors based on project context
    const hasResearchPapers = selectedPapers.length > 0
    const hasPatents = patents.length > 0
    const hasComplexAnalysis = forgeResult?.result?.technical?.complexity === 'high'

    const costs: CostBreakdown[] = [
      {
        category: 'Development Tools & Software',
        estimatedCost: baseCost * 0.25,
        description: 'IDE licenses, design tools, version control, development software',
        icon: <Code className="w-5 h-5" />,
        priority: 'high',
        factors: [
          platform === 'mobile' ? 'Mobile development tools' : 'Web development tools',
          complexity === 'complex' ? 'Advanced IDE licenses' : 'Free IDE options',
          timeframe === '1-year' ? 'Annual software subscriptions' : 'Monthly tool costs'
        ],
        specificCosts: getSpecificToolCosts(platform, complexity, timeframe, currency)
      },
      {
        category: 'API Services & Subscriptions',
        estimatedCost: baseCost * 0.30,
        description: 'Third-party APIs, cloud services, database hosting',
        icon: <Globe className="w-5 h-5" />,
        priority: 'high',
        factors: [
          hasPatents ? 'Patent database APIs' : 'Standard API subscriptions',
          hasResearchPapers ? 'Research data APIs' : 'Basic API costs',
          complexity === 'complex' ? 'Multiple API integrations' : 'Limited API usage'
        ],
        specificCosts: getSpecificAPICosts(complexity, timeframe, currency, hasResearchPapers, hasPatents)
      },
      {
        category: 'Cloud Infrastructure',
        estimatedCost: baseCost * 0.20,
        description: 'Hosting, servers, storage, CDN services',
        icon: <Server className="w-5 h-5" />,
        priority: 'medium',
        factors: [
          platform === 'web+mobile' ? 'Multi-platform hosting' : 'Single platform hosting',
          complexity === 'complex' ? 'Advanced infrastructure' : 'Basic cloud setup',
          timeframe === '1-year' ? 'Annual cloud contracts' : 'Pay-as-you-go pricing'
        ],
        specificCosts: getSpecificInfrastructureCosts(platform, complexity, timeframe, currency)
      },
      {
        category: 'Hardware & Equipment',
        estimatedCost: baseCost * 0.15,
        description: 'Development devices, testing equipment, accessories',
        icon: <Package className="w-5 h-5" />,
        priority: 'medium',
        factors: [
          platform === 'mobile' ? 'Mobile testing devices' : 'Development computer',
          complexity === 'complex' ? 'Advanced testing equipment' : 'Basic hardware setup',
          platform === 'web+mobile' ? 'Cross-platform testing devices' : 'Single platform devices'
        ],
        specificCosts: getSpecificHardwareCosts(platform, complexity, currency)
      },
      {
        category: 'Domain & Security',
        estimatedCost: baseCost * 0.10,
        description: 'Domain names, SSL certificates, security tools',
        icon: <Calculator className="w-5 h-5" />,
        priority: 'low',
        factors: [
          platform === 'web+mobile' ? 'Multiple domains' : 'Single domain',
          complexity === 'complex' ? 'Advanced security tools' : 'Basic SSL certificates',
          timeframe === '1-year' ? 'Multi-year domain registration' : 'Annual domain costs'
        ],
        specificCosts: getSpecificDomainCosts(platform, complexity, timeframe, currency)
      }
    ]

    return costs
  }

  // Specific cost breakdowns for each category
  const getSpecificToolCosts = (platform: string, complexity: string, timeframe: string, currency: string) => {
    const costs = [
      { item: 'VS Code (Free)', cost: 0, reason: 'Free IDE with extensions' },
      { item: 'Git Version Control', cost: 0, reason: 'Free version control system' },
      { item: 'GitHub (Free Tier)', cost: 0, reason: 'Free code hosting and collaboration' },
    ]

    if (platform === 'mobile') {
      costs.push(
        { item: 'Android Studio', cost: 0, reason: 'Free Android development IDE' },
        { item: 'Xcode (Mac Required)', cost: currency === 'USD' ? 999 : currency === 'INR' ? 89990 : 999, reason: 'Required for iOS development, one-time Mac purchase' }
      )
    }

    if (complexity === 'complex') {
      costs.push(
        { item: 'JetBrains IDE (1 Year)', cost: currency === 'USD' ? 199 : currency === 'INR' ? 15990 : 179, reason: 'Advanced IDE with debugging tools' },
        { item: 'Design Software', cost: currency === 'USD' ? 20 : currency === 'INR' ? 1599 : 18, reason: 'Figma Pro or Adobe Creative Cloud monthly' }
      )
    }

    if (timeframe === '1-year') {
      costs.push(
        { item: 'Development Tools Subscription', cost: currency === 'USD' ? 100 : currency === 'INR' ? 7999 : 90, reason: 'Annual subscription for premium tools' }
      )
    }

    return costs
  }

  const getSpecificAPICosts = (complexity: string, timeframe: string, currency: string, hasResearch: boolean, hasPatents: boolean) => {
    const costs = [
      { item: 'Google Maps API', cost: currency === 'USD' ? 200 : currency === 'INR' ? 15999 : 180, reason: 'Mapping services, $200/month after free tier' },
      { item: 'Authentication Service', cost: currency === 'USD' ? 25 : currency === 'INR' ? 1999 : 23, reason: 'Auth0 or Firebase Auth monthly cost' },
      { item: 'Database Service', cost: currency === 'USD' ? 50 : currency === 'INR' ? 3999 : 45, reason: 'MongoDB Atlas or Supabase hosting' },
    ]

    if (complexity === 'complex') {
      costs.push(
        { item: 'Payment Gateway', cost: currency === 'USD' ? 30 : currency === 'INR' ? 2399 : 27, reason: 'Stripe or Braintree monthly fees' },
        { item: 'Email Service', cost: currency === 'USD' ? 20 : currency === 'INR' ? 1599 : 18, reason: 'SendGrid or Mailgun monthly cost' }
      )
    }

    if (hasResearch) {
      costs.push(
        { item: 'Research API Access', cost: currency === 'USD' ? 100 : currency === 'INR' ? 7999 : 90, reason: 'Access to research databases and APIs' }
      )
    }

    if (hasPatents) {
      costs.push(
        { item: 'Patent Database API', cost: currency === 'USD' ? 150 : currency === 'INR' ? 11999 : 135, reason: 'USPTO or Google Patents API access' }
      )
    }

    return costs
  }

  const getSpecificInfrastructureCosts = (platform: string, complexity: string, timeframe: string, currency: string) => {
    const costs = [
      { item: 'Cloud Hosting (Vercel/Netlify)', cost: currency === 'USD' ? 20 : currency === 'INR' ? 1599 : 18, reason: 'Pro hosting plan for better performance' },
      { item: 'Database Storage', cost: currency === 'USD' ? 25 : currency === 'INR' ? 1999 : 23, reason: 'Database hosting and backups' },
      { item: 'CDN Services', cost: currency === 'USD' ? 10 : currency === 'INR' ? 799 : 9, reason: 'Content delivery network for faster loading' },
    ]

    if (platform === 'web+mobile') {
      costs.push(
        { item: 'Mobile Backend Services', cost: currency === 'USD' ? 30 : currency === 'INR' ? 2399 : 27, reason: 'Backend-as-a-Service for mobile apps' }
      )
    }

    if (complexity === 'complex') {
      costs.push(
        { item: 'Load Balancer', cost: currency === 'USD' ? 40 : currency === 'INR' ? 3199 : 36, reason: 'Load balancing for high traffic' },
        { item: 'Advanced Monitoring', cost: currency === 'USD' ? 20 : currency === 'INR' ? 1599 : 18, reason: 'Datadog or New Relic monitoring' }
      )
    }

    if (timeframe === '1-year') {
      costs.push(
        { item: 'Annual Cloud Contract', cost: currency === 'USD' ? 100 : currency === 'INR' ? 7999 : 90, reason: 'Discounted annual cloud services' }
      )
    }

    return costs
  }

  const getSpecificHardwareCosts = (platform: string, complexity: string, currency: string) => {
    const costs = [
      { item: 'Development Computer Upgrade', cost: currency === 'USD' ? 500 : currency === 'INR' ? 39999 : 450, reason: 'RAM/SSD upgrade for better development performance' },
    ]

    if (platform === 'mobile') {
      costs.push(
        { item: 'Android Testing Device', cost: currency === 'USD' ? 200 : currency === 'INR' ? 15999 : 180, reason: 'Budget Android phone for testing' },
        { item: 'iOS Testing Device', cost: currency === 'USD' ? 300 : currency === 'INR' ? 23999 : 270, reason: 'Used iPhone for iOS testing' }
      )
    }

    if (complexity === 'complex') {
      costs.push(
        { item: 'Multiple Testing Devices', cost: currency === 'USD' ? 400 : currency === 'INR' ? 31999 : 360, reason: 'Various devices for compatibility testing' },
        { item: 'Development Accessories', cost: currency === 'USD' ? 100 : currency === 'INR' ? 7999 : 90, reason: 'Monitor, keyboard, mouse upgrades' }
      )
    }

    if (platform === 'web+mobile') {
      costs.push(
        { item: 'Cross-Platform Testing', cost: currency === 'USD' ? 300 : currency === 'INR' ? 23999 : 270, reason: 'Multiple devices for web and mobile testing' }
      )
    }

    return costs
  }

  const getSpecificDomainCosts = (platform: string, complexity: string, timeframe: string, currency: string) => {
    const costs = [
      { item: 'Domain Name (.com)', cost: currency === 'USD' ? 15 : currency === 'INR' ? 1199 : 14, reason: 'Annual domain registration' },
      { item: 'SSL Certificate', cost: currency === 'USD' ? 50 : currency === 'INR' ? 3999 : 45, reason: 'Annual SSL certificate for HTTPS' },
    ]

    if (platform === 'web+mobile') {
      costs.push(
        { item: 'Additional Domains', cost: currency === 'USD' ? 30 : currency === 'INR' ? 2399 : 27, reason: 'Mobile app domain and subdomains' }
      )
    }

    if (complexity === 'complex') {
      costs.push(
        { item: 'Advanced Security Tools', cost: currency === 'USD' ? 40 : currency === 'INR' ? 3199 : 36, reason: 'Security scanning and monitoring tools' },
        { item: 'Wildcard SSL', cost: currency === 'USD' ? 100 : currency === 'INR' ? 7999 : 90, reason: 'Wildcard SSL certificate for subdomains' }
      )
    }

    if (timeframe === '1-year') {
      costs.push(
        { item: 'Multi-Year Domain Registration', cost: currency === 'USD' ? 25 : currency === 'INR' ? 1999 : 23, reason: 'Discount for multi-year registration' }
      )
    }

    return costs
  }

  const costs = calculateCosts()
  const totalCost = costs.reduce((sum, cost) => sum + cost.estimatedCost, 0)

  const formatCurrency = (amount: number) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
    const locales = { USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', INR: 'en-IN' }
    
    return `${symbols[currency]}${amount.toLocaleString(locales[currency])}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/30'
    }
  }

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'simple': return 'text-green-600 dark:text-green-400'
      case 'moderate': return 'text-amber-600 dark:text-amber-400'
      case 'complex': return 'text-red-600 dark:text-red-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'web': return 'text-blue-600 dark:text-blue-400'
      case 'mobile': return 'text-purple-600 dark:text-purple-400'
      case 'web+mobile': return 'text-emerald-600 dark:text-emerald-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-500/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
          <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20} />
          💰 Application Building Cost Estimator
        </h3>
        
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> This calculator shows actual costs for building the prototype yourself (tools, APIs, hardware), 
            excluding external manpower, testing, deployment, and marketing costs.
          </p>
        </div>
        
        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Smartphone size={16} className="inline mr-1" />
              Platform Type
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="web">Web Application</option>
              <option value="mobile">Mobile App</option>
              <option value="web+mobile">Web + Mobile</option>
            </select>
          </div>

          {/* Timeframe Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Clock size={16} className="inline mr-1" />
              Development Timeline
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="1-month">1 Month</option>
              <option value="3-months">3 Months</option>
              <option value="6-months">6 Months</option>
              <option value="1-year">1 Year</option>
            </select>
          </div>

          {/* Complexity Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <AlertCircle size={16} className="inline mr-1" />
              Project Complexity
            </label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="simple">Simple</option>
              <option value="moderate">Moderate</option>
              <option value="complex">Complex</option>
            </select>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Development Cost</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalCost)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Development Timeline</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {timeframe.replace('-', ' ')}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Platform</p>
                <p className={`text-lg font-bold capitalize ${getPlatformColor(platform)}`}>
                  {platform === 'web+mobile' ? 'Web + Mobile' : platform}
                </p>
              </div>
              <Smartphone className="w-8 h-8 text-purple-500 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Development Cost Breakdown (Tools & Resources)</h4>
          {costs.map((cost, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {cost.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white">{cost.category}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{cost.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(cost.estimatedCost)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(cost.priority)}`}>
                    {cost.priority} priority
                  </span>
                </div>
              </div>
              
              {/* Specific Itemized Costs */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">Specific costs breakdown:</p>
                <div className="space-y-2">
                  {cost.specificCosts.map((itemCost, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between text-xs">
                      <div className="flex-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{itemCost.item}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">({itemCost.reason})</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {itemCost.cost === 0 ? 'Free' : formatCurrency(itemCost.cost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dynamic Factors */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Factors affecting cost:</p>
                <div className="flex flex-wrap gap-1">
                  {cost.factors.map((factor, factorIndex) => (
                    <span
                      key={factorIndex}
                      className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Optimization Tips */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Development Cost Optimization Tips</h5>
              <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                <li>• Use free development tools and open-source IDEs</li>
                <li>• Start with free API tiers and upgrade as needed</li>
                <li>• Use cloud services with pay-as-you-go pricing</li>
                <li>• Leverage free domains and SSL certificates where possible</li>
                <li>• Use existing hardware before buying new equipment</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resource Recommendations */}
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <h5 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Free & Low-Cost Resources</h5>
              <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                <li>• Development: VS Code, GitHub, GitLab (Free)</li>
                <li>• APIs: Many services offer generous free tiers</li>
                <li>• Hosting: Vercel, Netlify, Firebase free tiers</li>
                <li>• Design: Figma, Canva free versions</li>
                <li>• Learning: Free documentation and tutorials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
