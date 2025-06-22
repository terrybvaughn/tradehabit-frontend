import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goals } from "@/api/types";
import { apiClient } from "@/api/client";

interface GoalDraft extends Omit<Goals, "current_streak" | "best_streak" | "progress" | "error"> {}

interface GoalsSlice {
  goals: Goals[];
  isLoading: boolean;
  /** Replace entire array – internal helper */
  setGoals: (g: Goals[]) => void;
  /** Create a new goal (id must be unique) */
  createGoal: (goal: GoalDraft) => Promise<void>;
  /** Update existing goal (identified by id) */
  updateGoal: (id: string, partial: Partial<Goals>) => Promise<void>;
  /** Delete goal by id */
  deleteGoal: (id: string) => Promise<void>;
}

/** LocalStorage key as per spec */
const STORAGE_KEY = "tradehabit_goals";

export const useGoalsStore = create<GoalsSlice>()(
  persist(
    (set: any, get: () => GoalsSlice) => ({
      goals: [],
      isLoading: false,

      // Replace state without side-effects
      setGoals: (g: Goals[]) => set({ goals: g }),

      createGoal: async (goalDraft: GoalDraft) => {
        const enriched: Goals = {
          ...goalDraft,
          // Defaults until backend fills them
          current_streak: 0,
          best_streak: 0,
          progress: 0,
        } as Goals;
        const newGoals = [...get().goals, enriched];
        set({ goals: newGoals });
        await recalcGoals(newGoals, set);
      },

      updateGoal: async (id: string, partial: Partial<Goals>) => {
        const newGoals = get().goals.map((g) => (g.id === id ? { ...g, ...partial } : g));
        set({ goals: newGoals });
        await recalcGoals(newGoals, set);
      },

      deleteGoal: async (id: string) => {
        const newGoals = get().goals.filter((g) => g.id !== id);
        set({ goals: newGoals });
        await recalcGoals(newGoals, set);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state: GoalsSlice) => ({ goals: state.goals }),
    },
  ),
);

async function recalcGoals(goals: Goals[], set: (partial: Partial<GoalsSlice>) => void) {
  try {
    set({ isLoading: true });
    const resp = await apiClient.post<Goals[]>("/api/goals/calculate", { goals });
    // resp may return array; overwrite progress fields etc.
    set({ goals: resp, isLoading: false });
  } catch (err) {
    // TODO: surface error globally (banner) – left to component layer.
    set({ isLoading: false });
  }
}

// ────────────────────────────────────────────────────────────
// Initial bootstrap – if the LocalStorage key is empty, seed it
// with the backend defaults.
// This runs once on module load (app start).
// ────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Fire-and-forget: fetch defaults and populate store
    apiClient
      .get<Goals[]>("/api/goals")
      .then((goals) => {
        // Persist via store to ensure proper write + calc
        useGoalsStore.getState().setGoals(goals);
      })
      .catch(() => {
        // Ignore; user will create goals manually
      });
  }
} 