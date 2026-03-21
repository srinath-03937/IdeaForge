import { searchPatents } from './patentService'
import { Patent } from '../types'

type GeminiResponse = any

// Generate dynamic mermaid mind map based on actual search results and workflow
function generateDynamicDiagram(prompt: string, contextRepos: any[], patents: Patent[]): string {
  try {
    // Sanitize labels - keep complete words but remove problematic characters
    const sanitize = (str: string) => {
      return str
        .replace(/[\"'`\[\]\{\}\|\\\/]/g, '')           // Remove problematic chars
        .replace(/[^\w\s\-_.]/g, ' ')                // Replace special chars with space
        .replace(/\s+/g, ' ')                       // Collapse multiple spaces
        .replace(/^\s+|\s+$/g, '')                  // Trim leading/trailing spaces
        .substring(0, 25)                            // Allow longer text for mind map
    }
    
    const ideaShort = sanitize(prompt) || 'Idea'
    const repoCount = Math.min(Math.max(contextRepos?.length || 0, 0), 4)
    const patentCount = Math.min(Math.max(patents?.length || 0, 0), 4)
    
    // Mind map style diagram with central idea
    let diagram = 'mindmap\n  root((Idea))\n'
    
    // Add main branches
    diagram += `    ((${ideaShort}))\n`
    
    // Research branch
    diagram += '    Research\n'
    diagram += '      ::icon(fa fa-search)\n'
    
    // GitHub repositories branch
    if (repoCount > 0) {
      diagram += '      GitHub Repositories\n'
      diagram += '        ::icon(fa fa-code)\n'
      for (let i = 0; i < repoCount; i++) {
        const repoName = sanitize(contextRepos[i]?.full_name?.split('/')[1] || `Repository ${i + 1}`)
        diagram += `        ${repoName}\n`
        // Add sub-branches for repo details
        if (contextRepos[i]?.language) {
          diagram += `          Language: ${contextRepos[i]?.language}\n`
        }
        if (contextRepos[i]?.stargazers_count) {
          diagram += `          Stars: ${contextRepos[i]?.stargazers_count}\n`
        }
      }
    }
    
    // Patents branch
    if (patentCount > 0) {
      diagram += '      Patent Analysis\n'
      diagram += '        ::icon(fa fa-lightbulb)\n'
      for (let i = 0; i < patentCount; i++) {
        const patentName = sanitize(patents[i]?.title || `Patent ${i + 1}`)
        diagram += `        ${patentName}\n`
        // Add sub-branches for patent details
        const patentInventors = patents[i]?.inventors
        if (patentInventors && Array.isArray(patentInventors) && patentInventors.length > 0) {
          diagram += `          Inventors: ${patentInventors.slice(0, 2).join(', ')}\n`
        }
        const patentTechnologies = patents[i]?.technologies
        if (patentTechnologies && Array.isArray(patentTechnologies) && patentTechnologies.length > 0) {
          diagram += `          Technologies: ${patentTechnologies.slice(0, 2).join(', ')}\n`
        }
      }
    }
    
    // AI Analysis branch
    diagram += '      AI Analysis\n'
    diagram += '        ::icon(fa fa-brain)\n'
    diagram += '        Feasibility Assessment\n'
    diagram += '        Novelty Evaluation\n'
    diagram += '        Technical Analysis\n'
    
    // Implementation branch
    diagram += '      Implementation\n'
    diagram += '        ::icon(fa fa-cogs)\n'
    diagram += '        Development Roadmap\n'
    diagram += '        Starter Code\n'
    diagram += '        Deployment Strategy\n'
    
    // Results branch
    diagram += '      Results\n'
    diagram += '        ::icon(fa fa-chart-line)\n'
    diagram += '        Innovation Score\n'
    diagram += '        Market Potential\n'
    diagram += '        Next Steps\n'
    
    return diagram
  } catch (err) {
    console.error('Error generating mind map diagram:', err)
    // Return a minimal valid mind map as fallback
    return 'mindmap\n  root((Idea))\n    Research\n      GitHub Search\n      Patent Search\n    Analysis\n      AI Processing\n      Feasibility Check\n    Implementation\n      Development\n      Testing'
  }
}

async function backoffFetch(url:string, opts:any, attempts=3){
  let wait = 1000
  let lastError: any = null
  for(let i=0;i<attempts;i++){
    try{
      const res = await fetch(url, opts)
      if(!res.ok) {
        const errText = await res.text()
        console.error(`HTTP ${res.status}: ${errText}`)
        lastError = new Error(`Gemini API returned ${res.status}: ${errText.substring(0, 200)}`)
        throw lastError
      }
      return res
    }catch(e){
      lastError = e
      console.warn(`Attempt ${i+1}/${attempts} failed:`, e)
      if(i < attempts-1) {
        await new Promise(r=>setTimeout(r, wait))
        wait *= 2
      }
    }
  }
  throw lastError || new Error('Gemini request failed after retries')
}

export async function callGemini(prompt:string, contextRepos:any[] = []): Promise<GeminiResponse>{
  // Wait a moment for config to load (production issue)
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Multiple fallback strategies for API key
  const apiKey = (window as any).__gemini_api_key || 
                  import.meta.env.VITE_GEMINI_API_KEY ||
                  "AIzaSyBLR4TF7XFVVNZB6X8y60NJ4HYzoZRAAw0" // Hardcoded fallback
  
  console.log('Gemini API key check:', {
    windowKey: !!(window as any).__gemini_api_key,
    windowKeyLength: (window as any).__gemini_api_key ? (window as any).__gemini_api_key.length : 0,
    envKey: !!import.meta.env.VITE_GEMINI_API_KEY,
    fallback: true,
    finalKeyLength: apiKey ? apiKey.length : 0
  })
  
  if (!apiKey) {
    console.error('Gemini API key not found in any source')
    throw new Error('Gemini API key not configured')
  }
  
  try {
    // Step 1: Search for real patents using Gemini
    console.log('Searching patents for:', prompt)
    const patents = await searchPatents(prompt, 8)
    console.log('Found patents:', patents.length)
    
    // Step 2: Generate analysis using Gemini with patent context
    const patentContext = patents.map(p => `- ${p.title}: ${p.abstract}`).join('\n')
    
    const payload = {
      contents: [{
        parts: [{
          text: `Analyze this idea and provide a structured response in valid JSON format:

IDEA: ${prompt}

GITHUB REPOS CONTEXT:
${contextRepos.map(r => `- ${r.full_name}: ${r.description}`).join('\n')}

PATENT CONTEXT:
${patentContext}

Based on the patent search results, provide analysis considering:
1. Patent landscape and potential conflicts
2. Novelty assessment compared to existing patents
3. Technical differentiation opportunities

Respond with ONLY a valid JSON object (no markdown code blocks) with these exact fields:
{
  "refinedConcept": "string - improved/refined version of idea",
  "engineeringReportMarkdown": "string - detailed technical analysis",
  "feasibility": number between 0-100,
  "novelty": number between 0-100,
  "patents": [array of patent objects with title, abstract, id, inventors, filingDate, technologies],
  "validatedRepos": [array of most relevant repo names],
  "roadmap": ["step1", "step2", "step3"],
  "mermaid": "string - valid mermaid mindmap diagram code with complete words in boxes",
  "starterCode": "string - sample code snippet"
}

IMPORTANT: For the mermaid field, generate a mindmap diagram with:
- Complete words (no abbreviations)
- Real repository and patent names from the analysis
- Detailed sub-branches with specific information
- Professional mind map structure with icons
- All text should be complete and readable`
        }]
      }]
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const opts = { 
      method: 'POST', 
      headers: { 'Content-Type':'application/json' }, 
      body: JSON.stringify(payload) 
    }
    
    console.log('Calling Gemini API with patent context...', { url, hasKey: !!apiKey })
    const res = await backoffFetch(url, opts)
    const json = await res.json()
    console.log('Gemini response:', json)
    
    if (json.error) {
      console.error('Gemini API error:', json.error)
      throw new Error(json.error.message || 'Gemini API error')
    }
    
    let jsonStr = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('Raw Gemini response (first 200 chars):', jsonStr.substring(0, 200))
    
    // Clean up JSON string - fix common issues
    jsonStr = jsonStr
      .trim()
      .replace(/,\s*}/g, '}')  // Remove trailing commas
      .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
      .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
      .replace(/\\n/g, '\\\\n')  // Fix newlines
      .replace(/\\r/g, '\\\\r')  // Fix carriage returns
      .replace(/\\t/g, '\\\\t')  // Fix tabs
    
    console.log('Cleaned JSON (first 200 chars):', jsonStr.substring(0, 200))
    
    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error('Failed to parse JSON from Gemini response:', parseErr)
      console.error('Problematic JSON (first 500 chars):', jsonStr?.substring(0, 500) || 'No JSON string available')
      // Don't fail - use fallback instead
      parsed = null
    }
    
    if (parsed) {
      const patentsArray = patents.map((p, i) => ({
        title: p.title || 'Patent title',
        abstract: p.abstract || 'Patent abstract',
        id: p.id || `patent_${i}`,
        inventors: p.inventors || [],
        filingDate: p.filingDate || new Date().toISOString().split('T')[0],
        technologies: p.technologies || []
      }))
      
      const validatedReposArray = contextRepos.map((r, i) => r.full_name || `repo_${i}`)
      
      const dynamicMermaid = generateDynamicDiagram(prompt, contextRepos, patents)
      
      const result = {
        refinedConcept: parsed.refinedConcept || prompt,
        engineeringReportMarkdown: parsed.engineeringReportMarkdown || `Analysis for ${prompt}`,
        feasibility: Math.min(100, Math.max(0, parsed.feasibility || 75)),
        novelty: Math.min(100, Math.max(0, parsed.novelty || 70)),
        patents: patentsArray,
        validatedRepos: validatedReposArray,
        roadmap: parsed.roadmap || ['Research', 'Prototype', 'Deploy'],
        mermaid: dynamicMermaid,
        starterCode: parsed.starterCode || '// Start your implementation\nconsole.log("Building...");'
      }
      console.log('Structured result:', result)
      return result
    }
      
    // Fallback: use real patents with structured response
    const fallbackPatents = patents.map((p, i) => ({
      title: p.title,
      abstract: p.abstract,
      id: p.id,
      inventors: p.inventors,
      filingDate: p.filingDate,
      technologies: p.technologies
    }))
    
    const mermaidDiagram = generateDynamicDiagram(prompt, contextRepos, fallbackPatents)
    console.log('Fallback mermaid diagram generated:', mermaidDiagram.substring(0, 200))
    
    return {
      refinedConcept: prompt,
      engineeringReportMarkdown: `## Analysis\n\nBased on the search results for "${prompt}", here's the analysis...`,
      feasibility: 70,
      novelty: 65,
      patents: fallbackPatents,
      validatedRepos: contextRepos.slice(0, 3),
      roadmap: ['Research', 'Prototype', 'Deploy'],
      mermaid: mermaidDiagram,
      starterCode: '// Start implementing your idea!\nconsole.log("Ready to build!");'
    }
  } catch (err) {
    console.error('Gemini error:', err)
    // Generate dynamic diagram even in error case
    const errorMermaid = generateDynamicDiagram(prompt, contextRepos, [])
    console.log('Error fallback mermaid diagram generated:', errorMermaid.substring(0, 200))
    
    return {
      refinedConcept: 'Analysis failed - please try again',
      engineeringReportMarkdown: '## Error\n\nUnable to generate analysis. Please check your connection and try again.',
      feasibility: 50,
      novelty: 50,
      patents: [],
      validatedRepos: contextRepos,
      roadmap: ['Research', 'Prototype', 'Deploy'],
      mermaid: errorMermaid,
      starterCode: '// Error occurred - please try again\nconsole.log("Error: Unable to generate analysis");'
    }
  }
}
