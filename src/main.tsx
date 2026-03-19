import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

// Fallback: Set Gemini API key if not available from config
if (!(window as any).__gemini_api_key) {
  (window as any).__gemini_api_key = 'AIzaSyDRzP-ueSjqjPBjYG1tCRPMbn48_o52DO4'
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
