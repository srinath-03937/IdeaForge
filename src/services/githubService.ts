import { Repo } from '../types'

export async function searchGitHubRepos(query: string, maxResults: number = 6): Promise<Repo[]> {
  // Use GitHub Actions environment variable for authentication
  const token = process.env.GITHUB_TOKEN || ''
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${maxResults}`
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json'
  }
  
  if (token) {
    headers['Authorization'] = `token ${token}`
  }
  
  const response = await fetch(url, {
    headers
  })
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    full_name: item.full_name,
    description: item.description,
    html_url: item.html_url,
    stargazers_count: item.stargazers_count,
    language: item.language,
    updated_at: item.updated_at
  }))
}
