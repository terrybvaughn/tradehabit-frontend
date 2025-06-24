import type { FC } from "react";
import styles from "./Body.module.css";
import editIcon from "@/assets/images/icon-edit-pencil.svg";
import deleteIcon from "@/assets/images/icon-delete-trash.svg";
import iconAward from "@/assets/images/icon-award.svg";

const GREEN = "#5FCB3A";

interface GoalCardProps {
  title: string;
  icon: string;
  progress: number;
  goal: number;
  description: string;
  className?: string;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  completedOn?: string; // optional date string YYYY-MM-DD
  start_date?: string;
  current_streak?: number;
  best_streak?: number;
  metric?: "trades" | "days";
  showDetails?: boolean;
  /** When true, the title will be shown as-is even if goal is completed. */
  suppressCompletionMessage?: boolean;
}

export const GoalCard: FC<GoalCardProps> = ({ title, icon, progress, goal, description, className, showActions = false, onEdit, onDelete, completedOn, start_date, current_streak, best_streak, metric = "trades", showDetails = false, suppressCompletionMessage = false }) => {
  const isCompleted = progress >= 1;
  let displayTitle = title;
  if (isCompleted && !suppressCompletionMessage) {
    if (completedOn) {
      displayTitle = `${title} – goal completed on ${formatDate(completedOn)}. Congratulations! 🎉`;
    } else {
      displayTitle = `${title} – goal is complete. Congratulations! 🎉`;
    }
  }

  const iconSrc = isCompleted ? iconAward : icon;

  return (
    <div className={`${styles.goalCard} ${className ?? ""}`}>
      <div className={styles.goalCardHeader}>
        <img src={iconSrc} alt="" className={styles.goalIcon} />
        <span className={styles.goalTitle}>{displayTitle}</span>
        {showActions && (
          <div className={styles.goalActions}>
            <button type="button" className={styles.actionBtnGray} aria-label="Edit Goal" title="Edit" onClick={onEdit}>
              <img src={editIcon} alt="Edit" height={20} />
            </button>
            <button type="button" className={styles.actionBtnGray} aria-label="Delete Goal" title="Delete" onClick={onDelete}>
              <img src={deleteIcon} alt="Delete" height={20} />
            </button>
          </div>
        )}
      </div>
      <div className={styles.goalProgressBarBg}>
        <div
          className={styles.goalProgressBarFill}
          style={{ width: `${Math.round(progress * 100)}%`, background: isCompleted ? GREEN : "#0077b6" }}
        />
      </div>
      <div className={styles.goalDescription}>
        {description}

        {showDetails && (
          <div style={{ fontSize: 11, color: "#9EADB8", lineHeight: 1.5 }}>
            <span>Start Date: {formatDate(start_date)}. </span>
            <span>Current Streak: {current_streak ?? 0} {metric} - this goal is {Math.ceil(progress * 100)}% complete. </span>
            <span>Best Streak: {best_streak ?? 0} {metric}.</span>
          </div>
        )}
      </div>
    </div>
  );
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthName = months[Number(m)-1] ?? m;
  return `${monthName} ${Number(d)}, ${y}`;
} 
