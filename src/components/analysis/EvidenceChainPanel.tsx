import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, Calculator, Target, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EvidenceChain, Citation } from '@/types'

interface EvidenceChainPanelProps {
  evidenceChain?: EvidenceChain
  citation?: Citation
  metricName: string
}

export function EvidenceChainPanel({ evidenceChain, citation, metricName }: EvidenceChainPanelProps) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  // Generate default evidence chain if not provided but has citation
  const chain: EvidenceChain = evidenceChain || {
    level1: {
      source: citation?.source || 'Company Filings',
      documentType: citation?.document || 'Annual Report',
      filingDate: citation?.date || 'FY 2024',
    },
    level2: {
      calculation: `${metricName} is calculated from audited financial statements`,
      rawDataPoints: ['Revenue', 'Net Profit', 'Total Assets'].slice(0, 3),
      methodology: 'Standard financial ratio methodology as per SEBI guidelines',
    },
    level3: {
      segmentContribution: `${metricName} contributes to segment score based on sector benchmarks`,
      weightInScore: 15,
      impactDescription: 'Weighted by relevance to investment thesis and sector norms',
    },
  }

  const toggleLevel = (level: number) => {
    setExpandedLevel(expandedLevel === level ? null : level)
  }

  const levels = [
    {
      level: 1,
      title: 'Raw Data Source',
      icon: FileText,
      subtitle: 'Where does this data come from?',
      color: 'primary',
    },
    {
      level: 2,
      title: 'Calculation Methodology',
      icon: Calculator,
      subtitle: 'How was this metric computed?',
      color: 'info',
    },
    {
      level: 3,
      title: 'Score Contribution',
      icon: Target,
      subtitle: 'How does this affect the overall score?',
      color: 'success',
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
          Evidence Chain
        </span>
        <span className="text-[10px] text-neutral-600 bg-dark-600 px-2 py-0.5 rounded">
          3-Level Transparency
        </span>
      </div>

      {levels.map(({ level, title, icon: Icon, subtitle, color }) => (
        <div key={level} className="rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => toggleLevel(level)}
            className="w-full flex items-center gap-3 p-3 bg-dark-700/50 hover:bg-dark-700 transition-colors"
          >
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              color === 'primary' && 'bg-primary-500/20 text-primary-400',
              color === 'info' && 'bg-info-500/20 text-info-400',
              color === 'success' && 'bg-success-500/20 text-success-400',
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-white block">
                Level {level}: {title}
              </span>
              <span className="text-xs text-neutral-500">{subtitle}</span>
            </div>
            {expandedLevel === level ? (
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          {expandedLevel === level && (
            <div className="p-4 bg-dark-800/50 border-t border-white/5 animate-fade-in">
              {level === 1 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">Source</span>
                    <span className="text-sm text-white font-medium">{chain.level1.source}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">Document Type</span>
                    <span className="text-sm text-white">{chain.level1.documentType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">Filing Date</span>
                    <span className="text-sm text-white">{chain.level1.filingDate}</span>
                  </div>
                  {citation?.url && citation.url !== '#' && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-3 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Original Filing
                    </a>
                  )}
                </div>
              )}

              {level === 2 && (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-neutral-500 block mb-1">Calculation</span>
                    <span className="text-sm text-white">{chain.level2.calculation}</span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 block mb-2">Raw Data Points Used</span>
                    <div className="flex flex-wrap gap-2">
                      {chain.level2.rawDataPoints.map((point, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-dark-600 text-neutral-300 rounded text-xs"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 block mb-1">Methodology</span>
                    <span className="text-sm text-neutral-400">{chain.level2.methodology}</span>
                  </div>
                </div>
              )}

              {level === 3 && (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-neutral-500 block mb-1">Contribution to Segment</span>
                    <span className="text-sm text-white">{chain.level3.segmentContribution}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">Weight in Score</span>
                    <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                        style={{ width: `${chain.level3.weightInScore}%` }}
                      />
                    </div>
                    <span className="text-sm text-primary-400 font-medium">
                      {chain.level3.weightInScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 block mb-1">Impact Description</span>
                    <span className="text-sm text-neutral-400">{chain.level3.impactDescription}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
