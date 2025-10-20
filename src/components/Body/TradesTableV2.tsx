import { type FC, useState, useEffect, useRef } from "react";
import styles from "../TemplateV2/TemplateV2.module.css";
import iconCalendar from "@/assets/images/icon-calendar.svg";
import iconChevronRight from "@/assets/images/Icon-chevron-right.png";
import iconCleanCheck from "@/assets/images/icon-clean-check.svg";
import iconAlertCircle from "@/assets/images/icon-alert-circle-PINK.svg";
import React from "react";

interface Trade {
  entryPrice: number;
  entryQty: number;
  entryTime: string;
  exitOrderId: number;
  exitPrice: number;
  exitQty: number;
  exitTime: string;
  id: string;
  mistakes: string[];
  pnl: number;
  pointsLost: number;
  riskPoints: number;
  side: string;
  symbol: string;
}

interface TradesTableProps {
  trades: Trade[];
}

function formatDateRange(trades: Trade[]): string {
  if (!trades.length) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sorted = [...trades].sort((a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime());
  const first = new Date(sorted[0].exitTime);
  const last = new Date(sorted[sorted.length - 1].exitTime);
  if (first.getFullYear() === last.getFullYear()) {
    if (first.getMonth() === last.getMonth()) {
      return `${months[first.getMonth()]} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
    } else {
      return `${months[first.getMonth()]} ${first.getDate()} – ${months[last.getMonth()]} ${last.getDate()}, ${first.getFullYear()}`;
    }
  } else {
    return `${months[first.getMonth()]} ${first.getDate()}, ${first.getFullYear()} – ${months[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
  }
}

function formatDateTime(dt: string): string {
  return dt.replace("T", " ").slice(0, 19);
}

export const TradesTableV2: FC<TradesTableProps> = ({ trades }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const tableOuterRef = useRef<HTMLDivElement>(null);

  // Listen for scrollToTrade event from LossConsistencyChart
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ tradeId: string }>;
      const tradeId = custom.detail?.tradeId;
      if (!tradeId) return;

      setExpandedRows((prev) => {
        const next = new Set(prev);
        next.add(tradeId);
        return next;
      });

      // Scroll to the row within the table container after a small delay to ensure the row is rendered
      setTimeout(() => {
        const tableContainer = tableOuterRef.current;
        const rowEl = tableContainer?.querySelector(`tr[data-trade-id="${tradeId}"]`) as HTMLTableRowElement;
        if (tableContainer && rowEl) {
          const rowRect = rowEl.getBoundingClientRect();
          const containerHeight = tableContainer.clientHeight;
          
          // Calculate the scroll position to center the row in the container
          const targetScrollTop = rowEl.offsetTop - (containerHeight / 2) + (rowRect.height / 2);
          
          tableContainer.scrollTo({
            top: targetScrollTop,
            behavior: "smooth"
          });
        }
      }, 50);
    };
    window.addEventListener("scrollToTrade", handler);
    return () => window.removeEventListener("scrollToTrade", handler);
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <div className={styles.tradesHeaderRow}>
        <h3 className={styles.tradesHeading}>Trades</h3>
        <div className={styles.tradesDateRange}>
          <img src={iconCalendar} alt="calendar" className={styles.tradesCalendarIcon} />
          <span>{formatDateRange(trades)}</span>
        </div>
      </div>
      <div className={styles.tradesContainer}>
        <div className={styles.tradesTableOuter} ref={tableOuterRef}>
          <table className={styles.tradesTable}>
            <tbody>
              {trades.map((trade, i) => {
                const expanded = expandedRows.has(trade.id);
                const rowClass = i % 2 === 0 ? styles.tradesRowEven : styles.tradesRowOdd;
                return (
                  <React.Fragment key={trade.id}>
                    <tr className={rowClass} data-trade-id={trade.id}>
                      <td
                        className={styles.tradesChevronCol}
                        onClick={() => toggleRow(trade.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={iconChevronRight}
                          alt="chevron"
                          className={styles.tradesChevronIcon}
                          style={{
                            width: 8,
                            height: 14,
                            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </td>
                      <td
                        className={styles.tradesContentCol}
                        onClick={() => toggleRow(trade.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles.tradesContentMain}>
                          {trade.side} • {trade.exitQty} • {trade.symbol}
                        </div>
                      </td>
                      <td
                        className={styles.tradesTimeCol}
                        onClick={() => toggleRow(trade.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles.tradesDataHeader}>Entry Time</div>
                        <div className={styles.tradesDataValue}>{formatDateTime(trade.entryTime)}</div>
                      </td>
                      <td
                        className={styles.tradesPriceCol}
                        onClick={() => toggleRow(trade.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles.tradesDataHeader}>Entry Price</div>
                        <div className={styles.tradesDataValue}>{trade.entryPrice}</div>
                      </td>
                      <td
                        className={styles.tradesRiskCol}
                        onClick={() => toggleRow(trade.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles.tradesDataHeader}>Risk / Unit</div>
                        <div className={styles.tradesDataValue}>
                          {trade.riskPoints && trade.riskPoints > 0 ? trade.riskPoints : '∞'}
                        </div>
                      </td>
                      <td
                        className={styles.tradesStatusCol}
                        onClick={() => toggleRow(trade.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={trade.mistakes.length === 0 ? iconCleanCheck : iconAlertCircle}
                          alt={trade.mistakes.length === 0 ? "clean" : "mistake"}
                          className={styles.tradesStatusIcon}
                        />
                      </td>
                    </tr>
                    {expanded && (
                      <tr className={`${rowClass} ${styles.tradesExpandedRow}`}>
                        <td className={styles.tradesChevronCol}></td>
                        <td className={styles.tradesContentCol}>
                          <div className={styles.tradesDataHeader}>Order ID</div>
                          <div className={styles.tradesDataValue}>{trade.exitOrderId}</div>
                        </td>
                        <td className={styles.tradesTimeCol}>
                          <div className={styles.tradesDataHeader}>Exit Time</div>
                          <div className={styles.tradesDataValue}>{formatDateTime(trade.exitTime)}</div>
                        </td>
                        <td className={styles.tradesPriceCol}>
                          <div className={styles.tradesDataHeader}>Exit Price</div>
                          <div className={styles.tradesDataValue}>{trade.exitPrice}</div>
                        </td>
                        <td className={styles.tradesRiskCol}>
                          <div className={styles.tradesDataHeader}>Profit / Unit</div>
                          <div className={styles.tradesDataValue}>{trade.pnl < 0 ? -Math.abs(trade.pointsLost) : trade.pointsLost}</div>
                        </td>
                        <td className={styles.tradesStatusCol}>
                          <div className={styles.tradesDataValue}>
                            {trade.mistakes.length > 0 && trade.mistakes.map((m, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: "block",
                                  color: "#FF53D7",
                                  lineHeight: 1.4,
                                }}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}; 