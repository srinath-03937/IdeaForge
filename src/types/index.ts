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

export interface Patent{
  title: string
  abstract?: string
  id?: string
  inventors?: string[]
  filingDate?: string
  technologies?: string[]
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
