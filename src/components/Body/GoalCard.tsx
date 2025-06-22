import type { FC } from "react";
import styles from "./Body.module.css";
import editIcon from "@/assets/images/icon-edit-pencil.svg";
import deleteIcon from "@/assets/images/icon-delete-trash.svg";

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
}

export const GoalCard: FC<GoalCardProps> = ({ title, icon, progress, goal, description, className, showActions = false, onEdit, onDelete }) => (
  <div className={`${styles.goalCard} ${className ?? ""}`}>
    <div className={styles.goalCardHeader}>
      <img src={icon} alt="" className={styles.goalIcon} />
      <span className={styles.goalTitle}>{title}</span>
      {showActions && (
        <div className={styles.goalActions}>
          <button type="button" className={styles.actionBtnGray} aria-label="Edit Goal" onClick={onEdit}>
            <img src={editIcon} alt="Edit" height={20} />
          </button>
          <button type="button" className={styles.actionBtnGray} aria-label="Delete Goal" onClick={onDelete}>
            <img src={deleteIcon} alt="Delete" height={20} />
          </button>
        </div>
      )}
    </div>
    <div className={styles.goalProgressBarBg}>
      <div
        className={styles.goalProgressBarFill}
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
    <div className={styles.goalDescription}>{description}</div>
  </div>
); 
