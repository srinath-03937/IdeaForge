import React from 'react'
import { collection, query, getDocs, doc, Timestamp, updateDoc } from 'firebase/firestore'
import { getFirebaseFirestore, appId } from '../services/firebaseConfig'

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
    const fs = getFirebaseFirestore()
    if (!fs) {
      console.warn('Firestore not initialized')
      return
    }
    const path = `artifacts/${appId()}/forges`
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

  const pinPaperToForge = async (forgeId: string, paper: any) => {
    const fs = getFirebaseFirestore()
    if (!fs) return
    const path = `artifacts/${appId()}/forges/${forgeId}`
    const forgeRef = doc(fs, path)
    const forgeSnap = await getDocs(query(collection(fs, `artifacts/${appId()}/forges`)))
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
  }

  const synthesizeFindings = async (forgeId: string, findings: string) => {
    const fs = getFirebaseFirestore()
    if (!fs) return
    const path = `artifacts/${appId()}/forges/${forgeId}`
    const forgeRef = doc(fs, path)
    await updateDoc(forgeRef, { synthesizedFindings: findings })
    console.log('Findings synthesized for forge')
  }

  const calculatePatentSimilarity = async (forgeId: string, score: number) => {
    const fs = getFirebaseFirestore()
    if (!fs) return
    const path = `artifacts/${appId()}/forges/${forgeId}`
    const forgeRef = doc(fs, path)
    await updateDoc(forgeRef, { patentSimilarityScore: score })
    console.log('Patent similarity score updated')
  }

  const updateLifecycleTag = async (forgeId: string, tag: string) => {
    const fs = getFirebaseFirestore()
    if (!fs) return
    const path = `artifacts/${appId()}/forges/${forgeId}`
    const forgeRef = doc(fs, path)
    await updateDoc(forgeRef, { lifecycleTag: tag })
    console.log('Lifecycle tag updated')
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
