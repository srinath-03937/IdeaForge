import React from 'react'
import { collection, query, where, getDocs, deleteDoc, doc, Timestamp, updateDoc, addDoc, setDoc } from 'firebase/firestore'
import { getFirebaseFirestore, appId } from '../services/firebaseConfig'
import { useAuth } from './useAuth'

export interface ForgeDoc {
  id: string
  idea: string
  title?: string
  createdAt?: Timestamp
  result?: any
  lifecycleTag?: 'active_research' | 'validated' | 'hardware_mvp' | 'shelved'
  pinnedPapers?: Array<{
    id: string
    title: string
    authors: string[]
    pdfUrl?: string
    summary: string
    pinnedAt: Timestamp
  }>
  synthesizedFindings?: string
  patentSimilarityScore?: number
}

export function useFirestore(){
  const [history, setHistory] = React.useState<ForgeDoc[]>([])
  const { user } = useAuth()

  const loadHistory = async () => {
    if(!user) return
    const fs = getFirebaseFirestore()
    if (!fs) {
      console.warn('Firestore not initialized')
      return
    }
    const path = `artifacts/${appId()}/users/${user.uid}/forges`
    const q = query(collection(fs, path))
    const snap = await getDocs(q)
    const docs = snap.docs.map(d=>({ id: d.id, ...d.data() } as ForgeDoc))
    // Sort by createdAt descending (newest first)
    docs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0
      const timeB = b.createdAt?.toMillis?.() || 0
      return timeB - timeA
    })
    setHistory(docs)
  }

  React.useEffect(()=>{
    if(!user) return
    loadHistory().catch(err => console.error('Firestore load error:', err))
  }, [user])

  const deleteForge = async (forgeId: string) => {
    if(!user) {
      console.error('User not authenticated')
      return
    }
    const fs = getFirebaseFirestore()
    if (!fs) {
      console.warn('Firestore not initialized')
      return
    }
    try {
      const path = `artifacts/${appId()}/users/${user.uid}/forges/${forgeId}`
      await deleteDoc(doc(fs, path))
      console.log('Forge deleted:', forgeId)
      // Reload history after delete
      await loadHistory()
    } catch (err) {
      console.error('Failed to delete forge:', err)
    }
  }

  const updateLifecycleTag = async (forgeId: string, tag: ForgeDoc['lifecycleTag']) => {
    if(!user) return
    const fs = getFirebaseFirestore()
    if (!fs) return
    try {
      const path = `artifacts/${appId()}/users/${user.uid}/forges/${forgeId}`
      await updateDoc(doc(fs, path), { lifecycleTag: tag })
      console.log('Lifecycle tag updated:', tag)
      await loadHistory()
    } catch (err) {
      console.error('Failed to update lifecycle tag:', err)
    }
  }

  const pinPaperToForge = async (forgeId: string, paper: any) => {
    if(!user) return
    const fs = getFirebaseFirestore()
    if (!fs) return
    try {
      const path = `artifacts/${appId()}/users/${user.uid}/forges/${forgeId}`
      const forgeRef = doc(fs, path)
      const currentForge = history.find(f => f.id === forgeId)
      
      const newPaper = {
        id: paper.id || Date.now().toString(),
        title: paper.title,
        authors: paper.authors || [],
        pdfUrl: paper.pdfUrl,
        summary: paper.summary || paper.abstract,
        pinnedAt: Timestamp.now()
      }

      const pinnedPapers = [...(currentForge?.pinnedPapers || []), newPaper]
      await updateDoc(forgeRef, { pinnedPapers })
      console.log('Paper pinned to forge:', paper.title)
      await loadHistory()
    } catch (err) {
      console.error('Failed to pin paper:', err)
    }
  }

  const synthesizeFindings = async (forgeId: string, selectedPapers: any[]) => {
    if(!user) return
    const fs = getFirebaseFirestore()
    if (!fs) return
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).__gemini_api_key
      if (!apiKey) throw new Error('Gemini API key not configured')

      const papersText = selectedPapers.map(p => `- ${p.title}: ${p.summary || p.abstract}`).join('\n')
      
      const payload = {
        contents: [{
          parts: [{
            text: `Write a one-page literature review synthesizing these research findings:

${papersText}

Focus on:
1. Key themes and patterns across the papers
2. Methodological approaches
3. Main findings and implications
4. Research gaps and opportunities

Provide a concise, academic-style synthesis (500-800 words).`
          }]
        }]
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      let synthesis = 'Unable to synthesize findings'

      if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
        synthesis = json.candidates[0].content.parts[0].text
      }

      const path = `artifacts/${appId()}/users/${user.uid}/forges/${forgeId}`
      await updateDoc(doc(fs, path), { synthesizedFindings: synthesis })
      console.log('Findings synthesized for forge:', forgeId)
      await loadHistory()
      return synthesis
    } catch (err) {
      console.error('Failed to synthesize findings:', err)
      throw err
    }
  }

  const calculatePatentSimilarity = async (forgeId: string, patents: any[]) => {
    if(!user) return
    const fs = getFirebaseFirestore()
    if (!fs) return
    
    try {
      // Simple similarity calculation based on keyword overlap and concept matching
      const currentForge = history.find(f => f.id === forgeId)
      if (!currentForge?.result) return

      const ideaKeywords = currentForge.idea.toLowerCase().split(' ')
      const refinedKeywords = (currentForge.result.refinedConcept || '').toLowerCase().split(' ')
      const allKeywords = [...ideaKeywords, ...refinedKeywords]

      let totalSimilarity = 0
      let validPatents = 0

      patents.forEach(patent => {
        if (!patent.title) return
        validPatents++
        
        const patentText = (patent.title + ' ' + (patent.abstract || '')).toLowerCase()
        const matchingKeywords = allKeywords.filter(keyword => 
          patentText.includes(keyword) && keyword.length > 3
        ).length
        
        const similarity = (matchingKeywords / Math.max(allKeywords.length, 1)) * 100
        totalSimilarity += similarity
      })

      const averageSimilarity = validPatents > 0 ? totalSimilarity / validPatents : 0
      const normalizedScore = Math.min(100, Math.max(0, averageSimilarity))

      const path = `artifacts/${appId()}/users/${user.uid}/forges/${forgeId}`
      await updateDoc(doc(fs, path), { patentSimilarityScore: normalizedScore })
      console.log('Patent similarity calculated:', normalizedScore)
      await loadHistory()
      return normalizedScore
    } catch (err) {
      console.error('Failed to calculate patent similarity:', err)
      return 0
    }
  }

  const exportForges = async (forgeIds: string[]) => {
    if(!user) return
    const fs = getFirebaseFirestore()
    if (!fs) return

    try {
      // Dynamic import for JSZip
      const JSZip = (await import('jszip')).default || (window as any).JSZip
      
      if (!JSZip) {
        throw new Error('JSZip not available')
      }

      const zip = new JSZip()
      
      for (const forgeId of forgeIds) {
        const forge = history.find(f => f.id === forgeId)
        if (!forge) continue

        // Create project folder
        const folderName = forge.idea?.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_') || 'project'
        
        // Create README content
        const readmeContent = `# ${forge.idea}

**Created:** ${forge.createdAt ? new Date(typeof forge.createdAt === 'object' && 'toMillis' in forge.createdAt ? forge.createdAt.toMillis() : forge.createdAt).toLocaleDateString() : 'Unknown'}

**Feasibility:** ${forge.result?.feasibility || 0}%
**Novelty:** ${forge.result?.novelty || 0}%

## Description
${forge.result?.refinedConcept || forge.idea}

## Engineering Report
${forge.result?.engineeringReportMarkdown || 'No engineering report available'}

## Roadmap
${forge.result?.roadmap?.map((step: any, index: number) => `${index + 1}. ${step}`).join('\n') || 'No roadmap available'}

## Synthesized Findings
${forge.synthesizedFindings || 'No findings synthesized yet'}

## Pinned Papers
${forge.pinnedPapers?.map((paper: any, index: number) => 
  `${index + 1}. **${paper.title}**\n   Authors: ${paper.authors?.join(', ') || 'Unknown'}\n   ${paper.summary || 'No summary'}\n   PDF: ${paper.pdfUrl || 'No PDF available'}`
).join('\n\n') || 'No papers pinned yet'}

## Patent Analysis
${forge.result?.patents?.map((patent: any, index: number) => 
  `${index + 1}. **${patent.title}**\n   Abstract: ${patent.abstract || 'No abstract'}\n   Inventors: ${patent.inventors?.join(', ') || 'Unknown'}\n   Filing Date: ${patent.filingDate || 'Unknown'}\n   Technologies: ${patent.technologies?.join(', ') || 'Unknown'}`
).join('\n\n') || 'No patent analysis available'}

## Starter Code
\`\`\`typescript
${forge.result?.starterCode || '// No starter code available'}
\`\`\`

---
*Generated by IdeaForge R&D Platform*
`

        // Add files to ZIP
        zip.file(`${folderName}/README.md`, readmeContent)
        
        if (forge.result?.starterCode) {
          zip.file(`${folderName}/starter-code.ts`, forge.result.starterCode)
        }
        
        if (forge.synthesizedFindings) {
          zip.file(`${folderName}/synthesized-findings.md`, forge.synthesizedFindings)
        }
        
        if (forge.pinnedPapers && forge.pinnedPapers.length > 0) {
          zip.file(`${folderName}/pinned-papers.json`, JSON.stringify(forge.pinnedPapers, null, 2))
        }
        
        if (forge.result?.patents && forge.result.patents.length > 0) {
          zip.file(`${folderName}/patent-analysis.json`, JSON.stringify(forge.result.patents, null, 2))
        }
      }

      // Generate ZIP file
      const content = await zip.generateAsync({ type: 'blob' })
      
      // Create download link
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `ideaforge-portfolio-${Date.now()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('Portfolio exported successfully')
    } catch (err) {
      console.error('Export failed:', err)
      throw err
    }
  }

  return { 
    history, 
    deleteForge, 
    loadHistory, 
    updateLifecycleTag, 
    pinPaperToForge, 
    synthesizeFindings, 
    calculatePatentSimilarity,
    exportForges
  }
}
