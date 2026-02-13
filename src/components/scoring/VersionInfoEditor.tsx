/**
 * VersionInfoEditor — Inline editor for scorecard version metadata
 */

import { useState, useEffect } from 'react'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { Tag, BookOpen, Link2, FileText } from 'lucide-react'

export function VersionInfoEditor() {
  const scorecard = useActiveScorecard()
  const updateVersionInfo = useScoringStore(s => s.updateVersionInfo)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sourceReference, setSourceReference] = useState('')
  const [sourceLink, setSourceLink] = useState('')

  // Sync from scorecard
  useEffect(() => {
    if (scorecard) {
      setName(scorecard.versionInfo.name)
      setDescription(scorecard.versionInfo.description ?? '')
      setSourceReference(scorecard.versionInfo.sourceReference ?? '')
      setSourceLink(scorecard.versionInfo.sourceLink ?? '')
    }
  }, [scorecard?.id])

  if (!scorecard) return null

  const save = () => {
    updateVersionInfo(scorecard.id, {
      name,
      description: description || undefined,
      sourceReference: sourceReference || undefined,
      sourceLink: sourceLink || undefined,
    })
  }

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Tag className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-sm font-medium text-white">Version Info</span>
        <span className="text-[10px] text-neutral-500 ml-auto">{scorecard.versionInfo.displayVersion}</span>
      </div>

      {/* Name */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] text-neutral-500 mb-1">
          <FileText className="w-3 h-3" /> Version Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={save}
          placeholder="e.g., Expert Model - Conservative Weights"
          className="w-full px-3 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30"
        />
      </div>

      {/* Source reference */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] text-neutral-500 mb-1">
          <BookOpen className="w-3 h-3" /> Source Reference
        </label>
        <input
          type="text"
          value={sourceReference}
          onChange={e => setSourceReference(e.target.value)}
          onBlur={save}
          placeholder="e.g., Based on Vishal's SME scorecard Jan 2026"
          className="w-full px-3 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30"
        />
      </div>

      {/* Source link */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] text-neutral-500 mb-1">
          <Link2 className="w-3 h-3" /> Source Link (optional)
        </label>
        <input
          type="url"
          value={sourceLink}
          onChange={e => setSourceLink(e.target.value)}
          onBlur={save}
          placeholder="https://..."
          className="w-full px-3 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-[10px] text-neutral-500 mb-1 block">Notes / Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={save}
          rows={2}
          placeholder="Optional notes about this version..."
          className="w-full px-3 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30 resize-none"
        />
      </div>
    </div>
  )
}
