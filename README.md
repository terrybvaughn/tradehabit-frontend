# TradeHabit Frontend

![TradeHabit Dashboard](/public/TradeHabit_Dashboard_Live.png)
A modern React-based web application for trading performance analysis and habit tracking. TradeHabit helps traders analyze their trading data, identify mistakes, track goals, and improve their trading discipline.

🌐 **Live Demo:** [app.tradehab.it](https://app.tradehab.it)

## Features

### 📊 **Trading Analysis Dashboard**
- **Performance Metrics**: Win rate, payoff ratio, average profit/loss
- **Clean Trade Rate**: Visual donut chart showing mistake-free trading percentage  
- **Mistake Tracking**: Categorized analysis of trading errors
- **Streak Monitoring**: Current and record clean trading streaks

### 📈 **Data Visualization**
- **Interactive Donut Charts**: Clean trade rate visualization
- **Loss Consistency Charts**: Statistical analysis of trading losses
- **Expandable Trades Table**: Detailed view of individual trades with mistake annotations

### 🎯 **Goal Management System**
- **Custom Goal Creation**: Set personalized trading improvement targets
- **Progress Tracking**: Real-time progress monitoring with streak counters
- **Goal Categories**: Clean trades, risk management, revenge trading prevention
- **Visual Goal Cards**: Intuitive progress display with icons and descriptions

### 🔍 **Tailored Insights**
- **Automated Analysis**: Behavioral insights based on trading patterns
- **Priority Recommendations**: Ranked suggestions for improvement
- **Interactive Insights**: Expandable detailed recommendations

### ⚙️ **Settings & Configuration**
- **Risk Thresholds**: Customizable risk management parameters
- **Data Persistence**: Session storage for user preferences
- **Upload Management**: CSV file processing for trading data

### 📱 **Modern UI/UX**
- **Responsive Design**: Mobile-friendly interface
- **Modal System**: Clean, reusable modal components
- **Navigation**: Tab-based navigation (Dashboard, Insights, Goals)
- **Loading States**: Smooth user experience with proper loading indicators

## Tech Stack

### **Frontend Framework**
- **React 19** - Latest React with modern hooks and features
- **TypeScript** - Full type safety throughout the application
- **Vite** - Fast build tool and development server

### **State Management**
- **Zustand** - Lightweight state management with persistence
- **TanStack Query** - Server state management and caching
- **React Context** - Application-level state (analysis status)

### **Styling**
- **CSS Modules** - Scoped styling with modular approach
- **Modern CSS** - Custom properties, flexbox, grid layouts

### **API Integration**
- **Custom API Client** - Type-safe HTTP client with error handling
- **RESTful Integration** - Clean API layer with React hooks

### **Development Tools**
- **ESLint** - Code linting and formatting
- **TypeScript Compiler** - Type checking and compilation
- **Vite Dev Server** - Hot module replacement and fast refresh

## Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tradehabit-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── api/                    # API layer
│   ├── client.ts          # HTTP client with error handling
│   ├── hooks.ts           # React Query hooks for API calls
│   ├── types.ts           # TypeScript interfaces for API responses
│   └── useBackendWakeUp.ts # Backend health check hook
├── components/            # React components
│   ├── Body/              # Main dashboard components
│   │   ├── Body.tsx       # Main dashboard layout
│   │   ├── DonutChart.tsx # Clean trade rate visualization
│   │   ├── GoalCard.tsx   # Individual goal display
│   │   ├── LossConsistencyChart.tsx # Loss analysis chart
│   │   └── TradesTable.tsx # Interactive trades table
│   ├── Goals/             # Goal management
│   ├── GoalModal/         # Goal creation/editing modals
│   ├── Header/            # Application header with navigation
│   ├── Layout/            # Main application layout
│   ├── SettingsModal/     # User settings configuration
│   └── UploadModal/       # CSV file upload interface
├── state/                 # State management
│   ├── goalsStore.ts      # Zustand store for goals
│   └── settingsStore.ts   # User settings store
├── utils/                 # Utility functions
│   └── goalDisplay.ts     # Goal rendering helpers
├── assets/                # Static assets (images, icons)
├── App.tsx               # Root application component
├── main.tsx              # Application entry point
└── AnalysisStatusContext.tsx # Global analysis state
```

## API Integration

The frontend integrates with a separate backend API for:

- **CSV Analysis** - Upload and process trading data
- **Performance Metrics** - Retrieve calculated trading statistics
- **Goal Calculations** - Server-side goal progress computation
- **Insights Generation** - AI-powered trading recommendations

### **Key API Endpoints**
- `POST /api/analyze` - Upload CSV for analysis
- `GET /api/summary` - Retrieve performance summary
- `GET /api/trades` - Get detailed trades data
- `GET /api/goals` - Goal management operations
- `GET /api/insights` - AI-generated insights

## Data Processing

### **Supported Trade Data**
- Entry/exit prices and quantities
- Trade timing and duration
- Profit/loss calculations
- Risk metrics and stop-loss data

### **Mistake Detection**
- **Excessive Risk** - Trades exceeding risk parameters
- **Outsized Loss** - Losses beyond statistical norms
- **Revenge Trading** - Emotional trading patterns
- **No Stop-Loss** - Trades without proper risk management

## UI Components

### **Reusable Components**
- **Modal System** - Base modal with consistent styling
- **Chart Components** - Donut charts and data visualizations
- **Data Tables** - Sortable, expandable trade tables
- **Goal Cards** - Progress tracking with visual indicators

### **Design System**
- **Color Palette** - Dark theme with accent colors
- **Typography** - Manrope font family for readability
- **Icons** - Custom SVG icon set for trading contexts
- **Responsive Grid** - Flexible layout system

## Deployment

### **Production Build**
```bash
npm run build
```

### **Deployment Platforms**
- **Replit** - Currently deployed (configured for Replit hosting)
- **Vercel/Netlify** - Compatible with modern hosting platforms
- **Docker** - Containerization ready

### **Environment Variables**
- `VITE_API_URL` - Backend API base URL
- `PORT` - Server port (for deployment platforms)

## Development

### **Code Quality**
- **TypeScript** - Strict type checking enabled
- **ESLint** - Configured for React and TypeScript
- **Module System** - ES modules with path aliases (`@/` for src)

### **Performance**
- **Code Splitting** - Lazy loading for optimal bundle size
- **React Query** - Efficient data fetching and caching
- **CSS Modules** - Scoped styles preventing conflicts

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

**You are free to:**
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

**Under the following terms:**
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made
- **NonCommercial** — You may not use the material for commercial purposes
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license

See the [LICENSE](LICENSE) file for full details or visit [Creative Commons](https://creativecommons.org/licenses/by-nc-sa/4.0/) for more information.

## Acknowledgments

- Built with modern React best practices
- Designed for aspiring trading professionals and enthusiasts  
- Focused on actionable insights that help traders to improve trading discipline
- Open source for educational and personal use

