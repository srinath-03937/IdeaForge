import React from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    // Get from localStorage or default to dark
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme | null
      return saved || 'dark'
    }
    return 'dark'
  })

  React.useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', theme)
    
    // Update HTML element class
    const html = document.documentElement
    if (theme === 'light') {
      html.classList.add('light')
      html.classList.remove('dark')
    } else {
      html.classList.add('dark')
      html.classList.remove('light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    // Return default values if context is not available
    console.warn('useTheme called outside ThemeProvider, using defaults')
    return { theme: 'dark' as Theme, toggleTheme: () => {} }
  }
  return ctx
}
