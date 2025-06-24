import { useState, type FC } from "react";
import { useGoalsStore } from "@/state/goalsStore";
import type { Goals as GoalType } from "@/api/types";
import { GoalCard } from "@/components/Body/GoalCard";
import { GoalModal } from "@/components/GoalModal/GoalModal";
import { ConfirmDeleteModal } from "@/components/GoalModal/ConfirmDeleteModal";
import styles from "./Goals.module.css";
import plusIcon from "@/assets/images/icon-plus-add.svg";
import { useTrades } from "@/api/hooks";
import { getIcon, buildDescription } from "@/utils/goalDisplay";

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
