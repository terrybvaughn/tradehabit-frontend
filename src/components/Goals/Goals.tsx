import { useState, type FC } from "react";
import { useGoalsStore } from "@/state/goalsStore";
import type { Goals as GoalType } from "@/api/types";
import { GoalCard } from "@/components/Body/GoalCard";
import { GoalModal } from "@/components/GoalModal/GoalModal";
import { ConfirmDeleteModal } from "@/components/GoalModal/ConfirmDeleteModal";
import iconCleanCheckCircle from "@/assets/images/icon-clean-check-circle.svg";
import iconStopAlert from "@/assets/images/icon-stop-alert.svg";
import iconRevengeClock from "@/assets/images/icon-revenge-clock.svg";
import styles from "./Goals.module.css";
import plusIcon from "@/assets/images/icon-plus-add.svg";
import { useTrades } from "@/api/hooks";

const allMistakes = [
  "no stop-loss order",
  "excessive risk",
  "outsized loss",
  "revenge trade",
];

function getIcon(goal: GoalType) {
  const { title = "", mistake_types = [] } = goal as any;

  // Deduce icon using mistake_types primarily; fallback to title when data incomplete
  const isRevengeOnly = mistake_types.length === 1 && mistake_types[0] === "revenge trade";
  const isAllMistakes = mistake_types.length === allMistakes.length && mistake_types.every((m: string) => allMistakes.includes(m));

  if (isRevengeOnly || title === "Revenge Trades") return iconRevengeClock;
  if (isAllMistakes || title === "Clean Trades") return iconCleanCheckCircle;
  // Risk-management subset (2–3 mistakes) or explicit title
  if ((mistake_types.length >= 1 && mistake_types.length < allMistakes.length) || title === "Risk Management") return iconStopAlert;

  // Default fallback
  return iconCleanCheckCircle;
}

function buildDescription(goal: GoalType): string {
  const { goal: target, metric = "trades", mistake_types = [], title = "" } = goal as any;

  const fmt = (tmpl: string) => tmpl.replace("{goal}", String(target)).replace("{metric}", metric);

  // Fallback to title-based logic first
  if (title === "Revenge Trades") return fmt("Complete {goal} {metric} outside your revenge trading window.");
  if (title === "Clean Trades") return fmt("Complete {goal} {metric} without making a mistake.");
  if (title === "Risk Management") return fmt("Complete {goal} {metric} without making a risk management error.");

  // If title not one of defaults, use mistake_types array

  if (mistake_types.length === 0) {
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

  // 2–3 mistakes subset (risk-management error)
  return fmt("Complete {goal} {metric} without making a risk management error.");
}

export const Goals: FC = () => {
  let { goals } = useGoalsStore();
  if (!Array.isArray(goals)) {
    // Handle legacy persisted shape { goals: [...] }
    if (goals && Array.isArray((goals as any).goals)) {
      goals = (goals as any).goals;
    } else {
      goals = [] as any;
    }
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create"|"edit">("create");
  const [editingGoal, setEditingGoal] = useState<GoalType|undefined>();
  const [deleteGoal, setDeleteGoal] = useState<GoalType|undefined>();
  const deleteGoalAction = useGoalsStore(s=>s.deleteGoal);

  // Fetch trades to determine earliest trade date
  const { data: tradesData } = useTrades(true);
  const earliestTradeDate = (() => {
    const trades = tradesData?.trades ?? [];
    if (!trades.length) return undefined;
    const earliest = trades.reduce((min, t) => new Date(t.exitTime) < new Date(min.exitTime) ? t : min, trades[0]);
    return earliest.exitTime.slice(0,10);
  })();

  return (
    <>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>Goals</h2>
        <button
          className={styles.addBtn}
          type="button"
          onClick={() => {
            setModalMode("create");
            setEditingGoal(undefined);
            setModalOpen(true);
          }}
        >
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
            completedOn={(g as any).completed_on}
            start_date={(g as any).start_date || earliestTradeDate}
            showDetails
            className={styles.goalCardFull}
            showActions
            onEdit={() => {
              setModalMode("edit");
              setEditingGoal(g);
              setModalOpen(true);
            }}
            onDelete={() => setDeleteGoal(g)}
          />
        ))}
      </div>

      <GoalModal
        open={modalOpen}
        mode={modalMode}
        initial={editingGoal as any}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDeleteModal
        open={!!deleteGoal}
        onCancel={() => setDeleteGoal(undefined)}
        onDelete={async () => {
          if (deleteGoal) await deleteGoalAction(deleteGoal.id);
        }}
      />
    </>
  );
}; 
