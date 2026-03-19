import React from 'react'

export interface ExportBundleData {
  idea: string
  result?: any
}

export function useExport() {
  const downloadBundle = (data: ExportBundleData) => {
    const bundle = {
      idea: data.idea,
      result: data.result,
      exportedAt: new Date().toISOString()
    }
    const json = JSON.stringify(bundle, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ideaforge-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadMarkdown = (markdown: string) => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ideaforge-report-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { downloadBundle, downloadMarkdown }
}
