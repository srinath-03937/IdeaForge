import React from 'react'
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react'
import { apiUsageTracker } from '../services/apiUsageService'

interface APIUsageDisplayProps {
  className?: string
}

export default function APIUsageDisplay({ className = '' }: APIUsageDisplayProps) {
  const [usage, setUsage] = React.useState(apiUsageTracker.getUsage())
  const [showDetails, setShowDetails] = React.useState(false)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setUsage(apiUsageTracker.getUsage())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const isNearLimit = apiUsageTracker.isNearLimit()
  const usagePercentage = apiUsageTracker.getUsagePercentage()

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 75) return 'text-orange-600 dark:text-orange-400'
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const formatTimeUntilReset = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const hoursUntilReset = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (hoursUntilReset > 24) {
      return `${Math.floor(hoursUntilReset / 24)} days`
    }
    
    const hours = hoursUntilReset % 24
    return `${hours}h`
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg p-4 border-2 border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
          API Usage
        </h4>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Warning Banner */}
      {(isNearLimit.gemini || isNearLimit.groq || isNearLimit.github) && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle size={16} />
            <span className="font-medium">
              {isNearLimit.gemini && 'Gemini API'} 
              {isNearLimit.groq && 'Groq API'} 
              {isNearLimit.github && 'GitHub API'} 
              {' approaching limits'}
            </span>
          </div>
        </div>
      )}

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Gemini API */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-slate-900 dark:text-white">Gemini AI</h5>
            <span className={`text-sm font-medium ${getUsageColor(usagePercentage.gemini)}`}>
              {usage.gemini.requests}/{usage.gemini.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(usagePercentage.gemini)}`}
              style={{ width: `${usagePercentage.gemini}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {usage.gemini.remainingRequests} requests left • {usage.gemini.totalCredits - usage.gemini.creditsUsed} credits left • Resets in {formatTimeUntilReset()}
          </div>
        </div>

        {/* Groq API */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-slate-900 dark:text-white">Groq</h5>
            <span className={`text-sm font-medium ${getUsageColor(usagePercentage.groq)}`}>
              {usage.groq.requests}/{usage.groq.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(usagePercentage.groq)}`}
              style={{ width: `${usagePercentage.groq}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {usage.groq.remainingRequests} requests left • {usage.groq.totalCredits - usage.groq.creditsUsed} credits left • Resets in {formatTimeUntilReset()}
          </div>
        </div>

        {/* GitHub API */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-slate-900 dark:text-white">GitHub</h5>
            <span className={`text-sm font-medium ${getUsageColor(usagePercentage.github)}`}>
              {usage.github.requests}/{usage.github.hourlyLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(usagePercentage.github)}`}
              style={{ width: `${usagePercentage.github}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {usage.github.remainingRequests} requests left • {usage.github.totalCredits - usage.github.creditsUsed} credits left • Resets in 1h
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h5 className="font-medium text-slate-900 dark:text-white mb-3">API Limits & Information</h5>
          
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-600 dark:text-blue-400" />
              <span><strong>Gemini AI:</strong> 60 requests/day • 1 credit per request • Analysis & synthesis</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-600 dark:text-blue-400" />
              <span><strong>Groq:</strong> ~100 requests/day • 0.5 credits per request • Paper synthesis</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-600 dark:text-blue-400" />
              <span><strong>GitHub:</strong> 5,000 requests/hour • 0.1 credits per request • Repository search</span>
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>Credit System:</strong> Each API call consumes credits. Free tier provides daily/monthly credit limits.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                <strong>Tip:</strong> Consider upgrading API keys for higher credit limits and faster processing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
