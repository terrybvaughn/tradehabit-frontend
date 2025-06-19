import type { FC } from "react";
import styles from "./Body.module.css";

interface GoalCardProps {
  title: string;
  icon: string;
  progress: number;
  goal: number;
  description: string;
}

export const GoalCard: FC<GoalCardProps> = ({ title, icon, progress, goal, description }) => (
  <div className={styles.goalCard}>
    <div className={styles.goalCardHeader}>
      <img src={icon} alt="" className={styles.goalIcon} />
      <span className={styles.goalTitle}>{title}</span>
    </div>
    <div className={styles.goalProgressBarBg}>
      <div
        className={styles.goalProgressBarFill}
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
    <div className={styles.goalDescription}>{description.replace("{goal}", goal.toString())}</div>
  </div>
); 