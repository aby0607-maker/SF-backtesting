/**
 * Scoring Pipeline Store — Zustand state management for the 7-stage pipeline
 *
 * Manages: pipeline navigation, scorecard CRUD, version history,
 * scoring runs, cohort selection, backtest config, and review snapshots.
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
  CohortDefinition,
  CohortFilter,
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

  // Stage 3: Universe filter + Scoring results
  universeFilter: {
    mode: 'individual' | 'cohort' | 'all'
    mcapTypes: string[]    // e.g. ['Large Cap'] — cohort mode only
    sectors: string[]      // e.g. ['Finance'] — cohort mode only
    customSymbols: string[] // e.g. ['RELIANCE', 'TCS'] — individual mode + cohort additions
  }
  currentRun: ModelRunResult | null

  // Stage 4: Cohort
  cohort: CohortDefinition | null

  // Stage 5: Backtest config
  backtestConfig: BacktestConfig | null

  // Stage 6: Review snapshot
  reviewSnapshot: PipelineReviewSnapshot | null

  // Stage 7: Backtest results
  backtestResult: BacktestResult | null

  // Saved runs for comparison
  savedRuns: SavedRun[]

  // Status
  status: ScoringStatus

  // ─── Actions: Pipeline Navigation ───
  setStage: (stage: PipelineStage) => void
  nextStage: () => void
  prevStage: () => void
  setUIMode: (mode: UIMode) => void
  editFromReview: (stageNumber: 1 | 2 | 3 | 4 | 5) => void

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

  // ─── Actions: Universe & Scoring & Backtest ───
  setUniverseFilter: (filter: Partial<ScoringState['universeFilter']>) => void
  setCurrentRun: (run: ModelRunResult | null) => void
  setCohort: (cohort: CohortDefinition | null) => void
  applyCohortFilter: (filters: CohortFilter[]) => void
  setBacktestConfig: (config: Partial<BacktestConfig>) => void
  setBacktestResult: (result: BacktestResult | null) => void
  setStatus: (status: ScoringStatus) => void

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
      currentStage: 1,
      uiMode: 'wizard',

      scorecards: [],
      activeScorecardId: null,
      versionHistory: {},

      universeFilter: { mode: 'cohort', mcapTypes: ['Large Cap'], sectors: [], customSymbols: [] },
      currentRun: null,
      cohort: null,
      backtestConfig: null,
      reviewSnapshot: null,
      backtestResult: null,

      savedRuns: [],
      status: 'idle',

      // ─── Pipeline Navigation ───

      setStage: (stage: PipelineStage) => {
        set({ currentStage: stage })
      },

      nextStage: () => {
        set(state => ({
          currentStage: Math.min(7, state.currentStage + 1) as PipelineStage,
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

      editFromReview: (stageNumber: 1 | 2 | 3 | 4 | 5) => {
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

        // Create a new micro version that's a copy of the target
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
      // All metric ops mutate the *active* scorecard only

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
            // Also clean composite formula references
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

        const { currentRun, cohort, backtestConfig } = get()

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

        // Add scoring results summary if available
        if (currentRun) {
          const stocks = currentRun.stocks
          const sorted = [...stocks].sort((a, b) => b.normalizedScore - a.normalizedScore)

          // Score distribution by verdict
          const verdictCounts: Record<string, number> = {}
          for (const stock of stocks) {
            verdictCounts[stock.verdict] = (verdictCounts[stock.verdict] || 0) + 1
          }
          const scoreDistribution = Object.entries(verdictCounts).map(([band, count]) => ({ band, count }))

          snapshot.scoringResultsSummary = {
            universeSize: stocks.length,
            scoreDistribution,
            topFive: sorted.slice(0, 5).map(s => ({ name: s.stockName, score: s.normalizedScore, verdict: s.verdict })),
            bottomFive: sorted.slice(-5).map(s => ({ name: s.stockName, score: s.normalizedScore, verdict: s.verdict })),
          }
        }

        // Add cohort summary if available
        if (cohort) {
          // Build sector breakdown from the current run
          const sectorBreakdown: Record<string, number> = {}
          if (currentRun) {
            for (const stockId of cohort.stockIds) {
              const stock = currentRun.stocks.find(s => s.stockId === stockId)
              if (stock) {
                sectorBreakdown[stock.sector] = (sectorBreakdown[stock.sector] || 0) + 1
              }
            }
          }

          snapshot.cohortSummary = {
            totalStocks: cohort.stockIds.length,
            filters: cohort.filters.map(f => f.label || `${f.type}: ${f.value}`),
            sectorBreakdown: Object.entries(sectorBreakdown).map(([sector, count]) => ({ sector, count })),
          }
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

      // ─── Universe & Scoring & Backtest ───

      setUniverseFilter: (filter: Partial<ScoringState['universeFilter']>) => {
        set(state => ({
          universeFilter: { ...state.universeFilter, ...filter },
        }))
      },

      setCurrentRun: (run: ModelRunResult | null) => {
        set({ currentRun: run })
      },

      setCohort: (cohort: CohortDefinition | null) => {
        set({ cohort })
      },

      applyCohortFilter: (filters: CohortFilter[]) => {
        const { currentRun } = get()
        if (!currentRun) return

        // Filter stocks based on criteria
        const matchingIds: string[] = []
        for (const stock of currentRun.stocks) {
          let matches = true
          for (const filter of filters) {
            switch (filter.type) {
              case 'sector':
                if (stock.sector !== filter.value) matches = false
                break
              case 'market_cap': {
                const [min, max] = filter.value as [number, number]
                if (stock.marketCap < min || stock.marketCap > max) matches = false
                break
              }
              case 'score_range': {
                const [minS, maxS] = filter.value as [number, number]
                if (stock.normalizedScore < minS || stock.normalizedScore > maxS) matches = false
                break
              }
              case 'verdict':
                if (stock.verdict !== filter.value) matches = false
                break
            }
            if (!matches) break
          }
          if (matches) matchingIds.push(stock.stockId)
        }

        const cohort: CohortDefinition = {
          id: generateId(),
          name: `Filtered Cohort (${matchingIds.length} stocks)`,
          filters,
          stockIds: matchingIds,
        }

        set({ cohort })
      },

      setBacktestConfig: (config: Partial<BacktestConfig>) => {
        set(state => ({
          backtestConfig: state.backtestConfig
            ? { ...state.backtestConfig, ...config }
            : {
                scorecardId: state.activeScorecardId || '',
                cohortId: state.cohort?.id || '',
                dateRange: { from: '', to: '' },
                interval: 'monthly' as BacktestInterval,
                ...config,
              },
        }))
      },

      setBacktestResult: (result: BacktestResult | null) => {
        set({ backtestResult: result })
      },

      setStatus: (status: ScoringStatus) => {
        set({ status })
      },

      // ─── Persistence ───

      saveRun: (name: string) => {
        const { currentRun, backtestResult, reviewSnapshot } = get()
        const scorecard = getActiveScorecard(get())
        if (!scorecard || !currentRun || !reviewSnapshot) return null

        const id = generateId()
        const saved: SavedRun = {
          id,
          name,
          scorecard: structuredClone(scorecard),
          run: structuredClone(currentRun),
          backtest: backtestResult ? structuredClone(backtestResult) : undefined,
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
          currentStage: 1,
          currentRun: null,
          cohort: null,
          backtestConfig: null,
          reviewSnapshot: null,
          backtestResult: null,
          status: 'idle',
        })
      },
    }),
    {
      name: 'stockfox-scoring-storage',
      version: 1,
      partialize: state => ({
        scorecards: state.scorecards,
        activeScorecardId: state.activeScorecardId,
        versionHistory: state.versionHistory,
        savedRuns: state.savedRuns,
        uiMode: state.uiMode,
        universeFilter: state.universeFilter,
      }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>
        // v0 → v1: add mode to universeFilter
        if (version < 1 && state.universeFilter) {
          const uf = state.universeFilter as Record<string, unknown>
          if (!uf.mode) uf.mode = 'cohort'
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

export const useCurrentScores = () =>
  useScoringStore(state => state.currentRun)

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

export const useCohort = () =>
  useScoringStore(state => state.cohort)
