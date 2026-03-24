import { searchPatents } from './patentService'
import { Patent } from '../types'

type GeminiResponse = any

// Generate dynamic mermaid flowchart based on actual search results and workflow
function generateDynamicDiagram(prompt: string, contextRepos: any[], patents: Patent[]): string {
  try {
    // Very simple sanitization to prevent SVG errors
    const sanitize = (str: string) => {
      return str
        .replace(/[^a-zA-Z\s]/g, '') // Only letters and spaces
        .replace(/\s+/g, ' ')        // Single spaces only
        .trim()
        .substring(0, 8)             // Very short labels
    }
    
    const ideaShort = sanitize(prompt) || 'Idea'
    const repoCount = Math.min(Math.max(contextRepos?.length || 0, 0), 3)
    const patentCount = Math.min(Math.max(patents?.length || 0, 0), 2)
    
    // Simple flowchart structure
    let diagram = 'flowchart TD\n'
    
    // Main idea
    diagram += `    A["${ideaShort}"]\n`
    
    // Research
    diagram += `    A --> B["Research"]\n`
    
    // GitHub search
    diagram += `    B --> C["GitHub"]\n`
    
    // Add repos if any
    if (repoCount > 0) {
      diagram += `    C --> D["Repos"]\n`
    }
    
    // Patent search
    diagram += `    B --> E["Patents"]\n`
    
    // Add patents if any
    if (patentCount > 0) {
      diagram += `    E --> F["Results"]\n`
    } else {
      diagram += `    C --> F["Results"]\n`
    }
    
    return diagram
  } catch (err) {
    console.error('Error generating diagram:', err)
    // Return a minimal valid diagram as fallback
    return 'flowchart TD\n    A["Idea"] --> B["Research"] --> C["Results"]'
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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).__gemini_api_key
  if (!apiKey) throw new Error('Gemini API key not configured')
  
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

Based on patent search results, provide analysis considering:
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
  "mermaid": "string - valid mermaid flowchart diagram code",
  "starterCode": "string - sample code snippet"
}`
        }]
      }]
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const opts = { 
      method: 'POST', 
      headers: { 'Content-Type':'application/json' }, 
      body: JSON.stringify(payload) 
    }
    
    console.log('Calling Gemini API with patent context...', { url, hasKey: !!apiKey, keyLength: apiKey?.length })
    const res = await backoffFetch(url, opts)
    const json = await res.json()
    console.log('Gemini response received:', { status: res.status, hasCandidates: !!json.candidates, candidateCount: json.candidates?.length || 0 })
    
    if (json.error) {
      console.error('Gemini API error:', json.error)
      throw new Error(json.error.message || 'Gemini API error')
    }
    
    if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts[0]) {
      const text = json.candidates[0].content.parts[0].text
      console.log('Gemini text response (first 500 chars):', text.substring(0, 500))
      
      let jsonStr = text
      try {
        // Try to extract JSON from response (handle markdown code blocks)
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1]
        } else {
          // Try to find JSON object - look for first { and last }
          const firstBrace = text.indexOf('{')
          const lastBrace = text.lastIndexOf('}')
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = text.substring(firstBrace, lastBrace + 1)
          }
        }
        
        // Clean up JSON string - fix common issues
        jsonStr = jsonStr
          .trim()
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
          .replace(/\\n/g, '\\\\n')  // Fix newlines
          .replace(/\\r/g, '\\\\r')  // Fix carriage returns
          .replace(/\\t/g, '\\\\t')  // Fix tabs
        
        console.log('Cleaned JSON string (first 200 chars):', jsonStr.substring(0, 200))
        
        const parsed = JSON.parse(jsonStr)
        console.log('Successfully parsed Gemini response')
        
        // Use real patents in the response
        const responsePatents = parsed.patents && parsed.patents.length > 0 ? parsed.patents : patents
        console.log('Response patents count:', responsePatents?.length || 0)
        
        // Ensure patents and validatedRepos are properly structured
        const patentsArray = responsePatents.map((p: any) => 
          typeof p === 'string' ? { title: p, abstract: '', id: `patent-${Math.random()}` } : { ...p, id: p.id || `patent-${Math.random()}` }
        ).filter((p: any) => p && p.title)
        
        const validatedReposArray = (parsed.validatedRepos || []).map((r: any) => 
          typeof r === 'string' ? contextRepos.find(cr => cr.full_name === r) || { full_name: r, html_url: '#' } : r
        ).filter((r: any) => r && r.full_name)
        
        // Generate dynamic diagram based on actual results
        const dynamicMermaid = generateDynamicDiagram(prompt, validatedReposArray, patentsArray)
        
        console.log('Dynamic mermaid diagram generated:', dynamicMermaid.substring(0, 200))
        
        const result = {
          refinedConcept: parsed.refinedConcept || 'Refined idea concept',
          engineeringReportMarkdown: parsed.engineeringReportMarkdown || '## Engineering Report\nNo report available',
          feasibility: Math.min(100, Math.max(0, parsed.feasibility || 65)),
          novelty: Math.min(100, Math.max(0, parsed.novelty || 60)),
          patents: patentsArray,
          validatedRepos: validatedReposArray,
          roadmap: parsed.roadmap || ['Research', 'Prototype', 'Deploy'],
          mermaid: dynamicMermaid,
          starterCode: parsed.starterCode || '// Start your implementation\nconsole.log("Building...");'
        }
        console.log('Structured result:', result)
        return result
      } catch (parseErr) {
        console.error('Failed to parse JSON from Gemini response:', parseErr)
        console.error('Problematic JSON (first 500 chars):', jsonStr?.substring(0, 500) || 'No JSON string available')
        // Don't fail - use fallback instead
      }
      
      // Fallback: use real patents with structured response
      const fallbackPatents = patents.map((p, i) => ({
        title: p.title,
        abstract: p.abstract,
        id: p.id || `patent-${i}`,
        inventors: p.inventors,
        filingDate: p.filingDate,
        technologies: p.technologies
      }))
      console.log('Fallback patents count:', fallbackPatents.length)
      
      const mermaidDiagram = generateDynamicDiagram(prompt, contextRepos, fallbackPatents)
      console.log('Fallback mermaid diagram generated:', mermaidDiagram.substring(0, 200))
    
      return {
        refinedConcept: text.substring(0, 500),
        engineeringReportMarkdown: `## Analysis\n\n${text}`,
        feasibility: 70,
        novelty: 65,
        patents: fallbackPatents,
        validatedRepos: contextRepos.slice(0, 3),
        roadmap: ['Research', 'Prototype', 'Deploy'],
        mermaid: mermaidDiagram,
        starterCode: '// Start implementing your idea!\nconsole.log("Ready to build!");'
      }
    }
    throw new Error('Invalid Gemini response format')
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
      starterCode: '// Analysis failed - please try again\nconsole.log("Error occurred");'
    }
  }
}
