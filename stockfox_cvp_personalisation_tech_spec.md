# StockFox MLP Prototype - Technical Specification

**Version:** 1.0  
**Date:** January 15, 2025  
**Status:** Ready for Development  
**Based On:** CVP & Personalisation Cluster PRD v2.0  
**Build Approach:** Vibe-coded Web App using Claude Code

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Data Models](#4-data-models)
5. [API Specifications](#5-api-specifications)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Component Specifications](#7-component-specifications)
8. [State Management](#8-state-management)
9. [Routing & Navigation](#9-routing--navigation)
10. [Mock Data Implementation](#10-mock-data-implementation)
11. [UI/UX Specifications](#11-uiux-specifications)
12. [Performance Requirements](#12-performance-requirements)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment Configuration](#14-deployment-configuration)

---

## 1. Executive Summary

### 1.1 Purpose
This technical specification defines the implementation details for the StockFox MLP (Minimum Lovable Product) prototype. The prototype demonstrates the platform's core value proposition: comprehensive, transparent, and personalized stock analysis.

### 1.2 Scope
- **In Scope:** CVP features (A1-A14), Personalisation features (B1-B12), Alert features (F1-F6), Journal features (E1-E9), Validation entry points (H1-H5)
- **Out of Scope:** Real-time data integration, payment processing, user authentication (beyond demo profiles), backend API development

### 1.3 Key Technical Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React 18+ with TypeScript | Type safety, component reusability |
| Styling | Tailwind CSS + shadcn/ui | Rapid prototyping, consistent design |
| State Management | Zustand | Lightweight, simple, works with TypeScript |
| Data Layer | JSON Mock Data | No backend required for demo |
| Build Tool | Vite | Fast development, optimized builds |
| Charts | Recharts | React-native, declarative, responsive |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │ Components  │  │   Layouts   │             │
│  │  (Routes)   │  │  (Reusable) │  │  (Shell)    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                      STATE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Profile   │  │   Stock     │  │   Journal   │             │
│  │   Store     │  │   Store     │  │   Store     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │   Alert     │  │    UI       │                              │
│  │   Store     │  │   Store     │                              │
│  └─────────────┘  └─────────────┘                              │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  stocks.json│  │profiles.json│  │ journal.json│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ alerts.json │  │segments.json│  │citations.json│            │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Directory Structure

```
stockfox-prototype/
├── public/
│   └── assets/
│       ├── icons/
│       └── images/
├── src/
│   ├── components/
│   │   ├── analysis/
│   │   │   ├── QuickAnalysis.tsx
│   │   │   ├── FullAnalysis.tsx
│   │   │   ├── SegmentCard.tsx
│   │   │   ├── MetricRow.tsx
│   │   │   ├── CitationDrilldown.tsx
│   │   │   ├── VerdictBanner.tsx
│   │   │   ├── PositionGuidance.tsx
│   │   │   ├── PeerRanking.tsx
│   │   │   └── RedFlagCard.tsx
│   │   ├── alerts/
│   │   │   ├── AlertCenter.tsx
│   │   │   ├── AlertCard.tsx
│   │   │   ├── ThesisBreakingAlert.tsx
│   │   │   ├── ScoreDropAlert.tsx
│   │   │   └── PeerRankChangeAlert.tsx
│   │   ├── journal/
│   │   │   ├── JournalList.tsx
│   │   │   ├── JournalEntry.tsx
│   │   │   ├── BlindSpotAnalysis.tsx
│   │   │   ├── PatternRecognition.tsx
│   │   │   └── HighlightToNote.tsx
│   │   ├── profile/
│   │   │   ├── ProfileSwitcher.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   └── PortfolioSnapshot.tsx
│   │   ├── comparison/
│   │   │   └── StockComparison.tsx
│   │   ├── discovery/
│   │   │   ├── DiscoveryHub.tsx
│   │   │   ├── TrendingStocks.tsx
│   │   │   └── ForYouRecommendations.tsx
│   │   ├── validation/
│   │   │   ├── BacktestEntry.tsx
│   │   │   ├── SimulatorEntry.tsx
│   │   │   └── AdvisorMarketplaceEntry.tsx
│   │   ├── charts/
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── SegmentRadar.tsx
│   │   │   └── HistoricalComparison.tsx
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ColorBand.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Navigation.tsx
│   │       └── PageWrapper.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── StockAnalysis.tsx
│   │   ├── SegmentDetail.tsx
│   │   ├── Journal.tsx
│   │   ├── AlertCenter.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Comparison.tsx
│   │   ├── Discovery.tsx
│   │   └── Validation.tsx
│   ├── stores/
│   │   ├── profileStore.ts
│   │   ├── stockStore.ts
│   │   ├── journalStore.ts
│   │   ├── alertStore.ts
│   │   └── uiStore.ts
│   ├── data/
│   │   ├── stocks.json
│   │   ├── profiles.json
│   │   ├── segments.json
│   │   ├── citations.json
│   │   ├── journal.json
│   │   ├── alerts.json
│   │   ├── patterns.json
│   │   └── peerRanks.json
│   ├── types/
│   │   ├── stock.ts
│   │   ├── profile.ts
│   │   ├── segment.ts
│   │   ├── journal.ts
│   │   ├── alert.ts
│   │   └── common.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── calculations.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useStockAnalysis.ts
│   │   ├── useProfile.ts
│   │   ├── useJournal.ts
│   │   └── useAlerts.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 3. Technology Stack

### 3.1 Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "recharts": "^2.10.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-accordion": "^1.1.2",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### 3.2 Design System Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // StockFox Brand Colors
        brand: {
          primary: "#2DD4BF",    // Teal/Cyan
          secondary: "#8B5CF6",  // Purple
          dark: "#1E1B4B",       // Dark purple/navy
        },
        // Score Bands
        score: {
          green: "#22C55E",      // 7+ scores
          yellow: "#EAB308",     // 5-7 scores
          red: "#EF4444",        // <5 scores
        },
        // Verdict Colors
        verdict: {
          buy: "#22C55E",
          hold: "#EAB308",
          avoid: "#EF4444",
          learn: "#3B82F6",
        },
        // UI Colors
        surface: {
          dark: "#0F0A1A",
          card: "#1A1333",
          elevated: "#251D3D",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'score-fill': 'scoreFill 1s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        scoreFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--score-width)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 4. Data Models

### 4.1 Core Type Definitions

```typescript
// types/profile.ts
export interface UserProfile {
  id: string;
  name: string;
  tagline: string;
  investmentThesis: InvestmentThesis;
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
  experienceLevel: ExperienceLevel;
  sectorPreferences: SectorPreference;
  portfolio: Portfolio;
  patterns: PatternDetection;
  blindSpots: BlindSpotAnalysis;
  skillLevel: SkillLevel;
}

export type InvestmentThesis = 'growth' | 'value' | 'dividend' | 'quality' | 'agnostic';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
export type TimeHorizon = 'short' | 'medium' | 'long'; // <1Y, 1-3Y, 3Y+
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SectorPreference {
  excludes: string[];
  preferences: string[];
}

export interface Portfolio {
  holdings: Holding[];
  cash: number; // percentage
  concentrationWarning: string | null;
}

export interface Holding {
  stock: string;
  ticker: string;
  allocation: number; // percentage
  purchased: string; // relative date
  entryPrice: number;
  currentReturn?: number;
}

export interface PatternDetection {
  primary: string;
  secondary: string;
}

export interface BlindSpotAnalysis {
  missed: string;
  strong: string;
  suggestion?: string;
}

export interface SkillLevel {
  level: number; // 1-7
  title: string;
  progressToNext: number; // percentage
}
```

```typescript
// types/stock.ts
export interface Stock {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  marketCap: string;
  lastUpdated: string;
}

export interface StockAnalysis {
  stockId: string;
  profileId: string;
  overallScore: number;
  verdict: Verdict;
  verdictColor: VerdictColor;
  summary: string;
  positionSizing: PositionSizing;
  entryTiming: EntryTiming;
  topSignals: Signal[];
  redFlags: RedFlag[];
  peerRanking: PeerRanking;
  portfolioFit: PortfolioFit;
  segments: SegmentAnalysis[];
  learningHighlights?: LearningHighlight[];
}

export type Verdict = 'STRONG BUY' | 'BUY' | 'HOLD' | 'HOLD/LEARN' | 'AVOID';
export type VerdictColor = 'green' | 'yellow' | 'red';

export interface PositionSizing {
  recommendedAllocation: string;
  reasoning: string;
  maxAllocation: string;
  warning?: string;
  learningNote?: string;
  entryStrategy?: string;
}

export interface EntryTiming {
  currentPrice: string;
  fairValueRange: string;
  suggestion: string;
  positionInRange?: string;
  assessment?: string;
}

export interface Signal {
  signal: string;
  detail: string;
  whyMatters: string;
  scoreContribution?: string;
}

export interface RedFlag {
  flag: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  detail: string;
  context: string; // Why acceptable/problematic for this profile
}

export interface PeerRanking {
  rank: number;
  category: string;
  total: number;
  above?: string[];
  below?: string[];
  commentary?: string;
  learningNote?: string;
}

export interface PortfolioFit {
  thesisFit: boolean;
  riskFit: boolean;
  diversificationFit: boolean;
  suggestionText: string;
}
```

```typescript
// types/segment.ts
export interface SegmentAnalysis {
  id: string;
  name: SegmentName;
  score: number;
  scoreBand: ScoreBand;
  quickInsight: string;
  metrics: Metric[];
  summaryByProfile: Record<string, string>;
}

export type SegmentName = 
  | 'profitability'
  | 'financialRatios'
  | 'growth'
  | 'valuation'
  | 'priceVolume'
  | 'technical'
  | 'brokerRatings'
  | 'ownership'
  | 'fno'
  | 'incomeStatement'
  | 'balanceSheetCashFlow';

export type ScoreBand = 'green' | 'yellow' | 'red';

export interface Metric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  sectorAvg?: string | number;
  comparison: 'above' | 'below' | 'inline';
  delta?: string;
  trend: 'improving' | 'declining' | 'stable';
  trend5Y?: (number | string)[];
  tooltipSimple: string;
  tooltipAdvanced: string;
  citation: Citation;
}

export interface Citation {
  id: string;
  source: string;
  document: string;
  date: string;
  page?: string;
  section?: string;
  exactQuote: string;
  documentUrl?: string;
}
```

```typescript
// types/journal.ts
export interface JournalEntry {
  id: string;
  timestamp: string;
  stockContext: {
    stock: string;
    ticker: string;
    aiScore: number;
    aiVerdict: Verdict;
    peerRank: string;
  };
  userProfileAtTime: {
    thesis: InvestmentThesis;
    riskTolerance: RiskTolerance;
    horizon: TimeHorizon;
  };
  analysisDepth: AnalysisDepth;
  userDecision: UserDecision;
  userNotes: UserNote[];
  outcome: Outcome;
}

export interface AnalysisDepth {
  modeUsed: 'quick' | 'full';
  timeSpent: string;
  segmentsViewed: SegmentView[];
  citationsClicked: number;
  aiQuestionsAsked: number;
}

export interface SegmentView {
  name: string;
  viewed: boolean;
  timeOnSegment?: string;
  metricsExpanded?: string[];
}

export interface UserDecision {
  verdict: Verdict | 'PASS';
  matchesAI: boolean;
  convictionLevel: number; // 1-10
  entryPrice?: number;
  plannedAllocation?: string;
}

export interface UserNote {
  text: string;
  highlightedFrom: string | null;
  timestamp: string;
}

export interface Outcome {
  status: 'pending' | 'profitable' | 'loss' | 'sold';
  currentReturn?: number;
  daysHeld?: number;
}
```

```typescript
// types/alert.ts
export interface Alert {
  id: string;
  type: AlertType;
  stock: string;
  ticker: string;
  timestamp: string;
  read: boolean;
  priority: AlertPriority;
  title: string;
  content: AlertContent;
}

export type AlertType = 
  | 'scoreChange'
  | 'peerRankChange'
  | 'earnings'
  | 'concentration'
  | 'thesisBreaking';

export type AlertPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface AlertContent {
  summary: string;
  whatChanged: string[];
  impactOnThesis: string;
  suggestedAction: string;
  previousValue?: string | number;
  currentValue?: string | number;
  updatedVerdict?: {
    from: Verdict;
    to: Verdict;
    fromScore: number;
    toScore: number;
  };
}

export interface ThesisBreakingAlertContent extends AlertContent {
  userThesis: string;
  thesisAtRisk: {
    title: string;
    details: string[];
    managementQuote?: string;
  };
  analysis: {
    whatThisMeans: string[];
    forYourProfile: string;
  };
  suggestedActions: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  primary?: boolean;
}
```

---

## 5. API Specifications

### 5.1 Data Access Layer

Since this is a mock-data prototype, we'll create a data service that simulates API calls:

```typescript
// services/dataService.ts
import stocksData from '../data/stocks.json';
import profilesData from '../data/profiles.json';
import segmentsData from '../data/segments.json';
import journalData from '../data/journal.json';
import alertsData from '../data/alerts.json';

export const dataService = {
  // Stock Operations
  async getStocks(): Promise<Stock[]> {
    return simulateDelay(stocksData.stocks);
  },

  async getStockById(stockId: string): Promise<Stock | null> {
    const stock = stocksData.stocks.find(s => s.id === stockId);
    return simulateDelay(stock || null);
  },

  async getStockAnalysis(
    stockId: string, 
    profileId: string
  ): Promise<StockAnalysis | null> {
    const analysis = stocksData.analyses.find(
      a => a.stockId === stockId && a.profileId === profileId
    );
    return simulateDelay(analysis || null);
  },

  // Profile Operations
  async getProfiles(): Promise<UserProfile[]> {
    return simulateDelay(profilesData.profiles);
  },

  async getProfileById(profileId: string): Promise<UserProfile | null> {
    const profile = profilesData.profiles.find(p => p.id === profileId);
    return simulateDelay(profile || null);
  },

  // Segment Operations
  async getSegments(
    stockId: string, 
    profileId: string
  ): Promise<SegmentAnalysis[]> {
    const key = `${stockId}_${profileId}`;
    return simulateDelay(segmentsData[key] || []);
  },

  // Journal Operations
  async getJournalEntries(profileId: string): Promise<JournalEntry[]> {
    const entries = journalData.entries.filter(
      e => e.profileId === profileId
    );
    return simulateDelay(entries);
  },

  async addJournalEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const newEntry = {
      ...entry,
      id: `JE-${Date.now()}`,
      timestamp: new Date().toISOString(),
    } as JournalEntry;
    // In real app, would persist
    return simulateDelay(newEntry);
  },

  // Alert Operations
  async getAlerts(profileId: string): Promise<Alert[]> {
    const alerts = alertsData.alerts.filter(
      a => a.profileId === profileId
    );
    return simulateDelay(alerts);
  },

  async markAlertRead(alertId: string): Promise<boolean> {
    return simulateDelay(true);
  },

  // Peer Ranking
  async getPeerRanking(
    stockId: string, 
    profileId: string
  ): Promise<PeerRanking> {
    const ranking = stocksData.peerRankings.find(
      r => r.stockId === stockId && r.profileId === profileId
    );
    return simulateDelay(ranking!);
  },
};

// Simulate network delay for realistic feel
function simulateDelay<T>(data: T, ms: number = 100): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms));
}
```

### 5.2 Custom Hooks

```typescript
// hooks/useStockAnalysis.ts
import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { useProfileStore } from '../stores/profileStore';
import type { Stock, StockAnalysis, SegmentAnalysis } from '../types';

export function useStockAnalysis(stockId: string) {
  const [stock, setStock] = useState<Stock | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [segments, setSegments] = useState<SegmentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { currentProfile } = useProfileStore();
  
  const fetchData = useCallback(async () => {
    if (!stockId || !currentProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [stockData, analysisData, segmentData] = await Promise.all([
        dataService.getStockById(stockId),
        dataService.getStockAnalysis(stockId, currentProfile.id),
        dataService.getSegments(stockId, currentProfile.id),
      ]);
      
      setStock(stockData);
      setAnalysis(analysisData);
      setSegments(segmentData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [stockId, currentProfile]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Refetch when profile changes
  useEffect(() => {
    if (currentProfile) {
      fetchData();
    }
  }, [currentProfile?.id]);
  
  return {
    stock,
    analysis,
    segments,
    loading,
    error,
    refetch: fetchData,
  };
}
```

```typescript
// hooks/useProfile.ts
import { useEffect } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { dataService } from '../services/dataService';

export function useProfile() {
  const { 
    currentProfile, 
    profiles, 
    setCurrentProfile, 
    setProfiles,
    isLoading,
    setLoading 
  } = useProfileStore();
  
  useEffect(() => {
    async function loadProfiles() {
      setLoading(true);
      try {
        const data = await dataService.getProfiles();
        setProfiles(data);
        if (!currentProfile && data.length > 0) {
          setCurrentProfile(data[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    
    if (profiles.length === 0) {
      loadProfiles();
    }
  }, []);
  
  const switchProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };
  
  return {
    currentProfile,
    profiles,
    switchProfile,
    isLoading,
  };
}
```

---

## 6. Frontend Architecture

### 6.1 Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── SearchBar
│   │   ├── ProfileSwitcher
│   │   └── NotificationBell
│   ├── Sidebar (Desktop)
│   │   ├── Navigation
│   │   └── PortfolioSnapshot (Mini)
│   └── MainContent
│       └── [Page Components]
│
├── Pages
│   ├── Dashboard
│   │   ├── WatchlistCards
│   │   ├── AlertSummary
│   │   ├── PortfolioSnapshot
│   │   └── QuickActions
│   │
│   ├── StockAnalysis
│   │   ├── StockHeader
│   │   ├── AnalysisModeToggle (Quick/Full)
│   │   ├── QuickAnalysis
│   │   │   ├── VerdictBanner
│   │   │   ├── TopSignalsList
│   │   │   ├── RedFlagsList
│   │   │   ├── PeerRankBadge
│   │   │   └── PortfolioFitIndicator
│   │   │
│   │   └── FullAnalysis
│   │       ├── VerdictBanner (Expanded)
│   │       ├── PositionGuidance
│   │       ├── PeerRankingTable
│   │       ├── SegmentAccordion
│   │       │   └── SegmentCard (×11)
│   │       │       ├── SegmentHeader
│   │       │       ├── MetricsList
│   │       │       │   └── MetricRow
│   │       │       │       └── CitationDrilldown
│   │       │       └── HistoricalTrend
│   │       └── ActionBar
│   │
│   ├── SegmentDetail
│   │   ├── SegmentHeader
│   │   ├── AllMetricsTable
│   │   ├── TrendCharts
│   │   └── CitationPanel
│   │
│   ├── Journal
│   │   ├── JournalFilters
│   │   ├── JournalEntryList
│   │   │   └── JournalEntryCard
│   │   ├── BlindSpotAnalysis
│   │   └── PatternRecognition
│   │
│   ├── AlertCenter
│   │   ├── AlertFilters
│   │   ├── AlertList
│   │   │   └── AlertCard (by type)
│   │   └── AlertSettings
│   │
│   ├── Portfolio
│   │   ├── HoldingsList
│   │   ├── AllocationChart
│   │   ├── ConcentrationWarnings
│   │   └── DiversificationSuggestions
│   │
│   ├── Comparison
│   │   ├── StockSelector (×2)
│   │   └── ComparisonTable
│   │
│   ├── Discovery
│   │   ├── DiscoveryTabs
│   │   ├── TrendingStocks
│   │   ├── TopRatedStocks
│   │   └── ForYouRecommendations
│   │
│   └── Validation (Entry Points)
│       ├── BacktestSection
│       ├── SimulatorSection
│       └── AdvisorMarketplace
│
└── Modals
    ├── HighlightToNoteModal
    ├── AddToWatchlistModal
    ├── AlertSettingsModal
    └── ProfileDetailModal
```

### 6.2 Layout Component

```typescript
// components/layout/Layout.tsx
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../stores/uiStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen, isMobile } = useUIStore();
  
  return (
    <div className="min-h-screen bg-surface-dark text-white">
      <Header />
      
      <div className="flex pt-16">
        {/* Sidebar - Hidden on mobile unless open */}
        <Sidebar 
          isOpen={sidebarOpen || !isMobile}
          className={`
            fixed lg:sticky top-16 h-[calc(100vh-4rem)]
            ${isMobile && !sidebarOpen ? 'hidden' : ''}
          `}
        />
        
        {/* Main Content */}
        <main className={`
          flex-1 min-h-[calc(100vh-4rem)]
          ${!isMobile ? 'lg:ml-64' : ''}
          p-4 lg:p-6
        `}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 7. Component Specifications

### 7.1 VerdictBanner Component

```typescript
// components/analysis/VerdictBanner.tsx
import React from 'react';
import { ScoreGauge } from '../charts/ScoreGauge';
import type { StockAnalysis } from '../../types';

interface VerdictBannerProps {
  analysis: StockAnalysis;
  variant: 'compact' | 'expanded';
  onChangeProfile?: () => void;
}

export function VerdictBanner({ 
  analysis, 
  variant,
  onChangeProfile 
}: VerdictBannerProps) {
  const {
    overallScore,
    verdict,
    verdictColor,
    summary,
    positionSizing
  } = analysis;
  
  return (
    <div className={`
      bg-surface-card rounded-xl border border-gray-800
      ${variant === 'expanded' ? 'p-6' : 'p-4'}
    `}>
      <div className="flex items-start gap-6">
        {/* Score Gauge */}
        <div className="flex-shrink-0">
          <ScoreGauge 
            score={overallScore} 
            size={variant === 'expanded' ? 'large' : 'medium'}
          />
        </div>
        
        {/* Verdict Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`
              text-2xl font-bold
              ${verdictColor === 'green' ? 'text-verdict-buy' : ''}
              ${verdictColor === 'yellow' ? 'text-verdict-hold' : ''}
              ${verdictColor === 'red' ? 'text-verdict-avoid' : ''}
            `}>
              {verdict}
            </span>
            
            <span className="text-gray-400 text-sm">
              {overallScore.toFixed(1)}/10
            </span>
          </div>
          
          {/* Summary */}
          <p className="text-gray-300 mb-4">
            {summary}
          </p>
          
          {/* Position Sizing (Expanded only) */}
          {variant === 'expanded' && positionSizing && (
            <div className="bg-surface-elevated rounded-lg p-4 mt-4">
              <h4 className="text-brand-primary font-medium mb-2">
                💰 Position Guidance
              </h4>
              <p className="text-lg font-semibold">
                Suggested Allocation: {positionSizing.recommendedAllocation}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {positionSizing.entryStrategy}
              </p>
              {positionSizing.warning && (
                <p className="text-score-yellow text-sm mt-2">
                  ⚠️ {positionSizing.warning}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Profile Badge */}
        <div className="flex-shrink-0">
          <button
            onClick={onChangeProfile}
            className="
              bg-surface-elevated px-3 py-2 rounded-lg
              text-sm text-gray-300 hover:bg-gray-700
              transition-colors
            "
          >
            For your <span className="text-brand-primary">
              {analysis.profileId.toUpperCase()}
            </span> profile
            <span className="ml-2">⚙️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 7.2 SegmentCard Component

```typescript
// components/analysis/SegmentCard.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Link2 } from 'lucide-react';
import { MetricRow } from './MetricRow';
import { TrendChart } from '../charts/TrendChart';
import type { SegmentAnalysis } from '../../types';

interface SegmentCardProps {
  segment: SegmentAnalysis;
  defaultExpanded?: boolean;
  profileType: string;
}

export function SegmentCard({ 
  segment, 
  defaultExpanded = false,
  profileType 
}: SegmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  
  const { name, score, scoreBand, quickInsight, metrics, summaryByProfile } = segment;
  
  const bandColors = {
    green: 'bg-score-green/20 border-score-green text-score-green',
    yellow: 'bg-score-yellow/20 border-score-yellow text-score-yellow',
    red: 'bg-score-red/20 border-score-red text-score-red',
  };
  
  const toggleMetric = (metricId: string) => {
    setExpandedMetrics(prev => {
      const next = new Set(prev);
      if (next.has(metricId)) {
        next.delete(metricId);
      } else {
        next.add(metricId);
      }
      return next;
    });
  };
  
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {/* Segment Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          w-full px-4 py-3 flex items-center justify-between
          bg-surface-card hover:bg-surface-elevated
          transition-colors
        "
      >
        <div className="flex items-center gap-4">
          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          
          {/* Segment Name */}
          <span className="font-medium text-white">
            {formatSegmentName(name)}
          </span>
          
          {/* Score Badge */}
          <span className={`
            px-2 py-0.5 rounded text-sm font-medium
            border ${bandColors[scoreBand]}
          `}>
            {score.toFixed(1)}/10
          </span>
        </div>
        
        {/* Quick Insight */}
        <span className="text-gray-400 text-sm">
          {quickInsight}
        </span>
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-800 bg-surface-dark">
          {/* Profile Summary */}
          <div className="px-4 py-3 bg-surface-elevated/50 border-b border-gray-800">
            <p className="text-sm text-gray-300">
              <span className="text-brand-primary">For your profile: </span>
              {summaryByProfile[profileType]}
            </p>
          </div>
          
          {/* Metrics List */}
          <div className="divide-y divide-gray-800">
            {metrics.slice(0, expandedMetrics.size > 0 ? undefined : 4).map(metric => (
              <MetricRow
                key={metric.id}
                metric={metric}
                isExpanded={expandedMetrics.has(metric.id)}
                onToggle={() => toggleMetric(metric.id)}
                profileType={profileType}
              />
            ))}
          </div>
          
          {/* Show More */}
          {metrics.length > 4 && expandedMetrics.size === 0 && (
            <button
              onClick={() => setExpandedMetrics(new Set(metrics.map(m => m.id)))}
              className="
                w-full py-3 text-center text-brand-primary text-sm
                hover:bg-surface-elevated transition-colors
              "
            >
              Show {metrics.length - 4} more metrics
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatSegmentName(name: string): string {
  const names: Record<string, string> = {
    profitability: 'Profitability',
    financialRatios: 'Financial Ratios',
    growth: 'Growth',
    valuation: 'Valuation',
    priceVolume: 'Price & Volume',
    technical: 'Technical Indicators',
    brokerRatings: 'Broker Ratings',
    ownership: 'Ownership',
    fno: 'F&O',
    incomeStatement: 'Income Statement',
    balanceSheetCashFlow: 'Balance Sheet & Cash Flow',
  };
  return names[name] || name;
}
```

### 7.3 CitationDrilldown Component

```typescript
// components/analysis/CitationDrilldown.tsx
import React, { useState } from 'react';
import { ExternalLink, Copy, Check, BookOpen, FileText } from 'lucide-react';
import type { Citation, Metric } from '../../types';

interface CitationDrilldownProps {
  metric: Metric;
}

export function CitationDrilldown({ metric }: CitationDrilldownProps) {
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);
  
  const { citation } = metric;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(formatCitation(citation));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="mt-3 bg-surface-elevated rounded-lg overflow-hidden">
      {/* Level Tabs */}
      <div className="flex border-b border-gray-700">
        {[1, 2, 3].map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l as 1 | 2 | 3)}
            className={`
              flex-1 py-2 text-sm font-medium transition-colors
              ${level === l 
                ? 'bg-brand-primary/20 text-brand-primary border-b-2 border-brand-primary' 
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            Level {l}
          </button>
        ))}
      </div>
      
      {/* Content by Level */}
      <div className="p-4">
        {level === 1 && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{citation.source}</span>
            <span>·</span>
            <span>{citation.document}</span>
          </div>
        )}
        
        {level === 2 && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-gray-500 text-sm w-20">Source:</span>
              <span className="text-white">{citation.source}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-500 text-sm w-20">Document:</span>
              <span className="text-white">{citation.document}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-500 text-sm w-20">Filed:</span>
              <span className="text-white">{citation.date}</span>
            </div>
            {citation.page && (
              <div className="flex items-start gap-2">
                <span className="text-gray-500 text-sm w-20">Page:</span>
                <span className="text-white">{citation.page}</span>
              </div>
            )}
            <button
              onClick={() => setLevel(3)}
              className="text-brand-primary text-sm hover:underline mt-2"
            >
              View Level 3 →
            </button>
          </div>
        )}
        
        {level === 3 && (
          <div className="space-y-4">
            {/* Exact Quote */}
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-2">
                Exact Source Quote:
              </h5>
              <blockquote className="
                bg-surface-dark border-l-4 border-brand-primary
                px-4 py-3 text-gray-300 italic rounded-r
              ">
                "{citation.exactQuote}"
              </blockquote>
            </div>
            
            {/* Full Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Document:</span>
                <p className="text-white">{citation.document}</p>
              </div>
              <div>
                <span className="text-gray-500">Page/Section:</span>
                <p className="text-white">
                  {citation.page && `Page ${citation.page}`}
                  {citation.section && `, ${citation.section}`}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Filing Date:</span>
                <p className="text-white">{citation.date}</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-700">
              {citation.documentUrl && (
                <a
                  href={citation.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center gap-2 px-3 py-2
                    bg-brand-primary/20 text-brand-primary
                    rounded-lg hover:bg-brand-primary/30
                    text-sm transition-colors
                  "
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Document
                </a>
              )}
              <button
                onClick={handleCopy}
                className="
                  flex items-center gap-2 px-3 py-2
                  bg-gray-700 text-gray-300
                  rounded-lg hover:bg-gray-600
                  text-sm transition-colors
                "
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-score-green" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Citation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatCitation(citation: Citation): string {
  return `${citation.source}. ${citation.document}. ${citation.date}. ${citation.page ? `Page ${citation.page}.` : ''} "${citation.exactQuote}"`;
}
```

### 7.4 ThesisBreakingAlert Component

```typescript
// components/alerts/ThesisBreakingAlert.tsx
import React from 'react';
import { AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react';
import type { Alert, ThesisBreakingAlertContent } from '../../types';

interface ThesisBreakingAlertProps {
  alert: Alert & { content: ThesisBreakingAlertContent };
  onViewAnalysis: () => void;
  onDismiss: () => void;
  onAdjustThesis: () => void;
}

export function ThesisBreakingAlert({
  alert,
  onViewAnalysis,
  onDismiss,
  onAdjustThesis,
}: ThesisBreakingAlertProps) {
  const { stock, ticker, content } = alert;
  
  return (
    <div className="bg-surface-card border border-score-red/50 rounded-xl overflow-hidden">
      {/* Urgent Header */}
      <div className="bg-score-red/20 px-6 py-4 border-b border-score-red/50">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-score-red" />
          <div>
            <h3 className="text-lg font-bold text-score-red">
              🚨 THESIS-BREAKING ALERT
            </h3>
            <p className="text-gray-300">
              URGENT: {stock} - Review Required
            </p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* User Thesis */}
        <div className="bg-surface-elevated rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">YOUR THESIS:</p>
          <p className="text-white font-medium">{content.userThesis}</p>
        </div>
        
        {/* Thesis at Risk */}
        <div className="border border-score-yellow rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-score-yellow mt-0.5" />
            <div>
              <h4 className="font-medium text-score-yellow mb-2">
                ⚠️ THESIS AT RISK:
              </h4>
              <p className="text-white font-medium mb-3">
                {content.thesisAtRisk.title}
              </p>
              <ul className="space-y-2 text-gray-300">
                {content.thesisAtRisk.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-500">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              {content.thesisAtRisk.managementQuote && (
                <blockquote className="
                  mt-4 pl-4 border-l-2 border-gray-600
                  text-gray-400 italic
                ">
                  Management cited: "{content.thesisAtRisk.managementQuote}"
                </blockquote>
              )}
            </div>
          </div>
        </div>
        
        {/* Analysis */}
        <div className="bg-surface-elevated rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">ANALYSIS:</h4>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm mb-1">What this means:</p>
              <ul className="space-y-1 text-gray-300">
                {content.analysis.whatThisMeans.map((point, i) => (
                  <li key={i}>• {point}</li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-1">For YOUR profile:</p>
              <p className="text-white">{content.analysis.forYourProfile}</p>
            </div>
          </div>
        </div>
        
        {/* Updated Verdict */}
        {content.updatedVerdict && (
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Previous</p>
              <p className="text-2xl font-bold text-score-green">
                {content.updatedVerdict.fromScore}/10
              </p>
              <p className="text-score-green">{content.updatedVerdict.from}</p>
            </div>
            <ArrowRight className="w-8 h-8 text-gray-500" />
            <div className="text-center">
              <p className="text-sm text-gray-400">Updated</p>
              <p className="text-2xl font-bold text-score-yellow">
                {content.updatedVerdict.toScore}/10
              </p>
              <p className="text-score-yellow">{content.updatedVerdict.to}</p>
            </div>
          </div>
        )}
        
        {/* Suggested Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-white">SUGGESTED ACTIONS:</h4>
          <div className="flex flex-wrap gap-3">
            {content.suggestedActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  if (action.action === 'viewAnalysis') onViewAnalysis();
                  if (action.action === 'dismiss') onDismiss();
                  if (action.action === 'adjustThesis') onAdjustThesis();
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${action.primary
                    ? 'bg-brand-primary text-black hover:bg-brand-primary/80'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. State Management

### 8.1 Profile Store

```typescript
// stores/profileStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types';

interface ProfileState {
  currentProfile: UserProfile | null;
  profiles: UserProfile[];
  isLoading: boolean;
  
  // Actions
  setCurrentProfile: (profile: UserProfile) => void;
  setProfiles: (profiles: UserProfile[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      currentProfile: null,
      profiles: [],
      isLoading: false,
      
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      setProfiles: (profiles) => set({ profiles }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'stockfox-profile',
      partialize: (state) => ({ 
        currentProfile: state.currentProfile 
      }),
    }
  )
);
```

### 8.2 Stock Store

```typescript
// stores/stockStore.ts
import { create } from 'zustand';
import type { Stock, StockAnalysis, SegmentAnalysis } from '../types';

interface StockState {
  stocks: Stock[];
  currentStock: Stock | null;
  currentAnalysis: StockAnalysis | null;
  segments: SegmentAnalysis[];
  analysisMode: 'quick' | 'full';
  expandedSegments: Set<string>;
  isLoading: boolean;
  
  // Actions
  setStocks: (stocks: Stock[]) => void;
  setCurrentStock: (stock: Stock | null) => void;
  setCurrentAnalysis: (analysis: StockAnalysis | null) => void;
  setSegments: (segments: SegmentAnalysis[]) => void;
  setAnalysisMode: (mode: 'quick' | 'full') => void;
  toggleSegment: (segmentId: string) => void;
  expandAllSegments: () => void;
  collapseAllSegments: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  currentStock: null,
  currentAnalysis: null,
  segments: [],
  analysisMode: 'quick',
  expandedSegments: new Set(),
  isLoading: false,
  
  setStocks: (stocks) => set({ stocks }),
  setCurrentStock: (stock) => set({ currentStock: stock }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setSegments: (segments) => set({ segments }),
  setAnalysisMode: (mode) => set({ analysisMode: mode }),
  
  toggleSegment: (segmentId) => set((state) => {
    const expanded = new Set(state.expandedSegments);
    if (expanded.has(segmentId)) {
      expanded.delete(segmentId);
    } else {
      expanded.add(segmentId);
    }
    return { expandedSegments: expanded };
  }),
  
  expandAllSegments: () => set((state) => ({
    expandedSegments: new Set(state.segments.map(s => s.id))
  })),
  
  collapseAllSegments: () => set({ expandedSegments: new Set() }),
  
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### 8.3 Journal Store

```typescript
// stores/journalStore.ts
import { create } from 'zustand';
import type { JournalEntry, PatternDetection, BlindSpotAnalysis } from '../types';

interface JournalState {
  entries: JournalEntry[];
  patterns: PatternDetection | null;
  blindSpots: BlindSpotAnalysis | null;
  filter: JournalFilter;
  isLoading: boolean;
  
  // Actions
  setEntries: (entries: JournalEntry[]) => void;
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  setPatterns: (patterns: PatternDetection) => void;
  setBlindSpots: (blindSpots: BlindSpotAnalysis) => void;
  setFilter: (filter: Partial<JournalFilter>) => void;
  setLoading: (loading: boolean) => void;
}

interface JournalFilter {
  type: 'all' | 'decisions' | 'notes' | 'profitable' | 'learning';
  dateRange: { start: Date | null; end: Date | null };
  stock: string | null;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  patterns: null,
  blindSpots: null,
  filter: {
    type: 'all',
    dateRange: { start: null, end: null },
    stock: null,
  },
  isLoading: false,
  
  setEntries: (entries) => set({ entries }),
  
  addEntry: (entry) => set((state) => ({
    entries: [entry, ...state.entries]
  })),
  
  updateEntry: (id, updates) => set((state) => ({
    entries: state.entries.map(e => 
      e.id === id ? { ...e, ...updates } : e
    )
  })),
  
  setPatterns: (patterns) => set({ patterns }),
  setBlindSpots: (blindSpots) => set({ blindSpots }),
  
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter }
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### 8.4 Alert Store

```typescript
// stores/alertStore.ts
import { create } from 'zustand';
import type { Alert, AlertType } from '../types';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  filter: AlertFilter;
  isLoading: boolean;
  
  // Actions
  setAlerts: (alerts: Alert[]) => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  dismissAlert: (alertId: string) => void;
  setFilter: (filter: Partial<AlertFilter>) => void;
  setLoading: (loading: boolean) => void;
}

interface AlertFilter {
  type: AlertType | 'all';
  priority: 'all' | 'urgent' | 'high' | 'medium' | 'low';
  read: 'all' | 'unread' | 'read';
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  filter: {
    type: 'all',
    priority: 'all',
    read: 'all',
  },
  isLoading: false,
  
  setAlerts: (alerts) => set({ 
    alerts,
    unreadCount: alerts.filter(a => !a.read).length
  }),
  
  markAsRead: (alertId) => set((state) => ({
    alerts: state.alerts.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    ),
    unreadCount: state.unreadCount - 1
  })),
  
  markAllAsRead: () => set((state) => ({
    alerts: state.alerts.map(a => ({ ...a, read: true })),
    unreadCount: 0
  })),
  
  dismissAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== alertId)
  })),
  
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter }
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}));
```

---

## 9. Routing & Navigation

### 9.1 Route Configuration

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import StockAnalysis from './pages/StockAnalysis';
import SegmentDetail from './pages/SegmentDetail';
import Journal from './pages/Journal';
import AlertCenter from './pages/AlertCenter';
import Portfolio from './pages/Portfolio';
import Comparison from './pages/Comparison';
import Discovery from './pages/Discovery';
import Validation from './pages/Validation';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Stock Analysis */}
          <Route path="/stock/:stockId" element={<StockAnalysis />} />
          <Route path="/stock/:stockId/segment/:segmentId" element={<SegmentDetail />} />
          
          {/* Journal */}
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:entryId" element={<Journal />} />
          
          {/* Alerts */}
          <Route path="/alerts" element={<AlertCenter />} />
          <Route path="/alerts/:alertId" element={<AlertCenter />} />
          
          {/* Portfolio */}
          <Route path="/portfolio" element={<Portfolio />} />
          
          {/* Comparison */}
          <Route path="/compare" element={<Comparison />} />
          <Route path="/compare/:stock1/:stock2" element={<Comparison />} />
          
          {/* Discovery */}
          <Route path="/discover" element={<Discovery />} />
          
          {/* Validation (Entry Points) */}
          <Route path="/validate" element={<Validation />} />
          <Route path="/validate/backtest" element={<Validation />} />
          <Route path="/validate/simulator" element={<Validation />} />
          <Route path="/validate/advisors" element={<Validation />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
```

### 9.2 Navigation Configuration

```typescript
// utils/navigation.ts
import { 
  Home, 
  Search, 
  BookOpen, 
  Bell, 
  PieChart, 
  GitCompare, 
  Compass,
  CheckCircle,
  Settings
} from 'lucide-react';

export const navigationItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: Home,
    group: 'main',
  },
  {
    label: 'Discover',
    path: '/discover',
    icon: Compass,
    group: 'main',
  },
  {
    label: 'Compare',
    path: '/compare',
    icon: GitCompare,
    group: 'analysis',
  },
  {
    label: 'Journal',
    path: '/journal',
    icon: BookOpen,
    group: 'tracking',
    badge: 'patterns',
  },
  {
    label: 'Alerts',
    path: '/alerts',
    icon: Bell,
    group: 'tracking',
    badge: 'unread',
  },
  {
    label: 'Portfolio',
    path: '/portfolio',
    icon: PieChart,
    group: 'tracking',
  },
  {
    label: 'Validate',
    path: '/validate',
    icon: CheckCircle,
    group: 'validation',
  },
];

export const navigationGroups = {
  main: 'Main',
  analysis: 'Analysis',
  tracking: 'Tracking',
  validation: 'Validation',
};
```

---

## 10. Mock Data Implementation

### 10.1 Data File Structure

```json
// data/stocks.json
{
  "stocks": [
    {
      "id": "zomato",
      "name": "Eternal (Zomato)",
      "ticker": "ZOMATO",
      "sector": "Food Tech",
      "currentPrice": 265,
      "priceChange": 3.50,
      "priceChangePercent": 1.34,
      "marketCap": "₹2.3L Cr",
      "lastUpdated": "2025-01-15T15:30:00+05:30"
    },
    {
      "id": "axisbank",
      "name": "Axis Bank",
      "ticker": "AXISBANK",
      "sector": "Banking",
      "currentPrice": 1145.50,
      "priceChange": 12.30,
      "priceChangePercent": 1.09,
      "marketCap": "₹3.5L Cr",
      "lastUpdated": "2025-01-15T15:30:00+05:30"
    },
    {
      "id": "tcs",
      "name": "TCS",
      "ticker": "TCS",
      "sector": "IT Services",
      "currentPrice": 3890,
      "priceChange": -25.00,
      "priceChangePercent": -0.64,
      "marketCap": "₹14.2L Cr",
      "lastUpdated": "2025-01-15T15:30:00+05:30"
    }
  ],
  "analyses": [
    {
      "stockId": "zomato",
      "profileId": "ankit",
      "overallScore": 7.2,
      "verdict": "BUY",
      "verdictColor": "green",
      "summary": "Strong growth justifies premium for your 3-5yr horizon. Monitor profitability trajectory.",
      "positionSizing": {
        "recommendedAllocation": "8-10%",
        "reasoning": "Your moderate risk tolerance accepts this volatility (35% historical). Current portfolio: 0% in Food Tech - good diversification add.",
        "maxAllocation": "12%",
        "warning": "Do not exceed 15% given loss-making status",
        "entryStrategy": "Start with 5%, add remaining on 10%+ dips"
      },
      "entryTiming": {
        "currentPrice": "₹265",
        "fairValueRange": "₹240 - ₹300",
        "suggestion": "Current price is in fair value zone. Moderate entry appropriate.",
        "positionInRange": "55th percentile",
        "assessment": "MODERATE ENTRY"
      },
      "topSignals": [
        {
          "signal": "Exceptional Revenue Growth",
          "detail": "65% CAGR vs sector 25%",
          "whyMatters": "Key for growth investors - market expansion intact",
          "scoreContribution": "+1.8"
        },
        {
          "signal": "Zero Debt, Strong Cash",
          "detail": "₹12,000 Cr cash runway",
          "whyMatters": "Can sustain losses while scaling",
          "scoreContribution": "+0.8"
        },
        {
          "signal": "Improving Unit Economics",
          "detail": "Contribution margin turned positive",
          "whyMatters": "Path to profitability visible",
          "scoreContribution": "+0.5"
        }
      ],
      "redFlags": [
        {
          "flag": "Still Loss-Making",
          "severity": "Medium",
          "detail": "Net margin -8.2%, though improving",
          "context": "Growth thesis prioritizes market capture over current profits"
        },
        {
          "flag": "Premium Valuation",
          "severity": "Low",
          "detail": "P/S 8.2x vs sector 3.5x",
          "context": "Growth rate 2x+ higher justifies premium for your horizon"
        }
      ],
      "peerRanking": {
        "rank": 3,
        "category": "Food Tech & Delivery",
        "total": 8,
        "above": ["Swiggy (if listed)", "Quick Commerce pure-plays"],
        "below": ["Jubilant FoodWorks (profitable)", "Devyani International"]
      },
      "portfolioFit": {
        "thesisFit": true,
        "riskFit": true,
        "diversificationFit": true,
        "suggestionText": "Good fit for your Growth profile with moderate risk tolerance"
      }
    }
  ]
}
```

### 10.2 Profile Data

```json
// data/profiles.json
{
  "profiles": [
    {
      "id": "ankit",
      "name": "Analytical Ankit",
      "tagline": "I want to make smart decisions fast.",
      "investmentThesis": "growth",
      "riskTolerance": "moderate",
      "timeHorizon": "medium",
      "experienceLevel": "intermediate",
      "sectorPreferences": {
        "excludes": [],
        "preferences": []
      },
      "portfolio": {
        "holdings": [
          {
            "stock": "TCS",
            "ticker": "TCS",
            "allocation": 20,
            "purchased": "4 months ago",
            "entryPrice": 3650,
            "currentReturn": 6.58
          },
          {
            "stock": "Axis Bank",
            "ticker": "AXISBANK",
            "allocation": 25,
            "purchased": "2 months ago",
            "entryPrice": 1020,
            "currentReturn": 12.30
          },
          {
            "stock": "Infosys",
            "ticker": "INFY",
            "allocation": 15,
            "purchased": "5 months ago",
            "entryPrice": 1480,
            "currentReturn": -2.10
          },
          {
            "stock": "HDFC Bank",
            "ticker": "HDFCBANK",
            "allocation": 20,
            "purchased": "3 months ago",
            "entryPrice": 1620,
            "currentReturn": 8.50
          }
        ],
        "cash": 20,
        "concentrationWarning": "45% in Banking sector"
      },
      "patterns": {
        "primary": "You favor profitable growers with ROE >15%",
        "secondary": "Prefer large-cap stability"
      },
      "blindSpots": {
        "missed": "Debt analysis (checked 2/5 analyses)",
        "strong": "Profitability (5/5), Growth (5/5)"
      },
      "skillLevel": {
        "level": 4,
        "title": "Confident Analyst",
        "progressToNext": 65
      }
    }
  ]
}
```

---

## 11. UI/UX Specifications

### 11.1 Design Tokens

```typescript
// utils/designTokens.ts
export const colors = {
  // Brand
  brand: {
    primary: '#2DD4BF',
    secondary: '#8B5CF6',
  },
  
  // Scores
  score: {
    green: '#22C55E',
    yellow: '#EAB308',
    red: '#EF4444',
  },
  
  // Surfaces
  surface: {
    dark: '#0F0A1A',
    card: '#1A1333',
    elevated: '#251D3D',
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    muted: '#6B7280',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const typography = {
  h1: { size: '32px', weight: 700, lineHeight: 1.2 },
  h2: { size: '24px', weight: 700, lineHeight: 1.3 },
  h3: { size: '20px', weight: 600, lineHeight: 1.4 },
  h4: { size: '18px', weight: 600, lineHeight: 1.4 },
  body: { size: '16px', weight: 400, lineHeight: 1.5 },
  small: { size: '14px', weight: 400, lineHeight: 1.5 },
  caption: { size: '12px', weight: 400, lineHeight: 1.4 },
};
```

### 11.2 Responsive Breakpoints

```typescript
// utils/breakpoints.ts
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const useBreakpoint = () => {
  // Returns current breakpoint based on window width
};
```

### 11.3 Animation Specifications

```typescript
// utils/animations.ts
export const animations = {
  // Page transitions
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  // Score fill animation
  scoreFill: {
    initial: { width: '0%' },
    animate: { width: 'var(--score-width)' },
    transition: { duration: 1, ease: 'easeOut' },
  },
  
  // Accordion expand
  accordionExpand: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    transition: { duration: 0.2 },
  },
  
  // Modal
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  },
};
```

---

## 12. Performance Requirements

### 12.1 Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Profile Switch Response | < 100ms | User-perceived |
| Analysis Mode Toggle | < 50ms | User-perceived |
| Segment Expand | < 100ms | Animation complete |
| Search Autocomplete | < 150ms | Results appear |
| Page Navigation | < 200ms | Route change complete |

### 12.2 Optimization Strategies

```typescript
// Lazy loading for routes
const StockAnalysis = lazy(() => import('./pages/StockAnalysis'));
const Journal = lazy(() => import('./pages/Journal'));
const AlertCenter = lazy(() => import('./pages/AlertCenter'));

// Memoization for expensive computations
const MemoizedSegmentCard = memo(SegmentCard, (prev, next) => {
  return prev.segment.id === next.segment.id && 
         prev.profileType === next.profileType;
});

// Virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual';

function JournalList({ entries }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <JournalEntryCard
            key={entries[virtualItem.index].id}
            entry={entries[virtualItem.index]}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 13. Testing Strategy

### 13.1 Test Categories

| Category | Tool | Coverage Target |
|----------|------|-----------------|
| Unit Tests | Vitest | 80% |
| Component Tests | React Testing Library | Key components |
| Integration Tests | Playwright | Critical paths |
| Visual Regression | Chromatic (optional) | UI components |

### 13.2 Critical Test Cases

```typescript
// tests/critical-paths.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical Demo Paths', () => {
  test('Profile switch updates verdict instantly', async ({ page }) => {
    await page.goto('/stock/zomato');
    
    // Initial verdict for Ankit
    await expect(page.locator('[data-testid="verdict"]')).toHaveText('BUY');
    await expect(page.locator('[data-testid="score"]')).toHaveText('7.2');
    
    // Switch to Sneha
    await page.click('[data-testid="profile-switcher"]');
    await page.click('[data-testid="profile-sneha"]');
    
    // Verdict should change without page reload
    await expect(page.locator('[data-testid="verdict"]')).toHaveText('AVOID');
    await expect(page.locator('[data-testid="score"]')).toHaveText('4.1');
  });
  
  test('Quick Analysis to Full Analysis flow', async ({ page }) => {
    await page.goto('/stock/axisbank');
    
    // Should start in Quick Analysis mode
    await expect(page.locator('[data-testid="analysis-mode"]'))
      .toHaveAttribute('data-mode', 'quick');
    
    // Click Deep Dive
    await page.click('[data-testid="deep-dive-button"]');
    
    // Should transition to Full Analysis
    await expect(page.locator('[data-testid="analysis-mode"]'))
      .toHaveAttribute('data-mode', 'full');
    
    // All 11 segments should be visible
    const segments = page.locator('[data-testid="segment-card"]');
    await expect(segments).toHaveCount(11);
  });
  
  test('Citation drill-down 3 levels', async ({ page }) => {
    await page.goto('/stock/axisbank');
    await page.click('[data-testid="deep-dive-button"]');
    
    // Expand Profitability segment
    await page.click('[data-testid="segment-profitability"]');
    
    // Click ROE metric
    await page.click('[data-testid="metric-roe"]');
    
    // Level 1 - basic citation
    await expect(page.locator('[data-testid="citation-level-1"]')).toBeVisible();
    
    // Click to Level 2
    await page.click('[data-testid="citation-level-2-tab"]');
    await expect(page.locator('[data-testid="citation-source"]')).toBeVisible();
    
    // Click to Level 3
    await page.click('[data-testid="citation-level-3-tab"]');
    await expect(page.locator('[data-testid="citation-exact-quote"]')).toBeVisible();
  });
  
  test('Thesis-breaking alert displays correctly', async ({ page }) => {
    await page.goto('/alerts');
    
    // Find thesis-breaking alert
    const thesisAlert = page.locator('[data-testid="alert-thesis-breaking"]').first();
    await expect(thesisAlert).toBeVisible();
    
    // Should show urgent styling
    await expect(thesisAlert).toHaveClass(/border-score-red/);
    
    // Should show user thesis
    await expect(thesisAlert.locator('[data-testid="user-thesis"]')).toBeVisible();
    
    // Should show updated verdict
    await expect(thesisAlert.locator('[data-testid="updated-verdict"]')).toBeVisible();
  });
  
  test('Journal shows 6 months history with patterns', async ({ page }) => {
    await page.goto('/journal');
    
    // Should have entries spanning 6 months
    const entries = page.locator('[data-testid="journal-entry"]');
    await expect(entries).toHaveCount.greaterThan(5);
    
    // Should show pattern recognition
    await expect(page.locator('[data-testid="pattern-recognition"]')).toBeVisible();
    
    // Should show blind spots
    await expect(page.locator('[data-testid="blind-spots"]')).toBeVisible();
  });
});
```

---

## 14. Deployment Configuration

### 14.1 Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-dialog'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### 14.2 Environment Configuration

```bash
# .env.example
VITE_APP_NAME=StockFox
VITE_APP_VERSION=1.0.0
VITE_DEMO_MODE=true
VITE_API_DELAY=100
```

### 14.3 Deployment Checklist

| Step | Action | Verification |
|------|--------|--------------|
| 1 | Run tests | `npm test` passes |
| 2 | Build production | `npm run build` succeeds |
| 3 | Preview build | `npm run preview` - visual check |
| 4 | Deploy to hosting | Vercel/Netlify/etc |
| 5 | Verify critical paths | Manual testing of demo moments |
| 6 | Performance check | Lighthouse score > 90 |

---

## Appendix A: Acceptance Criteria Mapping

| PRD Requirement | Technical Implementation | Test Case |
|-----------------|--------------------------|-----------|
| Profile Switch (instant verdict change) | Zustand store + memoized components | TC-001 |
| Quick → Full Analysis toggle | UI state + CSS transitions | TC-002 |
| Same Stock, Different Verdict | Profile-keyed analysis data | TC-003 |
| Position Sizing in Verdict | VerdictBanner component | TC-004 |
| 3-Level Citation Drill-down | CitationDrilldown component | TC-005 |
| All 11 Segments expandable | SegmentAccordion component | TC-006 |
| Journal 6-month history | Mock data + JournalList | TC-007 |
| Thesis-Breaking Alert | ThesisBreakingAlert component | TC-008 |
| Peer Ranking display | PeerRanking component | TC-009 |
| Blind Spot Detection | BlindSpotAnalysis component | TC-010 |
| Adaptive Explanations | Profile-aware tooltip content | TC-011 |
| Stock Comparison | StockComparison page | TC-012 |
| Backtest Sample Result | BacktestEntry component | TC-013 |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 15, 2025 | Technical Team | Initial technical specification based on PRD v2.0 |

---

*End of Technical Specification Document*
