import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

declare global { interface Window { __firebase_config:any; __app_id?:string } }

export function initFirebase(){
  if(!getApps().length){
    const cfg = window.__firebase_config
    if(!cfg || !cfg.apiKey){
      console.warn('Firebase config not found in window.__firebase_config. Please add credentials to public/config.js')
      // Try environment variables as fallback
      const envConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      }
      if (!envConfig.apiKey) {
        console.warn('Firebase config not found in environment variables either')
        return false
      }
      try {
        initializeApp(envConfig)
        return true
      } catch(err){
        console.error('Firebase init error with env config:', err)
        return false
      }
    }
    try {
      initializeApp(cfg)
      return true
    } catch(err){
      console.error('Firebase init error:', err)
      return false
    }
  }
  return true
}

export function getFirebaseAuth(){
  try {
    const initialized = initFirebase()
    if(!initialized) return null
    return getAuth()
  } catch(err){
    console.error('Firebase auth error:', err)
    return null
  }
}

export function getFirebaseFirestore(){
  try {
    const initialized = initFirebase()
    if(!initialized) return null
    return getFirestore()
  } catch(err){
    console.error('Firestore error:', err)
    return null
  }
}

export function appId(){
  return window.__app_id || 'ideaforge'
}
