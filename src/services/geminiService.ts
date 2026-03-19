import { searchPatents } from './patentService'
import { Patent } from '../types'

type GeminiResponse = any

// Generate dynamic mermaid flowchart based on actual search results and workflow
function generateDynamicDiagram(prompt: string, contextRepos: any[], patents: Patent[]): string {
  try {
    // Sanitize labels - remove problematic characters that break SVG paths
    const sanitize = (str: string) => {
      return str
        .replace(/[\"'`\[\]\{\}\|\\\/]/g, '')           // Remove problematic chars
        .replace(/[^\w\s\-_.]/g, ' ')                // Replace special chars with space
        .replace(/\s+/g, ' ')                       // Collapse multiple spaces
        .replace(/^\s+|\s+$/g, '')                  // Trim leading/trailing spaces
        .replace(/[0-9]+/g, '')                     // Remove numbers that might cause path issues
        .substring(0, 15)                            // Further limit length to prevent issues
    }
    
    const ideaShort = sanitize(prompt) || 'User Idea'
    const repoCount = Math.min(Math.max(contextRepos?.length || 0, 0), 5)
    const patentCount = Math.min(Math.max(patents?.length || 0, 0), 4)
    
    let diagram = 'flowchart TD\n'
    
    // Main idea node with styling
    diagram += `    A["${ideaShort}"]:::idea\n`
    
    // Research phase
    diagram += `    B["Research Phase"]:::research\n`
    diagram += `    A --> B\n`
    
    // GitHub search workflow
    diagram += `    C["GitHub Search"]:::search\n`
    diagram += `    B --> C\n`
    
    // Repository nodes (dynamic based on actual search)
    const repoNodes = []
    if (repoCount > 0) {
      for (let i = 0; i < repoCount; i++) {
        try {
          const repoName = sanitize(contextRepos[i]?.full_name?.split('/')[1] || `Repo${i + 1}`)
          const nodeId = String.fromCharCode(68 + i) // D, E, F, G, H
          repoNodes.push(nodeId)
          diagram += `    ${nodeId}["${repoName}"]:::repo\n`
          diagram += `    C --> ${nodeId}\n`
        } catch (e) {
          console.warn(`Error processing repo ${i}:`, e)
        }
      }
    }
    
    // Patent search workflow
    diagram += `    I["Patent Search"]:::search\n`
    diagram += `    B --> I\n`
    
    // Patent nodes (dynamic based on actual search)
    const patentNodes = []
    if (patentCount > 0) {
      for (let i = 0; i < patentCount; i++) {
        try {
          const patentName = sanitize(patents[i]?.title || `Patent${i + 1}`)
          const nodeId = String.fromCharCode(73 + i) // I, J, K, L
          patentNodes.push(nodeId)
          diagram += `    ${nodeId}["${patentName}"]:::patent\n`
          diagram += `    I --> ${nodeId}\n`
        } catch (e) {
          console.warn(`Error processing patent ${i}:`, e)
        }
      }
    }
    
    // AI Analysis phase
    diagram += `    M["AI Analysis"]:::analysis\n`
    if (repoNodes.length > 0) {
      for (const nodeId of repoNodes) {
        diagram += `    ${nodeId} --> M\n`
      }
    } else {
      diagram += `    C --> M\n`
    }
    
    if (patentNodes.length > 0) {
      for (const nodeId of patentNodes) {
        diagram += `    ${nodeId} --> M\n`
      }
    } else {
      diagram += `    I --> M\n`
    }
    
    // Results phase
    diagram += `    R["Results"]:::result\n`
    diagram += `    M --> R\n`
    
    // Score
    diagram += `    S["Score"]:::score\n`
    diagram += `    R --> S\n`
    
    // Styling definitions
    diagram += '\n'
    diagram += '    classDef ideaStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff\n'
    diagram += '    classDef researchStyle fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#fff\n'
    diagram += '    classDef searchStyle fill:#06B6D4,stroke:#0891B2,stroke-width:2px,color:#fff\n'
    diagram += '    classDef repoStyle fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff\n'
    diagram += '    classDef patentStyle fill:#EC4899,stroke:#BE185D,stroke-width:2px,color:#fff\n'
    diagram += '    classDef analysisStyle fill:#8B5CF6,stroke:#6D28D9,stroke-width:2px,color:#fff\n'
    diagram += '    classDef resultStyle fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff\n'
    diagram += '    classDef scoreStyle fill:#6B7280,stroke:#4B5563,stroke-width:2px,color:#fff\n'
    diagram += '    classDef patent fill:#EC4899,stroke:#BE185D,stroke-width:2px,color:#fff\n'
    diagram += '    classDef analysis fill:#8B5CF6,stroke:#6D28D9,stroke-width:2px,color:#fff\n'
    diagram += '    classDef assessment fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff\n'
    diagram += '    classDef planning fill:#84CC16,stroke:#65A30D,stroke-width:2px,color:#fff\n'
    diagram += '    classDef code fill:#6B7280,stroke:#374151,stroke-width:2px,color:#fff\n'
    diagram += '    classDef result fill:#EF4444,stroke:#B91C1C,stroke-width:3px,color:#fff,font-weight:bold,font-size:16px\n'
    
    // Apply classes
    diagram += '    class A idea\n'
    diagram += '    class B research\n'
    diagram += '    class C,I search\n'
    diagram += '    class O,P assessment\n'
    diagram += '    class N analysis\n'
    diagram += '    class Q planning\n'
    diagram += '    class R code\n'
    diagram += '    class S result\n'
    
    // Apply repo classes
    for (let i = 0; i < repoCount; i++) {
      const nodeId = String.fromCharCode(68 + i)
      diagram += `    class ${nodeId} repo\n`
    }
    
    // Apply patent classes
    for (let i = 0; i < patentCount; i++) {
      const nodeId = String.fromCharCode(74 + i)
      diagram += `    class ${nodeId} patent\n`
    }
    
    // Add workflow annotations
    diagram += '\n    %% Workflow annotations\n'
    diagram += '    A-.->|"Research & Analysis"|B\n'
    diagram += '    N-.->|"Evaluate & Plan"|Q\n'
    diagram += '    Q-.->|"Generate Code"|R\n'
    diagram += '    R-.->|"Build Ready"|S\n'
    
    return diagram
  } catch (err) {
    console.error('Error generating diagram:', err)
    // Return a minimal valid diagram as fallback
    return 'flowchart TD\n    A[" Idea"]:::idea --> B[" Research"]:::research --> C[" Results"]:::result\n    classDef idea fill:#10B981,stroke:#059669,color:#fff\n    classDef research fill:#3B82F6,stroke:#1D4ED8,color:#fff\n    classDef result fill:#F59E0B,stroke:#D97706,color:#fff\n    class A idea\n    class B research\n    class C result'
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
  const apiKey = (window as any).__gemini_api_key || (import.meta as any).env.VITE_GEMINI_API_KEY
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
  "mermaid": "string - valid mermaid diagram code",
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
    
    console.log('Calling Gemini API with patent context...', { url, hasKey: !!apiKey })
    const res = await backoffFetch(url, opts)
    const json = await res.json()
    console.log('Gemini response:', json)
    
    if (json.error) {
      console.error('Gemini API error:', json.error)
      throw new Error(json.error.message || 'Gemini API error')
    }
    
    if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts[0]) {
      const text = json.candidates[0].content.parts[0].text
      console.log('Gemini text response (first 500 chars):', text.substring(0, 500))
      
      try {
        // Try to extract JSON from response (handle markdown code blocks)
        let jsonStr = text
        
        // Remove markdown code blocks if present
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
        
        // Clean up JSON string
        jsonStr = jsonStr.trim()
        
        const parsed = JSON.parse(jsonStr)
        console.log('Successfully parsed Gemini response')
        
        // Use real patents in the response
        const responsePatents = parsed.patents && parsed.patents.length > 0 ? parsed.patents : patents
        
        // Ensure patents and validatedRepos are properly structured
        const patentsArray = responsePatents.map((p: any) => 
          typeof p === 'string' ? { title: p, abstract: '' } : p
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
        console.error('Failed to parse JSON from Gemini response at position:', (parseErr as any).message)
        // Don't fail - use fallback instead
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
      starterCode: '// Error occurred - please try again\nconsole.log("Error: Unable to generate analysis");'
    }
  }
}
