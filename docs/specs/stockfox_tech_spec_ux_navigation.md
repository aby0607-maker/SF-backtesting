# StockFox Technical Specification: UX & Navigation Cluster

**Version:** 1.0 | **Date:** January 15, 2025 | **Status:** Ready for Development

---

## 1. Architecture Overview

### 1.1 System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                        UX & Navigation Layer                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Routing    │  │  Navigation  │  │   Search     │          │
│  │   (Next.js)  │  │  (Global)    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Onboarding  │  │  Discovery   │  │   Share/     │          │
│  │    Flow      │  │    Hub       │  │   Export     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     Shared State (Zustand)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ProfileStore │  │ UIStore      │  │ SearchStore  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | SSR, routing, layouts |
| State | Zustand + persist | Global state management |
| Styling | Tailwind CSS | Utility-first styling |
| Components | Radix UI primitives | Accessible base components |
| Icons | Lucide React | Consistent iconography |
| Animation | Framer Motion | Transitions, gestures |
| Forms | React Hook Form + Zod | Form handling, validation |
| Storage | localStorage | Persist user preferences |

### 1.3 File Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Profile selection (demo entry)
│   ├── dashboard/
│   │   └── page.tsx               # Home/Dashboard
│   ├── stock/
│   │   └── [ticker]/
│   │       └── page.tsx           # Stock Analysis
│   ├── segment/
│   │   └── [ticker]/
│   │       └── [segment]/
│   │           └── page.tsx       # Segment Deep-dive
│   ├── chat/
│   │   └── page.tsx               # AI Chat
│   ├── compare/
│   │   └── page.tsx               # Stock Comparison
│   ├── journal/
│   │   └── page.tsx               # Analysis Journal
│   ├── portfolio/
│   │   └── page.tsx               # Portfolio View
│   ├── discover/
│   │   └── page.tsx               # Discovery Hub
│   ├── advisors/
│   │   └── page.tsx               # Advisor Marketplace
│   ├── backtest/
│   │   └── page.tsx               # Backtest Home
│   ├── alerts/
│   │   └── page.tsx               # Alerts Center
│   └── profile/
│       └── page.tsx               # Profile/Settings
│
├── components/
│   ├── layout/
│   │   ├── RootLayout.tsx         # Main layout wrapper
│   │   ├── Header.tsx             # Top header with search
│   │   ├── BottomNav.tsx          # Bottom navigation
│   │   ├── ProfileSwitcher.tsx    # Demo profile dropdown
│   │   └── DemoModeBanner.tsx     # Demo indicator
│   │
│   ├── navigation/
│   │   ├── NavItem.tsx            # Navigation item
│   │   ├── SearchModal.tsx        # Global search overlay
│   │   └── Breadcrumbs.tsx        # Breadcrumb navigation
│   │
│   ├── onboarding/
│   │   ├── OnboardingFlow.tsx     # Multi-step container
│   │   ├── WelcomeStep.tsx        # Step 1
│   │   ├── InvestmentStyleStep.tsx # Step 2
│   │   ├── RiskToleranceStep.tsx  # Step 3
│   │   ├── TimeHorizonStep.tsx    # Step 4
│   │   ├── ExperienceStep.tsx     # Step 5
│   │   ├── ReadyStep.tsx          # Step 6
│   │   └── QuickStartPresets.tsx  # Preset options
│   │
│   ├── dashboard/
│   │   ├── DashboardPage.tsx      # Main dashboard
│   │   ├── WatchlistSection.tsx   # Watchlist component
│   │   ├── WatchlistCard.tsx      # Individual stock card
│   │   ├── AlertsPreview.tsx      # Recent alerts
│   │   ├── ProgressSection.tsx    # User progress stats
│   │   └── AddStockModal.tsx      # Add to watchlist
│   │
│   ├── discovery/
│   │   ├── DiscoveryHub.tsx       # Main discovery page
│   │   ├── DiscoveryTabs.tsx      # Tab navigation
│   │   ├── TrendingTab.tsx        # Trending stocks
│   │   ├── TopRatedTab.tsx        # Top rated stocks
│   │   ├── ForYouTab.tsx          # Personalized suggestions
│   │   ├── SectorsTab.tsx         # Sector browse
│   │   └── DiscoveryStockCard.tsx # Stock card for discovery
│   │
│   ├── search/
│   │   ├── GlobalSearch.tsx       # Search trigger
│   │   ├── SearchInput.tsx        # Search input with autocomplete
│   │   ├── SearchResults.tsx      # Results dropdown
│   │   ├── RecentSearches.tsx     # Recent search history
│   │   └── SearchFilters.tsx      # Filter options
│   │
│   ├── sharing/
│   │   ├── ShareModal.tsx         # Share options modal
│   │   ├── SharePreview.tsx       # Preview card
│   │   ├── ExportModal.tsx        # Export options
│   │   └── PDFGenerator.tsx       # PDF generation
│   │
│   ├── pricing/
│   │   ├── FreeTierBadge.tsx      # Free tier indicator
│   │   ├── UpgradeModal.tsx       # Upgrade prompt
│   │   └── PricingDisplay.tsx     # Pricing options
│   │
│   └── common/
│       ├── Toggle.tsx             # DIY/DFY toggle
│       ├── EmptyState.tsx         # Empty state component
│       ├── ErrorState.tsx         # Error state component
│       ├── LoadingSkeleton.tsx    # Skeleton loader
│       ├── Toast.tsx              # Toast notifications
│       └── Tooltip.tsx            # Info tooltips
│
├── stores/
│   ├── profileStore.ts            # User profile state
│   ├── uiStore.ts                 # UI preferences state
│   ├── searchStore.ts             # Search state
│   ├── watchlistStore.ts          # Watchlist state
│   └── onboardingStore.ts         # Onboarding progress
│
├── services/
│   ├── searchService.ts           # Search logic
│   ├── shareService.ts            # Share/export logic
│   ├── discoveryService.ts        # Discovery data
│   └── navigationService.ts       # Navigation helpers
│
├── hooks/
│   ├── useNavigation.ts           # Navigation helpers
│   ├── useSearch.ts               # Search functionality
│   ├── useOnboarding.ts           # Onboarding flow
│   ├── useWatchlist.ts            # Watchlist operations
│   └── useShare.ts                # Share functionality
│
├── types/
│   └── ux.ts                      # UX-related types
│
├── utils/
│   ├── routes.ts                  # Route constants
│   ├── searchUtils.ts             # Search helpers
│   └── shareUtils.ts              # Share helpers
│
└── data/
    ├── mockStocks.ts              # Mock stock data
    ├── mockDiscovery.ts           # Discovery mock data
    └── presetProfiles.ts          # Quick start presets
```

---

## 2. Data Models

### 2.1 Core Types

```typescript
// types/ux.ts

// ============================================
// NAVIGATION TYPES
// ============================================

export type NavItemId = 
  | 'home' 
  | 'discover' 
  | 'portfolio' 
  | 'journal' 
  | 'chat';

export interface NavItem {
  id: NavItemId;
  path: string;
  label: string;
  icon: LucideIcon;
  showBadge?: boolean;
  badgeCount?: number;
}

export interface SecondaryNavItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

// ============================================
// PROFILE TYPES (Demo)
// ============================================

export type DemoProfileId = 'ankit' | 'sneha' | 'kavya';

export interface DemoProfile {
  id: DemoProfileId;
  name: string;
  fullName: string;
  avatar: string;
  investmentStyle: InvestmentStyle;
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
  experienceLevel: ExperienceLevel;
  tagline: string;
  color: string;
}

export type InvestmentStyle = 
  | 'growth' 
  | 'value' 
  | 'dividend' 
  | 'quality' 
  | 'agnostic';

export type RiskTolerance = 
  | 'conservative' 
  | 'moderate' 
  | 'aggressive';

export type TimeHorizon = 
  | 'short' // <1 year
  | 'medium' // 1-3 years
  | 'long' // 3-5 years
  | 'very-long'; // 5+ years

export type ExperienceLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced';

// ============================================
// ONBOARDING TYPES
// ============================================

export type OnboardingStep = 
  | 'welcome'
  | 'investment-style'
  | 'risk-tolerance'
  | 'time-horizon'
  | 'experience'
  | 'ready';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  selections: {
    investmentStyle?: InvestmentStyle;
    riskTolerance?: RiskTolerance;
    timeHorizon?: TimeHorizon;
    experienceLevel?: ExperienceLevel;
  };
  isComplete: boolean;
}

export interface QuickStartPreset {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  profile: Omit<DemoProfile, 'id' | 'name' | 'fullName' | 'avatar'>;
}

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchResult {
  ticker: string;
  companyName: string;
  sector: string;
  marketCap: 'large' | 'mid' | 'small';
  score?: number;
  verdict?: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  recentSearches: string[];
  filters: SearchFilters;
}

export interface SearchFilters {
  sector?: string;
  marketCap?: 'large' | 'mid' | 'small';
  minScore?: number;
}

// ============================================
// WATCHLIST TYPES
// ============================================

export interface WatchlistItem {
  ticker: string;
  companyName: string;
  addedAt: string;
  score: number;
  verdict: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

export interface WatchlistState {
  items: WatchlistItem[];
  maxItems: number;
  isAtLimit: boolean;
}

// ============================================
// DISCOVERY TYPES
// ============================================

export type DiscoveryTab = 
  | 'trending' 
  | 'top-rated' 
  | 'for-you' 
  | 'sectors';

export interface DiscoveryStock {
  ticker: string;
  companyName: string;
  sector: string;
  marketCap: 'large' | 'mid' | 'small';
  score: number;
  verdict: string;
  headline: string;
  analysisCount?: number; // For trending
  matchReason?: string; // For "For You"
}

export interface SectorGroup {
  id: string;
  name: string;
  icon: LucideIcon;
  stockCount: number;
  topStocks: DiscoveryStock[];
  healthScore: number;
}

// ============================================
// SHARE/EXPORT TYPES
// ============================================

export type SharePlatform = 
  | 'copy' 
  | 'whatsapp' 
  | 'twitter' 
  | 'linkedin' 
  | 'email';

export type ExportFormat = 'pdf' | 'excel' | 'copy';

export interface ShareContent {
  ticker: string;
  companyName: string;
  score: number;
  verdict: string;
  highlights: string[];
  url: string;
}

export interface ExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  includeCitations: boolean;
  includeDisclaimer: boolean;
}

// ============================================
// UI STATE TYPES
// ============================================

export type ViewMode = 'dfy' | 'diy';

export interface UIState {
  viewMode: ViewMode;
  sidebarCollapsed: boolean;
  expandedSegments: string[];
  activeDiscoveryTab: DiscoveryTab;
  searchOpen: boolean;
  theme: 'dark' | 'light';
}

// ============================================
// FREE TIER TYPES
// ============================================

export interface FreeTierState {
  analysesUsed: number;
  maxFreeAnalyses: number;
  isAtLimit: boolean;
  analyzedStocks: string[];
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: 'per-stock' | 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}
```

### 2.2 Route Configuration

```typescript
// utils/routes.ts

import { 
  Home, 
  Compass, 
  PieChart, 
  BookOpen, 
  MessageCircle,
  Users,
  FlaskConical,
  Bell,
  User,
  Settings
} from 'lucide-react';
import type { NavItem, SecondaryNavItem } from '@/types/ux';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  STOCK: (ticker: string) => `/stock/${ticker}`,
  SEGMENT: (ticker: string, segment: string) => `/segment/${ticker}/${segment}`,
  CHAT: '/chat',
  COMPARE: '/compare',
  JOURNAL: '/journal',
  PORTFOLIO: '/portfolio',
  DISCOVER: '/discover',
  ADVISORS: '/advisors',
  BACKTEST: '/backtest',
  ALERTS: '/alerts',
  PROFILE: '/profile',
} as const;

export const PRIMARY_NAV: NavItem[] = [
  { 
    id: 'home', 
    path: ROUTES.DASHBOARD, 
    label: 'Home', 
    icon: Home 
  },
  { 
    id: 'discover', 
    path: ROUTES.DISCOVER, 
    label: 'Discover', 
    icon: Compass 
  },
  { 
    id: 'portfolio', 
    path: ROUTES.PORTFOLIO, 
    label: 'Portfolio', 
    icon: PieChart 
  },
  { 
    id: 'journal', 
    path: ROUTES.JOURNAL, 
    label: 'Journal', 
    icon: BookOpen 
  },
  { 
    id: 'chat', 
    path: ROUTES.CHAT, 
    label: 'Chat', 
    icon: MessageCircle 
  },
];

export const SECONDARY_NAV: SecondaryNavItem[] = [
  { id: 'advisors', path: ROUTES.ADVISORS, label: 'Advisors', icon: Users },
  { id: 'backtest', path: ROUTES.BACKTEST, label: 'Simulator', icon: FlaskConical },
  { id: 'alerts', path: ROUTES.ALERTS, label: 'Alerts', icon: Bell },
  { id: 'profile', path: ROUTES.PROFILE, label: 'Profile', icon: User },
];
```

---

## 3. State Management

### 3.1 Profile Store

```typescript
// stores/profileStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DemoProfile, DemoProfileId } from '@/types/ux';

interface ProfileState {
  // Current active profile
  currentProfileId: DemoProfileId;
  currentProfile: DemoProfile;
  
  // All demo profiles
  profiles: Record<DemoProfileId, DemoProfile>;
  
  // Actions
  switchProfile: (profileId: DemoProfileId) => void;
  getCurrentProfile: () => DemoProfile;
}

const DEMO_PROFILES: Record<DemoProfileId, DemoProfile> = {
  ankit: {
    id: 'ankit',
    name: 'Ankit',
    fullName: 'Analytical Ankit',
    avatar: '/avatars/ankit.png',
    investmentStyle: 'growth',
    riskTolerance: 'moderate',
    timeHorizon: 'long',
    experienceLevel: 'intermediate',
    tagline: 'Growth-focused, efficiency seeker',
    color: '#10B981', // Green
  },
  sneha: {
    id: 'sneha',
    name: 'Sneha',
    fullName: 'Skeptical Sneha',
    avatar: '/avatars/sneha.png',
    investmentStyle: 'value',
    riskTolerance: 'conservative',
    timeHorizon: 'very-long',
    experienceLevel: 'advanced',
    tagline: 'Value-focused, evidence seeker',
    color: '#8B5CF6', // Purple
  },
  kavya: {
    id: 'kavya',
    name: 'Kavya',
    fullName: 'Curious Kavya',
    avatar: '/avatars/kavya.png',
    investmentStyle: 'agnostic',
    riskTolerance: 'moderate',
    timeHorizon: 'long',
    experienceLevel: 'beginner',
    tagline: 'Learning-focused, building skills',
    color: '#F59E0B', // Amber
  },
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      currentProfileId: 'ankit',
      currentProfile: DEMO_PROFILES.ankit,
      profiles: DEMO_PROFILES,

      switchProfile: (profileId: DemoProfileId) => {
        const profile = DEMO_PROFILES[profileId];
        set({
          currentProfileId: profileId,
          currentProfile: profile,
        });
      },

      getCurrentProfile: () => get().currentProfile,
    }),
    {
      name: 'stockfox-profile',
      partialize: (state) => ({
        currentProfileId: state.currentProfileId,
      }),
    }
  )
);

// Selectors
export const useCurrentProfile = () => 
  useProfileStore((state) => state.currentProfile);

export const useProfileId = () => 
  useProfileStore((state) => state.currentProfileId);

export const useSwitchProfile = () => 
  useProfileStore((state) => state.switchProfile);
```

### 3.2 UI Store

```typescript
// stores/uiStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewMode, DiscoveryTab, UIState } from '@/types/ux';

interface UIStoreState extends UIState {
  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  toggleSegment: (segmentId: string) => void;
  expandAllSegments: () => void;
  collapseAllSegments: () => void;
  setActiveDiscoveryTab: (tab: DiscoveryTab) => void;
  setSearchOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      viewMode: 'dfy',
      sidebarCollapsed: false,
      expandedSegments: [],
      activeDiscoveryTab: 'trending',
      searchOpen: false,
      theme: 'dark',

      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      
      toggleViewMode: () => 
        set((state) => ({ 
          viewMode: state.viewMode === 'dfy' ? 'diy' : 'dfy' 
        })),

      toggleSegment: (segmentId) =>
        set((state) => ({
          expandedSegments: state.expandedSegments.includes(segmentId)
            ? state.expandedSegments.filter((id) => id !== segmentId)
            : [...state.expandedSegments, segmentId],
        })),

      expandAllSegments: () =>
        set({
          expandedSegments: [
            'profitability',
            'growth',
            'valuation',
            'financial-ratios',
            'price-volume',
            'technical',
            'broker-ratings',
            'ownership',
            'fno',
            'income-statement',
            'balance-sheet',
          ],
        }),

      collapseAllSegments: () => set({ expandedSegments: [] }),

      setActiveDiscoveryTab: (tab) => set({ activeDiscoveryTab: tab }),

      setSearchOpen: (open) => set({ searchOpen: open }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'stockfox-ui',
      partialize: (state) => ({
        viewMode: state.viewMode,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selectors
export const useViewMode = () => useUIStore((state) => state.viewMode);
export const useExpandedSegments = () => useUIStore((state) => state.expandedSegments);
export const useDiscoveryTab = () => useUIStore((state) => state.activeDiscoveryTab);
export const useSearchOpen = () => useUIStore((state) => state.searchOpen);
```

### 3.3 Search Store

```typescript
// stores/searchStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchResult, SearchFilters, SearchState } from '@/types/ux';

interface SearchStoreState extends SearchState {
  // Actions
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setLoading: (loading: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  reset: () => void;
}

const MAX_RECENT_SEARCHES = 5;

export const useSearchStore = create<SearchStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      query: '',
      results: [],
      isLoading: false,
      recentSearches: [],
      filters: {},

      // Actions
      setQuery: (query) => set({ query }),

      setResults: (results) => set({ results, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      addRecentSearch: (query) => {
        if (!query.trim()) return;
        
        set((state) => {
          const filtered = state.recentSearches.filter(
            (s) => s.toLowerCase() !== query.toLowerCase()
          );
          return {
            recentSearches: [query, ...filtered].slice(0, MAX_RECENT_SEARCHES),
          };
        });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      clearFilters: () => set({ filters: {} }),

      reset: () =>
        set({
          query: '',
          results: [],
          isLoading: false,
          filters: {},
        }),
    }),
    {
      name: 'stockfox-search',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);
```

### 3.4 Watchlist Store

```typescript
// stores/watchlistStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WatchlistItem, DemoProfileId } from '@/types/ux';

interface WatchlistStoreState {
  // Watchlist per profile
  watchlists: Record<DemoProfileId, WatchlistItem[]>;
  maxItems: number;
  
  // Actions
  getWatchlist: (profileId: DemoProfileId) => WatchlistItem[];
  addToWatchlist: (profileId: DemoProfileId, item: WatchlistItem) => boolean;
  removeFromWatchlist: (profileId: DemoProfileId, ticker: string) => void;
  isInWatchlist: (profileId: DemoProfileId, ticker: string) => boolean;
  isAtLimit: (profileId: DemoProfileId) => boolean;
  reorderWatchlist: (profileId: DemoProfileId, items: WatchlistItem[]) => void;
}

const FREE_TIER_MAX = 10;

export const useWatchlistStore = create<WatchlistStoreState>()(
  persist(
    (set, get) => ({
      watchlists: {
        ankit: [],
        sneha: [],
        kavya: [],
      },
      maxItems: FREE_TIER_MAX,

      getWatchlist: (profileId) => get().watchlists[profileId] || [],

      addToWatchlist: (profileId, item) => {
        const watchlist = get().watchlists[profileId];
        
        // Check limit
        if (watchlist.length >= get().maxItems) {
          return false;
        }
        
        // Check duplicate
        if (watchlist.some((i) => i.ticker === item.ticker)) {
          return false;
        }

        set((state) => ({
          watchlists: {
            ...state.watchlists,
            [profileId]: [...state.watchlists[profileId], item],
          },
        }));
        
        return true;
      },

      removeFromWatchlist: (profileId, ticker) =>
        set((state) => ({
          watchlists: {
            ...state.watchlists,
            [profileId]: state.watchlists[profileId].filter(
              (i) => i.ticker !== ticker
            ),
          },
        })),

      isInWatchlist: (profileId, ticker) =>
        get().watchlists[profileId]?.some((i) => i.ticker === ticker) ?? false,

      isAtLimit: (profileId) =>
        (get().watchlists[profileId]?.length ?? 0) >= get().maxItems,

      reorderWatchlist: (profileId, items) =>
        set((state) => ({
          watchlists: {
            ...state.watchlists,
            [profileId]: items,
          },
        })),
    }),
    {
      name: 'stockfox-watchlist',
    }
  )
);
```

### 3.5 Onboarding Store

```typescript
// stores/onboardingStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingState, OnboardingStep, InvestmentStyle, RiskTolerance, TimeHorizon, ExperienceLevel } from '@/types/ux';

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'investment-style',
  'risk-tolerance',
  'time-horizon',
  'experience',
  'ready',
];

interface OnboardingStoreState extends OnboardingState {
  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  setInvestmentStyle: (style: InvestmentStyle) => void;
  setRiskTolerance: (tolerance: RiskTolerance) => void;
  setTimeHorizon: (horizon: TimeHorizon) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  skipOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set, get) => ({
      currentStep: 'welcome',
      completedSteps: [],
      selections: {},
      isComplete: false,

      nextStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
          const nextStep = STEP_ORDER[currentIndex + 1];
          set((state) => ({
            currentStep: nextStep,
            completedSteps: [...state.completedSteps, state.currentStep],
          }));
        }
      },

      prevStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEP_ORDER[currentIndex - 1] });
        }
      },

      goToStep: (step) => set({ currentStep: step }),

      setInvestmentStyle: (style) =>
        set((state) => ({
          selections: { ...state.selections, investmentStyle: style },
        })),

      setRiskTolerance: (tolerance) =>
        set((state) => ({
          selections: { ...state.selections, riskTolerance: tolerance },
        })),

      setTimeHorizon: (horizon) =>
        set((state) => ({
          selections: { ...state.selections, timeHorizon: horizon },
        })),

      setExperienceLevel: (level) =>
        set((state) => ({
          selections: { ...state.selections, experienceLevel: level },
        })),

      completeOnboarding: () =>
        set({
          isComplete: true,
          currentStep: 'ready',
          completedSteps: STEP_ORDER,
        }),

      resetOnboarding: () =>
        set({
          currentStep: 'welcome',
          completedSteps: [],
          selections: {},
          isComplete: false,
        }),

      skipOnboarding: () =>
        set({
          isComplete: true,
          currentStep: 'ready',
        }),
    }),
    {
      name: 'stockfox-onboarding',
    }
  )
);
```

### 3.6 Free Tier Store

```typescript
// stores/freeTierStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FreeTierState, DemoProfileId } from '@/types/ux';

interface FreeTierStoreState {
  // Per-profile tracking
  usage: Record<DemoProfileId, FreeTierState>;
  
  // Demo mode flag
  demoMode: boolean;
  
  // Actions
  recordAnalysis: (profileId: DemoProfileId, ticker: string) => boolean;
  getUsage: (profileId: DemoProfileId) => FreeTierState;
  isStockAnalyzed: (profileId: DemoProfileId, ticker: string) => boolean;
  canAnalyze: (profileId: DemoProfileId) => boolean;
  setDemoMode: (enabled: boolean) => void;
  resetUsage: (profileId: DemoProfileId) => void;
}

const MAX_FREE_ANALYSES = 3;

const initialUsage: FreeTierState = {
  analysesUsed: 0,
  maxFreeAnalyses: MAX_FREE_ANALYSES,
  isAtLimit: false,
  analyzedStocks: [],
};

export const useFreeTierStore = create<FreeTierStoreState>()(
  persist(
    (set, get) => ({
      usage: {
        ankit: { ...initialUsage },
        sneha: { ...initialUsage },
        kavya: { ...initialUsage },
      },
      demoMode: true, // Default to demo mode for prototype

      recordAnalysis: (profileId, ticker) => {
        // Demo mode bypasses limits
        if (get().demoMode) return true;

        const currentUsage = get().usage[profileId];
        
        // Already analyzed this stock
        if (currentUsage.analyzedStocks.includes(ticker)) return true;
        
        // At limit
        if (currentUsage.analysesUsed >= MAX_FREE_ANALYSES) return false;

        set((state) => ({
          usage: {
            ...state.usage,
            [profileId]: {
              ...currentUsage,
              analysesUsed: currentUsage.analysesUsed + 1,
              analyzedStocks: [...currentUsage.analyzedStocks, ticker],
              isAtLimit: currentUsage.analysesUsed + 1 >= MAX_FREE_ANALYSES,
            },
          },
        }));

        return true;
      },

      getUsage: (profileId) => get().usage[profileId] || initialUsage,

      isStockAnalyzed: (profileId, ticker) =>
        get().usage[profileId]?.analyzedStocks.includes(ticker) ?? false,

      canAnalyze: (profileId) => {
        if (get().demoMode) return true;
        return get().usage[profileId]?.analysesUsed < MAX_FREE_ANALYSES;
      },

      setDemoMode: (enabled) => set({ demoMode: enabled }),

      resetUsage: (profileId) =>
        set((state) => ({
          usage: {
            ...state.usage,
            [profileId]: { ...initialUsage },
          },
        })),
    }),
    {
      name: 'stockfox-free-tier',
    }
  )
);
```

---

## 4. Component Specifications

### 4.1 Layout Components

#### RootLayout

```typescript
// components/layout/RootLayout.tsx

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-sf-dark text-white">
      <DemoModeBanner />
      <Header />
      <main className="pb-20 pt-16">
        {children}
      </main>
      <BottomNav />
      <SearchModal />
      <Toaster />
    </div>
  );
}
```

#### Header

```
┌─────────────────────────────────────────────────────────────────┐
│ [🦊 Logo]     [🔍 Search...]     [🔔 3]     [👤 Ankit ▼]      │
└─────────────────────────────────────────────────────────────────┘
```

```typescript
// components/layout/Header.tsx

export function Header() {
  const { currentProfile } = useProfileStore();
  const { setSearchOpen } = useUIStore();
  const unreadAlerts = useAlertsStore((s) => s.unreadCount);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-sf-dark-secondary border-b border-sf-border z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <FoxLogo className="h-8 w-8 text-sf-primary" />
          <span className="font-bold text-lg hidden sm:block">StockFox</span>
        </Link>

        {/* Search Trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-md mx-4 px-4 py-2 bg-sf-dark rounded-lg
                     text-sf-muted text-left hover:bg-sf-dark-hover transition"
        >
          <Search className="inline-block w-4 h-4 mr-2" />
          Search stocks...
        </button>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link href="/alerts" className="relative p-2 hover:bg-sf-dark rounded-lg">
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-sf-error 
                              rounded-full text-xs flex items-center justify-center">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
            )}
          </Link>

          {/* Profile Switcher */}
          <ProfileSwitcher />
        </div>
      </div>
    </header>
  );
}
```

#### BottomNav

```typescript
// components/layout/BottomNav.tsx

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sf-dark-secondary 
                    border-t border-sf-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-full">
        {PRIMARY_NAV.map((item) => {
          const isActive = pathname === item.path || 
                          pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full',
                'transition-colors',
                isActive ? 'text-sf-primary' : 'text-sf-muted hover:text-white'
              )}
            >
              <Icon className={cn('w-6 h-6', item.id === 'chat' && 'text-sf-primary')} />
              <span className="text-xs mt-1">{item.label}</span>
              {item.showBadge && item.badgeCount && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-sf-error 
                                rounded-full text-xs flex items-center justify-center">
                  {item.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

#### ProfileSwitcher

```typescript
// components/layout/ProfileSwitcher.tsx

export function ProfileSwitcher() {
  const { currentProfile, profiles, switchProfile } = useProfileStore();
  const [open, setOpen] = useState(false);

  const handleSwitch = (profileId: DemoProfileId) => {
    switchProfile(profileId);
    setOpen(false);
    toast.success(`Switched to ${profiles[profileId].name}'s view`);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg
                          hover:bg-sf-dark transition">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentProfile.avatar} />
            <AvatarFallback style={{ backgroundColor: currentProfile.color }}>
              {currentProfile.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block">{currentProfile.name}</span>
          <ChevronDown className="w-4 h-4 text-sf-muted" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Profile (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.values(profiles).map((profile) => (
          <DropdownMenuItem
            key={profile.id}
            onClick={() => handleSwitch(profile.id)}
            className={cn(
              'flex items-center gap-3 py-3',
              profile.id === currentProfile.id && 'bg-sf-dark'
            )}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback style={{ backgroundColor: profile.color }}>
                {profile.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{profile.fullName}</p>
              <p className="text-xs text-sf-muted">{profile.tagline}</p>
            </div>
            {profile.id === currentProfile.id && (
              <Check className="w-4 h-4 text-sf-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 4.2 Search Components

#### SearchModal

```typescript
// components/search/SearchModal.tsx

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useUIStore();
  const {
    query,
    results,
    isLoading,
    recentSearches,
    setQuery,
    addRecentSearch,
    reset,
  } = useSearchStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  const handleSelect = (ticker: string) => {
    addRecentSearch(ticker);
    reset();
    setSearchOpen(false);
    router.push(`/stock/${ticker}`);
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setSearchOpen(false)}
      />

      {/* Modal */}
      <div className="relative mx-auto mt-20 max-w-2xl px-4">
        <div className="bg-sf-dark-secondary rounded-xl border border-sf-border
                       shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-sf-border">
            <Search className="w-5 h-5 text-sf-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks by name or ticker..."
              className="flex-1 px-4 py-4 bg-transparent outline-none text-lg"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-5 h-5 text-sf-muted hover:text-white" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-sf-primary" />
                <p className="mt-2 text-sf-muted">Searching...</p>
              </div>
            ) : query && results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <SearchResultItem
                    key={result.ticker}
                    result={result}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ) : query && results.length === 0 ? (
              <div className="p-8 text-center text-sf-muted">
                <p>No stocks found for "{query}"</p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="py-2">
                <p className="px-4 py-2 text-xs text-sf-muted uppercase">
                  Recent Searches
                </p>
                {recentSearches.map((recent) => (
                  <button
                    key={recent}
                    onClick={() => setQuery(recent)}
                    className="w-full px-4 py-3 text-left hover:bg-sf-dark
                              flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-sf-muted" />
                    {recent}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sf-muted">
                <p>Start typing to search stocks</p>
                <p className="text-xs mt-2">
                  Try "TCS", "Zomato", or "Banking"
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-sf-border flex items-center
                         justify-between text-xs text-sf-muted">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <span>⌘K to open search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4.3 Onboarding Components

#### OnboardingFlow

```typescript
// components/onboarding/OnboardingFlow.tsx

const STEPS: Record<OnboardingStep, React.ComponentType> = {
  'welcome': WelcomeStep,
  'investment-style': InvestmentStyleStep,
  'risk-tolerance': RiskToleranceStep,
  'time-horizon': TimeHorizonStep,
  'experience': ExperienceStep,
  'ready': ReadyStep,
};

export function OnboardingFlow() {
  const { currentStep, completedSteps } = useOnboardingStore();
  const StepComponent = STEPS[currentStep];

  const progress = (completedSteps.length / (Object.keys(STEPS).length - 1)) * 100;

  return (
    <div className="min-h-screen bg-sf-dark flex flex-col">
      {/* Progress Bar */}
      {currentStep !== 'welcome' && currentStep !== 'ready' && (
        <div className="h-1 bg-sf-dark-secondary">
          <motion.div
            className="h-full bg-sf-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <StepComponent />
        </motion.div>
      </div>
    </div>
  );
}
```

#### InvestmentStyleStep (Example)

```typescript
// components/onboarding/InvestmentStyleStep.tsx

const STYLES: { value: InvestmentStyle; label: string; description: string; icon: LucideIcon }[] = [
  {
    value: 'growth',
    label: 'Growth',
    description: 'I seek high-growth companies with strong momentum',
    icon: TrendingUp,
  },
  {
    value: 'value',
    label: 'Value',
    description: 'I look for undervalued stocks trading below intrinsic worth',
    icon: Target,
  },
  {
    value: 'dividend',
    label: 'Dividend',
    description: 'I prioritize consistent income through dividends',
    icon: Wallet,
  },
  {
    value: 'quality',
    label: 'Quality',
    description: 'I want stable, profitable companies with strong moats',
    icon: Shield,
  },
  {
    value: 'agnostic',
    label: 'Not sure yet',
    description: 'Help me discover my investment style',
    icon: HelpCircle,
  },
];

export function InvestmentStyleStep() {
  const { selections, setInvestmentStyle, nextStep, prevStep } = useOnboardingStore();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">What's your investment approach?</h2>
        <p className="text-sf-muted mt-2">
          This helps us personalize your stock analysis
        </p>
      </div>

      <div className="space-y-3">
        {STYLES.map((style) => {
          const Icon = style.icon;
          const isSelected = selections.investmentStyle === style.value;

          return (
            <button
              key={style.value}
              onClick={() => setInvestmentStyle(style.value)}
              className={cn(
                'w-full p-4 rounded-lg border text-left transition',
                'flex items-start gap-4',
                isSelected
                  ? 'border-sf-primary bg-sf-primary/10'
                  : 'border-sf-border hover:border-sf-primary/50'
              )}
            >
              <div className={cn(
                'p-2 rounded-lg',
                isSelected ? 'bg-sf-primary text-black' : 'bg-sf-dark-secondary'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{style.label}</p>
                <p className="text-sm text-sf-muted">{style.description}</p>
              </div>
              {isSelected && <Check className="w-5 h-5 text-sf-primary mt-1" />}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex-1 py-3 rounded-lg border border-sf-border
                    hover:bg-sf-dark-secondary transition"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!selections.investmentStyle}
          className="flex-1 py-3 rounded-lg bg-sf-primary text-black font-medium
                    hover:bg-sf-primary/90 transition disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

### 4.4 Discovery Components

#### DiscoveryHub

```typescript
// components/discovery/DiscoveryHub.tsx

export function DiscoveryHub() {
  const { activeDiscoveryTab, setActiveDiscoveryTab } = useUIStore();

  const tabs: { id: DiscoveryTab; label: string; icon: LucideIcon }[] = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'top-rated', label: 'Top Rated', icon: Star },
    { id: 'for-you', label: 'For You', icon: Sparkles },
    { id: 'sectors', label: 'Sectors', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold">Discover Stocks</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDiscoveryTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveDiscoveryTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap',
                  'transition-colors',
                  isActive
                    ? 'bg-sf-primary text-black'
                    : 'bg-sf-dark-secondary text-sf-muted hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        {activeDiscoveryTab === 'trending' && <TrendingTab />}
        {activeDiscoveryTab === 'top-rated' && <TopRatedTab />}
        {activeDiscoveryTab === 'for-you' && <ForYouTab />}
        {activeDiscoveryTab === 'sectors' && <SectorsTab />}
      </div>
    </div>
  );
}
```

#### ForYouTab (Personalized)

```typescript
// components/discovery/ForYouTab.tsx

export function ForYouTab() {
  const { currentProfile } = useProfileStore();
  const { data: suggestions, isLoading } = usePersonalizedSuggestions(currentProfile.id);

  if (isLoading) {
    return <DiscoverySkeletons count={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Pattern Insight */}
      <div className="p-4 rounded-lg bg-sf-dark-secondary border border-sf-border">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-sf-primary mt-0.5" />
          <div>
            <p className="font-medium">Based on your patterns</p>
            <p className="text-sm text-sf-muted mt-1">
              You favor profitable growers with strong ROE. Here are stocks 
              that match your style.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        {suggestions?.map((stock) => (
          <DiscoveryStockCard
            key={stock.ticker}
            stock={stock}
            showMatchReason
          />
        ))}
      </div>

      {/* Empty State */}
      {suggestions?.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Not enough data yet"
          description="Analyze a few more stocks and we'll find personalized suggestions for you."
          action={{ label: 'Explore Trending', href: '?tab=trending' }}
        />
      )}
    </div>
  );
}
```

### 4.5 Toggle & Mode Components

#### ViewModeToggle

```typescript
// components/common/ViewModeToggle.tsx

export function ViewModeToggle() {
  const { viewMode, toggleViewMode } = useUIStore();

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        'text-sm transition-colors',
        viewMode === 'dfy' ? 'text-sf-primary' : 'text-sf-muted'
      )}>
        DFY
      </span>
      
      <button
        onClick={toggleViewMode}
        className="relative w-12 h-6 rounded-full bg-sf-dark-secondary
                  border border-sf-border transition-colors"
        aria-label={`Switch to ${viewMode === 'dfy' ? 'DIY' : 'DFY'} mode`}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-sf-primary"
          animate={{ left: viewMode === 'dfy' ? 2 : 22 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>

      <span className={cn(
        'text-sm transition-colors',
        viewMode === 'diy' ? 'text-sf-primary' : 'text-sf-muted'
      )}>
        DIY
      </span>
    </div>
  );
}
```

### 4.6 Share & Export Components

#### ShareModal

```typescript
// components/sharing/ShareModal.tsx

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  content: ShareContent;
}

const PLATFORMS: { id: SharePlatform; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'copy', label: 'Copy Link', icon: Copy, color: 'bg-sf-dark-secondary' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-600' },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-black' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
  { id: 'email', label: 'Email', icon: Mail, color: 'bg-sf-dark-secondary' },
];

export function ShareModal({ open, onClose, content }: ShareModalProps) {
  const handleShare = async (platform: SharePlatform) => {
    const shareText = generateShareText(content);
    
    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=StockFox Analysis: ${content.companyName}&body=${encodeURIComponent(shareText)}`);
        break;
    }
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Analysis</DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <SharePreview content={content} />

        {/* Platform Options */}
        <div className="grid grid-cols-5 gap-2">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => handleShare(platform.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg
                          hover:bg-sf-dark-secondary transition"
              >
                <div className={cn('p-2 rounded-full', platform.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs">{platform.label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateShareText(content: ShareContent): string {
  return `🦊 StockFox Analysis

${content.companyName}: ${content.score}/10 - ${content.verdict}

${content.highlights.map((h) => `✅ ${h}`).join('\n')}

See full analysis: ${content.url}`;
}
```

---

## 5. Services & Business Logic

### 5.1 Search Service

```typescript
// services/searchService.ts

import { mockStocks } from '@/data/mockStocks';
import type { SearchResult, SearchFilters } from '@/types/ux';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export class SearchService {
  private static instance: SearchService;
  private debounceTimer: NodeJS.Timeout | null = null;

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  async search(
    query: string,
    filters: SearchFilters = {}
  ): Promise<SearchResult[]> {
    if (query.length < MIN_QUERY_LENGTH) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();

    let results = mockStocks.filter((stock) => {
      const matchesQuery =
        stock.ticker.toLowerCase().includes(normalizedQuery) ||
        stock.companyName.toLowerCase().includes(normalizedQuery) ||
        stock.sector.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) return false;

      // Apply filters
      if (filters.sector && stock.sector !== filters.sector) return false;
      if (filters.marketCap && stock.marketCap !== filters.marketCap) return false;
      if (filters.minScore && (stock.score ?? 0) < filters.minScore) return false;

      return true;
    });

    // Sort by relevance
    results = results.sort((a, b) => {
      // Exact ticker match first
      if (a.ticker.toLowerCase() === normalizedQuery) return -1;
      if (b.ticker.toLowerCase() === normalizedQuery) return 1;

      // Then by score
      return (b.score ?? 0) - (a.score ?? 0);
    });

    // Limit results
    return results.slice(0, 10);
  }

  debounceSearch(
    query: string,
    filters: SearchFilters,
    callback: (results: SearchResult[]) => void
  ): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      const results = await this.search(query, filters);
      callback(results);
    }, DEBOUNCE_MS);
  }
}
```

### 5.2 Discovery Service

```typescript
// services/discoveryService.ts

import { mockStocks, mockAnalysisCounts } from '@/data/mockDiscovery';
import type { DiscoveryStock, SectorGroup, DemoProfileId } from '@/types/ux';

export class DiscoveryService {
  static getTrending(): DiscoveryStock[] {
    return mockStocks
      .map((stock) => ({
        ...stock,
        analysisCount: mockAnalysisCounts[stock.ticker] ?? 0,
      }))
      .sort((a, b) => (b.analysisCount ?? 0) - (a.analysisCount ?? 0))
      .slice(0, 10);
  }

  static getTopRated(segment?: string): DiscoveryStock[] {
    return mockStocks
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  static getForYou(profileId: DemoProfileId): DiscoveryStock[] {
    // Get profile preferences
    const profilePatterns = {
      ankit: { minROE: 15, minGrowth: 12, preferSectors: ['IT', 'Consumer'] },
      sneha: { maxPE: 20, minDividend: 2, preferSectors: ['Banking', 'FMCG'] },
      kavya: { preferSectors: ['Large Cap', 'Blue Chip'], simpleCompanies: true },
    };

    const pattern = profilePatterns[profileId];

    return mockStocks
      .filter((stock) => {
        // Apply profile-specific filters
        if (pattern.preferSectors?.length) {
          if (!pattern.preferSectors.includes(stock.sector)) {
            return Math.random() > 0.7; // Allow some diversity
          }
        }
        return true;
      })
      .map((stock) => ({
        ...stock,
        matchReason: generateMatchReason(stock, profileId),
      }))
      .slice(0, 8);
  }

  static getSectors(): SectorGroup[] {
    const sectorStocks = groupBy(mockStocks, 'sector');

    return Object.entries(sectorStocks).map(([sector, stocks]) => ({
      id: sector.toLowerCase().replace(/\s/g, '-'),
      name: sector,
      icon: getSectorIcon(sector),
      stockCount: stocks.length,
      topStocks: stocks.sort((a, b) => b.score - a.score).slice(0, 3),
      healthScore: calculateSectorHealth(stocks),
    }));
  }
}

function generateMatchReason(stock: DiscoveryStock, profileId: DemoProfileId): string {
  const reasons = {
    ankit: [
      `High ROE matches your preference`,
      `Strong growth trajectory`,
      `Fits your growth investing style`,
    ],
    sneha: [
      `Trading below intrinsic value`,
      `Strong dividend history`,
      `Conservative risk profile`,
    ],
    kavya: [
      `Well-known company, good for learning`,
      `Clear business model`,
      `Stable and predictable`,
    ],
  };

  return reasons[profileId][Math.floor(Math.random() * reasons[profileId].length)];
}
```

### 5.3 Share Service

```typescript
// services/shareService.ts

import { jsPDF } from 'jspdf';
import type { ShareContent, ExportOptions } from '@/types/ux';

export class ShareService {
  static generateShareUrl(ticker: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/stock/${ticker}`;
  }

  static async generatePDF(
    ticker: string,
    options: ExportOptions
  ): Promise<Blob> {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(24);
    doc.text('StockFox Analysis Report', 20, 20);
    
    doc.setFontSize(16);
    doc.text(`Stock: ${ticker}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

    // Add content sections
    // ... (detailed PDF generation logic)

    if (options.includeDisclaimer) {
      doc.setFontSize(8);
      doc.text(
        'Disclaimer: This is for informational purposes only. Not investment advice.',
        20,
        280
      );
    }

    return doc.output('blob');
  }

  static async copyToClipboard(content: ShareContent): Promise<void> {
    const text = `🦊 StockFox Analysis

${content.companyName}: ${content.score}/10 - ${content.verdict}

${content.highlights.map((h) => `✅ ${h}`).join('\n')}

${content.url}`;

    await navigator.clipboard.writeText(text);
  }
}
```

---

## 6. Hooks

### 6.1 useNavigation

```typescript
// hooks/useNavigation.ts

export function useNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = useCallback(
    (path: string) => pathname === path || pathname.startsWith(path + '/'),
    [pathname]
  );

  const navigateToStock = useCallback(
    (ticker: string) => router.push(`/stock/${ticker}`),
    [router]
  );

  const navigateToSegment = useCallback(
    (ticker: string, segment: string) =>
      router.push(`/segment/${ticker}/${segment}`),
    [router]
  );

  const goBack = useCallback(() => router.back(), [router]);

  return {
    pathname,
    isActive,
    navigateToStock,
    navigateToSegment,
    goBack,
  };
}
```

### 6.2 useSearch

```typescript
// hooks/useSearch.ts

export function useSearch() {
  const {
    query,
    results,
    isLoading,
    recentSearches,
    filters,
    setQuery,
    setResults,
    setLoading,
    addRecentSearch,
    setFilters,
    reset,
  } = useSearchStore();

  const searchService = SearchService.getInstance();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    searchService.debounceSearch(query, filters, (results) => {
      setResults(results);
    });
  }, [query, filters]);

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
    },
    [setQuery]
  );

  const handleSelect = useCallback(
    (ticker: string) => {
      addRecentSearch(ticker);
      reset();
    },
    [addRecentSearch, reset]
  );

  return {
    query,
    results,
    isLoading,
    recentSearches,
    filters,
    handleSearch,
    handleSelect,
    setFilters,
    reset,
  };
}
```

### 6.3 useWatchlist

```typescript
// hooks/useWatchlist.ts

export function useWatchlist() {
  const profileId = useProfileId();
  const {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isAtLimit,
    reorderWatchlist,
  } = useWatchlistStore();

  const watchlist = useMemo(
    () => getWatchlist(profileId),
    [getWatchlist, profileId]
  );

  const add = useCallback(
    (item: WatchlistItem) => {
      const success = addToWatchlist(profileId, item);
      if (!success) {
        toast.error('Watchlist limit reached. Upgrade to add more stocks.');
      }
      return success;
    },
    [addToWatchlist, profileId]
  );

  const remove = useCallback(
    (ticker: string) => {
      removeFromWatchlist(profileId, ticker);
      toast.success('Removed from watchlist');
    },
    [removeFromWatchlist, profileId]
  );

  const isWatched = useCallback(
    (ticker: string) => isInWatchlist(profileId, ticker),
    [isInWatchlist, profileId]
  );

  const atLimit = useMemo(
    () => isAtLimit(profileId),
    [isAtLimit, profileId]
  );

  return {
    watchlist,
    add,
    remove,
    isWatched,
    atLimit,
    reorder: (items: WatchlistItem[]) => reorderWatchlist(profileId, items),
  };
}
```

---

## 7. Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial page load | < 2s | Lighthouse |
| Route navigation | < 300ms | Performance API |
| Search response | < 200ms after debounce | Custom timing |
| Profile switch | < 100ms | Custom timing |
| Modal open | < 50ms | Frame timing |
| Scroll performance | 60fps | Chrome DevTools |
| Memory usage | < 100MB | Chrome DevTools |

### Code Splitting Strategy

```typescript
// app/layout.tsx

// Lazy load non-critical components
const SearchModal = dynamic(() => import('@/components/search/SearchModal'), {
  ssr: false,
});

const ShareModal = dynamic(() => import('@/components/sharing/ShareModal'), {
  ssr: false,
});

const OnboardingFlow = dynamic(() => import('@/components/onboarding/OnboardingFlow'), {
  ssr: false,
});
```

---

## 8. Error Handling

### Error Types

```typescript
// types/errors.ts

export enum UXErrorCode {
  SEARCH_FAILED = 'UX_SEARCH_001',
  NAVIGATION_FAILED = 'UX_NAV_001',
  SHARE_FAILED = 'UX_SHARE_001',
  EXPORT_FAILED = 'UX_EXPORT_001',
  WATCHLIST_FULL = 'UX_WATCH_001',
  PROFILE_SWITCH_FAILED = 'UX_PROFILE_001',
}

export interface UXError {
  code: UXErrorCode;
  message: string;
  recoverable: boolean;
  action?: () => void;
}

export const UX_ERROR_MESSAGES: Record<UXErrorCode, UXError> = {
  [UXErrorCode.SEARCH_FAILED]: {
    code: UXErrorCode.SEARCH_FAILED,
    message: 'Search is temporarily unavailable. Please try again.',
    recoverable: true,
  },
  [UXErrorCode.WATCHLIST_FULL]: {
    code: UXErrorCode.WATCHLIST_FULL,
    message: 'Watchlist is full. Remove a stock or upgrade to add more.',
    recoverable: true,
  },
  // ... etc
};
```

### Error Boundary

```typescript
// components/common/ErrorBoundary.tsx

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UX Error:', error, errorInfo);
    // Log to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-sf-error mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p className="text-sf-muted mb-4">
                We're sorry, but something unexpected happened.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-sf-primary text-black rounded-lg"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## 9. Testing Specifications

### Unit Tests

```typescript
// __tests__/stores/profileStore.test.ts

describe('ProfileStore', () => {
  beforeEach(() => {
    useProfileStore.setState({
      currentProfileId: 'ankit',
      currentProfile: DEMO_PROFILES.ankit,
    });
  });

  it('should switch profile correctly', () => {
    const { switchProfile, currentProfileId } = useProfileStore.getState();
    
    switchProfile('sneha');
    
    expect(useProfileStore.getState().currentProfileId).toBe('sneha');
    expect(useProfileStore.getState().currentProfile.investmentStyle).toBe('value');
  });

  it('should persist profile selection', () => {
    const { switchProfile } = useProfileStore.getState();
    
    switchProfile('kavya');
    
    // Simulate page reload
    const persisted = JSON.parse(localStorage.getItem('stockfox-profile') || '{}');
    expect(persisted.state.currentProfileId).toBe('kavya');
  });
});
```

```typescript
// __tests__/services/searchService.test.ts

describe('SearchService', () => {
  const service = SearchService.getInstance();

  it('should return empty for short queries', async () => {
    const results = await service.search('T');
    expect(results).toHaveLength(0);
  });

  it('should find stocks by ticker', async () => {
    const results = await service.search('TCS');
    expect(results.some((r) => r.ticker === 'TCS')).toBe(true);
  });

  it('should find stocks by company name', async () => {
    const results = await service.search('Zomato');
    expect(results.some((r) => r.companyName.includes('Zomato'))).toBe(true);
  });

  it('should apply sector filter', async () => {
    const results = await service.search('Bank', { sector: 'Banking' });
    expect(results.every((r) => r.sector === 'Banking')).toBe(true);
  });

  it('should sort by relevance', async () => {
    const results = await service.search('TCS');
    expect(results[0].ticker).toBe('TCS'); // Exact match first
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/navigation.test.tsx

describe('Navigation Integration', () => {
  it('should navigate between main screens', async () => {
    render(<App />);

    // Click Discover
    fireEvent.click(screen.getByText('Discover'));
    await waitFor(() => {
      expect(screen.getByText('Discover Stocks')).toBeInTheDocument();
    });

    // Click Journal
    fireEvent.click(screen.getByText('Journal'));
    await waitFor(() => {
      expect(screen.getByText('Analysis Journal')).toBeInTheDocument();
    });
  });

  it('should update content on profile switch', async () => {
    render(<App />);
    
    // Navigate to dashboard
    fireEvent.click(screen.getByText('Home'));
    
    // Should show Ankit's watchlist
    expect(screen.getByText('Ankit')).toBeInTheDocument();
    
    // Switch profile
    fireEvent.click(screen.getByRole('button', { name: /ankit/i }));
    fireEvent.click(screen.getByText('Skeptical Sneha'));
    
    // Should update
    await waitFor(() => {
      expect(screen.getByText('Sneha')).toBeInTheDocument();
    });
  });
});
```

### Component Tests

```typescript
// __tests__/components/ProfileSwitcher.test.tsx

describe('ProfileSwitcher', () => {
  it('should display current profile', () => {
    render(<ProfileSwitcher />);
    expect(screen.getByText('Ankit')).toBeInTheDocument();
  });

  it('should show dropdown on click', () => {
    render(<ProfileSwitcher />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Analytical Ankit')).toBeInTheDocument();
    expect(screen.getByText('Skeptical Sneha')).toBeInTheDocument();
    expect(screen.getByText('Curious Kavya')).toBeInTheDocument();
  });

  it('should switch profile and show toast', async () => {
    render(<ProfileSwitcher />);
    
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Skeptical Sneha'));
    
    await waitFor(() => {
      expect(screen.getByText("Switched to Sneha's view")).toBeInTheDocument();
    });
  });
});
```

---

## 10. Mock Data Requirements

### 10.1 Mock Stocks

```typescript
// data/mockStocks.ts

export const mockStocks: SearchResult[] = [
  {
    ticker: 'ETERNAL',
    companyName: 'Eternal (Zomato)',
    sector: 'Food Tech',
    marketCap: 'large',
    score: 7.2,
    verdict: 'BUY',
  },
  {
    ticker: 'AXISBANK',
    companyName: 'Axis Bank',
    sector: 'Banking',
    marketCap: 'large',
    score: 8.2,
    verdict: 'BUY',
  },
  {
    ticker: 'TCS',
    companyName: 'Tata Consultancy Services',
    sector: 'IT',
    marketCap: 'large',
    score: 8.5,
    verdict: 'HOLD',
  },
  // ... additional stocks for search/discovery
];
```

### 10.2 Mock Discovery Data

```typescript
// data/mockDiscovery.ts

export const mockAnalysisCounts: Record<string, number> = {
  'ETERNAL': 1247,
  'AXISBANK': 892,
  'TCS': 756,
  'RELIANCE': 621,
  'INFY': 589,
};

export const mockSectorHealth: Record<string, number> = {
  'Banking': 7.8,
  'IT': 8.1,
  'Food Tech': 6.9,
  'FMCG': 7.5,
  'Pharma': 7.2,
};
```

---

## 11. Acceptance Criteria Checklist

### Navigation
- [ ] All 5 bottom nav items render and navigate correctly
- [ ] Active state highlights current route
- [ ] Header renders with logo, search, notifications, profile
- [ ] Profile switcher dropdown works on all screen sizes
- [ ] Back navigation works from all nested routes
- [ ] Keyboard navigation (Tab, Enter) works throughout

### Profile Switcher
- [ ] Shows current profile avatar and name
- [ ] Dropdown shows all 3 demo profiles
- [ ] Switching updates global state immediately
- [ ] Toast confirms switch
- [ ] Content updates across all screens

### Search
- [ ] Cmd/Ctrl+K opens search modal
- [ ] Esc closes modal
- [ ] Results appear after 2+ characters
- [ ] Debounce prevents excessive searches
- [ ] Recent searches persist across sessions
- [ ] Clicking result navigates to stock

### Onboarding
- [ ] Flow completes all 6 steps
- [ ] Progress bar updates correctly
- [ ] Quick Start presets skip to dashboard
- [ ] Selections persist in store
- [ ] Can go back and change selections

### Discovery
- [ ] All 4 tabs render correct content
- [ ] "For You" shows personalized content
- [ ] Stock cards navigate to analysis
- [ ] Tabs switch without page reload

### DIY/DFY Toggle
- [ ] Toggle switches mode instantly
- [ ] Mode persists across sessions
- [ ] Stock Analysis reflects current mode
- [ ] Toast confirms mode change

### Share/Export
- [ ] Share modal opens with correct content
- [ ] All 5 share platforms work
- [ ] Copy to clipboard works
- [ ] PDF generates and downloads
- [ ] Share preview renders correctly

### Free Tier
- [ ] Counter shows correct usage
- [ ] Upgrade modal appears at limit
- [ ] Demo mode bypasses limits
- [ ] Analyzed stocks tracked correctly

---

## Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| CVP + PERS Tech Spec | Stock Analysis content | ✅ Complete |
| LEARN Tech Spec | Journal screen content | ✅ Complete |
| Mock Data File | All screens | ✅ Complete |
| Design System | Colors, typography | Pending |

---

## Next Tech Spec: Engagement (ENG) Cluster
Covers: Alert System, Score Drop Alerts, Thesis-Breaking Events, Notification Center, Alert Settings

---

*Technical Specification v1.0 - Ready for implementation*
