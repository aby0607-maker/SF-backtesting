# StockFox Technical Specification: LEARN Cluster

**Version:** 1.0 | **Date:** January 15, 2025 | **Status:** Ready for Development  
**Parent PRD:** `stockfox_prd_learn_cluster.md`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Models](#2-data-models)
3. [API Specifications](#3-api-specifications)
4. [Component Specifications](#4-component-specifications)
5. [Business Logic & Rules](#5-business-logic--rules)
6. [State Management](#6-state-management)
7. [Performance Requirements](#7-performance-requirements)
8. [Error Handling](#8-error-handling)
9. [Testing Specifications](#9-testing-specifications)
10. [Mock Data Implementation](#10-mock-data-implementation)

---

## 1. Architecture Overview

### 1.1 System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEARN CLUSTER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Journal    │  │   Pattern    │  │   Learning   │          │
│  │   Service    │  │   Engine     │  │   Tracker    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴────────────────┘                   │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │  LEARN Store  │                                  │
│              │   (Zustand)   │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│         ┌────────────┼────────────┐                            │
│         │            │            │                             │
│    ┌────▼────┐  ┌────▼────┐  ┌───▼────┐                        │
│    │ Journal │  │ Pattern │  │Tooltip │                        │
│    │   UI    │  │   UI    │  │  UI    │                        │
│    └─────────┘  └─────────┘  └────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React 18 + TypeScript | Web app (vibe-coded) |
| State | Zustand | Lightweight, no boilerplate |
| Styling | Tailwind CSS | Utility-first |
| Data | Local JSON + Mock API | Demo mode |
| Charts | Recharts | For progress visualizations |
| Icons | Lucide React | Consistent iconography |

### 1.3 File Structure

```
src/
├── features/
│   └── learn/
│       ├── components/
│       │   ├── JournalDashboard.tsx
│       │   ├── JournalEntry.tsx
│       │   ├── JournalEntryCard.tsx
│       │   ├── ReflectionPrompt.tsx
│       │   ├── BlindSpotAlert.tsx
│       │   ├── PatternCard.tsx
│       │   ├── SkillBadge.tsx
│       │   ├── LearningProgress.tsx
│       │   ├── MetricTooltip.tsx
│       │   └── LearningChat.tsx
│       ├── hooks/
│       │   ├── useJournal.ts
│       │   ├── usePatternDetection.ts
│       │   ├── useBlindSpots.ts
│       │   ├── useSkillLevel.ts
│       │   └── useTooltips.ts
│       ├── services/
│       │   ├── journalService.ts
│       │   ├── patternEngine.ts
│       │   ├── blindSpotDetector.ts
│       │   └── learningTracker.ts
│       ├── store/
│       │   └── learnStore.ts
│       ├── types/
│       │   └── learn.types.ts
│       ├── utils/
│       │   ├── outcomeCalculator.ts
│       │   └── levelCalculator.ts
│       └── data/
│           ├── mockJournalEntries.ts
│           ├── metricDefinitions.ts
│           └── skillLevelConfig.ts
├── shared/
│   └── components/
│       └── BottomSheet.tsx
└── ...
```

---

## 2. Data Models

### 2.1 Core Types

```typescript
// src/features/learn/types/learn.types.ts

// ============================================
// JOURNAL TYPES
// ============================================

export type UserVerdict = 'BUY' | 'WATCHLIST' | 'SKIP' | 'AVOID';
export type OutcomeStatus = 'pending' | 'win' | 'loss' | 'neutral';

export interface JournalEntry {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  
  // Stock info at time of analysis
  stock: {
    symbol: string;
    name: string;
    sector: string;
    subSector?: string;
  };
  
  // Analysis data
  scoreAtAnalysis: number; // 0-10, one decimal
  verdictAtAnalysis: string; // StockFox verdict (STRONG BUY, etc.)
  userVerdict: UserVerdict;
  userNotes: string | null; // max 280 chars
  
  // Price tracking
  priceAtAnalysis: number;
  currentPrice: number;
  priceChangePercent: number; // calculated
  
  // Outcome
  outcomeStatus: OutcomeStatus;
  outcomeCalculatedAt: string | null;
  
  // Segment tracking (for blind spot detection)
  segmentsViewed: SegmentId[];
  segmentsExpanded: SegmentId[]; // Deeper engagement
  timeSpentSeconds: number;
  
  // Metadata
  profileId: string;
  analysisSessionId: string;
}

export type SegmentId = 
  | 'profitability'
  | 'financial_ratios'
  | 'growth'
  | 'valuation'
  | 'price_volume'
  | 'technical'
  | 'broker_ratings'
  | 'ownership'
  | 'fno'
  | 'income_statement'
  | 'balance_sheet';

// ============================================
// PATTERN TYPES
// ============================================

export interface PatternAnalysis {
  profileId: string;
  analysisCount: number;
  lastUpdated: string;
  
  // Detected patterns
  stylePreference: StylePattern | null;
  sectorBias: SectorPattern | null;
  metricFocus: MetricPattern | null;
  qualityFocus: QualityPattern | null;
  
  // Summary message (for display)
  summaryMessage: string;
  researchDNA: ResearchDNA;
}

export interface StylePattern {
  type: 'growth' | 'value' | 'dividend' | 'garp' | 'momentum';
  confidence: number; // 0-1
  evidenceCount: number;
  message: string;
}

export interface SectorPattern {
  dominantSector: string;
  percentage: number;
  sectors: Record<string, number>; // sector -> count
  message: string;
}

export interface MetricPattern {
  topMetrics: string[];
  mentionedInNotes: Record<string, number>;
  message: string;
}

export interface QualityPattern {
  avgROEThreshold: number;
  avgPEPreference: number;
  message: string;
}

export interface ResearchDNA {
  style: string;
  sectors: { name: string; percentage: number }[];
  keyMetric: string;
  comfortZone: string; // volatility range
  winRate: number;
}

// ============================================
// BLIND SPOT TYPES
// ============================================

export interface BlindSpotAnalysis {
  profileId: string;
  analysisWindow: number; // last N analyses
  lastUpdated: string;
  
  segmentCoverage: SegmentCoverage[];
  alerts: BlindSpotAlert[];
  overallHealth: 'good' | 'warning' | 'critical';
}

export interface SegmentCoverage {
  segmentId: SegmentId;
  segmentName: string;
  checkCount: number;
  totalAnalyses: number;
  percentage: number;
  status: 'strong' | 'adequate' | 'weak' | 'critical';
}

export interface BlindSpotAlert {
  id: string;
  segmentId: SegmentId;
  segmentName: string;
  percentage: number;
  severity: 'warning' | 'critical';
  message: string;
  learnMoreUrl: string;
  dismissedAt: string | null;
}

// ============================================
// SKILL LEVEL TYPES
// ============================================

export type SkillLevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SkillLevel {
  id: SkillLevelId;
  name: string;
  badge: string;
  requirements: SkillRequirements;
  nextLevel: SkillLevelId | null;
}

export interface SkillRequirements {
  minAnalyses: number;
  minMetricsLearned: number;
  minSectorsDiversified?: number;
  minWinRate?: number;
  requireAllSegments?: boolean;
  requirePatternIdentified?: boolean;
}

export interface UserSkillProgress {
  profileId: string;
  currentLevel: SkillLevelId;
  currentLevelName: string;
  currentBadge: string;
  
  // Progress metrics
  totalAnalyses: number;
  metricsLearned: string[];
  sectorsCovered: string[];
  winRate: number;
  
  // Next level progress
  nextLevel: SkillLevelId | null;
  progressToNext: number; // 0-100
  remainingRequirements: string[];
}

// ============================================
// LEARNING TRACKER TYPES
// ============================================

export interface MetricDefinition {
  id: string;
  name: string;
  segmentId: SegmentId;
  category: 'basic' | 'intermediate' | 'advanced';
  
  // Tooltip content (adaptive)
  definitions: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  
  whyItMatters: string;
  goodThreshold?: string;
  badThreshold?: string;
  compareToSector: boolean;
}

export interface LearningProgress {
  profileId: string;
  metricsLearned: MetricLearned[];
  segmentProgress: SegmentLearningProgress[];
  totalMetrics: number;
  learnedCount: number;
  lastActivity: string;
}

export interface MetricLearned {
  metricId: string;
  learnedAt: string;
  source: 'tooltip' | 'chat' | 'deep_dive';
}

export interface SegmentLearningProgress {
  segmentId: SegmentId;
  segmentName: string;
  totalMetrics: number;
  learnedMetrics: number;
  percentage: number;
  isComplete: boolean;
}

// ============================================
// REFLECTION PROMPT TYPES
// ============================================

export interface ReflectionPrompt {
  id: string;
  stockSymbol: string;
  stockName: string;
  triggeredAt: string;
  status: 'pending' | 'completed' | 'dismissed';
  
  // Response (if completed)
  response?: {
    verdict: UserVerdict;
    notes: string | null;
    submittedAt: string;
  };
}

export interface PromptConfig {
  delaySeconds: number; // Time after analysis before showing
  variants: string[]; // Different prompt texts
  dismissCooldownHours: number;
}

// ============================================
// AI CHAT TYPES
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  
  // Context (if applicable)
  stockContext?: {
    symbol: string;
    name: string;
    relevantMetric?: string;
    metricValue?: number;
  };
  
  // For demo: pre-scripted response key
  responseKey?: string;
}

export interface ChatSession {
  id: string;
  profileId: string;
  stockSymbol: string | null;
  messages: ChatMessage[];
  createdAt: string;
  lastMessageAt: string;
}

export type ChatQueryType = 
  | 'metric_explainer'
  | 'comparison'
  | 'concept'
  | 'stock_specific'
  | 'strategy'
  | 'unknown';
```

### 2.2 Database Schema (For Reference)

```sql
-- For production reference (demo uses local JSON)

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Stock info
  stock_symbol VARCHAR(20) NOT NULL,
  stock_name VARCHAR(100) NOT NULL,
  stock_sector VARCHAR(50) NOT NULL,
  
  -- Analysis data
  score_at_analysis DECIMAL(3,1) NOT NULL,
  verdict_at_analysis VARCHAR(20) NOT NULL,
  user_verdict VARCHAR(20) NOT NULL,
  user_notes TEXT,
  
  -- Price tracking
  price_at_analysis DECIMAL(12,2) NOT NULL,
  current_price DECIMAL(12,2),
  
  -- Outcome
  outcome_status VARCHAR(20) DEFAULT 'pending',
  outcome_calculated_at TIMESTAMPTZ,
  
  -- Tracking
  segments_viewed TEXT[], -- Array of segment IDs
  segments_expanded TEXT[],
  time_spent_seconds INTEGER DEFAULT 0,
  
  CONSTRAINT valid_user_verdict CHECK (user_verdict IN ('BUY', 'WATCHLIST', 'SKIP', 'AVOID')),
  CONSTRAINT valid_outcome CHECK (outcome_status IN ('pending', 'win', 'loss', 'neutral'))
);

-- Metrics Learned
CREATE TABLE metrics_learned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  metric_id VARCHAR(50) NOT NULL,
  learned_at TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(20) NOT NULL,
  
  UNIQUE(profile_id, metric_id)
);

-- Blind Spot Dismissals
CREATE TABLE blind_spot_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  segment_id VARCHAR(30) NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(profile_id, segment_id)
);

-- Indexes
CREATE INDEX idx_journal_profile ON journal_entries(profile_id);
CREATE INDEX idx_journal_created ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_stock ON journal_entries(stock_symbol);
```

---

## 3. API Specifications

### 3.1 Journal Service API

```typescript
// src/features/learn/services/journalService.ts

import { JournalEntry, UserVerdict, OutcomeStatus } from '../types/learn.types';

export interface JournalService {
  // CRUD Operations
  getEntries(profileId: string, options?: GetEntriesOptions): Promise<JournalEntry[]>;
  getEntry(entryId: string): Promise<JournalEntry | null>;
  createEntry(data: CreateEntryData): Promise<JournalEntry>;
  updateEntry(entryId: string, data: UpdateEntryData): Promise<JournalEntry>;
  deleteEntry(entryId: string): Promise<void>;
  
  // Analytics
  getStats(profileId: string): Promise<JournalStats>;
  getWinRate(profileId: string, options?: WinRateOptions): Promise<WinRateResult>;
  
  // Outcome Management
  updateOutcomes(profileId: string): Promise<OutcomeUpdateResult>;
}

interface GetEntriesOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'outcomeStatus' | 'score';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    verdict?: UserVerdict[];
    outcome?: OutcomeStatus[];
    sector?: string[];
    dateRange?: { start: string; end: string };
  };
}

interface CreateEntryData {
  profileId: string;
  stock: {
    symbol: string;
    name: string;
    sector: string;
  };
  scoreAtAnalysis: number;
  verdictAtAnalysis: string;
  userVerdict: UserVerdict;
  userNotes?: string;
  priceAtAnalysis: number;
  segmentsViewed: string[];
  segmentsExpanded: string[];
  timeSpentSeconds: number;
  analysisSessionId: string;
}

interface UpdateEntryData {
  userVerdict?: UserVerdict;
  userNotes?: string;
  currentPrice?: number;
  outcomeStatus?: OutcomeStatus;
}

interface JournalStats {
  totalEntries: number;
  winCount: number;
  lossCount: number;
  neutralCount: number;
  pendingCount: number;
  winRate: number;
  bestCall: { stock: string; returnPercent: number } | null;
  worstCall: { stock: string; returnPercent: number } | null;
  sectorBreakdown: Record<string, number>;
  verdictBreakdown: Record<UserVerdict, number>;
}

interface WinRateOptions {
  excludePending?: boolean;
  dateRange?: { start: string; end: string };
}

interface WinRateResult {
  winRate: number;
  totalDecisions: number;
  wins: number;
  losses: number;
  neutral: number;
}

interface OutcomeUpdateResult {
  updated: number;
  entries: { id: string; newStatus: OutcomeStatus; priceChange: number }[];
}
```

### 3.2 Pattern Engine API

```typescript
// src/features/learn/services/patternEngine.ts

import { PatternAnalysis, JournalEntry } from '../types/learn.types';

export interface PatternEngine {
  analyzePatterns(profileId: string, entries: JournalEntry[]): Promise<PatternAnalysis>;
  getStylePattern(entries: JournalEntry[]): StylePattern | null;
  getSectorPattern(entries: JournalEntry[]): SectorPattern | null;
  getMetricPattern(entries: JournalEntry[]): MetricPattern | null;
  generateSummaryMessage(patterns: PatternAnalysis): string;
  generateResearchDNA(patterns: PatternAnalysis, stats: JournalStats): ResearchDNA;
}

// Pattern detection thresholds
export const PATTERN_CONFIG = {
  MIN_ENTRIES_FOR_PATTERN: 5,
  STYLE_CONFIDENCE_THRESHOLD: 0.6, // 60% of picks match style
  SECTOR_BIAS_THRESHOLD: 0.4, // 40% in same sector
  METRIC_MENTION_THRESHOLD: 0.8, // 80% mention in notes
  QUALITY_ROE_THRESHOLD: 15, // ROE > 15% in 70% of picks
};
```

### 3.3 Blind Spot Detector API

```typescript
// src/features/learn/services/blindSpotDetector.ts

import { BlindSpotAnalysis, JournalEntry, SegmentId } from '../types/learn.types';

export interface BlindSpotDetector {
  analyze(profileId: string, entries: JournalEntry[]): Promise<BlindSpotAnalysis>;
  getSegmentCoverage(entries: JournalEntry[]): SegmentCoverage[];
  generateAlerts(coverage: SegmentCoverage[]): BlindSpotAlert[];
  dismissAlert(profileId: string, segmentId: SegmentId): Promise<void>;
  shouldShowAlert(alert: BlindSpotAlert, dismissals: string[]): boolean;
}

// Blind spot detection thresholds
export const BLIND_SPOT_CONFIG = {
  ANALYSIS_WINDOW: 10, // Last N analyses
  WARNING_THRESHOLD: 0.4, // Below 40% = warning
  CRITICAL_THRESHOLD: 0.2, // Below 20% = critical
  ALERT_COOLDOWN_ANALYSES: 3, // Re-show after N more analyses
};
```

### 3.4 Learning Tracker API

```typescript
// src/features/learn/services/learningTracker.ts

import { LearningProgress, MetricDefinition, SkillLevelId } from '../types/learn.types';

export interface LearningTracker {
  getProgress(profileId: string): Promise<LearningProgress>;
  markMetricLearned(profileId: string, metricId: string, source: string): Promise<void>;
  getMetricDefinition(metricId: string, skillLevel: SkillLevelId): MetricDefinition;
  calculateSkillLevel(progress: LearningProgress, stats: JournalStats): UserSkillProgress;
  getNextMetricsToLearn(progress: LearningProgress): MetricDefinition[];
}
```

---

## 4. Component Specifications

### 4.1 JournalDashboard Component

```typescript
// src/features/learn/components/JournalDashboard.tsx

import React from 'react';
import { useJournal } from '../hooks/useJournal';
import { usePatternDetection } from '../hooks/usePatternDetection';
import { useBlindSpots } from '../hooks/useBlindSpots';
import { useSkillLevel } from '../hooks/useSkillLevel';

interface JournalDashboardProps {
  profileId: string;
}

export const JournalDashboard: React.FC<JournalDashboardProps> = ({ profileId }) => {
  // Implementation
};

// Sub-components
export const StatsHeader: React.FC<StatsHeaderProps>;
export const PatternCard: React.FC<PatternCardProps>;
export const BlindSpotAlert: React.FC<BlindSpotAlertProps>;
export const EntryList: React.FC<EntryListProps>;
export const FilterBar: React.FC<FilterBarProps>;
```

**Component States:**

| State | Trigger | Display |
|-------|---------|---------|
| Loading | Initial mount | Skeleton loader |
| Empty | No entries | Empty state + CTA |
| Populated | Has entries | Full dashboard |
| Error | API failure | Error message + retry |

**Props Interface:**

```typescript
interface JournalDashboardProps {
  profileId: string;
  initialFilter?: FilterOptions;
  onEntryClick?: (entryId: string) => void;
  showPatterns?: boolean; // Default true
  showBlindSpots?: boolean; // Default true
}
```

### 4.2 JournalEntryCard Component

```typescript
// src/features/learn/components/JournalEntryCard.tsx

interface JournalEntryCardProps {
  entry: JournalEntry;
  variant: 'compact' | 'expanded';
  onTap?: () => void;
  showOutcome?: boolean;
}

// Visual states based on outcome
const OUTCOME_STYLES = {
  pending: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: '⏳',
    text: 'text-gray-600',
  },
  win: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✅',
    text: 'text-green-700',
  },
  loss: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '❌',
    text: 'text-red-700',
  },
  neutral: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: '~',
    text: 'text-yellow-700',
  },
};
```

**Card Layout (Compact):**

```
┌─────────────────────────────────────┐
│ Jul 15, 2024 | Trent          [✅] │
│ Score: 7.8/10 | BUY | +32%         │
│ "Retail growth plays can work"     │
└─────────────────────────────────────┘
```

**Card Layout (Expanded):**

```
┌─────────────────────────────────────┐
│ Jul 15, 2024                        │
│ ┌───────────────────────────────┐   │
│ │ TRENT                    [✅] │   │
│ │ Retail / Fashion              │   │
│ └───────────────────────────────┘   │
│                                     │
│ Your Analysis                       │
│ Score: 7.8/10                       │
│ StockFox: STRONG BUY                │
│ Your verdict: BUY                   │
│                                     │
│ Outcome                             │
│ ₹1,450 → ₹1,914 (+32%)             │
│ Status: WIN ✅                      │
│                                     │
│ Your Note                           │
│ "Retail growth plays can work"      │
│                                     │
│ Segments Checked                    │
│ ✓ Profitability  ✓ Growth          │
│ ✓ Valuation      ✗ Debt            │
│                                     │
│ Time Spent: 8 min                   │
└─────────────────────────────────────┘
```

### 4.3 ReflectionPrompt Component

```typescript
// src/features/learn/components/ReflectionPrompt.tsx

interface ReflectionPromptProps {
  stockSymbol: string;
  stockName: string;
  onSubmit: (verdict: UserVerdict, notes: string | null) => void;
  onDismiss: () => void;
  variant?: number; // Which prompt variant to show
}

// Prompt variants
const PROMPT_VARIANTS = [
  "What's your verdict on {stock}?",
  "Based on your analysis, would you invest?",
  "Quick note: What was the key factor for you?",
  "Did this stock meet your criteria?",
];

// Animation: Slide up from bottom, 300ms ease-out
// Backdrop: Semi-transparent black (0.3 opacity)
// Dismiss: Tap outside, swipe down, or X button
```

**Behavior Specifications:**

| Trigger | Condition | Action |
|---------|-----------|--------|
| Show | Analysis complete + 30s dwell | Animate in |
| Submit | User taps verdict + submit | Save to journal, animate out |
| Dismiss | X tap, outside tap, swipe | Mark dismissed, animate out |
| Re-show | Same stock, same session | Don't show |
| Re-show | Same stock, new session (24h+) | Show again |

### 4.4 BlindSpotAlert Component

```typescript
// src/features/learn/components/BlindSpotAlert.tsx

interface BlindSpotAlertProps {
  alert: BlindSpotAlert;
  onDismiss: (segmentId: SegmentId) => void;
  onLearnMore: (segmentId: SegmentId) => void;
}

// Severity-based styling
const ALERT_STYLES = {
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    icon: '⚠️',
    iconColor: 'text-yellow-600',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: '🚨',
    iconColor: 'text-red-600',
  },
};
```

**Alert Layout:**

```
┌─────────────────────────────────────┐
│ ⚠️ Blind Spot Alert                 │
│ ─────────────────────────────────── │
│ Ownership checked: 20%              │
│                                     │
│ "You've been skipping Ownership     │
│ analysis. This shows institutional  │
│ confidence in management."          │
│                                     │
│ [ Got it ]  [ Learn about → ]       │
└─────────────────────────────────────┘
```

### 4.5 MetricTooltip Component

```typescript
// src/features/learn/components/MetricTooltip.tsx

interface MetricTooltipProps {
  metricId: string;
  metricValue?: number;
  sectorAverage?: number;
  stockName?: string;
  skillLevel: SkillLevelId;
  onLearnMore: (metricId: string) => void;
  onDismiss: () => void;
}

// Display as BottomSheet on mobile, Popover on desktop
// Content adapts based on skillLevel
```

**Tooltip Layout:**

```
┌─────────────────────────────────────┐
│ Return on Equity (ROE) 📈      [X] │
│ ═══════════════════════════════════ │
│                                     │
│ In simple terms:                    │
│ How much profit a company makes     │
│ for every ₹100 of shareholder       │
│ money invested.                     │
│                                     │
│ Why it matters:                     │
│ Higher ROE = management using your  │
│ money efficiently.                  │
│                                     │
│ ─────────────────────────────────── │
│ For Zomato: 18.3%                   │
│ Sector avg: 14.2%                   │
│ Verdict: ✅ Above average           │
│ ─────────────────────────────────── │
│                                     │
│ [ Got it ]  [ Learn more → ]        │
└─────────────────────────────────────┘
```

### 4.6 SkillBadge Component

```typescript
// src/features/learn/components/SkillBadge.tsx

interface SkillBadgeProps {
  level: SkillLevelId;
  size: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showProgress?: boolean;
  progressPercent?: number;
}

const BADGE_CONFIG: Record<SkillLevelId, { name: string; emoji: string; color: string }> = {
  1: { name: 'Newcomer', emoji: '🌱', color: 'bg-gray-100' },
  2: { name: 'Explorer', emoji: '🔍', color: 'bg-blue-100' },
  3: { name: 'Learner', emoji: '📚', color: 'bg-green-100' },
  4: { name: 'Researcher', emoji: '🔬', color: 'bg-yellow-100' },
  5: { name: 'Analyst', emoji: '📊', color: 'bg-orange-100' },
  6: { name: 'Strategist', emoji: '🎯', color: 'bg-purple-100' },
  7: { name: 'Expert', emoji: '🏆', color: 'bg-gold-100' },
};
```

**Badge Layouts:**

```
// Size: sm
[📊]

// Size: md
[📊 Analyst]

// Size: lg (with progress)
┌─────────────────────┐
│ 📊 Analyst          │
│ ▓▓▓▓▓▓▓░░░ 70%     │
│ → Strategist        │
└─────────────────────┘
```

### 4.7 LearningChat Component

```typescript
// src/features/learn/components/LearningChat.tsx

interface LearningChatProps {
  profileId: string;
  stockContext?: {
    symbol: string;
    name: string;
    currentMetric?: string;
  };
  onMetricLearned?: (metricId: string) => void;
}

// Chat message classification
function classifyQuery(message: string): ChatQueryType {
  const patterns = {
    metric_explainer: /what (is|does|means?)|explain|define/i,
    comparison: /is (this|that|it) (good|bad|high|low)/i,
    concept: /what is a|how do|what are/i,
    stock_specific: /why (is|does|did)|how come/i,
    strategy: /how (do|should|can) (i|investors)/i,
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(message)) return type as ChatQueryType;
  }
  return 'unknown';
}
```

---

## 5. Business Logic & Rules

### 5.1 Outcome Calculation

```typescript
// src/features/learn/utils/outcomeCalculator.ts

export const OUTCOME_THRESHOLDS = {
  WIN: 0.10,    // +10% = win
  LOSS: -0.10,  // -10% = loss
  // Between -10% and +10% = neutral
};

export function calculateOutcome(
  priceAtAnalysis: number,
  currentPrice: number
): { status: OutcomeStatus; changePercent: number } {
  const changePercent = (currentPrice - priceAtAnalysis) / priceAtAnalysis;
  
  let status: OutcomeStatus;
  if (changePercent >= OUTCOME_THRESHOLDS.WIN) {
    status = 'win';
  } else if (changePercent <= OUTCOME_THRESHOLDS.LOSS) {
    status = 'loss';
  } else {
    status = 'neutral';
  }
  
  return { status, changePercent };
}

export function calculateWinRate(entries: JournalEntry[]): number {
  const resolved = entries.filter(e => e.outcomeStatus !== 'pending');
  if (resolved.length === 0) return 0;
  
  const wins = resolved.filter(e => e.outcomeStatus === 'win').length;
  return Math.round((wins / resolved.length) * 100);
}
```

### 5.2 Pattern Detection Logic

```typescript
// src/features/learn/services/patternEngine.ts

export function detectStylePattern(entries: JournalEntry[]): StylePattern | null {
  if (entries.length < PATTERN_CONFIG.MIN_ENTRIES_FOR_PATTERN) {
    return null;
  }
  
  // Analyze stock characteristics of user's BUY verdicts
  const buyEntries = entries.filter(e => e.userVerdict === 'BUY');
  if (buyEntries.length < 3) return null;
  
  // Check for growth pattern
  const growthCharacteristics = buyEntries.filter(entry => {
    // Mock: check if stock is growth-oriented based on score breakdown
    return entry.stock.sector === 'Technology' || 
           entry.scoreAtAnalysis >= 7.5;
  });
  
  const growthConfidence = growthCharacteristics.length / buyEntries.length;
  
  if (growthConfidence >= PATTERN_CONFIG.STYLE_CONFIDENCE_THRESHOLD) {
    return {
      type: 'growth',
      confidence: growthConfidence,
      evidenceCount: growthCharacteristics.length,
      message: `You favor growth stocks with strong momentum. ${Math.round(growthConfidence * 100)}% of your picks share growth characteristics.`,
    };
  }
  
  // Similar checks for value, dividend, etc.
  return null;
}

export function detectSectorBias(entries: JournalEntry[]): SectorPattern | null {
  const sectorCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    const sector = entry.stock.sector;
    sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
  });
  
  const totalEntries = entries.length;
  const sortedSectors = Object.entries(sectorCounts)
    .sort(([, a], [, b]) => b - a);
  
  const [topSector, topCount] = sortedSectors[0];
  const percentage = topCount / totalEntries;
  
  if (percentage >= PATTERN_CONFIG.SECTOR_BIAS_THRESHOLD) {
    return {
      dominantSector: topSector,
      percentage,
      sectors: sectorCounts,
      message: `You've been focusing on ${topSector} stocks (${Math.round(percentage * 100)}% of analyses).`,
    };
  }
  
  return null;
}
```

### 5.3 Blind Spot Detection Logic

```typescript
// src/features/learn/services/blindSpotDetector.ts

export function analyzeBlindSpots(entries: JournalEntry[]): BlindSpotAnalysis {
  const recentEntries = entries.slice(0, BLIND_SPOT_CONFIG.ANALYSIS_WINDOW);
  
  const segmentCoverage: SegmentCoverage[] = ALL_SEGMENTS.map(segment => {
    const checkCount = recentEntries.filter(
      entry => entry.segmentsViewed.includes(segment.id)
    ).length;
    
    const percentage = checkCount / recentEntries.length;
    
    let status: SegmentCoverage['status'];
    if (percentage >= 0.8) status = 'strong';
    else if (percentage >= 0.6) status = 'adequate';
    else if (percentage >= BLIND_SPOT_CONFIG.WARNING_THRESHOLD) status = 'weak';
    else status = 'critical';
    
    return {
      segmentId: segment.id,
      segmentName: segment.name,
      checkCount,
      totalAnalyses: recentEntries.length,
      percentage,
      status,
    };
  });
  
  const alerts = generateBlindSpotAlerts(segmentCoverage);
  const overallHealth = calculateOverallHealth(segmentCoverage);
  
  return {
    profileId: entries[0]?.profileId || '',
    analysisWindow: BLIND_SPOT_CONFIG.ANALYSIS_WINDOW,
    lastUpdated: new Date().toISOString(),
    segmentCoverage,
    alerts,
    overallHealth,
  };
}

function generateBlindSpotAlerts(coverage: SegmentCoverage[]): BlindSpotAlert[] {
  return coverage
    .filter(c => c.status === 'weak' || c.status === 'critical')
    .map(c => ({
      id: `alert-${c.segmentId}`,
      segmentId: c.segmentId,
      segmentName: c.segmentName,
      percentage: c.percentage,
      severity: c.status === 'critical' ? 'critical' : 'warning',
      message: BLIND_SPOT_MESSAGES[c.segmentId],
      learnMoreUrl: `/learn/segments/${c.segmentId}`,
      dismissedAt: null,
    }));
}

const BLIND_SPOT_MESSAGES: Record<SegmentId, string> = {
  profitability: "Profitability shows if the business is actually making money.",
  financial_ratios: "Financial ratios reveal the company's efficiency and health.",
  growth: "Growth metrics show if the business is expanding.",
  valuation: "Valuation tells you if you're paying a fair price.",
  price_volume: "Price patterns reveal market sentiment.",
  technical: "Technical indicators show momentum and trends.",
  broker_ratings: "Broker ratings show institutional sentiment.",
  ownership: "Ownership shows who's betting on the company.",
  fno: "F&O data reveals derivative market positioning.",
  income_statement: "Income statement shows profit generation.",
  balance_sheet: "Balance sheet reveals financial strength.",
};
```

### 5.4 Skill Level Calculation

```typescript
// src/features/learn/utils/levelCalculator.ts

const SKILL_LEVELS: SkillLevel[] = [
  {
    id: 1,
    name: 'Newcomer',
    badge: '🌱',
    requirements: { minAnalyses: 0, minMetricsLearned: 0 },
    nextLevel: 2,
  },
  {
    id: 2,
    name: 'Explorer',
    badge: '🔍',
    requirements: { minAnalyses: 3, minMetricsLearned: 0 },
    nextLevel: 3,
  },
  {
    id: 3,
    name: 'Learner',
    badge: '📚',
    requirements: { minAnalyses: 10, minMetricsLearned: 3 },
    nextLevel: 4,
  },
  {
    id: 4,
    name: 'Researcher',
    badge: '🔬',
    requirements: { minAnalyses: 20, minMetricsLearned: 6, minSectorsDiversified: 1 },
    nextLevel: 5,
  },
  {
    id: 5,
    name: 'Analyst',
    badge: '📊',
    requirements: { minAnalyses: 35, minMetricsLearned: 9, minWinRate: 50 },
    nextLevel: 6,
  },
  {
    id: 6,
    name: 'Strategist',
    badge: '🎯',
    requirements: { 
      minAnalyses: 50, 
      minMetricsLearned: 11, // All segments
      requirePatternIdentified: true 
    },
    nextLevel: 7,
  },
  {
    id: 7,
    name: 'Expert',
    badge: '🏆',
    requirements: { 
      minAnalyses: 75, 
      requireAllSegments: true, 
      minWinRate: 65 
    },
    nextLevel: null,
  },
];

export function calculateSkillLevel(
  analyses: number,
  metricsLearned: number,
  sectorsCovered: number,
  winRate: number,
  hasPattern: boolean,
  allSegmentsCovered: boolean
): UserSkillProgress {
  let currentLevel = SKILL_LEVELS[0];
  
  for (const level of SKILL_LEVELS) {
    const req = level.requirements;
    
    const meetsCriteria = 
      analyses >= req.minAnalyses &&
      metricsLearned >= req.minMetricsLearned &&
      (!req.minSectorsDiversified || sectorsCovered >= req.minSectorsDiversified) &&
      (!req.minWinRate || winRate >= req.minWinRate) &&
      (!req.requirePatternIdentified || hasPattern) &&
      (!req.requireAllSegments || allSegmentsCovered);
    
    if (meetsCriteria) {
      currentLevel = level;
    } else {
      break;
    }
  }
  
  const nextLevel = currentLevel.nextLevel 
    ? SKILL_LEVELS.find(l => l.id === currentLevel.nextLevel) 
    : null;
  
  const progressToNext = nextLevel 
    ? calculateProgressToNext(currentLevel, nextLevel, { analyses, metricsLearned, winRate })
    : 100;
  
  return {
    profileId: '', // Set by caller
    currentLevel: currentLevel.id,
    currentLevelName: currentLevel.name,
    currentBadge: currentLevel.badge,
    totalAnalyses: analyses,
    metricsLearned: [], // Set by caller
    sectorsCovered: [], // Set by caller
    winRate,
    nextLevel: nextLevel?.id || null,
    progressToNext,
    remainingRequirements: getRemainingRequirements(nextLevel, { 
      analyses, metricsLearned, winRate 
    }),
  };
}
```

---

## 6. State Management

### 6.1 Learn Store (Zustand)

```typescript
// src/features/learn/store/learnStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearnState {
  // Journal
  entries: JournalEntry[];
  entriesLoading: boolean;
  entriesError: string | null;
  
  // Patterns
  patterns: PatternAnalysis | null;
  patternsLoading: boolean;
  
  // Blind Spots
  blindSpots: BlindSpotAnalysis | null;
  dismissedAlerts: string[]; // segment IDs
  
  // Skill Progress
  skillProgress: UserSkillProgress | null;
  
  // Learning Progress
  learningProgress: LearningProgress | null;
  
  // Reflection Prompt
  activePrompt: ReflectionPrompt | null;
  promptDismissals: Record<string, string>; // stockSymbol -> dismissedAt
  
  // Chat
  chatSessions: Record<string, ChatSession>; // sessionId -> session
  activeChatSessionId: string | null;
  
  // Actions
  actions: {
    // Journal
    fetchEntries: (profileId: string) => Promise<void>;
    createEntry: (data: CreateEntryData) => Promise<JournalEntry>;
    updateEntry: (entryId: string, data: UpdateEntryData) => Promise<void>;
    
    // Patterns
    analyzePatterns: (profileId: string) => Promise<void>;
    
    // Blind Spots
    analyzeBlindSpots: (profileId: string) => Promise<void>;
    dismissBlindSpotAlert: (segmentId: string) => void;
    
    // Skill
    calculateSkillLevel: (profileId: string) => Promise<void>;
    
    // Learning
    markMetricLearned: (metricId: string, source: string) => void;
    
    // Prompt
    showReflectionPrompt: (stock: { symbol: string; name: string }) => void;
    submitReflection: (verdict: UserVerdict, notes: string | null) => void;
    dismissReflection: () => void;
    
    // Chat
    sendChatMessage: (message: string) => Promise<void>;
    clearChat: () => void;
  };
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: [],
      entriesLoading: false,
      entriesError: null,
      patterns: null,
      patternsLoading: false,
      blindSpots: null,
      dismissedAlerts: [],
      skillProgress: null,
      learningProgress: null,
      activePrompt: null,
      promptDismissals: {},
      chatSessions: {},
      activeChatSessionId: null,
      
      actions: {
        fetchEntries: async (profileId) => {
          set({ entriesLoading: true, entriesError: null });
          try {
            const entries = await journalService.getEntries(profileId);
            set({ entries, entriesLoading: false });
          } catch (error) {
            set({ 
              entriesError: error.message, 
              entriesLoading: false 
            });
          }
        },
        
        createEntry: async (data) => {
          const entry = await journalService.createEntry(data);
          set(state => ({ 
            entries: [entry, ...state.entries] 
          }));
          
          // Trigger re-analysis
          get().actions.analyzePatterns(data.profileId);
          get().actions.analyzeBlindSpots(data.profileId);
          get().actions.calculateSkillLevel(data.profileId);
          
          return entry;
        },
        
        // ... other actions
      },
    }),
    {
      name: 'stockfox-learn-store',
      partialize: (state) => ({
        dismissedAlerts: state.dismissedAlerts,
        promptDismissals: state.promptDismissals,
        learningProgress: state.learningProgress,
      }),
    }
  )
);

// Selector hooks for performance
export const useJournalEntries = () => useLearnStore(state => state.entries);
export const usePatterns = () => useLearnStore(state => state.patterns);
export const useBlindSpots = () => useLearnStore(state => state.blindSpots);
export const useSkillProgress = () => useLearnStore(state => state.skillProgress);
export const useLearnActions = () => useLearnStore(state => state.actions);
```

---

## 7. Performance Requirements

### 7.1 Loading Times

| Operation | Target | Maximum | Notes |
|-----------|--------|---------|-------|
| Journal Dashboard Load | <500ms | 1s | With 50 entries |
| Pattern Analysis | <200ms | 500ms | Client-side calculation |
| Blind Spot Detection | <100ms | 200ms | Client-side calculation |
| Tooltip Display | <100ms | 200ms | Pre-loaded definitions |
| Chat Response | <500ms | 2s | Mock responses |
| Entry Creation | <200ms | 500ms | Optimistic update |

### 7.2 Memory Limits

| Data | Limit | Strategy |
|------|-------|----------|
| Journal Entries | 100 in memory | Pagination, oldest evicted |
| Chat History | 50 messages per session | Truncate older messages |
| Metric Definitions | All (~45) | Pre-loaded, cached |

### 7.3 Debounce/Throttle Settings

```typescript
// src/features/learn/utils/performance.ts

export const PERFORMANCE_CONFIG = {
  // Pattern re-analysis after entry creation
  PATTERN_ANALYSIS_DEBOUNCE: 1000, // 1 second
  
  // Blind spot re-analysis
  BLIND_SPOT_ANALYSIS_DEBOUNCE: 500,
  
  // Auto-save notes
  NOTE_AUTOSAVE_DEBOUNCE: 500,
  
  // Chat typing indicator
  CHAT_TYPING_THROTTLE: 200,
  
  // Scroll-based entry loading
  SCROLL_LOAD_THRESHOLD: 0.8, // 80% scroll position
  SCROLL_LOAD_DEBOUNCE: 200,
};
```

---

## 8. Error Handling

### 8.1 Error Types

```typescript
// src/features/learn/types/errors.ts

export class LearnError extends Error {
  constructor(
    message: string,
    public code: LearnErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'LearnError';
  }
}

export enum LearnErrorCode {
  // Journal errors
  JOURNAL_FETCH_FAILED = 'JOURNAL_FETCH_FAILED',
  JOURNAL_CREATE_FAILED = 'JOURNAL_CREATE_FAILED',
  JOURNAL_UPDATE_FAILED = 'JOURNAL_UPDATE_FAILED',
  
  // Pattern errors
  PATTERN_ANALYSIS_FAILED = 'PATTERN_ANALYSIS_FAILED',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  
  // Learning errors
  METRIC_NOT_FOUND = 'METRIC_NOT_FOUND',
  
  // Chat errors
  CHAT_SEND_FAILED = 'CHAT_SEND_FAILED',
  QUERY_NOT_UNDERSTOOD = 'QUERY_NOT_UNDERSTOOD',
}
```

### 8.2 Error Recovery Strategies

| Error Code | User Message | Recovery Action |
|------------|--------------|-----------------|
| JOURNAL_FETCH_FAILED | "Couldn't load your journal. Tap to retry." | Retry button |
| JOURNAL_CREATE_FAILED | "Couldn't save entry. It's saved locally." | Queue for retry |
| INSUFFICIENT_DATA | "Analyze 5+ stocks to see patterns." | Show progress |
| METRIC_NOT_FOUND | "Definition not available." | Show generic text |
| QUERY_NOT_UNDERSTOOD | "I didn't understand that. Try rephrasing." | Suggest examples |

### 8.3 Error Boundaries

```typescript
// src/features/learn/components/LearnErrorBoundary.tsx

interface LearnErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export class LearnErrorBoundary extends React.Component<
  LearnErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Learn cluster error:', error, errorInfo);
    this.props.onError?.(error);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <LearnErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## 9. Testing Specifications

### 9.1 Unit Tests

```typescript
// src/features/learn/__tests__/outcomeCalculator.test.ts

describe('outcomeCalculator', () => {
  describe('calculateOutcome', () => {
    it('should return win when price increased >10%', () => {
      const result = calculateOutcome(100, 115);
      expect(result.status).toBe('win');
      expect(result.changePercent).toBe(0.15);
    });
    
    it('should return loss when price decreased >10%', () => {
      const result = calculateOutcome(100, 85);
      expect(result.status).toBe('loss');
      expect(result.changePercent).toBe(-0.15);
    });
    
    it('should return neutral when price within ±10%', () => {
      const result = calculateOutcome(100, 105);
      expect(result.status).toBe('neutral');
      expect(result.changePercent).toBe(0.05);
    });
    
    it('should handle edge case at exactly +10%', () => {
      const result = calculateOutcome(100, 110);
      expect(result.status).toBe('win');
    });
    
    it('should handle edge case at exactly -10%', () => {
      const result = calculateOutcome(100, 90);
      expect(result.status).toBe('loss');
    });
  });
  
  describe('calculateWinRate', () => {
    it('should exclude pending entries', () => {
      const entries = [
        { outcomeStatus: 'win' },
        { outcomeStatus: 'loss' },
        { outcomeStatus: 'pending' },
      ] as JournalEntry[];
      
      expect(calculateWinRate(entries)).toBe(50);
    });
    
    it('should return 0 for all pending entries', () => {
      const entries = [
        { outcomeStatus: 'pending' },
        { outcomeStatus: 'pending' },
      ] as JournalEntry[];
      
      expect(calculateWinRate(entries)).toBe(0);
    });
  });
});
```

### 9.2 Integration Tests

```typescript
// src/features/learn/__tests__/journalFlow.integration.test.ts

describe('Journal Flow Integration', () => {
  it('should create entry and update patterns', async () => {
    // Setup
    const { result } = renderHook(() => useLearnStore());
    
    // Create entry
    await act(async () => {
      await result.current.actions.createEntry({
        profileId: 'test-profile',
        stock: { symbol: 'TCS', name: 'TCS Ltd', sector: 'IT' },
        scoreAtAnalysis: 8.2,
        verdictAtAnalysis: 'STRONG BUY',
        userVerdict: 'BUY',
        priceAtAnalysis: 4000,
        segmentsViewed: ['profitability', 'growth'],
        segmentsExpanded: ['profitability'],
        timeSpentSeconds: 300,
        analysisSessionId: 'session-1',
      });
    });
    
    // Verify entry created
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].stock.symbol).toBe('TCS');
    
    // Verify patterns re-analyzed
    expect(result.current.patternsLoading).toBe(false);
  });
  
  it('should detect blind spots after 10 analyses', async () => {
    // Setup with 10 entries, all missing 'ownership'
    const mockEntries = Array(10).fill(null).map((_, i) => ({
      id: `entry-${i}`,
      segmentsViewed: ['profitability', 'growth', 'valuation'],
      // Note: 'ownership' not included
    }));
    
    // Run blind spot detection
    const result = analyzeBlindSpots(mockEntries as JournalEntry[]);
    
    // Verify ownership flagged
    const ownershipCoverage = result.segmentCoverage.find(
      s => s.segmentId === 'ownership'
    );
    expect(ownershipCoverage?.status).toBe('critical');
    expect(result.alerts.some(a => a.segmentId === 'ownership')).toBe(true);
  });
});
```

### 9.3 Component Tests

```typescript
// src/features/learn/components/__tests__/JournalEntryCard.test.tsx

describe('JournalEntryCard', () => {
  const mockEntry: JournalEntry = {
    id: '1',
    stock: { symbol: 'TCS', name: 'TCS Ltd', sector: 'IT' },
    scoreAtAnalysis: 8.2,
    userVerdict: 'BUY',
    outcomeStatus: 'win',
    priceChangePercent: 0.14,
    // ... other fields
  };
  
  it('should display win status with green styling', () => {
    render(<JournalEntryCard entry={mockEntry} variant="compact" />);
    
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.getByText('+14%')).toBeInTheDocument();
    expect(screen.getByTestId('entry-card')).toHaveClass('bg-green-50');
  });
  
  it('should call onTap when clicked', () => {
    const onTap = jest.fn();
    render(<JournalEntryCard entry={mockEntry} variant="compact" onTap={onTap} />);
    
    fireEvent.click(screen.getByTestId('entry-card'));
    expect(onTap).toHaveBeenCalledTimes(1);
  });
  
  it('should show expanded view with all details', () => {
    render(<JournalEntryCard entry={mockEntry} variant="expanded" />);
    
    expect(screen.getByText('Segments Checked')).toBeInTheDocument();
    expect(screen.getByText('Time Spent')).toBeInTheDocument();
  });
});
```

### 9.4 Test Coverage Requirements

| Category | Minimum Coverage |
|----------|-----------------|
| Business Logic (utils/) | 90% |
| Services | 80% |
| Hooks | 75% |
| Components | 70% |
| Store | 80% |

---

## 10. Mock Data Implementation

### 10.1 Mock Journal Entries

```typescript
// src/features/learn/data/mockJournalEntries.ts

import { JournalEntry } from '../types/learn.types';

export const MOCK_JOURNAL_ENTRIES: Record<string, JournalEntry[]> = {
  // Profile A: Ankit (Growth)
  'ankit-growth': [
    {
      id: 'ankit-1',
      createdAt: '2024-07-15T10:30:00Z',
      updatedAt: '2024-07-15T10:45:00Z',
      stock: { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail' },
      scoreAtAnalysis: 7.8,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'BUY',
      userNotes: 'Retail growth plays can work',
      priceAtAnalysis: 1450,
      currentPrice: 1914,
      priceChangePercent: 0.32,
      outcomeStatus: 'win',
      outcomeCalculatedAt: '2025-01-15T00:00:00Z',
      segmentsViewed: ['profitability', 'growth', 'valuation', 'ownership'],
      segmentsExpanded: ['profitability', 'growth'],
      timeSpentSeconds: 480,
      profileId: 'ankit-growth',
      analysisSessionId: 'session-ankit-1',
    },
    {
      id: 'ankit-2',
      createdAt: '2024-08-02T14:20:00Z',
      updatedAt: '2024-08-02T14:35:00Z',
      stock: { symbol: 'DELHIVERY', name: 'Delhivery Ltd', sector: 'Logistics' },
      scoreAtAnalysis: 6.2,
      verdictAtAnalysis: 'HOLD',
      userVerdict: 'SKIP',
      userNotes: 'Waited for profitability clarity',
      priceAtAnalysis: 380,
      currentPrice: 399,
      priceChangePercent: 0.05,
      outcomeStatus: 'neutral',
      outcomeCalculatedAt: '2025-01-15T00:00:00Z',
      segmentsViewed: ['profitability', 'growth'],
      segmentsExpanded: ['profitability'],
      timeSpentSeconds: 360,
      profileId: 'ankit-growth',
      analysisSessionId: 'session-ankit-2',
    },
    // ... more entries (6 total for Ankit)
  ],
  
  // Profile B: Sneha (Value)
  'sneha-value': [
    {
      id: 'sneha-1',
      createdAt: '2024-07-05T09:15:00Z',
      updatedAt: '2024-07-05T09:40:00Z',
      stock: { symbol: 'BRITANNIA', name: 'Britannia Industries', sector: 'FMCG' },
      scoreAtAnalysis: 7.5,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'BUY',
      userNotes: 'Quality FMCG at reasonable price',
      priceAtAnalysis: 5200,
      currentPrice: 5616,
      priceChangePercent: 0.08,
      outcomeStatus: 'neutral',
      outcomeCalculatedAt: '2025-01-15T00:00:00Z',
      segmentsViewed: ['profitability', 'valuation', 'financial_ratios', 'ownership', 'balance_sheet'],
      segmentsExpanded: ['valuation', 'financial_ratios'],
      timeSpentSeconds: 720,
      profileId: 'sneha-value',
      analysisSessionId: 'session-sneha-1',
    },
    // ... more entries (6 total for Sneha)
  ],
  
  // Profile C: Kavya (Beginner)
  'kavya-beginner': [
    {
      id: 'kavya-1',
      createdAt: '2024-08-01T11:00:00Z',
      updatedAt: '2024-08-01T11:25:00Z',
      stock: { symbol: 'TCS', name: 'TCS Ltd', sector: 'IT' },
      scoreAtAnalysis: 7.8,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'BUY',
      userNotes: 'First stock! Nervous but excited',
      priceAtAnalysis: 3500,
      currentPrice: 3990,
      priceChangePercent: 0.14,
      outcomeStatus: 'win',
      outcomeCalculatedAt: '2025-01-15T00:00:00Z',
      segmentsViewed: ['profitability', 'growth'],
      segmentsExpanded: ['profitability'],
      timeSpentSeconds: 600,
      profileId: 'kavya-beginner',
      analysisSessionId: 'session-kavya-1',
    },
    // ... more entries (4 total for Kavya - less experienced)
  ],
};

// Helper to get entries for a profile
export function getMockJournalEntries(profileId: string): JournalEntry[] {
  return MOCK_JOURNAL_ENTRIES[profileId] || [];
}
```

### 10.2 Mock Metric Definitions

```typescript
// src/features/learn/data/metricDefinitions.ts

import { MetricDefinition } from '../types/learn.types';

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  // Profitability Segment
  {
    id: 'roe',
    name: 'Return on Equity (ROE)',
    segmentId: 'profitability',
    category: 'intermediate',
    definitions: {
      beginner: 'ROE shows how well a company uses investor money. Higher is generally better.',
      intermediate: 'ROE measures profit generated per rupee of shareholder equity. Compare to sector average (typically 12-18% is good).',
      advanced: 'ROE = Net Income / Shareholders Equity. Use DuPont analysis to decompose: Net Margin × Asset Turnover × Equity Multiplier. Watch for ROE inflated by excessive leverage.',
    },
    whyItMatters: 'Higher ROE means management is using your money efficiently to generate profits.',
    goodThreshold: '> 15%',
    badThreshold: '< 10%',
    compareToSector: true,
  },
  {
    id: 'net_profit_margin',
    name: 'Net Profit Margin',
    segmentId: 'profitability',
    category: 'basic',
    definitions: {
      beginner: 'How much profit the company keeps from each rupee of sales.',
      intermediate: 'Net Profit Margin = Net Profit / Revenue. Shows pricing power and cost efficiency. Compare within same industry.',
      advanced: 'Analyze margin trends over 5 years. Expanding margins suggest operating leverage; contracting margins may indicate competitive pressure or rising costs.',
    },
    whyItMatters: 'Higher margins mean the company keeps more of what it earns.',
    goodThreshold: '> 10%',
    badThreshold: '< 5%',
    compareToSector: true,
  },
  {
    id: 'revenue_growth',
    name: 'Revenue Growth',
    segmentId: 'growth',
    category: 'basic',
    definitions: {
      beginner: 'How fast the company\'s sales are growing year over year.',
      intermediate: 'YoY Revenue Growth = (Current Year Revenue - Last Year) / Last Year. Look for consistent double-digit growth in growth stocks.',
      advanced: 'Analyze organic vs inorganic growth. Check revenue quality: recurring vs one-time, domestic vs export mix, customer concentration.',
    },
    whyItMatters: 'Growing revenue means expanding business and potential for higher profits.',
    goodThreshold: '> 15% YoY',
    badThreshold: '< 5% YoY',
    compareToSector: true,
  },
  {
    id: 'pe_ratio',
    name: 'Price-to-Earnings (P/E) Ratio',
    segmentId: 'valuation',
    category: 'basic',
    definitions: {
      beginner: 'How much investors are paying for each rupee of profit. Lower can mean cheaper.',
      intermediate: 'P/E = Stock Price / EPS. Compare to sector average and historical P/E. High P/E may indicate growth expectations or overvaluation.',
      advanced: 'Use forward P/E for growth stocks. Consider PEG ratio (P/E divided by growth rate). Normalize earnings for one-time items.',
    },
    whyItMatters: 'Helps determine if a stock is cheap or expensive relative to its earnings.',
    goodThreshold: 'Below sector average',
    badThreshold: '> 2x sector average',
    compareToSector: true,
  },
  // ... more metrics (45 total covering all segments)
];

export function getMetricDefinition(
  metricId: string, 
  skillLevel: number
): MetricDefinition | null {
  const metric = METRIC_DEFINITIONS.find(m => m.id === metricId);
  if (!metric) return null;
  
  // Adaptive content based on skill level
  const depthKey = skillLevel <= 2 ? 'beginner' 
    : skillLevel <= 4 ? 'intermediate' 
    : 'advanced';
  
  return {
    ...metric,
    // Return only the appropriate depth definition
    definitions: {
      beginner: metric.definitions.beginner,
      intermediate: metric.definitions[depthKey],
      advanced: metric.definitions[depthKey],
    },
  };
}
```

### 10.3 Mock Chat Responses

```typescript
// src/features/learn/data/mockChatResponses.ts

interface MockChatResponse {
  patterns: RegExp[];
  response: (context: ChatContext) => string;
}

interface ChatContext {
  stockSymbol?: string;
  stockName?: string;
  metricValue?: number;
  sectorAverage?: number;
  skillLevel: number;
}

export const MOCK_CHAT_RESPONSES: MockChatResponse[] = [
  // What is ROE
  {
    patterns: [
      /what (is|does) (roe|return on equity)/i,
      /explain roe/i,
      /define roe/i,
    ],
    response: (ctx) => {
      if (ctx.skillLevel <= 2) {
        return `**Return on Equity (ROE)** 📈

In simple terms: How much profit a company makes for every ₹100 of shareholder money invested.

${ctx.stockName ? `For ${ctx.stockName}: ${ctx.metricValue}%
Sector average: ${ctx.sectorAverage}%
${ctx.metricValue > ctx.sectorAverage ? '✅ Above average - good sign!' : '⚠️ Below average'}` : ''}

Higher is generally better. Most good companies have ROE above 15%.`;
      }
      
      return `**Return on Equity (ROE)**

ROE = Net Income / Shareholders' Equity

${ctx.stockName ? `**${ctx.stockName}:** ${ctx.metricValue}%
**Sector avg:** ${ctx.sectorAverage}%
**Verdict:** ${ctx.metricValue > ctx.sectorAverage ? '✅ Outperforming' : '⚠️ Underperforming'}` : ''}

ROE shows management efficiency. For IT sector, 20%+ is excellent. For banks, 12-15% is normal due to capital requirements.

Pro tip: Check if high ROE is from genuine profitability or excessive debt (use DuPont analysis).`;
    },
  },
  
  // Is this P/E good
  {
    patterns: [
      /is (this|that|the) (pe|p\/e|price.?to.?earnings) (good|high|low|ok)/i,
      /is \d+x? pe (good|high|low)/i,
    ],
    response: (ctx) => {
      const pe = ctx.metricValue;
      const sectorPE = ctx.sectorAverage;
      
      if (!pe || !sectorPE) {
        return `To evaluate P/E, I need to know:
1. The stock's current P/E
2. The sector average P/E

Can you tell me which stock you're looking at?`;
      }
      
      const premium = ((pe - sectorPE) / sectorPE * 100).toFixed(0);
      const isHigh = pe > sectorPE * 1.2;
      const isLow = pe < sectorPE * 0.8;
      
      return `**P/E Analysis for ${ctx.stockName}**

Current P/E: ${pe}x
Sector Average: ${sectorPE}x
${isHigh ? `Premium: +${premium}%` : isLow ? `Discount: ${premium}%` : 'In line with sector'}

**Interpretation:**
${isHigh 
  ? `⚠️ Trading at a premium. This could mean:\n• Market expects higher growth\n• Stock may be overvalued\n• Compare with growth rate (PEG ratio)` 
  : isLow 
  ? `✅ Trading at a discount. This could mean:\n• Potential undervaluation\n• Market has concerns (check why)\n• Good entry point if fundamentals solid`
  : `📊 Fair valued relative to peers. Focus on:\n• Growth potential\n• Quality of earnings\n• Future catalysts`}`;
    },
  },
  
  // Why is this stock risky
  {
    patterns: [
      /why (is|does) (this|the) stock (show|have|flag) (high )?risk/i,
      /why (is it|is this) risky/i,
      /what are the risks/i,
    ],
    response: (ctx) => {
      return `**Risk Factors for ${ctx.stockName || 'this stock'}**

Based on the analysis, here are the key risks:

1. **Volatility Risk** 📊
   Beta indicates how much the stock swings vs market.
   Higher beta = bigger swings in both directions.

2. **Financial Risk** 💰
   Check debt levels and interest coverage.
   High debt + rising rates = pressure on profits.

3. **Business Risk** 🏢
   Concentration in customers/products/geography.
   Regulatory changes that could impact operations.

For your profile, consider:
• Does this fit your risk tolerance?
• Is the potential reward worth the risk?
• How does this fit with your existing portfolio?`;
    },
  },
  
  // Fallback
  {
    patterns: [/.*/],
    response: () => {
      return `I'm not sure I understood that question. 

I can help with:
• **Metric explanations** - "What is ROE?"
• **Evaluations** - "Is this P/E ratio good?"
• **Concepts** - "What is a GARP investor?"
• **Stock-specific** - "Why is this stock risky?"

Try rephrasing your question, or pick one of the topics above!`;
    },
  },
];

export function getMockChatResponse(
  message: string, 
  context: ChatContext
): string {
  for (const { patterns, response } of MOCK_CHAT_RESPONSES) {
    if (patterns.some(p => p.test(message))) {
      return response(context);
    }
  }
  
  // Should never reach here due to fallback
  return "I'm having trouble understanding. Can you try rephrasing?";
}
```

---

## Appendix A: Segment Configuration

```typescript
// src/features/learn/data/segmentConfig.ts

export const ALL_SEGMENTS: { id: SegmentId; name: string; metricsCount: number }[] = [
  { id: 'profitability', name: 'Profitability', metricsCount: 5 },
  { id: 'financial_ratios', name: 'Financial Ratios', metricsCount: 5 },
  { id: 'growth', name: 'Growth', metricsCount: 4 },
  { id: 'valuation', name: 'Valuation', metricsCount: 5 },
  { id: 'price_volume', name: 'Price & Volume', metricsCount: 4 },
  { id: 'technical', name: 'Technical Indicators', metricsCount: 4 },
  { id: 'broker_ratings', name: 'Broker Ratings', metricsCount: 3 },
  { id: 'ownership', name: 'Ownership', metricsCount: 4 },
  { id: 'fno', name: 'Futures & Options', metricsCount: 4 },
  { id: 'income_statement', name: 'Income Statement', metricsCount: 4 },
  { id: 'balance_sheet', name: 'Balance Sheet & Cash Flow', metricsCount: 4 },
];

export const TOTAL_METRICS = ALL_SEGMENTS.reduce((sum, s) => sum + s.metricsCount, 0);
// = 46 metrics total
```

---

## Appendix B: Accessibility Requirements

| Component | Requirement |
|-----------|-------------|
| All interactive elements | Min touch target 44x44px |
| Color contrast | WCAG AA (4.5:1 for text) |
| Outcome indicators | Not color-only (include icon) |
| Tooltips | Screen reader accessible |
| Charts | Alternative text descriptions |
| Focus states | Visible focus ring |
| Animations | Respect prefers-reduced-motion |

---

*Technical Specification v1.0 - Ready for development*
