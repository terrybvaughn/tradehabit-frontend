import type { FC, ReactNode } from "react";
import styles from "./TemplateV2.module.css";
import { DonutChart } from "@/components/Body/DonutChart";
import { MentorChat } from "@/components/Mentor/MentorChat";
import { useSummary } from "@/api/hooks";
import { useAnalysisStatus } from "@/AnalysisStatusContext";

interface TemplateV2Props {
  children: ReactNode;
}

export const TemplateV2: FC<TemplateV2Props> = ({ children }) => {
  const { ready } = useAnalysisStatus();
  const { data: summaryData } = useSummary(ready);

  // Derived metrics
  const totalTrades = summaryData?.total_trades ?? 0;
  const cleanTradeRate = Math.round((summaryData?.clean_trade_rate ?? 0) * 100);
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
  const noStopLoss = mistakeCounts["no stop-loss order"] ?? 0;

  const streakCurrent = summaryData?.streak_current ?? 0;
  const streakRecord = summaryData?.streak_record ?? 0;

  return (
    <div className={styles.template}>
      <aside className={styles.left}>
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
      </aside>
      <main className={styles.center}>
        {children}
      </main>
      <aside className={styles.right}>
        <MentorChat />
      </aside>
    </div>
  );
};
