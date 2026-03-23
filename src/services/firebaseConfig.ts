import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

declare global { interface Window { __firebase_config:any; __app_id?:string } }

export function initFirebase(){
  if(!getApps().length){
    const cfg = window.__firebase_config || {
      // Hardcoded fallback configuration
      apiKey: "AIzaSyCdyPvFnhdPWbU9wpMApdk2n-ACUBT1p5I",
      authDomain: "ideaforge-51a7f.firebaseapp.com",
      projectId: "ideaforge-51a7f",
      storageBucket: "ideaforge-51a7f.firebasestorage.app",
      messagingSenderId: "989454342380",
      appId: "1:989454342380:web:3910f7c6615bbbe5b8edc9",
      measurementId: "G-QHQJQ1JCHG"
    }
    
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
      console.log('Firebase initialized successfully with config source:', {
        window: !!(window as any).__firebase_config,
        fallback: !!(window as any).__firebase_config === undefined
      })
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
