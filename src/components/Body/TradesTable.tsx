import type { FC } from "react";
import styles from "./Body.module.css";
import iconCalendar from "@/assets/images/icon-calendar.svg";
import iconChevronRight from "@/assets/images/Icon-chevron-right.png";
import iconCleanCheck from "@/assets/images/icon-clean-check.svg";
import iconAlertCircle from "@/assets/images/icon-alert-circle-PINK.svg";

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

export const TradesTable: FC<TradesTableProps> = ({ trades }) => (
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
            {trades.map((trade, i) => (
              <tr
                key={trade.id}
                className={i % 2 === 0 ? styles.tradesRowEven : styles.tradesRowOdd}
              >
                <td className={styles.tradesChevronCol}>
                  <img src={iconChevronRight} alt="chevron" style={{ width: 8, height: 14 }} className={styles.tradesChevronIcon} />
                </td>
                <td className={styles.tradesContentCol}>
                  <div className={styles.tradesContentMain}>
                    {trade.side} • {trade.exitQty} • {trade.symbol}
                  </div>
                  <div className={styles.tradesDateTime}>{formatDateTime(trade.exitTime)}</div>
                </td>
                <td className={styles.tradesStatusCol}>
                  <img
                    src={trade.mistakes.length === 0 ? iconCleanCheck : iconAlertCircle}
                    alt={trade.mistakes.length === 0 ? "clean" : "mistake"}
                    className={styles.tradesStatusIcon}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
); 