import { Repo } from '../types'
import { apiUsageTracker } from './apiUsageService'

const FALLBACK_REPOS: Repo[] = [
  { full_name: 'facebook/react', description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.', stargazers_count: 220000, language: 'JavaScript', html_url: 'https://github.com/facebook/react', id: 1, name: 'react', topics: ['javascript', 'frontend', 'ui'], forks_count: 45000, updated_at: '2024-01-01', open_issues_count: 1200 },
  { full_name: 'microsoft/TypeScript', description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.', stargazers_count: 98000, language: 'TypeScript', html_url: 'https://github.com/microsoft/TypeScript', id: 2, name: 'TypeScript', topics: ['typescript', 'javascript', 'compiler'], forks_count: 12000, updated_at: '2024-01-01', open_issues_count: 800 },
  { full_name: 'tensorflow/tensorflow', description: 'An Open Source Machine Learning Framework for Everyone', stargazers_count: 180000, language: 'Python', html_url: 'https://github.com/tensorflow/tensorflow', id: 3, name: 'tensorflow', topics: ['machine-learning', 'python', 'ai'], forks_count: 88000, updated_at: '2024-01-01', open_issues_count: 1500 }
]

export async function searchGitHubRepos(query: string, limit?: number): Promise<Repo[]> {
  if (!query || query.trim().length === 0) {
    console.warn('Empty query provided to searchGitHubRepos')
    return []
  }

  // Track API usage
  apiUsageTracker.trackGitHubUsage()

  const token = (import.meta as any).env?.VITE_GITHUB_TOKEN || ''
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'IdeaForge-App',
    'X-GitHub-Api-Version': '2022-11-28'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    // Build a more specific search query for the research idea
    const searchQuery = `${query} in:name,description,readme`
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=${limit || 20}`
    console.log('Searching GitHub with URL:', url)
    console.log('Using token:', token ? 'Yes' : 'No')
    
    const response = await fetch(url, { headers })
    
    console.log('GitHub API response status:', response.status)
    
    if (!response.ok) {
      console.error('GitHub API request failed:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      
      // Try without token if token auth fails
      if (token && response.status === 401) {
        console.log('Token auth failed, trying without token...')
        const publicHeaders = { ...headers }
        delete publicHeaders['Authorization']
        
        const publicResponse = await fetch(url, { headers: publicHeaders })
        if (publicResponse.ok) {
          const data = await publicResponse.json()
          console.log('Public API succeeded, found:', data.items?.length || 0, 'repos')
          return processGitHubResponse(data, query, limit)
        }
      }
      
      return []
    }

    const data = await response.json()
    console.log('GitHub API response data:', data)
    
    if (!data.items || data.items.length === 0) {
      console.warn('No repositories found for query:', query)
      // Try a broader search
      console.log('Trying broader search...')
      const broaderQuery = query.split(' ').slice(0, 3).join(' ') // Use first 3 words
      const broaderUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(broaderQuery)}&sort=stars&order=desc&per_page=${limit || 20}`
      
      const broaderResponse = await fetch(broaderUrl, { headers })
      if (broaderResponse.ok) {
        const broaderData = await broaderResponse.json()
        console.log('Broader search found:', broaderData.items?.length || 0, 'repos')
        return processGitHubResponse(broaderData, query, limit)
      }
      
      return []
    }

    return processGitHubResponse(data, query, limit)

  } catch (error) {
    console.error('Error searching GitHub repos:', error)
    return []
  }
}

function processGitHubResponse(data: any, query: string, limit?: number): Repo[] {
  const repos: Repo[] = data.items.map((item: any) => ({
    id: item.id || 0,
    name: item.name,
    full_name: item.full_name,
    description: item.description || 'No description available',
    stargazers_count: item.stargazers_count || 0,
    forks_count: item.forks_count || 0,
    open_issues_count: item.open_issues_count || 0,
    language: item.language || 'Unknown',
    html_url: item.html_url,
    topics: item.topics || [],
    updated_at: item.updated_at,
    created_at: item.created_at,
    pushed_at: item.pushed_at,
    size: item.size || 0,
    default_branch: item.default_branch || 'main'
  }))

  console.log(`Found ${repos.length} real repositories for query: ${query}`)
  console.log('Sample repo:', repos[0]?.full_name, repos[0]?.description?.substring(0, 100))
  
  // Filter out irrelevant repos based on description and name
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2)
  const relevantRepos = repos.filter(repo => {
    const repoText = `${repo.name} ${repo.description} ${repo.topics.join(' ')}`.toLowerCase()
    return queryWords.some(word => repoText.includes(word))
  })
  
  console.log(`Filtered to ${relevantRepos.length} relevant repositories`)
  
  return relevantRepos.slice(0, limit || 20)
}
