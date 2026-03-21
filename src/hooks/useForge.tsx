import React from 'react'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { getFirebaseFirestore, appId } from '../services/firebaseConfig'
import useAuth from './useAuth'
import { searchGitHubRepos } from '../services/githubService'
import { callGemini } from '../services/geminiService'
import { AnalysisResult } from '../types'

export interface CurrentForge {
  id: string
  idea: string
  result?: AnalysisResult
  loading?: boolean
  patentSimilarityScore?: number
}

const ForgeContext = React.createContext<{
  currentForge: CurrentForge
  startForge: () => Promise<void>
  setIdea: (idea: string) => void
  loadForgeFromHistory: (forge: any) => void
  shouldSearchPapers: boolean
  clearPaperSearchTrigger: () => void
} | null>(null)

export function ForgeProvider({ children }: { children: React.ReactNode }) {
  const [currentForge, setCurrentForge] = React.useState<CurrentForge>({ id: 'new', idea: '' })
  const [shouldSearchPapers, setShouldSearchPapers] = React.useState(false)
  const { user } = useAuth()

  const setIdea = (idea: string) => {
    console.log('setIdea called with:', idea)
    setCurrentForge((prev: CurrentForge) => {
      const updated = { ...prev, idea }
      console.log('currentForge updated to:', updated)
      return updated
    })
  }

  const loadForgeFromHistory = (forge: any) => {
    console.log('Loading forge from history:', forge)
    setCurrentForge({
      id: forge.id,
      idea: forge.idea,
      result: forge.result,
      loading: false
    })
  }

  const startForge = async () => {
    console.warn('startForge called, state:', { currentForgeId: currentForge.id, idea: currentForge.idea, userId: user?.uid })
    
    // Validate idea is not empty
    if (!currentForge.idea || currentForge.idea.trim().length === 0) {
      console.error('No idea provided')
      alert('Please enter an idea first')
      return
    }
    
    if (!user) {
      console.error('User not authenticated')
      alert('Please sign in first')
      return
    }
    
    console.log('Starting forge with idea:', currentForge.idea)
    setCurrentForge((f: CurrentForge) => ({ ...f, loading: true }))

    try {
      // Step 1: GitHub search (grounded data)
      console.log('Step 1: Searching GitHub...')
      const repos = await searchGitHubRepos(currentForge.idea, 6)
      console.log('GitHub repos returned:', repos)

      // Step 2: Gemini call with context
      console.log('Step 2: Calling Gemini...')
      const result = await callGemini(currentForge.idea, repos)
      console.log('Gemini result:', result)

      const updated = { ...currentForge, result, loading: false }
      setCurrentForge(updated)

      // Step 3: Trigger automatic paper search for Module 2
      console.log('Step 3: Triggering automatic paper search...')
      setShouldSearchPapers(true)

      // Save to Firestore
      const fs = getFirebaseFirestore()
      if (!fs) {
        console.error('Firestore not initialized')
        return
      }
      const forgeId = updated.id === 'new' ? Date.now().toString() : updated.id
      const path = `artifacts/${appId()}/users/${user.uid}/forges/${forgeId}`
      console.log('Saving to Firestore path:', path)
      await setDoc(doc(fs, path), {
        idea: updated.idea,
        result: updated.result,
        createdAt: Timestamp.now()
      })
      console.log('Forge saved successfully!')
    } catch (err) {
      console.error('Forge error:', err)
      setCurrentForge((f: CurrentForge) => ({ ...f, loading: false }))
    }
  }

  const clearPaperSearchTrigger = () => {
    setShouldSearchPapers(false)
  }

  return (
    <ForgeContext.Provider value={{ 
      currentForge, 
      startForge, 
      setIdea, 
      loadForgeFromHistory,
      shouldSearchPapers,
      clearPaperSearchTrigger
    }}>
      {children}
    </ForgeContext.Provider>
  )
}

export function useForge() {
  const ctx = React.useContext(ForgeContext)
  if (!ctx) throw new Error('useForge must be inside ForgeProvider')
  return ctx
}
