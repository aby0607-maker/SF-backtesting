/**
 * Scoring Pipeline Store — Zustand state management for the 5-stage pipeline
 *
 * Pipeline: Metrics → Scorecard → Configure → Review & Run → Results
 *
 * Manages: pipeline navigation, scorecard CRUD, version history,
 * universe selection, combined scoring+backtest results, and review snapshots.
 *
 * Pattern: Follows useAppStore.ts — Zustand v5 + persist + selector hooks
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  PipelineStage,
  UIMode,
  ScoringStatus,
  ScorecardVersion,
  ScorecardSegment,
  CompositeMetric,
  CompositeFormula,
  NormalizationConfig,
  VerdictThreshold,
  VerdictDisplayMode,
  ModelRunResult,
  CombinedRunResult,
  BacktestConfig,
  BacktestInterval,
  BacktestResult,
  PipelineReviewSnapshot,
  SavedRun,
  MetricFormula,
  ScoreBand,
} from '@/types/scoring'
import { SCORECARD_TEMPLATES } from '@/data/scorecardTemplates'

// ─────────────────────────────────────────────────
// State Interface
// ─────────────────────────────────────────────────

interface ScoringState {
  // Pipeline navigation
  currentStage: PipelineStage
  uiMode: UIMode

  // Scorecard management
  scorecards: ScorecardVersion[]
  activeScorecardId: string | null
  versionHistory: Record<string, ScorecardVersion[]>  // macroVersion → versions

  // Stage 3: Universe filter (stock selection + date range + benchmark)
  universeFilter: {
    mode: 'individual' | 'cohort' | 'all'
    mcapTypes: string[]    // e.g. ['Large Cap'] — cohort mode only
    sectors: string[]      // e.g. ['Finance'] — cohort mode only
    customSymbols: string[] // e.g. ['RELIANCE', 'TCS'] — individual mode + cohort additions
  }

  // Backtest config (date range, interval, benchmark)
  backtestConfig: BacktestConfig | null

  // Stage 4→5: Combined scoring + backtest result
  combinedResult: CombinedRunResult | null

  // Legacy fields kept for backward compatibility with saved runs
  currentRun: ModelRunResult | null
  currentRunFilterHash: string | null
  backtestResult: BacktestResult | null

  // Review snapshot
  reviewSnapshot: PipelineReviewSnapshot | null

  // Saved runs for comparison
  savedRuns: SavedRun[]

  // Status
  status: ScoringStatus
  errorMessage: string | null

  // ─── Actions: Pipeline Navigation ───
  setStage: (stage: PipelineStage) => void
  nextStage: () => void
  prevStage: () => void
  setUIMode: (mode: UIMode) => void
  editFromReview: (stageNumber: 1 | 2 | 3) => void

  // ─── Actions: Scorecard CRUD ───
  createScorecard: (name: string, macroVersion: string) => string
  duplicateScorecard: (scorecardId: string, newName?: string) => string | null
  updateScorecard: (scorecardId: string, updates: Partial<ScorecardVersion>) => void
  deleteScorecard: (scorecardId: string) => void
  setActiveScorecard: (scorecardId: string) => void
  loadTemplate: (templateId: string) => string | null

  // ─── Actions: Version Management ───
  createMicroVersion: (scorecardId: string) => string | null
  revertToVersion: (scorecardId: string) => void
  updateVersionInfo: (scorecardId: string, updates: { name?: string; description?: string; sourceReference?: string; sourceLink?: string }) => void

  // ─── Actions: Metric Operations ───
  addMetric: (segmentId: string, metric: CompositeMetric) => void
  removeMetric: (segmentId: string, metricId: string) => void
  updateMetric: (segmentId: string, metricId: string, updates: Partial<CompositeMetric>) => void
  createFormula: (segmentId: string, formula: MetricFormula, scoreBands: ScoreBand[], weight?: number) => void
  updateScoreBands: (segmentId: string, metricId: string, bands: ScoreBand[]) => void

  // ─── Actions: Segment Operations ───
  addSegment: (segment: ScorecardSegment) => void
  removeSegment: (segmentId: string) => void
  updateSegmentWeight: (segmentId: string, weight: number) => void
  updateCompositeFormula: (formula: CompositeFormula) => void
  updateNormalization: (config: NormalizationConfig) => void
  updateVerdictThresholds: (thresholds: VerdictThreshold[]) => void
  setVerdictDisplayMode: (mode: VerdictDisplayMode) => void

  // ─── Actions: Review & Confirm ───
  generateReviewSnapshot: () => void
  confirmReview: () => void

  // ─── Actions: Universe & Config & Results ───
  setUniverseFilter: (filter: Partial<ScoringState['universeFilter']>) => void
  setBacktestConfig: (config: Partial<BacktestConfig>) => void
  setCombinedResult: (result: CombinedRunResult | null) => void
  setCurrentRun: (run: ModelRunResult | null, filterHash?: string | null) => void
  setBacktestResult: (result: BacktestResult | null) => void
  setStatus: (status: ScoringStatus) => void
  setError: (message: string | null) => void

  // ─── Actions: Persistence ───
  saveRun: (name: string) => string | null
  deleteRun: (runId: string) => void
  loadRun: (runId: string) => void
  resetPipeline: () => void
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Get the active scorecard from state, applying mutations only to it */
function getActiveScorecard(state: ScoringState): ScorecardVersion | null {
  if (!state.activeScorecardId) return null
  return state.scorecards.find(s => s.id === state.activeScorecardId) ?? null
}

/** Update the active scorecard in the scorecards array */
function updateActiveInList(
  scorecards: ScorecardVersion[],
  activeScorecardId: string | null,
  updater: (sc: ScorecardVersion) => ScorecardVersion
): ScorecardVersion[] {
  if (!activeScorecardId) return scorecards
  return scorecards.map(sc =>
    sc.id === activeScorecardId ? updater(sc) : sc
  )
}

// ─────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────

export const useScoringStore = create<ScoringState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStage: 1 as PipelineStage,
      uiMode: 'wizard' as UIMode,

      scorecards: [],
      activeScorecardId: null,
      versionHistory: {},

      universeFilter: { mode: 'cohort' as const, mcapTypes: ['Large Cap'], sectors: [], customSymbols: [] },
      backtestConfig: null,
      combinedResult: null,
      currentRun: null,
      currentRunFilterHash: null,
      backtestResult: null,
      reviewSnapshot: null,

      savedRuns: [],
      status: 'idle' as ScoringStatus,
      errorMessage: null,

      // ─── Pipeline Navigation ───

      setStage: (stage: PipelineStage) => {
        set({ currentStage: stage })
      },

      nextStage: () => {
        set(state => ({
          currentStage: Math.min(5, state.currentStage + 1) as PipelineStage,
        }))
      },

      prevStage: () => {
        set(state => ({
          currentStage: Math.max(1, state.currentStage - 1) as PipelineStage,
        }))
      },

      setUIMode: (mode: UIMode) => {
        set({ uiMode: mode })
      },

      editFromReview: (stageNumber: 1 | 2 | 3) => {
        set({ currentStage: stageNumber })
      },

      // ─── Scorecard CRUD ───

      createScorecard: (name: string, macroVersion: string) => {
        const id = generateId()
        const scorecard: ScorecardVersion = {
          id,
          versionInfo: {
            macroVersion,
            microVersion: 1,
            displayVersion: `${macroVersion}.1`,
            name,
            createdAt: Date.now(),
          },
          segments: [],
          compositeFormula: { baseSegments: [], baseWeight: 1.0 },
          normalization: { method: 'none' },
          verdictThresholds: [],
          customFactors: [],
          negativeHandlingRules: [],
          verdictDisplayMode: 'action',
        }

        set(state => ({
          scorecards: [...state.scorecards, scorecard],
          activeScorecardId: id,
          versionHistory: {
            ...state.versionHistory,
            [macroVersion]: [...(state.versionHistory[macroVersion] || []), scorecard],
          },
        }))

        return id
      },

      duplicateScorecard: (scorecardId: string, newName?: string) => {
        const source = get().scorecards.find(s => s.id === scorecardId)
        if (!source) return null

        const id = generateId()
        const macro = source.versionInfo.macroVersion
        const existingVersions = get().versionHistory[macro] || []
        const nextMicro = existingVersions.length + 1

        const duplicate: ScorecardVersion = {
          ...structuredClone(source),
          id,
          versionInfo: {
            ...source.versionInfo,
            microVersion: nextMicro,
            displayVersion: `${macro}.${nextMicro}`,
            name: newName || `${source.versionInfo.name} (Copy)`,
            createdAt: Date.now(),
            parentVersionId: scorecardId,
          },
        }

        set(state => ({
          scorecards: [...state.scorecards, duplicate],
          activeScorecardId: id,
          versionHistory: {
            ...state.versionHistory,
            [macro]: [...(state.versionHistory[macro] || []), duplicate],
          },
        }))

        return id
      },

      updateScorecard: (scorecardId: string, updates: Partial<ScorecardVersion>) => {
        set(state => ({
          scorecards: state.scorecards.map(sc =>
            sc.id === scorecardId ? { ...sc, ...updates } : sc
          ),
        }))
      },

      deleteScorecard: (scorecardId: string) => {
        set(state => {
          const scorecard = state.scorecards.find(s => s.id === scorecardId)
          const newScorecards = state.scorecards.filter(s => s.id !== scorecardId)

          // Clean version history
          const newHistory = { ...state.versionHistory }
          if (scorecard) {
            const macro = scorecard.versionInfo.macroVersion
            if (newHistory[macro]) {
              newHistory[macro] = newHistory[macro].filter(v => v.id !== scorecardId)
              if (newHistory[macro].length === 0) delete newHistory[macro]
            }
          }

          return {
            scorecards: newScorecards,
            activeScorecardId: state.activeScorecardId === scorecardId
              ? (newScorecards[0]?.id ?? null)
              : state.activeScorecardId,
            versionHistory: newHistory,
          }
        })
      },

      setActiveScorecard: (scorecardId: string) => {
        set({ activeScorecardId: scorecardId })
      },

      loadTemplate: (templateId: string) => {
        const template = SCORECARD_TEMPLATES.find(t => t.id === templateId)
        if (!template) return null

        const id = generateId()
        const loaded: ScorecardVersion = {
          ...structuredClone(template),
          id,
          versionInfo: {
            ...template.versionInfo,
            createdAt: Date.now(),
            parentVersionId: template.id,
          },
        }

        const macro = loaded.versionInfo.macroVersion

        set(state => ({
          scorecards: [...state.scorecards, loaded],
          activeScorecardId: id,
          versionHistory: {
            ...state.versionHistory,
            [macro]: [...(state.versionHistory[macro] || []), loaded],
          },
        }))

        return id
      },

      // ─── Version Management ───

      createMicroVersion: (scorecardId: string) => {
        const source = get().scorecards.find(s => s.id === scorecardId)
        if (!source) return null

        const macro = source.versionInfo.macroVersion
        const existingVersions = get().versionHistory[macro] || []
        const nextMicro = existingVersions.length + 1

        const id = generateId()
        const newVersion: ScorecardVersion = {
          ...structuredClone(source),
          id,
          versionInfo: {
            ...source.versionInfo,
            microVersion: nextMicro,
            displayVersion: `${macro}.${nextMicro}`,
            createdAt: Date.now(),
            parentVersionId: scorecardId,
          },
        }

        set(state => ({
          scorecards: [...state.scorecards, newVersion],
          activeScorecardId: id,
          versionHistory: {
            ...state.versionHistory,
            [macro]: [...(state.versionHistory[macro] || []), newVersion],
          },
        }))

        return id
      },

      revertToVersion: (scorecardId: string) => {
        const target = get().scorecards.find(s => s.id === scorecardId)
        if (!target) return

        const macro = target.versionInfo.macroVersion
        const existingVersions = get().versionHistory[macro] || []
        const nextMicro = existingVersions.length + 1

        const id = generateId()
        const reverted: ScorecardVersion = {
          ...structuredClone(target),
          id,
          versionInfo: {
            ...target.versionInfo,
            microVersion: nextMicro,
            displayVersion: `${macro}.${nextMicro}`,
            name: `${target.versionInfo.name} (Reverted)`,
            createdAt: Date.now(),
            parentVersionId: scorecardId,
          },
        }

        set(state => ({
          scorecards: [...state.scorecards, reverted],
          activeScorecardId: id,
          versionHistory: {
            ...state.versionHistory,
            [macro]: [...(state.versionHistory[macro] || []), reverted],
          },
        }))
      },

      updateVersionInfo: (scorecardId: string, updates) => {
        set(state => ({
          scorecards: state.scorecards.map(sc =>
            sc.id === scorecardId
              ? { ...sc, versionInfo: { ...sc.versionInfo, ...updates } }
              : sc
          ),
        }))
      },

      // ─── Metric Operations ───

      addMetric: (segmentId: string, metric: CompositeMetric) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            segments: sc.segments.map(seg =>
              seg.id === segmentId
                ? { ...seg, metrics: [...seg.metrics, metric] }
                : seg
            ),
          })),
        }))
      },

      removeMetric: (segmentId: string, metricId: string) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            segments: sc.segments.map(seg =>
              seg.id === segmentId
                ? { ...seg, metrics: seg.metrics.filter(m => m.id !== metricId) }
                : seg
            ),
          })),
        }))
      },

      updateMetric: (segmentId: string, metricId: string, updates: Partial<CompositeMetric>) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            segments: sc.segments.map(seg =>
              seg.id === segmentId
                ? {
                    ...seg,
                    metrics: seg.metrics.map(m =>
                      m.id === metricId ? { ...m, ...updates } : m
                    ),
                  }
                : seg
            ),
          })),
        }))
      },

      createFormula: (segmentId: string, formula: MetricFormula, scoreBands: ScoreBand[], weight?: number) => {
        const metric: CompositeMetric = {
          id: formula.id,
          name: formula.name,
          type: 'formula',
          formula,
          scoreBands,
          weight,
          description: formula.description,
        }
        get().addMetric(segmentId, metric)
      },

      updateScoreBands: (segmentId: string, metricId: string, bands: ScoreBand[]) => {
        get().updateMetric(segmentId, metricId, { scoreBands: bands })
      },

      // ─── Segment Operations ───

      addSegment: (segment: ScorecardSegment) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            segments: [...sc.segments, segment],
          })),
        }))
      },

      removeSegment: (segmentId: string) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            segments: sc.segments.filter(s => s.id !== segmentId),
            compositeFormula: {
              ...sc.compositeFormula,
              baseSegments: sc.compositeFormula.baseSegments.filter(bs => bs.segmentId !== segmentId),
              overlaySegments: sc.compositeFormula.overlaySegments?.filter(os => os.segmentId !== segmentId),
            },
          })),
        }))
      },

      updateSegmentWeight: (segmentId: string, weight: number) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            segments: sc.segments.map(seg =>
              seg.id === segmentId ? { ...seg, segmentWeight: weight } : seg
            ),
          })),
        }))
      },

      updateCompositeFormula: (formula: CompositeFormula) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            compositeFormula: formula,
          })),
        }))
      },

      updateNormalization: (config: NormalizationConfig) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            normalization: config,
          })),
        }))
      },

      updateVerdictThresholds: (thresholds: VerdictThreshold[]) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            verdictThresholds: thresholds,
          })),
        }))
      },

      setVerdictDisplayMode: (mode: VerdictDisplayMode) => {
        const { activeScorecardId } = get()
        set(state => ({
          scorecards: updateActiveInList(state.scorecards, activeScorecardId, sc => ({
            ...sc,
            verdictDisplayMode: mode,
          })),
        }))
      },

      // ─── Review & Confirm ───

      generateReviewSnapshot: () => {
        const scorecard = getActiveScorecard(get())
        if (!scorecard) return

        const { universeFilter, backtestConfig } = get()

        // Build metrics summary
        const bySegment = scorecard.segments.map(seg => ({
          segmentName: seg.name,
          metricCount: seg.metrics.length,
        }))
        const totalMetrics = bySegment.reduce((sum, s) => sum + s.metricCount, 0)

        // Build segments summary with human-readable formula
        const formulaParts: string[] = []
        for (const bs of scorecard.compositeFormula.baseSegments) {
          const seg = scorecard.segments.find(s => s.id === bs.segmentId)
          if (seg) formulaParts.push(`${seg.name}(${(bs.weight * 100).toFixed(0)}%)`)
        }
        let formulaStr = formulaParts.join(' + ')
        if (scorecard.compositeFormula.baseWeight !== 1.0) {
          formulaStr = `(${formulaStr}) × ${scorecard.compositeFormula.baseWeight}`
        }
        if (scorecard.compositeFormula.overlaySegments) {
          for (const os of scorecard.compositeFormula.overlaySegments) {
            const seg = scorecard.segments.find(s => s.id === os.segmentId)
            if (seg) formulaStr += ` + ${seg.name} × ${os.weight}`
          }
        }

        const snapshot: PipelineReviewSnapshot = {
          scorecardVersion: scorecard,
          selectedMetricsSummary: { totalMetrics, bySegment },
          segmentsSummary: {
            totalSegments: scorecard.segments.length,
            segments: scorecard.segments.map(seg => ({
              name: seg.name,
              weight: seg.segmentWeight,
              metricCount: seg.metrics.length,
            })),
            compositeFormula: formulaStr,
          },
        }

        // Add stock selection summary from universe filter
        const stockNames = universeFilter.customSymbols.slice(0, 5)
        const totalStocks = universeFilter.mode === 'all'
          ? -1  // Unknown until we fetch
          : universeFilter.mode === 'individual'
            ? universeFilter.customSymbols.length
            : universeFilter.customSymbols.length // cohort mode — symbols resolved by UniverseSelector
        snapshot.stockSelectionSummary = {
          totalStocks,
          selectionMode: universeFilter.mode,
          stockNames,
        }

        // Add date config if available
        if (backtestConfig) {
          snapshot.dateConfig = {
            from: backtestConfig.dateRange.from,
            to: backtestConfig.dateRange.to,
            interval: backtestConfig.interval,
            benchmark: backtestConfig.benchmarkIndex,
          }
        }

        set({ reviewSnapshot: snapshot })
      },

      confirmReview: () => {
        set(state => ({
          reviewSnapshot: state.reviewSnapshot
            ? { ...state.reviewSnapshot, confirmedAt: Date.now() }
            : null,
        }))
      },

      // ─── Universe & Config & Results ───

      setUniverseFilter: (filter: Partial<ScoringState['universeFilter']>) => {
        set(state => ({
          universeFilter: { ...state.universeFilter, ...filter },
        }))
      },

      setBacktestConfig: (config: Partial<BacktestConfig>) => {
        set(state => ({
          backtestConfig: state.backtestConfig
            ? { ...state.backtestConfig, ...config }
            : {
                scorecardId: state.activeScorecardId || '',
                cohortId: '',
                dateRange: { from: '', to: '' },
                interval: 'monthly' as BacktestInterval,
                ...config,
              },
        }))
      },

      setCombinedResult: (result: CombinedRunResult | null) => {
        set({
          combinedResult: result,
          // Also update legacy fields for backward compatibility with charts/components
          currentRun: result?.scoring ?? null,
          backtestResult: result?.backtest ?? null,
        })
      },

      setCurrentRun: (run: ModelRunResult | null, filterHash?: string | null) => {
        set({ currentRun: run, currentRunFilterHash: filterHash ?? null })
      },

      setBacktestResult: (result: BacktestResult | null) => {
        set({ backtestResult: result })
      },

      setStatus: (status: ScoringStatus) => {
        set({ status, errorMessage: status !== 'error' ? null : get().errorMessage })
      },

      setError: (message: string | null) => {
        set({ errorMessage: message, status: message ? 'error' : 'idle' })
      },

      // ─── Persistence ───

      saveRun: (name: string) => {
        const { combinedResult, reviewSnapshot } = get()
        const scorecard = getActiveScorecard(get())
        const run = combinedResult?.scoring ?? get().currentRun
        if (!scorecard || !run || !reviewSnapshot) return null

        const id = generateId()
        const saved: SavedRun = {
          id,
          name,
          scorecard: structuredClone(scorecard),
          run: structuredClone(run),
          backtest: combinedResult?.backtest ? structuredClone(combinedResult.backtest) : undefined,
          reviewSnapshot: structuredClone(reviewSnapshot),
          savedAt: Date.now(),
        }

        set(state => ({
          savedRuns: [...state.savedRuns, saved],
        }))

        return id
      },

      deleteRun: (runId: string) => {
        set(state => ({
          savedRuns: state.savedRuns.filter(r => r.id !== runId),
        }))
      },

      loadRun: (runId: string) => {
        const run = get().savedRuns.find(r => r.id === runId)
        if (!run) return

        set({
          currentRun: run.run,
          backtestResult: run.backtest ?? null,
          reviewSnapshot: run.reviewSnapshot,
        })
      },

      resetPipeline: () => {
        set({
          currentStage: 1 as PipelineStage,
          combinedResult: null,
          currentRun: null,
          currentRunFilterHash: null,
          backtestConfig: null,
          reviewSnapshot: null,
          backtestResult: null,
          status: 'idle' as ScoringStatus,
          errorMessage: null,
        })
      },
    }),
    {
      name: 'stockfox-scoring-storage',
      version: 2,
      partialize: state => ({
        scorecards: state.scorecards,
        activeScorecardId: state.activeScorecardId,
        versionHistory: state.versionHistory,
        savedRuns: state.savedRuns,
        uiMode: state.uiMode,
        universeFilter: state.universeFilter,
        currentStage: state.currentStage,
        backtestConfig: state.backtestConfig,
      }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>
        // v0 → v1: add mode to universeFilter
        if (version < 1 && state.universeFilter) {
          const uf = state.universeFilter as Record<string, unknown>
          if (!uf.mode) uf.mode = 'cohort'
        }
        // v1 → v2: 7-stage → 5-stage pipeline migration
        if (version < 2) {
          // Clamp currentStage to new max of 5
          const stage = state.currentStage as number
          if (stage > 5) state.currentStage = 3
          // Clear removed fields
          delete state.cohort
          delete state.currentRun
          delete state.currentRunFilterHash
        }
        return state
      },
    }
  )
)

// ─────────────────────────────────────────────────
// Selector Hooks
// ─────────────────────────────────────────────────

export const useActiveScorecard = () =>
  useScoringStore(state =>
    state.activeScorecardId
      ? state.scorecards.find(s => s.id === state.activeScorecardId) ?? null
      : null
  )

export const useCurrentStage = () =>
  useScoringStore(state => state.currentStage)

export const useScoringStatus = () =>
  useScoringStore(state => state.status)

export const useScoringError = () =>
  useScoringStore(state => state.errorMessage)

export const useCurrentScores = () =>
  useScoringStore(state => state.currentRun)

export const useCombinedResult = () =>
  useScoringStore(state => state.combinedResult)

export const useBacktestResult = () =>
  useScoringStore(state => state.backtestResult)

export const useUIMode = () =>
  useScoringStore(state => state.uiMode)

export const useVersionHistory = (macroVersion: string) =>
  useScoringStore(state => state.versionHistory[macroVersion] ?? [])

export const useReviewSnapshot = () =>
  useScoringStore(state => state.reviewSnapshot)

export const useSavedRuns = () =>
  useScoringStore(state => state.savedRuns)
