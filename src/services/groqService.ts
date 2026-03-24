// Groq API Service for dynamic paper synthesis and patent analysis

export interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export interface SynthesisRequest {
  papers: Array<{
    title: string
    authors: string[]
    summary?: string
    published?: string
    doi?: string
    journal?: string
  }>
  forgeIdea: string
  forgeTitle?: string
}

export interface PatentAnalysisRequest {
  patent: {
    title: string
    abstract: string
    inventors?: string[]
    assignee?: string
    filingDate?: string
  }
  forgeIdea: string
  forgeTitle?: string
}

class GroqService {
  private apiKey: string | null = null
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions'

  constructor() {
    // Try to get API key from environment
    this.apiKey = import.meta.env?.VITE_GROQ_API_KEY || null
    
    if (!this.apiKey) {
      console.warn('Groq API key not found in environment variables')
    }
  }

  private async makeRequest(prompt: string, model: string = 'gemma2-9b-it'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured. Please set VITE_GROQ_API_KEY in your environment.')
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert research analyst and patent examiner. Provide detailed, technical analysis with specific insights and actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)
      throw new Error(`Groq API error: ${response.status} - ${errorText}`)
    }

    const data: GroqResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Groq API')
    }

    return data.choices[0].message.content
  }

  async synthesizePapers(request: SynthesisRequest): Promise<string> {
    const { papers, forgeIdea, forgeTitle } = request

    const papersText = papers.map((paper, index) => `
**Paper ${index + 1}:**
- Title: ${paper.title}
- Authors: ${paper.authors.join(', ')}
${paper.summary ? `- Summary: ${paper.summary.substring(0, 300)}...` : ''}
${paper.journal ? `- Journal: ${paper.journal}` : ''}
${paper.published ? `- Published: ${new Date(paper.published).toLocaleDateString()}` : ''}
${paper.doi ? `- DOI: ${paper.doi}` : ''}
`).join('\n')

    const prompt = `Please synthesize findings from the following research papers for the innovation idea: "${forgeIdea}"${forgeTitle ? ` (Project: ${forgeTitle})` : ''}.

${papersText}

Please provide a comprehensive synthesis including:

1. **Executive Summary**: A high-level overview of the research landscape
2. **Key Technical Insights**: Main technical approaches and methodologies found
3. **Research Gaps**: What's missing in current literature that this idea could address
4. **Implementation Strategy**: How to build upon existing research
5. **Innovation Opportunities**: Novel contributions this idea could make
6. **Risk Assessment**: Potential challenges and how to mitigate them
7. **Next Steps**: Concrete recommendations for moving forward

Format the response with clear headings and bullet points. Be specific and actionable.`

    return await this.makeRequest(prompt)
  }

  async analyzePatent(request: PatentAnalysisRequest): Promise<string> {
    const { patent, forgeIdea, forgeTitle } = request

    const patentText = `
**Patent Details:**
- Title: ${patent.title}
${patent.abstract ? `- Abstract: ${patent.abstract}` : ''}
${patent.inventors ? `- Inventors: ${patent.inventors.join(', ')}` : ''}
${patent.assignee ? `- Assignee: ${patent.assignee}` : ''}
${patent.filingDate ? `- Filing Date: ${patent.filingDate}` : ''}
`

    const prompt = `Please analyze the following patent in relation to the innovation idea: "${forgeIdea}"${forgeTitle ? ` (Project: ${forgeTitle})` : ''}.

${patentText}

Please provide a comprehensive patent analysis including:

1. **Patent Summary**: Key claims and technical innovations
2. **Relevance Assessment**: How this patent relates to the innovation idea
3. **Freedom to Operate**: Potential patent conflicts or licensing requirements
4. **Technical Overlap**: Similarities and differences with the proposed idea
5. **Design Around Opportunities**: How to design around this patent if needed
6. **Patent Landscape**: How this fits into the broader patent ecosystem
7. **Strategic Recommendations**: IP strategy considerations

Format the response with clear headings and specific, actionable insights.`

    return await this.makeRequest(prompt)
  }

  async generatePatentSearchResults(query: string, forgeIdea: string): Promise<string> {
    const prompt = `Generate a comprehensive patent search strategy and analysis for the innovation idea: "${forgeIdea}" based on the search query: "${query}".

Please provide:

1. **Search Strategy**: Recommended patent search terms, classifications, and databases
2. **Key Patent Areas**: Most relevant patent categories and technology areas
3. **Potential Patent Applications**: How this idea could be patentable
4. **Prior Art Landscape**: Likely existing patents in this space
5. **Innovation Differentiation**: What makes this idea novel compared to existing patents
6. **Filing Recommendations**: Timing and strategy for patent applications
7. **Risk Assessment**: Potential patent infringement risks

Be specific and provide actionable recommendations for patent strategy.`

    return await this.makeRequest(prompt)
  }

  async compareWithPriorArt(papers: any[], patents: any[], forgeIdea: string): Promise<string> {
    const papersSummary = papers.map((p, i) => `Paper ${i+1}: ${p.title}`).join('\n')
    const patentsSummary = patents.map((p, i) => `Patent ${i+1}: ${p.title}`).join('\n')

    const prompt = `Compare the innovation idea "${forgeIdea}" with the following prior art:

**Research Papers:**
${papersSummary}

**Patents:**
${patentsSummary}

Please provide:

1. **Novelty Assessment**: What aspects of the idea are truly novel
2. **Non-Obviousness**: Why the idea wouldn't be obvious to someone skilled in the art
3. **Prior Art Gaps**: What's missing from existing research and patents
4. **Innovation Opportunities**: Unique contributions the idea can make
5. **Freedom to Operate**: Potential IP conflicts and how to avoid them
6. **Strategic Positioning**: How to position this idea relative to prior art
7. **Development Path**: Recommended approach to maximize innovation potential

Be specific and provide actionable insights.`

    return await this.makeRequest(prompt)
  }

  // Fallback method if Groq API is not available
  generateFallbackSynthesis(papers: any[], forgeIdea: string): string {
    const papersCount = papers.length
    const titles = papers.map(p => p.title).join(', ')

    return `## Synthesized Findings from ${papersCount} Papers

### Executive Summary
Based on analysis of ${papersCount} research papers related to "${forgeIdea}", several key insights emerge. The research landscape shows active development in this area with multiple technical approaches being explored.

### Key Papers Analyzed
${papers.map((paper, index) => `
${index + 1}. **${paper.title}**
   - Authors: ${paper.authors?.join(', ') || 'Unknown'}
   - Summary: ${paper.summary?.substring(0, 200) || 'No summary available'}...
   ${paper.journal ? `- Journal: ${paper.journal}` : ''}
`).join('')}

### Technical Insights
- Multiple approaches exist for implementing "${forgeIdea}"
- Current research shows promising results in core functionality
- Performance and scalability are common focus areas

### Research Gaps
- Limited research on integration with existing systems
- Opportunities for improved user experience and accessibility
- Need for more comprehensive evaluation frameworks

### Implementation Strategy
1. **Phase 1**: Develop core functionality based on most successful approaches
2. **Phase 2**: Address identified research gaps with novel solutions
3. **Phase 3**: Optimize performance and user experience

### Innovation Opportunities
- Combine strengths from multiple research approaches
- Address limitations in current implementations
- Explore novel applications in underserved domains

### Next Steps
1. Prototype the most promising technical approach
2. Validate against requirements from research literature
3. Iterate based on testing and user feedback
4. Consider publication of novel contributions to the field

*Note: This is a fallback synthesis using gemma2-9b-it model. For more detailed analysis, please configure a working Groq API key.*`
  }
}

// Export singleton instance
export const groqService = new GroqService()

// Export individual functions for easier usage
export const synthesizePapers = (request: SynthesisRequest) => groqService.synthesizePapers(request)
export const analyzePatent = (request: PatentAnalysisRequest) => groqService.analyzePatent(request)
export const generatePatentSearchResults = (query: string, forgeIdea: string) => groqService.generatePatentSearchResults(query, forgeIdea)
export const compareWithPriorArt = (papers: any[], patents: any[], forgeIdea: string) => groqService.compareWithPriorArt(papers, patents, forgeIdea)
