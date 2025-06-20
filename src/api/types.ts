// Shared TypeScript interfaces for TradeHabit backend API responses.

// Mistake counts keyed by mistake type, e.g. { "excessive risk": 5 }
export interface MistakeCounts {
  [mistake: string]: number;
}

export interface AnalyzeMeta {
  csvRows: number;
  mistakeCounts: MistakeCounts;
  sigmaUsed: number;
  successRate: number; // 0–1 range (e.g. 0.64)
  totalMistakes: number;
  tradesDetected: number;
  tradesWithMistakes: number;
}

export interface Trade {
  id: string;

  side: "Buy" | "Sell" | string; // fallback string for unknown sides
  symbol: string;

  entryPrice: number;
  entryQty: number;
  entryTime: string; // ISO timestamp

  exitOrderId: number;
  exitPrice: number;
  exitQty: number;
  exitTime: string; // ISO timestamp

  pnl: number; // profit and loss in points or currency
  pointsLost: number;
  riskPoints: number;

  mistakes: string[]; // list of mistake labels
}

export interface AnalyzeResponse {
  meta: AnalyzeMeta;
  trades: Trade[];
}

export interface SummaryResponse {
  average_loss: number;
  average_win: number;
  diagnostic_text: string;
  loss_count: number;
  mistake_counts: MistakeCounts;
  payoff_ratio: number;
  required_wr_adj: number;
  streak_current: number;
  streak_record: number;
  clean_trade_rate: number; // 0-1
  flagged_trades: number;
  total_mistakes: number;
  total_trades: number;
  win_count: number;
  win_rate: number; // 0-1
}

export interface TradesResponse {
  date_range: {
    start: string; // ISO start
    end: string;   // ISO end
  };
  trades: Trade[];
}

export interface LossEntry {
  hasMistake: boolean;
  lossIndex: number;
  pointsLost: number;
  tradeId: string;
}

export interface LossesResponse {
  meanPointsLost: number;
  stdDevPointsLost: number;
  losses: LossEntry[];
}

// ────────────────────────────────────────────────────────────
// Added: Insights interface used by /api/insights endpoint
export interface Insights {
  diagnostic: string;
  priority: number;
  title: string;
}

// ────────────────────────────────────────────────────────────
// Goal tracking
export interface Goals {
  best_streak: number;
  current_streak: number;
  goal: number;
  progress: number; // fraction 0-1
  title: string;
} 