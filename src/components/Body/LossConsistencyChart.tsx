import { type FC, useRef, useState, useEffect } from "react";
import styles from "./Body.module.css";

interface Loss {
  hasMistake: boolean;
  lossIndex: number;
  pointsLost: number;
  tradeId: string;
  side?: string;
  exitQty?: number;
  symbol?: string;
  entryTime?: string;
  exitOrderId?: number;
}

interface LossConsistencyChartProps {
  losses: Loss[];
  mean?: number;
  std?: number;
  maxLosses?: number;
}

function niceFloor(val: number) {
  // Rounds down to nearest 1, 5, 10, 25, 50, 100, etc.
  if (val === 0) return 0;
  const pow = Math.floor(Math.log10(Math.abs(val)));
  const base = Math.pow(10, pow);
  if (val / base < 2) return Math.floor(val / (base / 2)) * (base / 2);
  return Math.floor(val / base) * base;
}
function niceCeil(val: number) {
  if (val === 0) return 0;
  const pow = Math.floor(Math.log10(Math.abs(val)));
  const base = Math.pow(10, pow);
  if (val / base < 2) return Math.ceil(val / (base / 2)) * (base / 2);
  return Math.ceil(val / base) * base;
}

export const LossConsistencyChart: FC<LossConsistencyChartProps> = ({ losses, mean: meanProp, std: stdProp, maxLosses = 235 }) => {
  // Limit to maxLosses and sort by lossIndex
  const sorted = [...losses]
    .sort((a, b) => a.lossIndex - b.lossIndex)
    .slice(0, maxLosses);
  const n = sorted.length;
  const values = sorted.map(t => t.pointsLost);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const yMinRaw = minVal - 0.25 * Math.abs(maxVal - minVal);
  const yMaxRaw = maxVal + 0.1 * Math.abs(maxVal);
  const yMin = Math.max(0, niceFloor(yMinRaw));
  const yMax = niceCeil(yMaxRaw);
  const yRange = yMax - yMin;

  // X-axis ticks: always increment by 10 or less
  let xTickStep = Math.max(1, Math.ceil(n / 10));
  if (n > 50) xTickStep = 10;
  const xTicks = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 || (i + 1) % xTickStep === 0 || i === n - 1) {
      xTicks.push(i);
    }
  }

  // Chart dimensions
  // If more than 80 trades, make chart scrollable horizontally
  const minChartPx = 680 - 24;
  const pxPerTrade = 16;
  const width = Math.max(minChartPx, n * pxPerTrade + 60); // 60 for left/rightPad
  const height = 280;
  const leftPad = 60;
  const rightPad = 20;
  const topPad = 20;
  const bottomPad = 38; // increase for x-axis label
  const chartW = width - leftPad - rightPad;
  const chartH = height - topPad - bottomPad;
  const plotW = chartW + rightPad;

  // Add margin so first/last dots are inside the chart area
  const dotPad = 16;
  const dotShift = -4; // px left shift to balance right margin

  // Map data to SVG coords
  const x = (i: number) => dotPad + ((plotW - 2 * dotPad) * i) / (n - 1 || 1) + dotShift;
  const y = (v: number) => topPad + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  // Y-axis ticks
  const numTicks = 5;
  const ticks = Array.from({ length: numTicks }, (_, i) => yMin + (i * yRange) / (numTicks - 1));

  // Colors
  const blue = "#0077b6";
  const mistakePink = "#FF53D7";
  const cleanWhite = "#FFFFFF";
  const band = "rgba(0,119,182,0.10)";
  const bg = "#121417";
  const border = "#3D4A52";

  // Use provided mean and standard deviation if available
  const mean = meanProp ?? 0;
  const std = stdProp ?? 0;

  const svgRef = useRef<SVGSVGElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Hover & tooltip state
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState<number | null>(null);
  const hoverTimer = useRef<number | null>(null);

  // Clear hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current !== null) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, []);

  // Dismiss pinned tooltip on document click or scroll
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const targetNode = e.target as Node;
      if (
        (svgRef.current && svgRef.current.contains(targetNode)) ||
        (tooltipRef.current && tooltipRef.current.contains(targetNode))
      ) {
        return; // clicked inside chart or tooltip; ignore
      }
      setPinnedIdx(null);
      setTooltipIdx(null);
    };
    const handleScroll = () => {
      setPinnedIdx(null);
      setTooltipIdx(null);
    };
    document.addEventListener("click", handleDocClick);
    scrollAreaRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("click", handleDocClick);
      scrollAreaRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const showTooltipIdx = pinnedIdx ?? tooltipIdx;

  function formatDateTime(dt?: string) {
    return dt ? dt.replace("T", " ").slice(0, 19) : "";
  }

  return (
    <div className={styles.lossChartContainer} style={{ position: "relative" }}>
      <div style={{ display: "flex", position: "relative", height: height }}>
        {/* Fixed left section */}
        <div style={{ flex: "0 0 auto", width: leftPad, position: "relative" }}>
          <svg width={leftPad} height={height} style={{ overflow: "visible" }}>
            {/* Y-axis labels (no tick marks) */}
            {ticks.map((tick, i) => (
              <g key={i}>
                <text
                  x={leftPad - 12}
                  y={y(tick) + 4}
                  textAnchor="end"
                  fontSize={13}
                  fill="#A9B4BC"
                  fontFamily="Roboto, monospace"
                >
                  {tick.toFixed(0)}
                </text>
              </g>
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
            {/* Vertical 'Loss' label */}
            <text
              x={18}
              y={topPad + chartH / 2}
              textAnchor="middle"
              fontSize={15}
              fill="#A9B4BC"
              fontFamily="Roboto, monospace"
              transform={`rotate(-90 18,${topPad + chartH / 2})`}
            >
              Loss Value
            </text>
          </svg>
        </div>

        {/* Scrollable chart area */}
        <div
          ref={scrollAreaRef}
          style={{
            flex: "1 1 auto",
            overflowX: "auto",
            overflowY: "visible",
            position: "relative",
            paddingRight: "30px",
          }}
        >
          <div style={{ width: chartW + rightPad, height: height, position: "relative" }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartW + rightPad} ${height}`}
              width={chartW + rightPad}
              height={height}
              style={{ display: "block" }}
              preserveAspectRatio="none"
            >
              {/* Chart area background (no rounded corners) */}
              <rect x={0} y={topPad} width={plotW} height={chartH} fill={bg} />
              {/* Standard deviation band: ±1 std dev */}
              <rect
                x={0}
                y={y(mean + std)}
                width={plotW}
                height={y(mean - std) - y(mean + std)}
                fill={band}
              />
              {/* Mean dashed line */}
              <line
                x1={0}
                x2={plotW}
                y1={y(mean)}
                y2={y(mean)}
                stroke={blue}
                strokeWidth={1}
                strokeDasharray="8 6"
              />
              {/* X-axis line */}
              <line
                x1={0}
                x2={plotW}
                y1={topPad + chartH}
                y2={topPad + chartH}
                stroke={border}
                strokeWidth={1.5}
              />
              {/* Dots */}
              {sorted.map((t, i) => {
                const active = i === hoverIdx || i === pinnedIdx;
                return (
                  <circle
                    key={i}
                    cx={x(i)}
                    cy={y(t.pointsLost)}
                    r={active ? 6 : 4}
                    fill={t.hasMistake ? mistakePink : cleanWhite}
                    style={{ transition: "r 0.15s ease, transform 0.15s ease" }}
                    onMouseEnter={() => {
                      setHoverIdx(i);
                      if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
                      hoverTimer.current = window.setTimeout(() => {
                        setTooltipIdx(i);
                      }, 800);
                    }}
                    onMouseLeave={() => {
                      setHoverIdx((prev) => (prev === i ? null : prev));
                      if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
                      if (pinnedIdx !== i) setTooltipIdx(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPinnedIdx(i);
                      setTooltipIdx(i);
                    }}
                  />
                );
              })}
            </svg>
            {showTooltipIdx != null && (() => {
              const loss = sorted[showTooltipIdx];
              const left = x(showTooltipIdx);
              const top = y(loss.pointsLost);
              const placeBelow = (top - topPad) < chartH * 0.55;
              const translateY = placeBelow ? "10px" : "-10px";

              // Horizontal edge handling
              const edgePad = 90; // px threshold from sides
              let translateX = "-50%";
              if (left < edgePad) {
                translateX = "0"; // align left edge of tooltip with dot
              } else if (left > plotW - edgePad) {
                translateX = "-100%"; // align right edge
              }

              const translate = placeBelow
                ? `translate(${translateX}, ${translateY})`
                : `translate(${translateX}, -100%) translateY(${translateY})`;
              return (
                <div
                  ref={tooltipRef}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    transform: translate,
                    background: "#FFFFFF",
                    color: "#121417",
                    borderRadius: 6,
                    padding: "8px 10px",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className={styles.lossTooltipLine}>
                    {loss.side ?? ""} • {loss.exitQty ?? ""} • {loss.symbol ?? ""}
                  </div>
                  <div className={styles.lossTooltipLine} style={{ marginBottom: "6px",}}>
                    {formatDateTime(loss.entryTime)}
                  </div>
                  <div className={styles.lossTooltipLine} style={{ marginBottom: "6px", fontWeight: 500 }}>
                    Points Lost: {loss.pointsLost}
                  </div>
                  <div className={styles.lossTooltipLine}>
                    Exit Order ID: {" "}
                    <a
                      href="#"
                      style={{ color: "#0077b6", textDecoration: "underline" }}
                      onClick={(e) => {
                        e.preventDefault();
                        window.dispatchEvent(
                          new CustomEvent("scrollToTrade", { detail: { tradeId: loss.tradeId } })
                        );
                      }}
                    >
                      {loss.exitOrderId}
                    </a>
                  </div>
                </div>
              );
            })()}
            {/* X-axis tick labels as HTML, aligned with chart area */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: height - 38 + 10,
                width: chartW + rightPad,
                height: 20,
                pointerEvents: "none",
              }}
            >
              {xTicks.map((i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: x(i),
                    transform: "translateX(-50%)",
                    fontSize: 13,
                    color: "#A9B4BC",
                    fontFamily: "Roboto, monospace",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Stationary Losing Trades label */}
      <div
        style={{
          textAlign: "center",
          fontSize: 15,
          color: "#A9B4BC",
          fontFamily: "Roboto, monospace",
          fontWeight: 400,
          marginBottom: "0.7em",
        }}
      >
        Losing Trades
      </div>
    </div>
  );
}; 