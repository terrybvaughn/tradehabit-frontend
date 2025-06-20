import { type FC, useState } from "react";
import styles from "./Body.module.css";
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

export const TradesTable: FC<TradesTableProps> = ({ trades }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
        <div className={styles.tradesTableOuter}>
          <table className={styles.tradesTable}>
            <tbody>
              {trades.map((trade, i) => {
                const expanded = expandedRows.has(trade.id);
                const rowClass = i % 2 === 0 ? styles.tradesRowEven : styles.tradesRowOdd;
                return (
                  <React.Fragment key={trade.id}>
                    <tr className={rowClass}>
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
                        <div className={styles.tradesDateTime}>{formatDateTime(trade.entryTime)}</div>
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
                      <tr className={rowClass}>
                        <td className={styles.tradesChevronCol}></td>
                        <td className={styles.tradesDetailsCol} colSpan={2} style={{ padding: "8px 10px 8px 0" }}>
                          <div className={styles.tradesDetailsContainer}>
                            <div className={styles.tradesDetailLine}>
                              <span className={styles.tradesDetailLabel} style={{ fontSize: "14px", fontWeight: 400 }}>Mistakes</span>
                              <span className={styles.tradesDetailValue} style={{ textAlign: "right" }}>
                                {trade.mistakes.length === 0 ? (
                                  "None"
                                ) : (
                                  trade.mistakes.map((m, idx) => (
                                    <span
                                      key={idx}
                                      style={{
                                        display: "block",
                                        fontWeight: 400,
                                        fontSize: "14px",
                                        color: "#FF53D7",
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {m}
                                    </span>
                                  ))
                                )}
                              </span>
                            </div>
                            <div className={styles.tradesDetailLine}>
                              <span className={styles.tradesDetailLabel}>Entry Price</span>
                              <span className={styles.tradesDetailValue}>{trade.entryPrice}</span>
                            </div>
                            <div className={styles.tradesDetailLine}>
                              <span className={styles.tradesDetailLabel}>Exit Price</span>
                              <span className={styles.tradesDetailValue}>{trade.exitPrice}</span>
                            </div>
                            <div className={styles.tradesDetailLine}>
                              <span className={styles.tradesDetailLabel}>Exit Time</span>
                              <span className={styles.tradesDetailValue}>{formatDateTime(trade.exitTime)}</span>
                            </div>
                            <div className={styles.tradesDetailLine}>
                              <span className={styles.tradesDetailLabel}>Profit</span>
                              <span className={styles.tradesDetailValue}>{trade.pnl}</span>
                            </div>
                            <div className={styles.tradesDetailLine}>
                              <span className={styles.tradesDetailLabel}>Risk per Unit</span>
                              <span className={styles.tradesDetailValue}>{trade.riskPoints}</span>
                            </div>
                            <div className={styles.tradesDetailLine}>
                              <span className={styles.tradesDetailLabel}>Exit Order ID</span>
                              <span className={styles.tradesDetailValue}>{trade.exitOrderId}</span>
                            </div>
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