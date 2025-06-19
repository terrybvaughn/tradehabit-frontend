import type { FC, ReactNode } from "react";
import styles from "./Body.module.css";
import { DonutChart } from "./DonutChart";
import { GoalCard } from "./GoalCard";
import iconCleanCheckCircle from "@/assets/images/icon-clean-check-circle.svg";
import iconStopAlert from "@/assets/images/icon-stop-alert.svg";
import iconRevengeClock from "@/assets/images/icon-revenge-clock.svg";
import { TradesTable } from "./TradesTable";
import { LossConsistencyChart } from "./LossConsistencyChart";
import { useSummary } from "@/api/hooks";

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

const tradesData = [
  {
    entryPrice: 22263.5,
    entryQty: 1,
    entryTime: "2024-12-18T11:21:20",
    exitOrderId: 6301600894,
    exitPrice: 22253.5,
    exitQty: 1,
    exitTime: "2024-12-18T11:21:28",
    id: "3ea2cc85-2646-4db3-859f-edd71761ce26",
    mistakes: [],
    pnl: -10.0,
    pointsLost: 10.0,
    riskPoints: 10.0,
    side: "Buy",
    symbol: "NQH5"
  },
  {
    entryPrice: 22263.25,
    entryQty: 1,
    entryTime: "2024-12-18T11:22:41",
    exitOrderId: 6301600923,
    exitPrice: 22275.0,
    exitQty: 1,
    exitTime: "2024-12-18T11:25:20",
    id: "aa01e928-8743-4a19-8d35-a238736bd351",
    mistakes: [],
    pnl: 11.75,
    pointsLost: 11.75,
    riskPoints: 10.25,
    side: "Buy",
    symbol: "NQH5"
  },
  {
    entryPrice: 21817.5,
    entryQty: 2,
    entryTime: "2024-12-18T15:23:03",
    exitOrderId: 6301600969,
    exitPrice: 21778.25,
    exitQty: 2,
    exitTime: "2024-12-18T15:25:28",
    id: "f3af7cd7-a360-47a2-8268-fd9d997ccef4",
    mistakes: ["outsized loss", "excessive risk"],
    pnl: -78.5,
    pointsLost: 39.25,
    riskPoints: 39.0,
    side: "Buy",
    symbol: "MNQH5"
  },
  // 50 more example trades
  ...Array.from({ length: 50 }, (_, i) => {
    const baseTime = new Date("2024-12-18T16:00:00").getTime();
    const exitTime = new Date(baseTime + i * 60000).toISOString().replace(/\.\d+Z$/, "");
    return {
      entryPrice: 22000 + i,
      entryQty: (i % 3) + 1,
      entryTime: new Date(baseTime + i * 60000 - 120000).toISOString().replace(/\.\d+Z$/, ""),
      exitOrderId: 6301601000 + i,
      exitPrice: 22010 + i,
      exitQty: (i % 3) + 1,
      exitTime,
      id: `example-trade-${i}`,
      mistakes: i % 4 === 0 ? ["excessive risk"] : [],
      pnl: (i % 2 === 0 ? 1 : -1) * (10 + i),
      pointsLost: i,
      riskPoints: 10 + (i % 5),
      side: i % 2 === 0 ? "Buy" : "Sell",
      symbol: i % 2 === 0 ? "NQH5" : "MNQH5"
    };
  })
];

// Replace the sample loss consistency data with the new, larger data set
const lossConsistencyData = {
    count: 235,
    diagnostic: "You had 235 trades with losses that exceeded 1.0 standard deviation above your average losing trade. These outliers contributed 527.97 points in excess losses, meaning that if they'd been closer to your average, your total drawdown would have been significantly lower. A few large losses can erase weeks of gains. Controlling these outliers is critical for long-term performance.",
    excessLossPoints: 527.97,
    losses: [
      {
        "hasMistake": false,
        "lossIndex": 1,
        "pointsLost": 4.0,
        "tradeId": "8b5215b6-8600-47d7-a71b-261a41aafa84"
    },
    {
        "hasMistake": false,
        "lossIndex": 2,
        "pointsLost": 3.25,
        "tradeId": "98e9d34c-5349-4408-ace8-d33fb963717d"
    },
    {
        "hasMistake": false,
        "lossIndex": 3,
        "pointsLost": 2.5,
        "tradeId": "6eda47c3-12c1-448c-89c6-25eaf0cf0869"
    },
    {
        "hasMistake": false,
        "lossIndex": 4,
        "pointsLost": 9.25,
        "tradeId": "71ab3069-44ed-42bd-865b-e0f66ad0df57"
    },
    {
        "hasMistake": false,
        "lossIndex": 5,
        "pointsLost": 7.5,
        "tradeId": "00bf9a08-adb6-4110-96de-ba509f1adc2f"
    },
    {
        "hasMistake": false,
        "lossIndex": 6,
        "pointsLost": 7.75,
        "tradeId": "f51a1e53-a118-456c-8190-c909825967eb"
    },
    {
        "hasMistake": false,
        "lossIndex": 7,
        "pointsLost": 7.0,
        "tradeId": "e31faf4e-901a-4a13-8ce9-e9e95c920c82"
    },
    {
        "hasMistake": false,
        "lossIndex": 8,
        "pointsLost": 4.0,
        "tradeId": "4d4226f6-2251-4728-bddf-53eebfeb3553"
    },
    {
        "hasMistake": false,
        "lossIndex": 9,
        "pointsLost": 7.56,
        "tradeId": "fd6c9b5c-c2f1-4780-a50b-ba7145b9a988"
    },
    {
        "hasMistake": false,
        "lossIndex": 10,
        "pointsLost": 3.25,
        "tradeId": "152ac290-ad3e-4d81-9e23-798d5021a384"
    },
    {
        "hasMistake": false,
        "lossIndex": 11,
        "pointsLost": 4.5,
        "tradeId": "e3b0b481-dbd0-41ad-8f60-50af2f316dab"
    },
    {
        "hasMistake": false,
        "lossIndex": 12,
        "pointsLost": 6.25,
        "tradeId": "f46bfb15-4940-4f5f-b12e-2b04e79f5c11"
    },
    {
        "hasMistake": false,
        "lossIndex": 13,
        "pointsLost": 1.25,
        "tradeId": "467bf651-8369-43ac-a87f-9a6902f24cc9"
    },
    {
        "hasMistake": false,
        "lossIndex": 14,
        "pointsLost": 4.25,
        "tradeId": "ccdb957e-67f7-490e-8e04-856be94cf233"
    },
    {
        "hasMistake": false,
        "lossIndex": 15,
        "pointsLost": 3.5,
        "tradeId": "317b0001-c93e-42b1-832e-0aa0e781354d"
    },
    {
        "hasMistake": false,
        "lossIndex": 16,
        "pointsLost": 0.75,
        "tradeId": "4678df18-18f4-407b-8365-74522abce561"
    },
    {
        "hasMistake": false,
        "lossIndex": 17,
        "pointsLost": 18.75,
        "tradeId": "5144753a-249a-47a3-a60e-0a08915601de"
    },
    {
        "hasMistake": false,
        "lossIndex": 18,
        "pointsLost": 20.25,
        "tradeId": "e61dfbe6-54f8-4a38-9e24-15f9f3f94a9e"
    },
    {
        "hasMistake": false,
        "lossIndex": 19,
        "pointsLost": 7.0,
        "tradeId": "8eefc8b3-cffb-4813-8334-cdaf0bd0e17f"
    },
    {
        "hasMistake": false,
        "lossIndex": 20,
        "pointsLost": 9.5,
        "tradeId": "ff2f305b-0cd8-46bd-8f3b-8bfebb53e3e7"
    },
    {
        "hasMistake": false,
        "lossIndex": 21,
        "pointsLost": 11.5,
        "tradeId": "f6f7f529-ea68-43d7-a557-8069cf40306c"
    },
    {
        "hasMistake": false,
        "lossIndex": 22,
        "pointsLost": 4.25,
        "tradeId": "fa6cc3f0-2af2-4282-8877-3bdb9dbeb7a3"
    },
    {
        "hasMistake": false,
        "lossIndex": 23,
        "pointsLost": 3.0,
        "tradeId": "f1110f67-d29f-4a04-a66a-10127ad3f67a"
    },
    {
        "hasMistake": false,
        "lossIndex": 24,
        "pointsLost": 5.0,
        "tradeId": "21cf125c-5927-43d9-8c89-9aa180c33f22"
    },
    {
        "hasMistake": false,
        "lossIndex": 25,
        "pointsLost": 5.0,
        "tradeId": "19ed8c9b-a5b1-488f-a069-df8c6418b76f"
    },
    {
        "hasMistake": false,
        "lossIndex": 26,
        "pointsLost": 3.25,
        "tradeId": "733eab92-5ea1-4b36-9f13-461182b7e61b"
    },
    {
        "hasMistake": false,
        "lossIndex": 27,
        "pointsLost": 1.25,
        "tradeId": "b2b9f7e8-6236-487c-bfdc-f7512457b06d"
    },
    {
        "hasMistake": false,
        "lossIndex": 28,
        "pointsLost": 0.5,
        "tradeId": "e7496e21-0eb2-4376-8358-bde88e3f898c"
    },
    {
        "hasMistake": false,
        "lossIndex": 29,
        "pointsLost": 6.0,
        "tradeId": "581a97ef-a8db-4cab-9470-158d37029e67"
    },
    {
        "hasMistake": false,
        "lossIndex": 30,
        "pointsLost": 10.0,
        "tradeId": "b95c994f-1696-4caa-9555-133f86a0f1a5"
    },
    {
        "hasMistake": false,
        "lossIndex": 31,
        "pointsLost": 6.5,
        "tradeId": "cd934537-fc2f-4376-ab29-41622b746aab"
    },
    {
        "hasMistake": false,
        "lossIndex": 32,
        "pointsLost": 5.0,
        "tradeId": "1624faf7-9147-48ae-89a7-43cc5cdf22d9"
    },
    {
        "hasMistake": false,
        "lossIndex": 33,
        "pointsLost": 8.75,
        "tradeId": "2957acf6-dc08-4246-90da-fc8198c0b6af"
    },
    {
        "hasMistake": false,
        "lossIndex": 34,
        "pointsLost": 4.25,
        "tradeId": "aa190fdf-7909-4130-852f-f796640bab6b"
    },
    {
        "hasMistake": false,
        "lossIndex": 35,
        "pointsLost": 8.25,
        "tradeId": "3e2f13b6-990e-4829-9fbf-45807fe8d1ae"
    },
    {
        "hasMistake": false,
        "lossIndex": 36,
        "pointsLost": 0.5,
        "tradeId": "7c8f9b87-1a52-42c4-beee-0af1a851ff38"
    },
    {
        "hasMistake": false,
        "lossIndex": 37,
        "pointsLost": 7.0,
        "tradeId": "03328751-2bc0-410a-bab8-5dca5134dfb1"
    },
    {
        "hasMistake": false,
        "lossIndex": 38,
        "pointsLost": 7.5,
        "tradeId": "59c95965-c6bf-4caa-8c9e-d029799b3c5f"
    },
    {
        "hasMistake": false,
        "lossIndex": 39,
        "pointsLost": 8.0,
        "tradeId": "6f04a712-2419-44b1-a7ee-e340c92dae7d"
    },
    {
        "hasMistake": false,
        "lossIndex": 40,
        "pointsLost": 7.0,
        "tradeId": "6c29e7be-87ce-4b97-961b-2e43cbf29331"
    },
    {
        "hasMistake": false,
        "lossIndex": 41,
        "pointsLost": 5.25,
        "tradeId": "5dc498f1-930a-470b-8fbe-c5862f2be625"
    },
    {
        "hasMistake": false,
        "lossIndex": 42,
        "pointsLost": 10.25,
        "tradeId": "ee7691a4-6b6c-445a-b892-3dd40bb34536"
    },
    {
        "hasMistake": false,
        "lossIndex": 43,
        "pointsLost": 6.5,
        "tradeId": "6d916697-15d6-453c-86b8-83891c6e0c30"
    },
    {
        "hasMistake": false,
        "lossIndex": 44,
        "pointsLost": 6.0,
        "tradeId": "ecea07a1-d266-467a-9714-7a90ed01d8cc"
    },
    {
        "hasMistake": false,
        "lossIndex": 45,
        "pointsLost": 7.0,
        "tradeId": "5922ab35-2dfd-4cb9-bcee-2ff53bed2d45"
    },
    {
        "hasMistake": false,
        "lossIndex": 46,
        "pointsLost": 9.25,
        "tradeId": "d55160e4-fa8f-43d3-a2a0-ca6dca58bc4d"
    },
    {
        "hasMistake": false,
        "lossIndex": 47,
        "pointsLost": 7.0,
        "tradeId": "01199ad9-b701-49a7-8a6f-2fa926f14128"
    }
    ],
    meanPointsLost: 10.93,
    percentage: 4.4,
    sigmaUsed: 1.0,
    stdDevPointsLost: 10.7,
    symbolFiltered: null,
    thresholdPointsLost: 21.63
};

export const Body: FC<BodyProps> = ({ children, insightsExpanded, setInsightsExpanded }) => {
  const summary = insightsData.find(i => i.priority === 0);
  const rest = insightsData.filter(i => i.priority !== 0).sort((a, b) => a.priority - b.priority);

  // Live summary data from backend
  const { data: summaryData } = useSummary();
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
        <LossConsistencyChart losses={lossConsistencyData.losses} />
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