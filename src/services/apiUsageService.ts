// API Usage Tracking Service
interface APIUsage {
  gemini: {
    requests: number
    lastRequest: Date
    dailyLimit: number
    remainingRequests: number
    creditsUsed: number
    totalCredits: number
  }
  groq: {
    requests: number
    lastRequest: Date
    dailyLimit: number
    remainingRequests: number
    creditsUsed: number
    totalCredits: number
  }
  github: {
    requests: number
    lastRequest: Date
    hourlyLimit: number
    remainingRequests: number
    creditsUsed: number
    totalCredits: number
  }
}

class APIUsageTracker {
  private usage: APIUsage = {
    gemini: {
      requests: 0,
      lastRequest: new Date(),
      dailyLimit: 60, // Gemini free tier: 60 requests per day
      remainingRequests: 60
    },
    groq: {
      requests: 0,
      lastRequest: new Date(),
      dailyLimit: 100, // Groq free tier: ~100 requests per day
      remainingRequests: 100
    },
    github: {
      requests: 0,
      lastRequest: new Date(),
      hourlyLimit: 5000, // GitHub API: 5000 requests per hour
      remainingRequests: 5000
    }
  }

  constructor() {
    this.loadUsageFromStorage()
  }

  // Load usage from localStorage
  private loadUsageFromStorage() {
    try {
      const stored = localStorage.getItem('ideaforge-api-usage')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Reset counters if new day
        const today = new Date().toDateString()
        const lastReset = parsed.lastReset || today
        
        if (today !== lastReset) {
          this.usage = {
            gemini: { ...this.usage.gemini, requests: 0, remainingRequests: this.usage.gemini.dailyLimit, creditsUsed: 0, totalCredits: 100 },
            groq: { ...this.usage.groq, requests: 0, remainingRequests: this.usage.groq.dailyLimit, creditsUsed: 0, totalCredits: 100 },
            github: { ...this.usage.github, requests: 0, remainingRequests: this.usage.github.hourlyLimit, creditsUsed: 0, totalCredits: 1000 }
          }
          this.saveUsageToStorage(today)
        } else {
          this.usage = { ...parsed }
        }
      }
    } catch (error) {
      console.warn('Failed to load API usage from storage:', error)
    }
  }

  // Save usage to localStorage
  private saveUsageToStorage(today?: string) {
    try {
      const data = {
        ...this.usage,
        lastReset: today || new Date().toDateString()
      }
      localStorage.setItem('ideaforge-api-usage', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save API usage to storage:', error)
    }
  }

  // Track Gemini API usage
  trackGeminiUsage() {
    this.usage.gemini.requests++
    this.usage.gemini.lastRequest = new Date()
    this.usage.gemini.remainingRequests = Math.max(0, this.usage.gemini.dailyLimit - this.usage.gemini.requests)
    
    // Deduct credits (1 credit per request)
    this.usage.gemini.creditsUsed = Math.min(this.usage.gemini.creditsUsed + 1, this.usage.gemini.totalCredits)
    this.usage.gemini.totalCredits = 100 // Fixed total credits
    
    this.saveUsageToStorage()
    
    console.log(`Gemini API usage: ${this.usage.gemini.requests}/${this.usage.gemini.dailyLimit} (${this.usage.gemini.remainingRequests} remaining) - Credits: ${this.usage.gemini.creditsUsed}/${this.usage.gemini.totalCredits}`)
  }

  // Track Groq API usage
  trackGroqUsage() {
    this.usage.groq.requests++
    this.usage.groq.lastRequest = new Date()
    this.usage.groq.remainingRequests = Math.max(0, this.usage.groq.dailyLimit - this.usage.groq.requests)
    
    // Deduct credits (0.5 credits per request)
    this.usage.groq.creditsUsed = Math.min(this.usage.groq.creditsUsed + 0.5, this.usage.groq.totalCredits)
    this.usage.groq.totalCredits = 100 // Fixed total credits
    
    this.saveUsageToStorage()
    
    console.log(`Groq API usage: ${this.usage.groq.requests}/${this.usage.groq.dailyLimit} (${this.usage.groq.remainingRequests} remaining) - Credits: ${this.usage.groq.creditsUsed}/${this.usage.groq.totalCredits}`)
  }

  // Track GitHub API usage
  trackGitHubUsage() {
    this.usage.github.requests++
    this.usage.github.lastRequest = new Date()
    
    // Reset hourly counter if needed
    const now = new Date()
    const lastHour = this.usage.github.lastRequest.getHours()
    const currentHour = now.getHours()
    
    if (currentHour !== lastHour) {
      this.usage.github.requests = 1
      this.usage.github.remainingRequests = this.usage.github.hourlyLimit - 1
      this.usage.github.creditsUsed = Math.min(this.usage.github.creditsUsed + 0.1, this.usage.github.totalCredits)
    } else {
      this.usage.github.remainingRequests = Math.max(0, this.usage.github.hourlyLimit - this.usage.github.requests)
      this.usage.github.creditsUsed = Math.min(this.usage.github.creditsUsed + 0.1, this.usage.github.totalCredits)
    }
    
    this.saveUsageToStorage()
    
    console.log(`GitHub API usage: ${this.usage.github.requests}/${this.usage.github.hourlyLimit} (${this.usage.github.remainingRequests} remaining this hour) - Credits: ${this.usage.github.creditsUsed}/${this.usage.github.totalCredits}`)
  }

  // Get current usage
  getUsage(): APIUsage {
    return { ...this.usage }
  }

  // Check if near limits
  isNearLimit(): { gemini: boolean; groq: boolean; github: boolean } {
    return {
      gemini: this.usage.gemini.remainingRequests <= 5 || this.usage.gemini.creditsUsed >= this.usage.gemini.totalCredits * 0.9,
      groq: this.usage.groq.remainingRequests <= 10 || this.usage.groq.creditsUsed >= this.usage.groq.totalCredits * 0.9,
      github: this.usage.github.remainingRequests <= 100 || this.usage.github.creditsUsed >= this.usage.github.totalCredits * 0.9
    }
  }

  // Get usage percentage
  getUsagePercentage(): { gemini: number; groq: number; github: number } {
    return {
      gemini: (this.usage.gemini.requests / this.usage.gemini.dailyLimit) * 100,
      groq: (this.usage.groq.requests / this.usage.groq.dailyLimit) * 100,
      github: (this.usage.github.requests / this.usage.github.hourlyLimit) * 100
    }
  }
}

// Export singleton instance
export const apiUsageTracker = new APIUsageTracker()
