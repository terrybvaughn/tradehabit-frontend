import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Goals } from "@/api/types";
import { apiClient } from "@/api/client";
import { nanoid } from "nanoid";

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
          current_streak: 0,
          best_streak: 0,
          progress: 0,
        } as Goals;

        const current = normalize(get().goals);
        const newGoals = [...current, enriched];
        set({ goals: newGoals });
        await recalcGoals(newGoals, set);
      },

      updateGoal: async (id: string, partial: Partial<Goals>) => {
        const current = normalize(get().goals);
        const newGoals = current.map((g) => (g.id === id ? { ...g, ...partial } : g));
        set({ goals: newGoals });
        await recalcGoals(newGoals, set);
      },

      deleteGoal: async (id: string) => {
        const newGoals = normalize(get().goals).filter((g) => g.id !== id);
        set({ goals: newGoals });
        await recalcGoals(newGoals, set);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state: GoalsSlice) => state.goals, // store raw array
    },
  ),
);

async function recalcGoals(goals: Goals[], set: (partial: Partial<GoalsSlice>) => void) {
  try {
    set({ isLoading: true });
    const resp = await apiClient.post<any>("/api/goals/calculate", { goals });
    const incoming = Array.isArray(resp) ? resp : resp?.goals ?? [];
    // Merge backend-calculated fields with existing client fields (e.g., mistake_types)
    const byId = new Map(goals.map((g) => [g.id, g]));
    const merged = incoming.map((g: Goals) => ({
      ...byId.get(g.id), // original goal with all client-side props
      ...g,              // backend updates overwrite where relevant
    }));
    const next = ensureIds(merged);
    set({ goals: next, isLoading: false });
  } catch (err) {
    // TODO: surface error globally (banner) – left to component layer.
    set({ isLoading: false });
  }
}

// Note: we no longer fetch default goals on app start.
// Instead, `seedDefaultGoals` is called after the user uploads a dataset via
// `useAnalyzeCsv` (see api/hooks.ts). This ensures the backend has trading
// data available so /api/goals returns 200.

function normalize(val: any): Goals[] {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray(val.goals)) return val.goals as Goals[];
  return [];
}

function ensureIds(arr: Goals[]): Goals[] {
  return arr.map((g) => ({ ...g, id: g.id ?? nanoid() }));
}

// Helper to seed defaults (used from upload hook)
export async function seedDefaultGoals() {
  try {
    const goals = await apiClient.get<Goals[]>("/api/goals");
    useGoalsStore.getState().setGoals(ensureIds(goals));
  } catch {
    useGoalsStore.getState().setGoals([]);
  }
} 