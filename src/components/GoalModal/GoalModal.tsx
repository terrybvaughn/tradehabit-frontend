import type { FC, ChangeEvent, FormEvent } from "react";
import { useState, useEffect, useMemo } from "react";
import styles from "./GoalModal.module.css";
import base from "@/components/Modal/ModalBase.module.css";
import { nanoid } from "nanoid";
import type { Goals } from "@/api/types";
import { useGoalsStore } from "@/state/goalsStore";
import { useTrades } from "@/api/hooks";

interface GoalModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Goals;
  onClose: () => void;
}

const mistakeOptions = [
  { label: "without taking a revenge trade", key: "revenge trade" },
  { label: "without taking an outsized loss", key: "outsized loss" },
  { label: "without setting a stop that's too large", key: "excessive risk" },
  { label: "with stop-loss protection", key: "no stop-loss order" },
] as const;

type MistakeKey = typeof mistakeOptions[number]["key"];

const titleSuggestion = (mistakes: MistakeKey[]): string => {
  if (mistakes.length === 4) return "Clean Trades";
  if (mistakes.length === 1 && mistakes[0] === "revenge trade") return "Revenge Trades";
  // 2 or 3 selected
  return "Risk Management";
};

export const GoalModal: FC<GoalModalProps> = ({ open, mode, initial, onClose }) => {
  const createGoal = useGoalsStore((s) => s.createGoal);
  const updateGoal = useGoalsStore((s) => s.updateGoal);

  // ─── Form state ────────────────────────────────────────────
  const [step] = useState(1);
  const [goal, setGoal] = useState<string>("");
  const [metric, setMetric] = useState<"trades" | "days">("trades");
  const [mistakes, setMistakes] = useState<MistakeKey[]>([]);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const allMistakeKeys = mistakeOptions.map((o) => o.key);
  const deriveMistakes = (titleVal: string): MistakeKey[] => {
    switch (titleVal) {
      case "Clean Trades":
        return allMistakeKeys as MistakeKey[];
      case "Revenge Trades":
        return ["revenge trade"] as MistakeKey[];
      case "Risk Management":
        return allMistakeKeys.filter((k) => k !== "revenge trade") as MistakeKey[];
      default:
        return [];
    }
  };

  // Fetch trades once modal is open to derive earliest trade date
  const { data: tradesData } = useTrades(open);

  const earliestTradeDate = useMemo(() => {
    if (!tradesData?.trades?.length) return null;
    const earliest = tradesData.trades.reduce((min, t) =>
      new Date(t.entryTime) < new Date(min) ? t.entryTime : min,
      tradesData.trades[0].entryTime,
    );
    return earliest.slice(0, 10);
  }, [tradesData]);

  // Reset form each time modal opens or mode changes
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setGoal(initial.goal !== undefined ? String(initial.goal) : "");
      setMetric((initial.metric as any) ?? "trades");

      const incomingMistakes: MistakeKey[] = Array.isArray(initial.mistake_types)
        ? (initial.mistake_types as any)
        : [];
      setMistakes(incomingMistakes.length ? incomingMistakes : deriveMistakes(initial.title));

      setTitle(initial.title ?? "");

      const dateToUse = initial.start_date && initial.start_date !== ""
        ? initial.start_date
        : earliestTradeDate ?? new Date().toISOString().slice(0, 10);
      setStartDate(dateToUse);
    } else {
      setGoal("");
      setMetric("trades");
      setMistakes([]);
      setTitle("");
      setStartDate(earliestTradeDate ?? new Date().toISOString().slice(0, 10));
    }
  }, [open, mode, initial, earliestTradeDate]);

  // Suggested title shown as placeholder (create mode only)
  const suggestedTitle = useMemo(() => (mode === "create" ? titleSuggestion(mistakes) : ""), [mistakes, mode]);

  if (!open) return null;

  // ─── Validation helpers ────────────────────────────────────
  const goalNum = parseInt(goal, 10);
  const goalValid = !Number.isNaN(goalNum) && goalNum > 0;
  const mistakesValid = Array.isArray(mistakes) && mistakes.length > 0;
  const titleRegex = /^[A-Za-z0-9 _\-.']{1,24}$/;
  const titleValid = titleRegex.test(title);
  const saveEnabled = goalValid && mistakesValid && titleValid && startDate;
  const nextEnabled = true; // obsolete

  // ─── Handlers ──────────────────────────────────────────────
  const toggleMistake = (key: MistakeKey) => {
    setMistakes((prev) => (prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!saveEnabled) return;
    const obj: Goals = {
      id: initial?.id ?? nanoid(),
      goal: goalNum,
      metric,
      mistake_types: mistakes,
      title,
      start_date: startDate,
      progress: 0,
      current_streak: 0,
      best_streak: 0,
    } as Goals;
    if (mode === "create") await createGoal(obj as any);
    else await updateGoal(obj.id, obj as any);
    onClose();
  };

  return (
    <div className={base.backdrop}>
      <form className={`${base.modal} ${styles.modal}`} onSubmit={handleSubmit}>
        <h2 className={base.title}>{mode === "create" ? "New Goal" : "Edit Goal"}</h2>

        {/* Step 1 */}
        <div className={base.bodyText}>
          <span>Complete</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={styles.inputNumber}
            value={goal}
            placeholder="100"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setGoal(e.target.value)}
          />
          <select className={styles.select} value={metric} onChange={(e) => setMetric(e.target.value as any)}>
            <option value="trades">trades</option>
            <option value="days">days</option>
          </select>
        </div>
        {/* remaining checkboxes */}
        <div className={styles.checkboxGroup}>
          {mistakeOptions.map((opt) => (
            <label key={opt.key}>
              <input
                type="checkbox"
                checked={mistakes.includes(opt.key)}
                onChange={() => toggleMistake(opt.key)}
              /> {opt.label}
            </label>
          ))}
        </div>

        {/* Goal name & start date */}
        <div className={styles.bodyText} style={{ marginTop: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13 }}>Goal Name</span>
            <input
              type="text"
              className={styles.inputText}
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0,24))}
              maxLength={24}
              placeholder={suggestedTitle || "Goal Name"}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13 }}>Start Date</span>
            <input
              type="date"
              className={styles.datePicker}
              value={startDate}
              min="1972-10-10"
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
        </div>

        {/* Footer buttons */}
        <div className={base.footer}>
          <button type="button" className={base.btnOutline} onClick={onClose}>Cancel</button>
          <button type="submit" className={base.btnPrimary} disabled={!saveEnabled}>Save</button>
        </div>
      </form>
    </div>
  );
}; 