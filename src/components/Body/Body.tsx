import type { FC, ReactNode } from "react";
import styles from "./Body.module.css";
import { DonutChart } from "./DonutChart";
import { GoalCard } from "./GoalCard";
import iconCleanCheckCircle from "@/assets/images/icon-clean-check-circle.svg";
import iconStopAlert from "@/assets/images/icon-stop-alert.svg";
import iconRevengeClock from "@/assets/images/icon-revenge-clock.svg";
import { TradesTable } from "./TradesTable";
import { LossConsistencyChart } from "./LossConsistencyChart";
import { useSummary, useTrades, useLosses } from "@/api/hooks";

interface BodyProps {
  children: ReactNode;
  insightsExpanded: boolean;
  setInsightsExpanded: (expanded: boolean) => void;
}

const insightsData = [
  {
    diagnostic: "Over this time period, 64% of your trades were executed without a mistake. Your biggest problem is risking too much on individual trades. Bring position size back in line to avoid single-trade blow-ups. For more information, see your Excessive Risk Sizing insight.",
    priority: 0,
    title: "Summary"
  },
  {
    diagnostic: "All 47 of your trades used stop-loss orders. This shows consistent risk discipline, which can help limit downside and reduce stress during volatile periods.",
    priority: 1,
    title: "Stop-Loss Discipline"
  },
  {
    diagnostic: "5 of your 47 trades (10.6%) had stop distances that exceeded 1.5× your standard deviation. The average risk size among these trades was 45.25 points. These large-risk trades may signal moments of overconfidence or loss of discipline.",
    priority: 2,
    title: "Excessive Risk Sizing"
  },
  {
    diagnostic: "You had 3 trades with losses that exceeded 1.0 standard deviation above your average losing trade. These outliers contributed 63.42 points in excess losses, meaning that if they'd been closer to your average, your total drawdown would have been significantly lower. A few large losses can erase weeks of gains. Controlling these outliers is critical for long-term performance.",
    priority: 3,
    title: "Outsized Losses"
  },
  {
    diagnostic: "You're winning only 40% of your revenge trades—well below your overall 51% win rate—and even though your average winner is larger ($49.75 vs. $21.08), those extra losses have already set you back $-17.26 in total (about $-3.45 per revenge trade). In other words, you'd need a payoff ratio north of 1.5 just to breakeven at a 40% win rate, yet your revenge payoff is only 1.28× (compared with 0.54× overall). Bottom line: taking trades in the heat of frustration is costing you real money and eroding your edge—best to pause and stick to your plan rather than chase losses.",
    priority: 4,
    title: "Revenge Trading"
  },
  {
    diagnostic: "You risked as little as 0.5 points and as much as 68.5 points per trade. Your average risk size was 13.61 points, with a standard deviation of 13.69 points. Wide variation in stop placement may signal inconsistency in risk management.",
    priority: 5,
    title: "Risk Sizing Consistency"
  },
  {
    diagnostic: "Your win rate is 51.1%, and your average win is $21.08, versus an average loss of $39.24. That gives you a payoff ratio of 0.54.\nYou're running below breakeven. This math doesn't work long term. Either your losses are too large or your winners too small. One of them has to improve.",
    priority: 6,
    title: "Win Rate vs. Payoff Ratio"
  }
];

const goalsData = [
  {
    best_streak: 16,
    current_streak: 8,
    goal: 50,
    progress: 0.39,
    title: "Clean Trades",
    icon: iconCleanCheckCircle,
    description: "Complete {goal} trades without making a mistake."
  },
  {
    best_streak: 16,
    current_streak: 10,
    goal: 100,
    progress: 0.70,
    title: "Risk Management",
    icon: iconStopAlert,
    description: "Complete {goal} trades without making a risk management error."
  },
  {
    best_streak: 20,
    current_streak: 8,
    goal: 100,
    progress: 0.90,
    title: "Revenge Trades",
    icon: iconRevengeClock,
    description: "Complete {goal} trades outside your revenge trading window."
  }
];

export const Body: FC<BodyProps> = ({ children, insightsExpanded, setInsightsExpanded }) => {
  const summary = insightsData.find(i => i.priority === 0);
  const rest = insightsData.filter(i => i.priority !== 0).sort((a, b) => a.priority - b.priority);

  // Live summary data from backend
  const { data: summaryData } = useSummary();
  const { data: tradesDataResp } = useTrades();
  const tradesData = tradesDataResp?.trades ?? [];
  const cleanTradeRate = Math.round((summaryData?.success_rate ?? 0) * 100);

  // Derived metrics for Performance, Mistakes, Streaks columns
  const totalTrades = summaryData?.total_trades ?? 0;
  const winningTrades = summaryData?.win_count ?? 0;
  const losingTrades = summaryData?.loss_count ?? 0;
  const winRate = Math.round((summaryData?.win_rate ?? 0) * 100);
  const avgProfit = summaryData?.average_win?.toFixed(2) ?? "0";
  const avgLoss = summaryData?.average_loss?.toFixed(2) ?? "0";
  const payoffRatio = summaryData?.payoff_ratio?.toFixed(2) ?? "0";
  const cleanTrades = Math.round(totalTrades * (summaryData?.success_rate ?? 0));
  const flaggedTrades = totalTrades - cleanTrades;

  const mistakeCounts = summaryData?.mistake_counts ?? {};
  const excessiveRisk = mistakeCounts["excessive risk"] ?? 0;
  const outsizedLoss = mistakeCounts["outsized loss"] ?? 0;
  const revengeTrade = mistakeCounts["revenge trade"] ?? 0;
  const noStopLoss = mistakeCounts["no stop-loss"] ?? 0;

  const streakCurrent = summaryData?.streak_current ?? 0;
  const streakRecord = summaryData?.streak_record ?? 0;

  // Compute losses for LossConsistencyChart from live trades
  const tradeLosses = tradesData
    .filter((t) => t.pointsLost > 0)
    .map((t, idx) => ({
      hasMistake: t.mistakes.length > 0,
      lossIndex: idx + 1,
      pointsLost: t.pointsLost,
      tradeId: t.id,
    }));

  // Live losses data from backend
  const { data: lossesResp } = useLosses();
  const losses = lossesResp?.losses ?? [];
  const meanLoss = lossesResp?.meanPointsLost ?? 0;
  const stdLoss = lossesResp?.stdDevPointsLost ?? 0;

  // Handler for expanding insights
  const handleExpandInsights = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setInsightsExpanded(true);
  };

  // Render the summary as JSX with a clickable link
  let summaryJsx: React.ReactNode = null;
  if (summary) {
    const linkText = "Excessive Risk Sizing";
    const idx = summary.diagnostic.indexOf(linkText);
    if (idx !== -1) {
      summaryJsx = (
        <>
          {summary.diagnostic.slice(0, idx)}
          <a
            href="#"
            style={{ color: "#D2FF31", cursor: "pointer", fontWeight: "500", textDecoration: "none" }}
            onClick={handleExpandInsights}
          >
            {linkText}
          </a>
          {summary.diagnostic.slice(idx + linkText.length)}
        </>
      );
    } else {
      summaryJsx = summary.diagnostic;
    }
  }

  return (
    <div className={styles.body}>
      <div className={styles.leftColumn}>
        <DonutChart value={cleanTradeRate} label="Clean Trade Rate" />
        <div className={styles.section}>
          <h3 className={styles.sectionHeading}>Performance</h3>
          <ul className={styles.metrics}>
            <li>Total Trades <span>{totalTrades}</span></li>
            <li>Clean Trades <span>{cleanTrades}</span></li>
            <li>Flagged Trades <span>{flaggedTrades}</span></li>
            <li>Clean Trade Rate <span>{cleanTradeRate}%</span></li>
            <li className={styles.spacer}></li>
            <li>Winning Trades <span>{winningTrades}</span></li>
            <li>Losing Trades <span>{losingTrades}</span></li>
            <li>Win Rate <span>{winRate}%</span></li>
            <li className={styles.spacer}></li>
            <li>Average Profit <span>{avgProfit}</span></li>
            <li>Average Loss <span>{avgLoss}</span></li>
            <li>Payoff Ratio <span>{payoffRatio}</span></li>
          </ul>
        </div>
        <div className={styles.section}>
          <h3 className={styles.sectionHeading}>Mistakes</h3>
          <ul className={styles.metrics}>
            <li>Excessive Risk <span>{excessiveRisk}</span></li>
            <li>Outsized Loss <span>{outsizedLoss}</span></li>
            <li>Revenge Trade <span>{revengeTrade}</span></li>
            <li>No Stop-Loss <span>{noStopLoss}</span></li>
          </ul>
        </div>
        <div className={styles.section}>
          <h3 className={styles.sectionHeading}>Streaks</h3>
          <ul className={styles.metrics}>
            <li>Current Clean Streak <span>{streakCurrent}</span></li>
            <li>Record Clean Streak <span>{streakRecord}</span></li>
          </ul>
        </div>
      </div>
      <div className={styles.centerColumn}>
        {summary && (
          <div className={styles.insightsSection}>
            <h2 className={styles.insightsHeading}>Insights</h2>
            <div
              className={styles.insightsSummary}
              style={{
                maxHeight: insightsExpanded ? 1000 : 90,
                overflow: "hidden",
                transition: "max-height 0.5s cubic-bezier(.4,0,.2,1)",
              }}
            >
              <div className={styles.insightDiagnostic}>
                {summaryJsx}
              </div>
              {insightsExpanded && (
                <div className={styles.insightsDetails}>
                  {rest.map(insight => (
                    <div key={insight.priority} className={styles.insightDetail}>
                      <h3 className={styles.insightTitle}>{insight.title}</h3>
                      <p className={styles.insightDiagnostic}>{insight.diagnostic}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={styles.sectionTitle}>Goals</div>
        <div className={styles.goalsRow}>
          {goalsData.map((goal, i) => (
            <GoalCard key={i} {...goal} />
          ))}
        </div>
        <div className={styles.sectionTitle}>Loss Consistency</div>
        <LossConsistencyChart losses={losses.length ? losses : tradeLosses} mean={meanLoss} std={stdLoss} />
        {children}
      </div>
      <div className={styles.rightColumn}>
        <TradesTable trades={tradesData} />
      </div>
    </div>
  );
};

// Attach expand handler to window for inline link
if (typeof window !== "undefined") {
  (window as any).__expandInsights = () => {
    const evt = new CustomEvent("expandInsights");
    window.dispatchEvent(evt);
  };
}

// Listen for expand event
if (typeof window !== "undefined") {
  window.addEventListener("expandInsights", () => {
    const setInsightsExpanded = (window as any).setInsightsExpanded;
    if (typeof setInsightsExpanded === "function") setInsightsExpanded(true);
  });
} 