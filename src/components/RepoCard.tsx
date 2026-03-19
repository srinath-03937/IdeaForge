import React from 'react'
import { Repo } from '../types'

export default function RepoCard({ repo }: { repo: Repo }) {
  return (
    <div className="p-3 rounded-lg bg-white dark:bg-white/5 border-2 border-cyan-200 dark:border-white/10 hover:shadow-md dark:hover:bg-white/10 transition">
      <a 
        href={repo.html_url} 
        target="_blank" 
        rel="noreferrer" 
        className="font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 break-words"
      >
        {repo.full_name}
      </a>
      <p className="text-sm text-slate-700 dark:text-white/70 mt-1">{repo.description || 'No description'}</p>
      <div className="text-xs mt-2 text-slate-600 dark:text-white/50 flex gap-3 flex-wrap">
        <span>⭐ {repo.stargazers_count || 0} stars</span>
        <span>💻 {repo.language || 'Unknown'}</span>
      </div>
    </div>
  )
}
