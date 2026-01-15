# 🦊 StockFox Demo

AI-powered stock research platform - Investor Demo Prototype

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- **Framework:** Vite + React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Charts:** Recharts

## Project Structure

```
stockfox/
├── docs/                 # PRDs, specs, research documents
│   ├── prd/             # Product requirements
│   ├── specs/           # Technical specifications
│   ├── data/            # Mock data & metrics reference
│   └── research/        # Personas, journeys, competitive
│
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # Base UI components
│   │   ├── layout/      # Layout components
│   │   └── features/    # Feature components
│   ├── pages/           # Page components (13 screens)
│   ├── data/            # Mock data JSON
│   ├── store/           # Zustand state
│   ├── types/           # TypeScript definitions
│   └── lib/             # Utilities
│
├── public/              # Static assets
└── package.json
```

## Demo Features

### 3 Demo Profiles
- **Analytical Ankit** - Growth investor, moderate risk
- **Skeptical Sneha** - Value investor, conservative
- **Curious Kavya** - Beginner, learning focus

### 3 Demo Stocks
- **Eternal (Zomato)** - Polarizing new economy stock
- **Axis Bank** - Traditional banking
- **TCS** - Blue chip IT benchmark

### 13 Screens
1. Profile Selection
2. Dashboard
3. Stock Analysis
4. Segment Deep-dive
5. AI Chat
6. Stock Comparison
7. Analysis Journal
8. Portfolio View
9. Discovery Hub
10. Advisor Marketplace
11. Backtest Home
12. Alerts Center
13. Settings

## Key Demo Moment

**"Same Stock, Different Verdict"** - Switch between profiles on any stock analysis to see how personalization changes the recommendation.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Documentation

Full PRDs and specs available in `/docs`:
- `docs/prd/CONSOLIDATED_PRD_SUMMARY.md` - Complete feature summary
- `docs/data/stockfox_mock_data_filled.md` - All mock data
- `docs/specs/` - Technical specifications

---

**StockFox Demo** | Investor Pitch Prototype
