import type { FC } from "react";
import { useGoalsStore } from "@/state/goalsStore";
import type { Goals as GoalType } from "@/api/types";
import { GoalCard } from "@/components/Body/GoalCard";
import iconCleanCheckCircle from "@/assets/images/icon-clean-check-circle.svg";
import iconStopAlert from "@/assets/images/icon-stop-alert.svg";
import iconRevengeClock from "@/assets/images/icon-revenge-clock.svg";
import styles from "./Goals.module.css";
import plusIcon from "@/assets/images/icon-plus-add.svg";

const allMistakes = [
  "no stop-loss order",
  "excessive risk",
  "outsized loss",
  "revenge trade",
];

function getIcon(goal: GoalType) {
  const { title = "", mistake_types = [] } = goal as any;
  if (mistake_types.length === 0) {
    if (title === "Revenge Trades") return iconRevengeClock;
    if (title === "Risk Management") return iconStopAlert;
    return iconCleanCheckCircle;
  }
  if (mistake_types.length === 1 && mistake_types[0] === "revenge trade") return iconRevengeClock;
  if (mistake_types.length === allMistakes.length && mistake_types.every((m: string) => allMistakes.includes(m))) return iconCleanCheckCircle;
  return iconStopAlert;
}

function buildDescription(goal: GoalType): string {
  const { goal: target, metric = "trades", mistake_types = [], title = "" } = goal as any;

  const fmt = (tmpl: string) => tmpl.replace("{goal}", String(target)).replace("{metric}", metric);

  // Empty mistake_types
  if (mistake_types.length === 0) {
    if (title === "Risk Management") return fmt("Complete {goal} {metric} without making a risk management error.");
    if (title === "Revenge Trades") return fmt("Complete {goal} {metric} outside your revenge trading window.");
    return fmt("Complete {goal} {metric} without making a mistake.");
  }

  // All mistakes
  if (mistake_types.length === allMistakes.length && mistake_types.every((m: string) => allMistakes.includes(m))) {
    return fmt("Complete {goal} {metric} without making a mistake.");
  }

  // Single mistake
  if (mistake_types.length === 1) {
    switch (mistake_types[0]) {
      case "revenge trade":
        return fmt("Complete {goal} {metric} outside your revenge trading window.");
      case "excessive risk":
        return fmt("Complete {goal} {metric} without taking on excessive risk.");
      case "outsized loss":
        return fmt("Complete {goal} {metric} without taking an outsized loss.");
      case "no stop-loss order":
        return fmt("Complete {goal} {metric} with stop-loss protection.");
      default:
        break;
    }
  }

  // 2-3 mistakes subset
  return fmt("Complete {goal} {metric} without making a risk management error.");
}

export const Goals: FC = () => {
  const { goals } = useGoalsStore();

  return (
    <>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>Goals</h2>
        <button className={styles.addBtn} type="button">
          <img src={plusIcon} alt="" height={20} className={styles.addIcon} />
          New Goal
        </button>
      </div>
      <div className={styles.list}>
        {goals.map((g: GoalType, idx: number) => (
          <GoalCard
            key={g.id ?? idx}
            {...(g as any)}
            icon={getIcon(g as any)}
            description={buildDescription(g as any)}
            className={styles.goalCardFull}
            showActions
          />
        ))}
      </div>
    </>
  );
}; 