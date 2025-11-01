# TradeHabit Frontend

## Overview

TradeHabit is a React-based web application that helps traders analyze their trading performance, identify mistakes, track goals, and receive AI-powered mentorship. The application processes NinjaTrader CSV files to provide detailed analysis of trading patterns, behavioral insights, and personalized recommendations for improvement.

**Key Features:**
- Trading performance dashboard with metrics and visualizations
- Automated mistake detection and categorization
- Goal setting and progress tracking
- AI mentor chat for personalized guidance
- Interactive data visualizations (donut charts, dispersion charts, breakeven analysis)
- Customizable risk thresholds and analysis parameters

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework & Build System
- **React 19** with TypeScript for type safety and modern React features
- **Vite** as the build tool and development server (port 5000 for Replit compatibility)
- **Path aliases** configured via `@/*` mapping to `src/*` for cleaner imports
- **ESLint** with TypeScript and React plugins for code quality

**Rationale:** React 19 provides the latest features and performance improvements. Vite offers fast hot module replacement and optimized builds. TypeScript adds type safety to prevent runtime errors.

### State Management Architecture
- **Zustand** for client-side state management (goals, settings)
- **TanStack Query (React Query)** for server state and API caching
- **Session Storage** for persistence of user preferences and goals

**Persistence Strategy:**
- Goals stored in `sessionStorage` under key `tradehabit_goals`
- Settings stored in `sessionStorage` under key `tradehabit_settings`
- Analysis state managed through `AnalysisStatusContext` (ready/not ready)

**Rationale:** Zustand provides a lightweight, minimal state solution. TanStack Query handles API caching, loading states, and refetching automatically. Session storage ensures preferences persist within a session but are cleared when the browser closes (appropriate for trading data privacy).

### API Communication Pattern
- **Custom API client** (`src/api/client.ts`) wrapping native `fetch`
- **Centralized error handling** via `TradeHabitApiError` class
- **JWT authentication** stored in `localStorage` under key `tradehabit_jwt`
- **Base URL** configured via `VITE_API_URL` environment variable
- **Proxy configuration** in Vite for `/api` routes to backend (localhost:5000)

**API Hooks Pattern:**
- Each API endpoint has a corresponding hook in `src/api/hooks.ts`
- Hooks use TanStack Query's `useQuery` for GET requests and `useMutation` for POST/PUT/DELETE
- Automatic query invalidation on mutations to keep UI synchronized

**Rationale:** Custom client provides consistent error handling and auth injection. TanStack Query hooks eliminate boilerplate and provide excellent caching behavior. JWT in localStorage allows persistence across sessions.

### Component Architecture

**Layout Strategy:**
- **Three-column layout** (200px left, 700px center, 500px right) at 1400px total width
- **Sticky header** (52px) with navigation and action buttons
- **Independent scrolling** for each column with fade-out masks
- **Minimum screen width** of 1200px enforced via `ScreenSizeWarning` component

**Component Organization:**
- **Feature-based** folders (`components/Goals/`, `components/Mentor/`)
- **Shared components** (`components/Body/`, `components/Modal/`)
- **Page components** (`pages/DashboardV2.tsx`)
- **CSS Modules** for scoped styling (`.module.css` files)

**Rationale:** Three-column layout optimizes space for metrics (left), content (center), and mentor chat (right). CSS Modules prevent style conflicts. Independent scrolling prevents layout issues when one column has more content.

### Data Visualization Strategy

**Chart Components:**
- **DonutChart** - SVG-based progress visualization for clean trade rate
- **DispersionChart** - Scatter plot for loss and risk analysis with statistical overlays
- **BreakevenChart** - Win rate vs. payoff ratio visualization
- **BinaryEventSeriesChart** - Time series ribbon for binary events (stop-loss discipline)
- **LossConsistencyChart** - Historical loss pattern analysis

**Rendering Approach:**
- Pure SVG rendering for charts (no external charting library)
- Responsive sizing based on container width
- Interactive tooltips with trade details
- Dynamic scaling based on data ranges

**Rationale:** Custom SVG charts provide complete control over styling and interactivity without external dependencies. This keeps bundle size small and ensures consistent visual design.

### Goal System Architecture

**Goal Model:**
```typescript
{
  id: string;              // Unique identifier (nanoid)
  title: string;           // User-defined or suggested title
  goal: number;            // Target value (e.g., 10 trades)
  metric: "trades"|"days"; // Progress measurement unit
  mistake_types: string[]; // Mistakes to avoid
  start_date: string;      // ISO date (YYYY-MM-DD)
  current_streak: number;  // Calculated by backend
  best_streak: number;     // Calculated by backend
  progress: number;        // 0-1 range
}
```

**Goal Calculation Flow:**
1. Goals stored in Zustand with session storage persistence
2. On changes, goals sent to backend `/api/goals` for recalculation
3. Backend returns updated progress, streaks, and completion status
4. UI updates via TanStack Query cache invalidation

**Default Goals:** Three goals are automatically seeded on first analysis:
- Clean Trades (all 4 mistake types)
- Revenge Trades (only "revenge trade" mistake)
- Risk Management (3 risk-related mistakes)

**Rationale:** Backend calculation ensures accuracy and consistency. Session storage prevents goals from persisting inappropriately across datasets. Default goals provide immediate value for new users.

### Settings & Threshold System

**Configurable Parameters:**
- `revengeK` (0.5-3.0): Revenge trade time window multiplier
- `lossSigma` (0.75-1.5): Outsized loss detection threshold (standard deviations)
- `riskSigma` (1.0-2.0): Excessive risk detection threshold (standard deviations)
- `riskVR` (0.20-0.50): Risk sizing variance ratio threshold

**Settings Flow:**
1. Settings stored in Zustand with session storage persistence
2. On change, settings sent to `/api/settings` endpoint
3. Backend recalculates all mistake flags in memory
4. Frontend invalidates all queries to refetch updated data

**Reset Behavior:** Settings reset clears session storage and notifies backend to revert to defaults.

**Rationale:** In-memory backend recalculation is fast (no database round-trip). Query invalidation ensures UI reflects new thresholds. Session storage allows experimentation without permanent changes.

### Mentor Chat Architecture

**Components:**
- `MentorChat.tsx` - Main chat container with message list
- `MessageBubble.tsx` - Individual message rendering with Markdown support
- `PromptInput.tsx` - Auto-expanding textarea with send button

**Message Flow:**
1. User sends message via `PromptInput`
2. Frontend posts to `/api/mentor/chat` with message and optional threadId
3. Backend processes with OpenAI Assistant API
4. Response streamed back and displayed in chat

**Welcome Message:** Generated on first load using trading summary data to provide personalized greeting (6 template variations based on mistake patterns).

**Priming:** On first interaction, system sends hidden "priming" message with user's trading data to establish context.

**Rationale:** Markdown rendering supports rich formatting from AI. Auto-expanding textarea improves UX. Welcome message creates engagement. Priming ensures AI has full context without user effort.

### Modal System

**Base Modal Component:** `components/Modal/ModalBase.module.css` provides consistent styling
- Semi-transparent backdrop
- Centered modal panel with border and shadow
- Standard button styles (primary, outline, danger)

**Modal Variants:**
- `UploadModal` - CSV file upload with drag-and-drop
- `SettingsModal` - Threshold configuration with sliders
- `GoalModal` - Goal creation/editing form
- `ConfirmDeleteModal` - Deletion confirmation dialog

**Rationale:** Base styles ensure visual consistency. Portal rendering (via `createPortal`) ensures modals render above all content. Shared styles reduce CSS duplication.

### Routing & Navigation

**No Router Library:** Application uses conditional rendering based on state flags
- `?v2=1` query parameter enables V2 dashboard
- `?mentor=1` query parameter enables mentor chat panel
- Tab-based navigation (Insights/Trades/Goals) managed via state

**Rationale:** Single-page application with minimal views doesn't require a routing library. Query parameters provide shareable URLs. State-based navigation is simpler and lighter.

### Analytics Integration

**Google Tag Manager:** Integrated via script tags in `index.html`
- Container ID: `GTM-NT6XZLB8`
- Tester dimension tracked via `?tester=` query parameter
- Custom events pushed to `dataLayer`

**Tracked Events:**
- `mentor_prompt` - When user sends a message to mentor

**Rationale:** GTM allows flexible event tracking without code changes. Tester parameter enables A/B testing analysis. Minimal event tracking respects user privacy.

## External Dependencies

### Backend API
- **Base URL:** Configured via `VITE_API_URL` environment variable
- **Authentication:** JWT token in `Authorization: Bearer` header
- **Key Endpoints:**
  - `POST /api/analyze` - Upload CSV and receive initial analysis
  - `GET /api/summary` - Trading performance summary
  - `GET /api/trades` - Individual trade details
  - `GET /api/losses` - Loss analysis with statistics
  - `GET /api/insights` - Behavioral insights ranked by priority
  - `GET /api/goals` - Goal progress updates
  - `POST /api/settings` - Update analysis thresholds
  - `POST /api/mentor/chat` - AI mentor conversation

**Backend Repository:** See `docs/shared/` for cross-repo documentation

### NPM Packages

**Core Dependencies:**
- `react` & `react-dom` (19.1.0) - UI framework
- `@tanstack/react-query` (5.30.0) - Server state management
- `zustand` (4.5.7) - Client state management
- `axios` (1.10.0) - HTTP client (note: custom fetch client used instead)
- `nanoid` (5.1.5) - Unique ID generation for goals
- `react-markdown` (10.1.0) - Markdown rendering for mentor chat
- `remark-gfm` (4.0.1) - GitHub Flavored Markdown support

**Development Dependencies:**
- `vite` (6.3.5) - Build tool and dev server
- `typescript` (5.8.3) - Type checking
- `eslint` + plugins - Code quality

**Rationale:** Minimal dependencies reduce bundle size and maintenance burden. React Query and Zustand are battle-tested state libraries. Markdown support enables rich mentor responses.

### Third-Party Services

**Google Tag Manager:**
- Purpose: Analytics and event tracking
- Integration: Script tags in `index.html`
- Data sent: Page views, custom events, tester dimension

**Google Fonts:**
- Manrope (300, 400, 500, 600, 700) - Primary UI font
- Roboto (300, 400, 500, 600, 700) - Data/chart font

**Rationale:** GTM provides flexible analytics without code changes. Web fonts ensure consistent cross-platform typography.

### Development Environment

**Replit Configuration:**
- Dev server runs on port 5000 (required for Replit webview)
- Server listens on `0.0.0.0` for external access
- Host checking disabled for Replit domains

**Build Process:**
- `npm run dev` - Start Vite dev server
- `npm run build` - TypeScript check + Vite production build
- `npm run preview` - Preview production build locally

**Rationale:** Port 5000 and host configuration ensure Replit compatibility. TypeScript build step catches errors before production deployment.