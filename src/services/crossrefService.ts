export interface ResearchPaper {
  id: string
  title: string
  authors: string[]
  summary?: string
  abstract?: string
  pdfUrl?: string
  arxivUrl?: string
  published?: string
  updated?: string
  categories?: string[]
  doi?: string
  comment?: string
  journal?: string
  publisher?: string
  type?: string
  url?: string
}

export async function searchCrossref(query: string, maxResults: number = 1000, usePagination: boolean = false): Promise<ResearchPaper[]> {
  if (!query || query.trim().length === 0) {
    console.warn('Empty query provided to searchCrossref')
    return []
  }

  console.log('Searching Crossref for:', query, 'maxResults:', maxResults, 'usePagination:', usePagination)

  try {
    // If pagination is requested and we want more than 1000 papers, use cursor-based pagination
    if (usePagination && maxResults > 1000) {
      return await searchCrossrefWithPagination(query, maxResults)
    }

    const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${Math.min(maxResults, 1000)}&select=title,abstract,author,published,DOI,container-title,publisher,type,URL,member,relation&sort=relevance&order=desc`
    
    console.log('Searching Crossref with URL:', url)
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IdeaForge-Vision/1.0 (mailto:contact@ideaforge.com)'
      }
    })

    if (!response.ok) {
      console.warn('Crossref API request failed:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    console.log('Crossref response received:', data.message?.totalResults || 0, 'total results')
    
    if (!data.message || !data.message.items || data.message.items.length === 0) {
      console.warn('No papers found in Crossref for query:', query)
      return []
    }

    const papers: ResearchPaper[] = data.message.items.map((item: any, index: number) => {
      try {
        // Extract authors
        const authors = item.author?.map((author: any) => {
          const name = author.given ? `${author.given} ${author.family}` : author.family || 'Unknown'
          return name
        }) || []

        // Extract title
        const title = item.title || 'Untitled Paper'

        // Extract abstract
        let abstract = item.abstract || ''
        if (abstract && abstract.length > 500) {
          abstract = abstract.substring(0, 500) + '...'
        }

        // Extract publication date
        const published = item.published?.['date-parts'] ? 
          new Date(item.published['date-parts'][0], item.published['date-parts'][1] - 1, item.published['date-parts'][2]).toISOString() :
          item.published ? new Date(item.published).toISOString() : new Date().toISOString()

        // Extract DOI and URLs
        const doi = item.DOI || ''
        const pdfUrl = doi ? `https://doi.org/${doi}` : ''
        const arxivUrl = pdfUrl

        // Extract journal/container info
        const journal = item['container-title']?.[0] || ''
        const publisher = item.publisher || ''
        const type = item.type || 'journal-article'

        // Extract categories
        const categories = item.member?.map((member: any) => member['name']) || []

        return {
          id: `crossref-${index}`,
          title,
          authors,
          summary: abstract,
          abstract,
          pdfUrl,
          arxivUrl,
          published,
          updated: published,
          categories,
          doi,
          comment: 'Retrieved from Crossref',
          journal,
          publisher,
          type,
          url: pdfUrl
        }
      } catch (error) {
        console.error('Error parsing Crossref item:', error)
        return {
          id: `crossref-error-${index}`,
          title: 'Error parsing paper',
          authors: ['Unknown'],
          summary: 'Failed to parse paper data',
          published: new Date().toISOString(),
          updated: new Date().toISOString(),
          categories: ['error'],
          comment: 'Parsing error occurred'
        }
      }
    })

    console.log(`Successfully parsed ${papers.length} papers from Crossref`)
    return papers

  } catch (error) {
    console.error('Error searching Crossref:', error)
    return []
  }
}

// New function for cursor-based pagination
async function searchCrossrefWithPagination(query: string, maxResults: number): Promise<ResearchPaper[]> {
  const allPapers: ResearchPaper[] = []
  let cursor = "*"
  let retrievedCount = 0
  const pageSize = 1000 // Maximum per request
  
  try {
    while (retrievedCount < maxResults) {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${pageSize}&cursor=${encodeURIComponent(cursor)}&select=title,abstract,author,published,DOI,container-title,publisher,type,URL,member,relation&sort=relevance&order=desc`
      
      console.log(`Fetching page with cursor: ${cursor}`)
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IdeaForge-Vision/1.0 (mailto:contact@ideaforge.com)'
        }
      })

      if (!response.ok) {
        console.warn('Pagination request failed:', response.status)
        break
      }

      const data = await response.json()
      
      if (!data.message || !data.message.items || data.message.items.length === 0) {
        console.log('No more results available')
        break
      }

      const papers: ResearchPaper[] = data.message.items.map((item: any, index: number) => {
        // Similar parsing logic as above
        const authors = item.author?.map((author: any) => {
          const name = author.given ? `${author.given} ${author.family}` : author.family || 'Unknown'
          return name
        }) || []

        const title = item.title || 'Untitled Paper'
        let abstract = item.abstract || ''
        if (abstract && abstract.length > 500) {
          abstract = abstract.substring(0, 500) + '...'
        }

        const published = item.published?.['date-parts'] ? 
          new Date(item.published['date-parts'][0], item.published['date-parts'][1] - 1, item.published['date-parts'][2]).toISOString() :
          item.published ? new Date(item.published).toISOString() : new Date().toISOString()

        const doi = item.DOI || ''
        const pdfUrl = doi ? `https://doi.org/${doi}` : ''

        return {
          id: `crossref-paged-${retrievedCount + index}`,
          title,
          authors,
          summary: abstract,
          abstract,
          pdfUrl,
          arxivUrl: pdfUrl,
          published,
          updated: published,
          categories: item.member?.map((member: any) => member['name']) || [],
          doi,
          comment: 'Retrieved from Crossref (paginated)',
          journal: item['container-title']?.[0] || '',
          publisher: item.publisher || '',
          type: item.type || 'journal-article',
          url: pdfUrl
        }
      })

      allPapers.push(...papers)
      retrievedCount += papers.length
      
      // Update cursor for next request
      cursor = data.message.nextCursor || "*"
      
      // Prevent infinite loop
      if (papers.length === 0) break
    }
      
    } catch (error) {
      console.error('Error during pagination:', error)
    }
    
    console.log(`Paginated search complete: retrieved ${allPapers.length} papers out of requested ${maxResults}`)
    return allPapers.slice(0, maxResults)
}
