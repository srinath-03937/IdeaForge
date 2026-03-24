import React from 'react'
import { collection, query, getDocs, doc, Timestamp, updateDoc, setDoc } from 'firebase/firestore'
import { getFirebaseFirestore, appId } from '../firebase/config'

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

  const loadHistory = async () => {
    try {
      const fs = getFirebaseFirestore()
      if (!fs) {
        console.warn('Firestore not initialized')
        return
      }
      const path = `history`
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
    } catch (err) {
      console.warn('Failed to load history (Firebase permissions may be required):', err)
      setHistory([]) // Set empty history as fallback
    }
  }

  const pinPaperToForge = async (forgeId: string, paper: any) => {
    try {
      const fs = getFirebaseFirestore()
      if (!fs) {
        console.warn('Firestore not initialized')
        return
      }
      const path = `history/${forgeId}`
      const forgeRef = doc(fs, path)
      const forgeSnap = await getDocs(query(collection(fs, `history`)))
      const forge = forgeSnap.docs.find(d => d.id === forgeId)
      if (!forge) return
      const pinnedPapers = forge.data()?.pinnedPapers || []
      const exists = pinnedPapers.find((p: any) => p.id === paper.id)
      if (!exists) {
        pinnedPapers.push({
          ...paper,
          pinnedAt: Timestamp.now()
        })
        await updateDoc(forgeRef, { pinnedPapers })
        console.log('Paper pinned to forge')
      }
    } catch (err) {
      console.warn('Failed to pin paper to forge (Firebase permissions may be required):', err)
    }
  }

  const synthesizeFindings = async (forgeId: string, findings: string) => {
    try {
      const fs = getFirebaseFirestore()
      if (!fs) return findings
      const path = `history/${forgeId}`
      const forgeRef = doc(fs, path)
      
      // Use setDoc with merge to create document if it doesn't exist
      await setDoc(forgeRef, { synthesizedFindings: findings }, { merge: true })
      console.log('Findings synthesized for forge:', forgeId)
      await loadHistory()
      return findings
    } catch (err) {
      console.warn('Failed to synthesize findings (Firebase permissions may be required):', err)
      return findings // Return findings even if Firebase fails
    }
  }

  const calculatePatentSimilarity = async (forgeId: string, score: number) => {
    try {
      const fs = getFirebaseFirestore()
      if (!fs) return
      const path = `history/${forgeId}`
      const forgeRef = doc(fs, path)
      await updateDoc(forgeRef, { patentSimilarityScore: score })
      console.log('Patent similarity score updated')
    } catch (err) {
      console.warn('Failed to update patent similarity (Firebase permissions may be required):', err)
    }
  }

  const updateLifecycleTag = async (forgeId: string, tag: string) => {
    try {
      const fs = getFirebaseFirestore()
      if (!fs) return
      const path = `history/${forgeId}`
      const forgeRef = doc(fs, path)
      await updateDoc(forgeRef, { lifecycleTag: tag })
      console.log('Lifecycle tag updated')
    } catch (err) {
      console.warn('Failed to update lifecycle tag (Firebase permissions may be required):', err)
    }
  }

  React.useEffect(() => {
    loadHistory().catch(err => console.error('Firestore load error:', err))
  }, [])

  return {
    history,
    loadHistory,
    pinPaperToForge,
    synthesizeFindings,
    calculatePatentSimilarity,
    updateLifecycleTag
  }
}
