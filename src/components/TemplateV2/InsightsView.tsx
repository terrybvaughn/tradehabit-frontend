import type { FC } from "react";
import { useInsights } from "@/api/hooks";
import { useAnalysisStatus } from "@/AnalysisStatusContext";
import styles from "./TemplateV2.module.css";

export const InsightsView: FC = () => {
  const { ready } = useAnalysisStatus();
  const { data: insightsData = [] } = useInsights(ready);

  const summary = insightsData.find(i => i.priority === 0);
  const additionalInsights = insightsData
    .filter(i => i.priority !== 0)
    .sort((a, b) => a.priority - b.priority);

  // Reuse clickable link logic from Body.tsx (simplified - no expand functionality)
  const handleExpandInsights = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // No-op since we're always showing all content
  };

  // Render summary with clickable links (reuse existing logic)
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
    <div className={styles.insightsSection}>
      <h2 className={styles.insightsHeading}>Insights</h2>
      <div className={styles.insightsSummary}>
        <div className={styles.insightDiagnostic}>
          {summaryJsx}
        </div>
        <div className={styles.insightsDetails}>
          {additionalInsights.map(insight => (
            <div key={insight.priority} className={styles.insightDetail}>
              <h3 className={styles.insightTitle}>{insight.title}</h3>
              <p className={styles.insightDiagnostic}>{insight.diagnostic}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
