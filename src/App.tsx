import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ProjectHub from './pages/ProjectHub'
import { ForgeProvider } from './hooks/useForge'
import { ThemeProvider } from './hooks/useTheme'

export default function App() {
  return (
    <ThemeProvider>
      <ForgeProvider>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project-hub" element={<ProjectHub />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ForgeProvider>
    </ThemeProvider>
  )
}
