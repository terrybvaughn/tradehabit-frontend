import type { SummaryResponse } from "@/api/types";

// Mistake counts from API - backend always returns all 5 types
export type MistakeCounts = Record<string, number>;

export interface WelcomeMessageData {
  template: 1 | 2 | 3 | 4 | 5 | 6;
  base: string;
  personalized?: string; // Optional for Templates 5 and 6
  calibration: string;
  close?: string; // Optional for Templates 5 and 6
}

// Mistake keys from API use lowercase with spaces (see api.md)
const MISTAKE_PRIORITY = [
  'no stop-loss order',      // Highest priority
  'outsized loss',
  'excessive risk',
  'revenge trade',
  'risk sizing inconsistency' // Lowest priority
];

// Template 1 - Clear Mistake Observations
const CLEAR_MISTAKE_OBSERVATIONS: Record<string, (count: number) => string> = {
  "no stop-loss order": (count: number) =>
    `Your data shows ${count} trades without stop-loss protection. This is a common pattern I see with developing traders, and addressing it could significantly improve your risk management.`,

  "outsized loss": (count: number) =>
    `I noticed ${count} trades where your losses were much larger than your average. When losses exceed your normal range, it often indicates stop-loss discipline issues or emotional decision-making that could be costing you significant capital.`,

  "excessive risk": (count: number) =>
    `Your data shows ${count} trades with unusually large risk size compared to your typical range. This exposes you to larger-than-planned losses and suggests an opportunity to tighten risk controls.`,

  "revenge trade": (count: number) =>
    `I detected ${count} potential revenge trades in your data - trades that happened very quickly after losses. This suggests some emotional responses that we can work on together.`,

  "risk sizing inconsistency": (count) =>
    `I noticed ${count} trades with inconsistent position sizing. When risk amounts fluctuate significantly, it often indicates a lack of systematic approach that could be affecting your consistency.`
};

// Template 2 - Minimal Mistake Observations
const MINIMAL_MISTAKE_OBSERVATIONS: Record<string, (count: number) => string> = {
  "no stop-loss order": (count) =>
    `There are a small number of stop-loss issues (${count} trades) that we could review.`,

  "outsized loss": (count) =>
    `A few trades (${count}) showed larger losses than typical, which we could examine.`,

  "excessive risk": (count) =>
    `Some trades (${count}) had higher risk exposure than your usual pattern.`,

  "revenge trade": (count) =>
    `A couple of trades (${count}) might have been revenge trades, worth a quick look.`,

  "risk sizing inconsistency": (count) =>
    `Your position sizing shows some variation (${count} trades) that we could optimize.`
};

/**
 * Select template based on summary data
 */
export function selectTemplate(summary: SummaryResponse | null): 1 | 2 | 3 | 4 | 5 | 6 {
  // Template 6: Data loading error
  if (!summary || summary === null) {
    return 6;
  }

  const { mistake_counts, clean_trade_rate, total_trades } = summary;
  const maxCount = Math.max(...Object.values(mistake_counts as Record<string, number>));
  const cleanRate = clean_trade_rate ?? 1;

  // Template 5: No trades detected
  if (total_trades === 0) {
    return 5;
  }

  // Template 4: Insufficient data (minimum 30 trades)
  if (total_trades < 30) {
    return 4;
  }

  // Template 3: No mistakes detected
  if (maxCount === 0) {
    return 3;
  }

  // Template 1: Clear issues
  if (maxCount >= 3 || cleanRate < 0.9) {
    return 1;
  }

  // Template 2: Minimal issues
  return 2;
}

/**
 * Select highest priority mistake from tied mistakes
 */
export function selectHighestPriorityMistake(mistakeCounts: MistakeCounts): string {
  const maxCount = Math.max(...Object.values(mistakeCounts));
  const tiedMistakes = Object.entries(mistakeCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([mistake, _]) => mistake);

  // Return the highest priority mistake among those tied
  for (const priorityMistake of MISTAKE_PRIORITY) {
    if (tiedMistakes.includes(priorityMistake)) {
      return priorityMistake;
    }
  }

  // Fallback to first tied mistake if none match priority list
  return tiedMistakes[0];
}

/**
 * Analyze payoff ratio for Template 3
 */
export function analyzePayoffRatio(payoffRatio: number): string {
  if (payoffRatio < 1.0) {
    return `However, your payoff ratio is ${payoffRatio.toFixed(2)}, which means your average wins aren't covering your average losses. This suggests we need to focus on improving your risk-reward strategy rather than behavioral discipline.`;
  } else if (payoffRatio <= 1.1) {
    return `Your payoff ratio is ${payoffRatio.toFixed(2)}, which puts you right at the break-even point. After commissions, you're likely not making money. Let's work on improving your risk-reward to create a sustainable edge.`;
  } else if (payoffRatio <= 1.3) {
    return `Your payoff ratio is ${payoffRatio.toFixed(2)}, showing a small positive edge. This is a good start, but there's room to improve your risk-reward strategy to create more consistent profitability.`;
  } else if (payoffRatio <= 1.75) {
    return `Your payoff ratio is ${payoffRatio.toFixed(2)}, demonstrating a solid edge in your trading. You're combining good discipline with effective risk-reward management. Let's explore how to maintain and potentially improve this edge.`;
  } else {
    return `Your payoff ratio is ${payoffRatio.toFixed(2)}, which is exceptional! You're not only disciplined but also have an excellent risk-reward strategy. This combination is what separates consistently profitable traders from the rest.`;
  }
}

/**
 * Generate insufficient trades observation for Template 4
 */
export function generateInsufficientTradesObservation(totalTrades: number): string {
  return `You have ${totalTrades} trades, but we need at least 30 trades to provide statistically meaningful insights. Keep trading and upload more data for a comprehensive analysis.`;
}

/**
 * Generate complete welcome message based on summary data
 */
export function generateWelcomeMessage(summary: SummaryResponse | null): WelcomeMessageData {
  const template = selectTemplate(summary);

  // Template 6: Data Loading Error
  if (template === 6) {
    return {
      template: 6,
      base: "# Welcome to TradeHabit!\n\nI'm Franklin, your personalized trading coach.",
      calibration: "I'm having trouble loading your analytics data. This usually means the data hasn't been uploaded yet or there was an issue processing it. Try uploading your data again, and I'll be ready to help you analyze your performance."
    };
  }

  // Template 5: No Trades Detected
  if (template === 5) {
    return {
      template: 5,
      base: "# Welcome to TradeHabit!\n\nI'm Franklin, your personalized trading coach. I've analyzed your data, but no trades were detected.",
      calibration: "Once you start trading and upload your data, I'll be able to provide detailed insights about your performance."
    };
  }

  // Template 4: Insufficient Trades
  if (template === 4 && summary) {
    return {
      template: 4,
      base: "# Welcome to TradeHabit!\n\nI'm Franklin, your personalized trading coach. I've analyzed your trading data, but there isn't enough data to provide meaningful insights yet.",
      personalized: generateInsufficientTradesObservation(summary.total_trades),
      calibration: "This analysis is based on TradeHabit's default analytics settings. Once you have more trading data, I'll be able to provide more detailed insights about your performance.",
      close: "Feel free to ask me anything about your trading performance or how it's evaluated."
    };
  }

  // Template 3: No Mistakes
  if (template === 3 && summary) {
    return {
      template: 3,
      base: "# Welcome to TradeHabit!\n\nI'm Franklin, your personalized trading coach. I've analyzed your trading data and found excellent trading discipline with no behavioral mistakes detected.",
      personalized: analyzePayoffRatio(summary.payoff_ratio),
      calibration: "This analysis is based on TradeHabit's default analytics settings. Your discipline is strong, but let's look at your risk-reward performance to see if there are opportunities to optimize your edge.",
      close: "Feel free to ask me anything about your trading performance or how it's evaluated."
    };
  }

  // Template 1: Clear Issues
  if (template === 1 && summary) {
    const topMistake = selectHighestPriorityMistake(summary.mistake_counts);
    const mistakeCount = summary.mistake_counts[topMistake];
    const observation = CLEAR_MISTAKE_OBSERVATIONS[topMistake]?.(mistakeCount) ||
      `I found ${mistakeCount} instances of ${topMistake} in your trading data.`;

    return {
      template: 1,
      base: "# Welcome to TradeHabit!\n\nI'm Franklin, your personalized trading coach. I'm here to answer your questions about your trading performance. I've analyzed your trading data and found some opportunities for improvement.",
      personalized: observation,
      calibration: "This insight is based on TradeHabit's default analytics settings. If something doesn't feel right, ask me about it. We can always adjust the settings to better fit your trading style.",
      close: "Feel free to ask me anything about your trading performance or how it's evaluated."
    };
  }

  // Template 2: Minimal Issues
  if (template === 2 && summary) {
    const topMistake = selectHighestPriorityMistake(summary.mistake_counts);
    const mistakeCount = summary.mistake_counts[topMistake];
    const observation = MINIMAL_MISTAKE_OBSERVATIONS[topMistake]?.(mistakeCount) ||
      `I found ${mistakeCount} instances of ${topMistake} in your trading data.`;

    return {
      template: 2,
      base: "# Welcome to TradeHabit!\n\nI'm Franklin, your personalized trading coach. I've analyzed your trading data and found very few mistakes. This indicates strong trading discipline. And while you're doing well, there are some opportunities for improvement.",
      personalized: observation,
      calibration: "This analysis is based on TradeHabit's default analytics settings. Sometimes, a closer look or a slight adjustment in parameters can uncover areas for optimization.",
      close: "Feel free to ask me anything about your trading performance or how it's evaluated."
    };
  }

  // Fallback to Template 6 (should never reach here)
  return {
    template: 6,
    base: "Welcome to TradeHabit!\n\nI'm Franklin, your personalized trading coach.",
    calibration: "I'm having trouble loading your analytics data. This usually means the data hasn't been uploaded yet or there was an issue processing it. Try uploading your data again, and I'll be ready to help you analyze your performance."
  };
}

/**
 * Format welcome message data into display text
 */
export function formatWelcomeMessage(data: WelcomeMessageData): string {
  const parts = [data.base];

  if (data.personalized) {
    parts.push(data.personalized);
  }

  parts.push(data.calibration);

  if (data.close) {
    parts.push(data.close);
  }

  return parts.join('\n\n');
}
