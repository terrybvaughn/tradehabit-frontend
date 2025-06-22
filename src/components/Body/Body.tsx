import type { FC, ReactNode } from "react";
import styles from "./Body.module.css";
import { DonutChart } from "./DonutChart";
import { GoalCard } from "./GoalCard";
import iconCleanCheckCircle from "@/assets/images/icon-clean-check-circle.svg";
import iconStopAlert from "@/assets/images/icon-stop-alert.svg";
import iconRevengeClock from "@/assets/images/icon-revenge-clock.svg";
import { TradesTable } from "./TradesTable";
import { LossConsistencyChart } from "./LossConsistencyChart";
import { useSummary, useTrades, useLosses, useInsights, useGoals } from "@/api/hooks";
import { useAnalysisStatus } from "@/AnalysisStatusContext";
import { Goals as GoalsList } from "@/components/Goals/Goals";

interface BodyProps {
  children: ReactNode;
  insightsExpanded: boolean;
  setInsightsExpanded: (expanded: boolean) => void;
  showGoals: boolean;
}

// Icons for each default goal title
const goalIconMap = {
  "Clean Trades": iconCleanCheckCircle,
  "Risk Management": iconStopAlert,
  "Revenge Trades": iconRevengeClock,
} as const;

type BuildIconParams = { title?: string; mistake_types?: string[] };
function buildGoalIcon({ title = "", mistake_types = [] }: BuildIconParams) {
  // iconCleanCheckCircle for clean trades, iconRevengeClock for revenge, else stopAlert
  if (mistake_types.length === 0) {
    if (title === "Revenge Trades") return iconRevengeClock;
    if (title === "Risk Management") return iconStopAlert;
    return iconCleanCheckCircle;
  }

  // only revenge trade selected
  if (mistake_types.length === 1 && mistake_types[0] === "revenge trade") {
    return iconRevengeClock;
  }

  // all 4 mistakes chosen -> clean check icon
  const all = [
    "no stop-loss order",
    "excessive risk",
    "outsized loss",
    "revenge trade",
  ];
  if (mistake_types.length === all.length && mistake_types.every((m) => all.includes(m))) {
    return iconCleanCheckCircle;
  }

  // default
  return iconStopAlert;
}

/**
 * Generate a human-readable description for a goal based on its configured
 * mistake_types and metric. Mirrors the rules defined in the Goals feature spec.
 */
type BuildDescParams = { goal: number; metric?: string; mistake_types?: string[]; title?: string };
function buildGoalDescription({ goal, metric = "trades", mistake_types = [], title = "" }: BuildDescParams) {
  const all = [
    "no stop-loss order",
    "excessive risk",
    "outsized loss",
    "revenge trade",
  ];

  // Helper to inject numbers / metric into template
  const fmt = (tmpl: string) => tmpl.replace("{goal}", goal.toString()).replace("{metric}", metric);

  // Resolve titles fallback when mistake_types is empty (legacy defaults)
  if (mistake_types.length === 0) {
    if (title === "Risk Management") {
      return fmt("Complete {goal} {metric} without making a risk management error.");
    }
    if (title === "Revenge Trades") {
      return fmt("Complete {goal} {metric} outside your revenge trading window.");
    }
    // Empty & any other title defaults to Clean Trades description
    return fmt("Complete {goal} {metric} without making a mistake.");
  }

  // Case 1b: explicitly all mistakes selected
  if (mistake_types.length === all.length && mistake_types.every((m) => all.includes(m))) {
    return fmt("Complete {goal} {metric} without making a mistake.");
  }

  if (mistake_types.length === 1) {
    switch (mistake_types[0]) {
      case "revenge trade":
        return fmt("Complete {goal} {metric} outside your revenge trading window.");
      case "excessive risk":
        return fmt("Complete {goal} {metric} without taking on excessive risk.");
      case "outsized loss":
        return fmt("Complete {goal} {metric} without taking an outsized loss.");
      case "no stop-loss order":
        return fmt("Complete {goal} {metric} with stop-loss protection.");
      default:
        break;
    }
  }

  // 2–3 mistakes selected
  return fmt("Complete {goal} {metric} without making a risk management error.");
}

export const Body: FC<BodyProps> = ({ children, insightsExpanded, setInsightsExpanded, showGoals }) => {
  const { ready } = useAnalysisStatus();

  // Fetch insights & goals from API once analysis is ready
  const { data: insightsData = [] } = useInsights(ready);
  const { data: goalsRaw = [] } = useGoals(ready);

  // Enrich raw goals with icon + computed description
  const goalsData = goalsRaw.map((g) => ({
    ...g,
    icon: buildGoalIcon({ title: g.title, mistake_types: g.mistake_types }),
    description: buildGoalDescription({ goal: g.goal, metric: g.metric, mistake_types: g.mistake_types, title: g.title }),
  }));

  const summary = insightsData.find(i => i.priority === 0);
  const rest = insightsData.filter(i => i.priority !== 0).sort((a, b) => a.priority - b.priority);

  // Live summary data from backend (enabled only when ready)
  const { data: summaryData } = useSummary(ready);
  const { data: tradesDataResp } = useTrades(ready);
  const tradesData = tradesDataResp?.trades ?? [];
  const cleanTradeRate = Math.round((summaryData?.clean_trade_rate ?? 0) * 100);

  // Derived metrics for Performance, Mistakes, Streaks columns
  const totalTrades = summaryData?.total_trades ?? 0;
  const winningTrades = summaryData?.win_count ?? 0;
  const losingTrades = summaryData?.loss_count ?? 0;
  const winRate = Math.round((summaryData?.win_rate ?? 0) * 100);
  const avgProfit = summaryData?.average_win?.toFixed(2) ?? "0";
  const avgLoss = summaryData?.average_loss?.toFixed(2) ?? "0";
  const payoffRatio = summaryData?.payoff_ratio?.toFixed(2) ?? "0";
  const flaggedTrades = summaryData?.flagged_trades ?? (totalTrades - Math.round(totalTrades * (summaryData?.clean_trade_rate ?? 0)));
  const cleanTrades = totalTrades - flaggedTrades;

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

  // Live losses data from backend (enabled only when ready)
  const { data: lossesResp } = useLosses(ready);
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
    const linkableTexts = [
      "Excessive Risk Sizing",
      "Stop-Loss Discipline",
      "Outsized Losses",
      "Revenge Trading",
      "Risk Sizing Consistency",
      "Win Rate vs. Payoff Ratio",
    ];

    // Find first linkable phrase present in diagnostic text 
    const matchedText = linkableTexts.find((txt) => summary.diagnostic.includes(txt));

    if (matchedText) {
      const idx = summary.diagnostic.indexOf(matchedText);
      summaryJsx = (
        <>
          {summary.diagnostic.slice(0, idx)}
          <a
            href="#"
            className={styles.summaryLink}
            onClick={handleExpandInsights}
          >
            {matchedText}
          </a>
          {summary.diagnostic.slice(idx + matchedText.length)}
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
        {showGoals ? (
          <GoalsList />
        ) : (
        <>
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
        </>
        )}
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