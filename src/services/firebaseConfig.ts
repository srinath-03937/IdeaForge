import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

declare global { interface Window { __firebase_config?:any; __app_id?:string } }

export function initFirebase() {
  try {
    if (!getApps().length) {
      // Try to get config from window or use fallback
      const cfg = window.__firebase_config || {
        apiKey: "AIzaSyDRzP-ueSjqjPBjYG1tCRPMbn48_o52DO4",
        authDomain: "ideaforge-51a7f.firebaseapp.com",
        projectId: "ideaforge-51a7f",
        storageBucket: "ideaforge-51a7f.firebasestorage.app",
        messagingSenderId: "989454342380",
        appId: "1:989454342380:web:3910f7c6615bbbe5b8edc9"
      }
      
      if (!cfg || !cfg.apiKey) {
        console.error('Firebase config not found')
        return false
      }
      
      initializeApp(cfg)
      console.log('Firebase initialized successfully')
      return true
    }
    return true
  } catch (err) {
    console.error('Firebase init error:', err)
    return false
  }
}

export function getFirebaseAuth() {
  try {
    const initialized = initFirebase()
    if (!initialized) return null
    return getAuth()
  } catch (err) {
    console.error('Firebase auth error:', err)
    return null
  }
}

export function getFirebaseFirestore() {
  try {
    const initialized = initFirebase()
    if (!initialized) return null
    return getFirestore()
  } catch (err) {
    console.error('Firestore error:', err)
    return null
  }
}

export function appId() {
  return window.__app_id || 'ideaforge-51a7f'
}

// Firebase configuration for deployment
export const firebaseConfig = {
  apiKey: "AIzaSyDRzP-ueSjqjPBjYG1tCRPMbn48_o52DO4",
  authDomain: "ideaforge-51a7f.firebaseapp.com",
  projectId: "ideaforge-51a7f",
  storageBucket: "ideaforge-51a7f.firebasestorage.app",
  messagingSenderId: "989454342380",
  appId: "1:989454342380:web:3910f7c6615bbbe5b8edc9",
  measurementId: "G-QHQJQ1JCHG"
}
