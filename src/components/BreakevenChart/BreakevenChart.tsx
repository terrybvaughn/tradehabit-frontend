import type { FC } from "react";
import styles from "./BreakevenChart.module.css";

interface BreakevenChartProps {
  /** Win rate as 0..1 (e.g., 0.49 for 49%) */
  winRate: number;
  /** Payoff ratio = avg win / avg loss (e.g., 1.23) */
  payoffRatio: number;
  /** Max Y to show (typical range 2.0–3.0). Defaults to 3.0 */
  yMax?: number;
  /** Optional title shown above the chart */
  title?: string;
}

export const BreakevenChart: FC<BreakevenChartProps> = ({ winRate, payoffRatio, yMax }) => {
  // Chart dimensions (fixed, like DispersionChart)
  const width = 648;
  const height = 200;
  const leftPad = 60;
  const rightPad = 20;
  const topPad = 20;
  const bottomPad = 28;
  const chartW = width - leftPad - rightPad;
  const chartH = height - topPad - bottomPad;

  // Calculate dynamic yMax if not provided (user's payoff ratio * 2, minimum 3.0)
  const maxY = yMax ?? Math.max(3.0, payoffRatio * 2);

  // Colors
  const mistakePink = "#FF53D7";
  const linkGreen = "#5FCB3A";
  const cleanWhite = "#FFFFFF";
  const border = "#3D4A52";

  // Scales
  const x = (w: number) => w * chartW;                      // w in [0,1] -> chart coords
  const y = (r: number) => topPad + (1 - r / maxY) * chartH; // r in [0,maxY] -> chart coords

  // Breakeven curve: R = (1 - W) / W
  const x0 = 1 / (1 + maxY); // where curve hits top (R = maxY)
  const curvePoints: Array<{ x: number; y: number }> = [];

  // Generate points from x0 to near 1.0
  for (let w = x0; w <= 0.995; w += 0.01) {
    const r = (1 - w) / w;
    if (r >= 0 && r <= maxY) {
      curvePoints.push({ x: x(w), y: y(r) });
    }
  }

  // Build path for the curve
  const curvePath = curvePoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
  ).join(' ');

  // Regions
  // Above breakeven curve = positive expectancy (green)
  const profitPoly = [
    ...curvePoints.map(p => `${p.x},${p.y}`),
    `${x(1)},${y(0)}`,            // Bottom right
    `${x(1)},${topPad}`,          // Top right corner
    `${x(x0)},${topPad}`,         // Top left at x0
  ].join(" ");

  // Below breakeven curve = negative expectancy (pink)
  const lossPoly = [
    `${x(0)},${y(0)}`,            // Bottom left (origin)
    `${x(0)},${topPad}`,          // Top left
    `${x(x0)},${topPad}`,         // Top edge at x0
    ...curvePoints.map(p => `${p.x},${p.y}`),
    `${x(1)},${y(0)}`,            // Bottom right
  ].join(" ");

  // Ticks
  const xTicks = [0, 0.25, 0.5, 0.75, 1];
  const yTicks = Array.from({ length: Math.floor(maxY) + 1 }, (_, i) => i).filter(v => v <= maxY);

  // User marker
  const dot = { cx: x(winRate), cy: y(Math.min(payoffRatio, maxY)) };

  // Calculate required payoff ratio to break even at current win rate
  const requiredPayoffRatio = (1 - winRate) / winRate;

  // Calculate required win rate to break even at current payoff ratio
  const requiredWinRate = 1 / (1 + payoffRatio);

  // Calculate expectancy to determine dot color
  // Expectancy = (Win Rate * Payoff Ratio) - (1 - Win Rate)
  // If > 1: profitable (green), if = 1: breakeven (white), if < 1: unprofitable (pink)
  const expectancy = (winRate * payoffRatio) - (1 - winRate); // positive => profitable
  let dotColor = cleanWhite; // default
  if (expectancy > 0) dotColor = linkGreen;
  else if (expectancy < 0) dotColor = mistakePink;

  return (
    <div className={styles.chartContainer} style={{ position: "relative" }}>
      <div style={{ display: "flex", position: "relative", height: height }}>
        {/* Fixed left section for Y-axis */}
        <div style={{ flex: "0 0 auto", width: leftPad, position: "relative" }}>
          <svg width={leftPad} height={height} style={{ overflow: "visible" }}>
            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
              <text
                key={i}
                x={leftPad - 12}
                y={y(tick) + 4}
                textAnchor="end"
                fontSize={13}
                fill="#A9B4BC"
                fontFamily="Roboto, monospace"
              >
                {tick.toFixed(1)}
              </text>
            ))}
            {/* Y-axis vertical line */}
            <line
              x1={leftPad}
              x2={leftPad}
              y1={topPad}
              y2={topPad + chartH}
              stroke={border}
              strokeWidth={1.5}
            />
            {/* Vertical Y-axis label */}
            <text
              x={18}
              y={topPad + chartH / 2}
              textAnchor="middle"
              fontSize={15}
              fill="#A9B4BC"
              fontFamily="Roboto, monospace"
              transform={`rotate(-90 18,${topPad + chartH / 2})`}
            >
              Payoff Ratio
            </text>
          </svg>
        </div>

        {/* Chart area */}
        <div
          style={{
            flex: "1 1 auto",
            overflowX: "visible",
            overflowY: "visible",
            position: "relative",
          }}
        >
          <div style={{ width: chartW + rightPad, height: height, position: "relative" }}>
            <svg
              className={styles.chartSvg}
              viewBox={`0 0 ${chartW + rightPad} ${height}`}
              width={chartW + rightPad}
              height={height}
              style={{ display: "block" }}
              preserveAspectRatio="none"
            >
              {/* Shaded regions */}
              <polygon className={styles.lossRegion} points={lossPoly} />
              <polygon className={styles.profitRegion} points={profitPoly} />

              {/* Breakeven curve */}
              <path className={styles.breakevenLine} d={curvePath} fill="none" />

              {/* X-axis line */}
              <line
                x1={0}
                x2={chartW + rightPad - 20}
                y1={y(0)}
                y2={y(0)}
                stroke={border}
                strokeWidth={1.5}
              />

              {/* Horizontal line showing required payoff ratio for breakeven */}
              <line
                x1={0}
                x2={dot.cx}
                y1={y(Math.min(requiredPayoffRatio, maxY))}
                y2={y(Math.min(requiredPayoffRatio, maxY))}
                stroke={linkGreen}
                strokeWidth={1}
              />

              {/* Vertical line showing required win rate for breakeven up to current payoff ratio */}
              <line
                x1={x(Math.max(0, Math.min(1, requiredWinRate)))}
                x2={x(Math.max(0, Math.min(1, requiredWinRate)))}
                y1={y(0)}
                y2={y(Math.min(payoffRatio, maxY))}
                stroke={linkGreen}
                strokeWidth={1}
              />

              {/* User point - colored dot based on expectancy */}
              <circle 
                cx={dot.cx} 
                cy={dot.cy} 
                r={5} 
                fill={dotColor}
              >
                <title>{`Win Rate: ${(winRate * 100).toFixed(1)}%\nPayoff Ratio: ${payoffRatio.toFixed(2)}\nExpectancy: ${expectancy.toFixed(3)}`}</title>
              </circle>
            </svg>

            {/* X-axis tick labels */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: height - bottomPad + 10,
                width: chartW + rightPad,
                height: 20,
                pointerEvents: "none",
              }}
            >
              {xTicks.map((t) => (
                <span
                  key={t}
                  style={{
                    position: "absolute",
                    left: x(t),
                    transform: "translateX(-50%)",
                    fontSize: 13,
                    color: "#A9B4BC",
                    fontFamily: "Roboto, monospace",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {Math.round(t * 100)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* X-axis label */}
      <div
        style={{
          textAlign: "center",
          fontSize: 15,
          color: "#A9B4BC",
          fontFamily: "Roboto, monospace",
          fontWeight: 400,
          marginTop: "10px",
          marginBottom: "4px",
        }}
      >
        Win Rate
      </div>
    </div>
  );
};

export default BreakevenChart;
