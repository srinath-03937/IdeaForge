import React from 'react'
import { useExport } from '../hooks/useExport'
import { Download } from 'lucide-react'

export default function ExportButton({ data }: { data: any }) {
  const { downloadBundle, downloadMarkdown } = useExport()

  return (
    <div className="flex gap-3 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-slate-900/30 dark:to-slate-800/30 border-2 border-emerald-400 dark:border-cyan-500/40 shadow-sm">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 rounded-lg text-white font-semibold border-2 border-emerald-700 dark:border-emerald-500 transition shadow-md"
        onClick={() => downloadBundle(data)}
      >
        <Download size={18} /> Export JSON
      </button>
      {data.result?.engineeringReportMarkdown && (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 dark:from-cyan-600 dark:to-cyan-700 dark:hover:from-cyan-700 dark:hover:to-cyan-800 rounded-lg text-white font-semibold border-2 border-cyan-700 dark:border-cyan-500 transition shadow-md"
          onClick={() => downloadMarkdown(data.result.engineeringReportMarkdown)}
        >
          <Download size={18} /> Report
        </button>
      )}
    </div>
  )
}
