export interface Repo{
  id: number
  name: string
  full_name: string
  description?: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language?: string
  html_url: string
  updated_at: string
  topics: string[]
  license?: string | null
}

export interface Dataset {
  id: string
  name: string
  description: string
  source: 'huggingface' | 'kaggle' | 'uci' | 'government' | 'domain-specific' | 'pubmed' | 'nasa' | 'noaa' | 'worldbank' | 'imdb' | 'papers-with-code'
  url: string
  size: string
  format: string
  downloads: number
  lastUpdated: string
  tags: string[]
  relevanceScore: number
}

export interface Patent{
  title: string
  abstract?: string
  id?: string
  inventors?: string[]
  filingDate?: string
  technologies?: string[]
  similarity?: number
}

export interface AnalysisResult{
  refinedConcept?: string
  engineeringReportMarkdown?: string
  engineeringReportHtml?: string
  feasibility?: number
  novelty?: number
  patents?: Patent[]
  validatedRepos?: Repo[]
  roadmap?: any[]
  mermaid?: string
  starterCode?: string
}
