import React, { useRef, useEffect, useState } from "react";
import { type Trade } from "@/api/types";
import styles from "./BinaryEventSeries.module.css";

interface BinaryEventSeriesProps {
  trades: Trade[];
  heightPx?: number;
  labelAreaPx?: number;
  mistakeColor?: string;
  backgroundColor?: string;
  streakColor?: string;
  labelColor?: string;
  fontFamily?: string;
  mistakeType?: string;
  title?: string;
  description?: string;
  streakLabel?: string;
}

export const BinaryEventSeries: React.FC<BinaryEventSeriesProps> = ({
  trades,
  heightPx = 20,
  labelAreaPx = 24,
  mistakeColor = "#FF53D7",
  backgroundColor = "#121417",
  streakColor = "#5FCB3A",
  labelColor = "#A9B4BC",
  fontFamily = "Roboto, monospace",
  mistakeType = "no stop-loss order",
  title = "Stop-Loss Discipline",
  description = "trades had a protective stop",
  streakLabel = "trades"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const N = Math.max(trades.length, 1);
  const viewBoxHeight = heightPx + labelAreaPx;

  // Calculate streak: count consecutive trades without the mistake from the most recent trade
  const streakInfo = (() => {
    let streak = 0;
    const tradesWithoutMistake = trades.map(trade => !trade.mistakes.includes(mistakeType));

    // Count backwards from the most recent trade
    for (let i = tradesWithoutMistake.length - 1; i >= 0; i--) {
      if (tradesWithoutMistake[i]) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  })();

  // Calculate percentage of trades without the mistake
  const tradesWithoutMistake = trades.filter(t => !t.mistakes.includes(mistakeType)).length;
  const percentage = ((tradesWithoutMistake / N) * 100).toFixed(1);

  // Determine if each trade is in the current streak
  const lastTradeWithoutMistake = trades.length > 0 && !trades[trades.length - 1].mistakes.includes(mistakeType);
  const getTradeColor = (tradeIndex: number) => {
    const trade = trades[tradeIndex];
    const hasMistake = trade.mistakes.includes(mistakeType);

    if (hasMistake) {
      return mistakeColor;
    } else if (lastTradeWithoutMistake && tradeIndex >= trades.length - streakInfo) {
      return streakColor;
    } else {
      return backgroundColor;
    }
  };

  // Calculate available width (accounting for padding)
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Account for 14px padding on each side (28px total)
        setContainerWidth(rect.width - 28);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Labels at 0, 25%, 50%, 75%, 100% of trade count (rounded)
  const quartiles = [0, Math.round(N * 0.25), Math.round(N * 0.5), Math.round(N * 0.75), N];

  const textAnchorFor = (x: number) =>
    x === 0 ? "start" : x === N ? "end" : "middle";

  const numberY = heightPx + Math.max(12, labelAreaPx * 0.6);

  return (
    <div className={styles.ribbonContainer} ref={containerRef}>
      {/* Title with stats */}
      <div className={styles.ribbonTitle}>
        <span>{percentage}% of all trades {description}</span>
        <span style={{ color: streakInfo === 0 ? mistakeColor : '#5FCB3A' }}>Current streak: {streakInfo} {streakInfo === 1 ? streakLabel.slice(0, -1) : streakLabel}</span>
      </div>

      <svg
        role="img"
        aria-label={`${title} ribbon. Pink bars mark trades with this issue.`}
        width="100%"
        height={heightPx + labelAreaPx}
        viewBox={`0 0 ${containerWidth || N} ${viewBoxHeight}`}
        style={{ display: "block", background: "transparent" }}
      >
        <desc>
          Horizontal ribbon of trades in chronological order.
          Pink cells represent trades with the issue.
          Labels indicate trade indices; axis label reads 'Trades'.
        </desc>

        {/* Background cells for all trades */}
        {trades.map((trade, i) => {
          const fillColor = getTradeColor(i);

          // Scale the cell width to fill the available space
          const cellWidth = (containerWidth || N) / N;
          const cellX = i * cellWidth;

          const hasMistake = trade.mistakes.includes(mistakeType);
          const tip = [
            `Trade #${i + 1}`,
            trade.entryTime && `Date: ${new Date(trade.entryTime).toLocaleDateString()}`,
            trade.symbol && `Symbol: ${trade.symbol}`,
            typeof trade.pnl === "number" && `PnL: ${trade.pnl}`,
            hasMistake ? `Has ${mistakeType}` : `No ${mistakeType}`
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <rect
              key={i}
              x={cellX}
              y={0}
              width={cellWidth}
              height={heightPx}
              fill={fillColor}
            >
              <title>{tip}</title>
            </rect>
          );
        })}

        {/* Number labels (no ticks) */}
        {quartiles.map((v, idx) => {
          // Scale label position to match the new viewBox width
          const labelX = v * ((containerWidth || N) / N);
          return (
            <text
              key={`lbl-${idx}`}
              x={labelX}
              y={numberY}
              fill={labelColor}
              fontSize={13}
              fontFamily={fontFamily}
              textAnchor={textAnchorFor(v)}
              dominantBaseline="central"
            >
              {v}
            </text>
          );
        })}

      </svg>

      {/* Stationary Trades label - styled like Loss Consistency Chart */}
      <div
        style={{
          textAlign: "center",
          fontSize: 15,
          color: "#A9B4BC",
          fontFamily: "Roboto, monospace",
          fontWeight: 400,
          marginTop: "8px",
        }}
      >
        Trades
      </div>
    </div>
  );
};

export default BinaryEventSeries;

