import type { Repo } from '../types'

const FALLBACK_REPOS: Repo[] = [
  { full_name: 'facebook/react', description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.', stargazers_count: 220000, language: 'JavaScript', html_url: 'https://github.com/facebook/react', id: 1, name: 'react', topics: ['javascript', 'frontend', 'ui'], forks_count: 45000, updated_at: '2024-01-01', open_issues_count: 1200 },
  { full_name: 'microsoft/TypeScript', description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.', stargazers_count: 98000, language: 'TypeScript', html_url: 'https://github.com/microsoft/TypeScript', id: 2, name: 'TypeScript', topics: ['typescript', 'javascript', 'compiler'], forks_count: 12000, updated_at: '2024-01-01', open_issues_count: 800 },
  { full_name: 'tensorflow/tensorflow', description: 'An Open Source Machine Learning Framework for Everyone', stargazers_count: 180000, language: 'Python', html_url: 'https://github.com/tensorflow/tensorflow', id: 3, name: 'tensorflow', topics: ['machine-learning', 'python', 'ai'], forks_count: 88000, updated_at: '2024-01-01', open_issues_count: 1500 }
]

export async function searchGitHubRepos(query: string, limit?: number): Promise<Repo[]> {
  if (!query || query.trim().length === 0) {
    console.warn('Empty query provided to searchGitHubRepos, using fallback')
    return FALLBACK_REPOS.slice(0, limit || 20)
  }

  const token = (import.meta as any).env?.VITE_GITHUB_TOKEN || ''
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'IdeaForge-App'
  }

  if (token) {
    headers['Authorization'] = `token ${token}`
  }

  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit || 20}`
    console.log('Searching GitHub with URL:', url)
    
    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      console.warn('GitHub API request failed:', response.status, response.statusText)
      return FALLBACK_REPOS.slice(0, limit || 20)
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      console.warn('No repositories found, using fallback')
      return FALLBACK_REPOS.slice(0, limit || 20)
    }

    const repos: Repo[] = data.items.map((item: any) => ({
      id: item.id || 0,
      name: item.name,
      full_name: item.full_name,
      description: item.description,
      stargazers_count: item.stargazers_count,
      forks_count: item.forks_count,
      open_issues_count: item.open_issues_count || 0,
      language: item.language,
      html_url: item.html_url,
      topics: item.topics || [],
      updated_at: item.updated_at
    }))

    console.log(`Found ${repos.length} repositories for query: ${query}`)
    return repos.slice(0, limit || 20)

  } catch (error) {
    console.error('Error searching GitHub repos:', error)
    return FALLBACK_REPOS.slice(0, limit || 20)
  }
}
