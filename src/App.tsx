import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProjectHub from './pages/ProjectHub'
import { AuthProvider } from './hooks/useAuth'
import { ForgeProvider } from './hooks/useForge'
import { ThemeProvider } from './hooks/useTheme'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ForgeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project-hub" element={<ProjectHub />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </ForgeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
