import { useState } from "react";
import type { FC } from "react";
import { useInsights, useTrades, useLosses, useExcessiveRisk, useSummary } from "@/api/hooks";
import iconChevronRight from "@/assets/images/Icon-chevron-right.png";
import { useAnalysisStatus } from "@/AnalysisStatusContext";
import BinaryEventSeries from "../BinaryTimeSeriesChart/BinaryEventSeriesChart";
import BreakevenChart from "../BreakevenChart/BreakevenChart";
import DispersionChart from "../DispersionChart/DispersionChart";
import styles from "./TemplateV2.module.css";

export const InsightsView: FC = () => {
  const { ready } = useAnalysisStatus();
  const { data: insightsData = [] } = useInsights(ready);
  const { data: tradesDataResp } = useTrades(ready);
  const tradesData = tradesDataResp?.trades ?? [];
  const { data: lossesDataResp } = useLosses(ready);
  const lossesData = lossesDataResp?.losses ?? [];
  const meanLoss = lossesDataResp?.meanPointsLost ?? 0;
  const stdLoss = lossesDataResp?.stdDevPointsLost ?? 0;
  const thresholdLoss = (lossesDataResp as any)?.thresholdPointsLost;
  const sigmaLoss = (lossesDataResp as any)?.sigmaUsed;

  // Excessive risk stats (mean/std/threshold) from API
  const { data: excessiveRiskResp } = useExcessiveRisk(ready);
  const meanRiskApi = excessiveRiskResp?.meanRiskPoints;
  const stdRiskApi = excessiveRiskResp?.stdDevRiskPoints;
  const thresholdRiskApi = excessiveRiskResp?.excessiveRiskThreshold;
  const sigmaRiskApi = (excessiveRiskResp as any)?.sigmaUsed;

  // Get summary data for breakeven chart
  const { data: summaryData } = useSummary(ready);
  const winRate = summaryData?.win_rate ?? 0;
  const payoffRatio = summaryData?.payoff_ratio ?? 0;

  // Build merged losses (primary from /api/losses) and a safe fallback from trades
  const lossesMerged = lossesData.map((loss) => {
    const t = tradesData.find((x) => x.id === loss.tradeId);
    return {
      ...loss,
      // Ensure mistake flag is present even if backend omitted it
      hasMistake: t ? t.mistakes.length > 0 : (loss as any).hasMistake,
      // Use API fields if present, otherwise fallback to trades data
      side: loss.side ?? t?.side,
      exitQty: loss.exitQty ?? t?.exitQty,
      symbol: loss.symbol ?? t?.symbol,
      entryTime: loss.entryTime ?? t?.entryTime,
      exitOrderId: loss.exitOrderId ?? t?.exitOrderId,
    } as any;
  });

  const tradeLosses = tradesData
    .filter((t) => t.pnl < 0)
    .map((t, idx) => ({
      hasMistake: t.mistakes.length > 0,
      lossIndex: idx + 1,
      pointsLost: t.pointsLost,
      tradeId: t.id,
      side: t.side,
      exitQty: t.exitQty,
      symbol: t.symbol,
      entryTime: t.entryTime,
      exitOrderId: t.exitOrderId,
    }));

  const lossesForChart = (lossesMerged.length ? lossesMerged : tradeLosses);

  // Choose mean/std from API when available; otherwise compute from fallback points
  let meanForChart = meanLoss;
  let stdForChart = stdLoss;
  if (!lossesMerged.length && lossesForChart.length) {
    const vals = lossesForChart
      .map((l: any) => l.pointsLost)
      .filter((v: any) => typeof v === "number" && isFinite(v)) as number[];
    if (vals.length) {
      const m = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((a, b) => a + Math.pow(b - m, 2), 0) / vals.length;
      meanForChart = m;
      stdForChart = Math.sqrt(variance);
    }
  }

  // Build risk entries dataset from trades with valid riskPoints
  const riskEntries = tradesData
    .filter((t) => typeof t.riskPoints === "number" && isFinite(t.riskPoints as any))
    .map((t, idx) => ({
      hasMistake: t.mistakes.includes("excessive risk"),
      lossIndex: idx + 1,
      riskPoints: t.riskPoints,
      tradeId: t.id,
      side: (t as any).side,
      exitQty: (t as any).exitQty,
      symbol: (t as any).symbol,
      entryTime: (t as any).entryTime,
      exitOrderId: (t as any).exitOrderId,
    }));

  // Risk stats preference: API first, then compute from entries
  let meanRiskForChart = meanRiskApi ?? 0;
  let stdRiskForChart = stdRiskApi ?? 0;
  if ((meanRiskApi == null || stdRiskApi == null) && riskEntries.length) {
    const rvals = riskEntries
      .map((e: any) => e.riskPoints)
      .filter((v: any) => typeof v === "number" && isFinite(v)) as number[];
    if (rvals.length) {
      const mr = rvals.reduce((a, b) => a + b, 0) / rvals.length;
      const v = rvals.reduce((a, b) => a + Math.pow(b - mr, 2), 0) / rvals.length;
      meanRiskForChart = mr;
      stdRiskForChart = Math.sqrt(v);
    }
  }

  const summary = insightsData.find(i => i.priority === 0);
  const additionalInsightsRaw = insightsData
    .filter(i => i.priority !== 0)
    .sort((a, b) => a.priority - b.priority);

  // Merge "Excessive Risk Sizing" and "Risk Sizing Consistency" into a single
  // "Risk Sizing Analysis" block, keeping the higher (lower number) priority
  const riskExcess = additionalInsightsRaw.find(i => i.title === "Excessive Risk Sizing");
  const riskConsistency = additionalInsightsRaw.find(i => i.title === "Risk Sizing Consistency");

  let additionalInsights = additionalInsightsRaw.filter(
    i => i.title !== "Excessive Risk Sizing" && i.title !== "Risk Sizing Consistency"
  );

  if (riskExcess || riskConsistency) {
    const combinedPriority = Math.min(
      riskExcess?.priority ?? Number.POSITIVE_INFINITY,
      riskConsistency?.priority ?? Number.POSITIVE_INFINITY
    );
    const combinedDiagnostic = [riskExcess?.diagnostic, riskConsistency?.diagnostic]
      .filter(Boolean)
      .join("\n\n");

    additionalInsights.push({
      title: "Risk Sizing Analysis",
      priority: Number.isFinite(combinedPriority) ? combinedPriority : (riskExcess?.priority ?? riskConsistency?.priority ?? 9999),
      diagnostic: combinedDiagnostic,
    } as any);

    additionalInsights = additionalInsights.sort((a, b) => a.priority - b.priority);
  }

  // Reuse clickable link logic from Body.tsx (simplified - no expand functionality)
  const handleExpandInsights = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // No-op since we're always showing all content
  };

  // Render summary with clickable links (reuse existing logic)
  let summaryJsx: React.ReactNode = null;
  if (summary) {
    const linkableTexts = [
      "Risk Sizing Analysis",
      "Stop-Loss Discipline", 
      "Outsized Losses",
      "Revenge Trading",
      "Risk Sizing Consistency",
      "Breakeven Analysis",
    ];

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

  // Track which insight blocks are open
  const [openInsights, setOpenInsights] = useState<Set<number>>(new Set());
  const toggleInsight = (priority: number) =>
    setOpenInsights((prev) => {
      const next = new Set(prev);
      next.has(priority) ? next.delete(priority) : next.add(priority);
      return next;
    });

  return (
    <div className={styles.insightsSection}>
      <h2 className={styles.insightsHeading}>Insights</h2>
      <div className={styles.insightsSummary}>
        <div className={styles.insightDiagnostic}>
          {summaryJsx}
        </div>
        <div className={styles.insightsDetails}>
          {additionalInsights.map(insight => {
            const isOpen = openInsights.has(insight.priority);
            return (
              <div key={insight.priority} className={styles.insightDetail}>
                <h3 
                  className={styles.insightTitle}
                  onClick={() => toggleInsight(insight.priority)}
                  style={{ cursor: "pointer" }}
                >
                  {insight.title}
                </h3>

                {/* Charts (always visible, right below the heading) */}
                {insight.title === "Stop-Loss Discipline" && tradesData.length > 0 && (
                  <BinaryEventSeries
                    trades={tradesData}
                    mistakeType="no stop-loss order"
                    title="Stop-Loss Discipline"
                    description="had a protective stop"
                    streakLabel="trades"
                  />
                )}
                {insight.title === "Revenge Trading" && tradesData.length > 0 && (
                  <BinaryEventSeries
                    trades={tradesData}
                    mistakeType="revenge trade"
                    title="Revenge Trading"
                    description="were not flagged as revenge trades"
                    streakLabel="trades"
                  />
                )}
                {insight.title === "Outsized Losses" && lossesForChart.length > 0 && (
                  <DispersionChart
                    data={lossesForChart.map((l: any) => ({ ...l, value: l.pointsLost }))}
                    mean={meanForChart}
                    std={stdForChart}
                    threshold={thresholdLoss}
                    sigmaUsed={sigmaLoss}
                    yAxisLabel="Loss Value"
                    xAxisLabel="Losing Trades"
                    valueLabel="Points Lost"
                  />
                )}
                {insight.title === "Risk Sizing Analysis" && riskEntries.length > 0 && (
                  <DispersionChart
                    data={riskEntries.map((r: any) => ({ ...r, value: r.riskPoints }))}
                    mean={meanRiskForChart}
                    std={stdRiskForChart}
                    threshold={thresholdRiskApi}
                    sigmaUsed={sigmaRiskApi}
                    yAxisLabel="Risk Value"
                    xAxisLabel="Trades with Stops"
                    valueLabel="Risk / Unit"
                  />
                )}
                {insight.title === "Breakeven Analysis" && winRate > 0 && payoffRatio > 0 && (
                  <BreakevenChart 
                    winRate={winRate}
                    payoffRatio={payoffRatio}
                  />
                )}

                {/* Clickable row with chevron and text container (collapsible) */}
                <div
                  onClick={() => toggleInsight(insight.priority)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.insightTextRow}>
                    <img
                      src={iconChevronRight}
                      alt="toggle"
                      className={styles.insightChevron}
                      style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease"
                      }}
                    />
                    {/* Single container with the actual text, collapsed/expanded */}
                    <div className={`${styles.insightTextContainer} ${isOpen ? styles.textOpen : styles.textClosed}`}>
                      {insight.title === "Risk Sizing Analysis"
                        ? (insight.diagnostic || "")
                            .split(/\n\n+/)
                            .filter(Boolean)
                            .map((para, idx) => (
                              <p key={idx} className={styles.insightPara}>{para}</p>
                            ))
                        : <p className={styles.insightPara}>{insight.diagnostic}</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
