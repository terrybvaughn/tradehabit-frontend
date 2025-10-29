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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const normalized = normalize((state as any).goals).map((g: Goals) => {
          let p = typeof g.progress === "number" ? g.progress : 0;
          if (p > 1) p = p / 100;
          if (p < 0) p = 0;
          if (p > 1) p = 1;
          const withMistakes = ensureMistakeTypes(g);
          return { ...withMistakes, progress: p } as Goals;
        });
        (state as any).setGoals(normalized);
      },
    },
  ),
);

async function recalcGoals(goals: Goals[], set: (partial: Partial<GoalsSlice>) => void) {
  try {
    set({ isLoading: true });
    // Ensure each goal has mistake_types and sensible defaults before sending to server
    const outgoing = goals.map((g) => ({
      ...ensureMistakeTypes(g),
      metric: (g as any).metric || "trades",
    }));

    const resp = await apiClient.post<any>("/api/goals/calculate", { goals: outgoing });
    const incoming = Array.isArray(resp) ? resp : resp?.goals ?? [];
    // Merge backend-calculated fields with existing client fields (e.g., mistake_types)
    const byId = new Map(outgoing.map((g) => [g.id, g]));
    const merged = incoming.map((g: Goals) => ({
      ...byId.get(g.id), // original goal with all client-side props
      ...g,              // backend updates overwrite where relevant
    }));
    const next = ensureIds(merged).map((g) => {
      const normalizedProgress = enforceProgressConsistency(g.progress, g.current_streak, g.goal);
      return {
        ...g,
        progress: normalizedProgress,
      } as Goals;
    });
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

function ensureMistakeTypes(g: Goals): Goals {
  if (Array.isArray((g as any).mistake_types) && (g as any).mistake_types.length > 0) return g;
  const title = (g as any).title || "";
  const all: string[] = [
    "revenge trade",
    "outsized loss",
    "excessive risk",
    "no stop-loss order",
  ];
  let mistake_types: string[] = [];
  if (title === "Clean Trades") mistake_types = all;
  else if (title === "Revenge Trades") mistake_types = ["revenge trade"];
  else if (title === "Risk Management") mistake_types = all.filter((m) => m !== "revenge trade");
  return { ...(g as any), mistake_types } as Goals;
}

function enforceProgressConsistency(progress: number, current: number, goal: number): number {
  let p = typeof progress === "number" ? progress : 0;
  if (p > 1) p = p / 100;
  const expected = goal ? current / goal : 0;
  // If mismatch greater than half a percent, recompute from streak
  if (!Number.isFinite(p) || Math.abs(p - expected) > 0.005) {
    p = expected;
  }
  // Clamp
  if (p < 0) p = 0;
  return p;
}

/**
 * Checks if the goals returned from the server are plausible (not in a transient/race state).
 * Returns true if all goals have progress <= 2 and current_streak <= goal * 2.
 */
function areGoalsPlausible(goals: Goals[]): boolean {
  return goals.every((g) => {
    const progress = typeof g.progress === "number" ? g.progress : 0;
    const normalizedProgress = progress > 1 ? progress / 100 : progress;
    const streakRatio = g.goal > 0 ? g.current_streak / g.goal : 0;

    // If progress > 2 or streak is more than 2x the goal, it's likely a race condition
    return normalizedProgress <= 2 && streakRatio <= 2;
  });
}

/**
 * Helper to seed defaults (used from upload hook).
 * Implements retry logic with exponential backoff to avoid seeding goals
 * during backend analysis transitional states.
 */
export async function seedDefaultGoals(maxRetries: number = 3, initialDelayMs: number = 250) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const goals = await apiClient.get<Goals[]>("/api/goals");

      // Check if goals are plausible (not in a race condition state)
      if (!areGoalsPlausible(goals)) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.warn(`Goals appear to be in transitional state (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delayMs}ms...`);

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        // If this was the last attempt, fall through and use what we got
      }

      const seeded = ensureIds(goals)
        .map(ensureMistakeTypes)
        .map((g) => {
          const normalized = enforceProgressConsistency(g.progress, g.current_streak, g.goal);
          return {
            ...g,
            metric: (g as any).metric || "trades",
            progress: normalized,
          } as Goals;
        });
      useGoalsStore.getState().setGoals(seeded);
      return;
    } catch (err) {
      lastError = err as Error;

      // If this is not the last attempt, retry
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.warn(`Failed to fetch goals (attempt ${attempt + 1}/${maxRetries}):`, err, `Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
    }
  }

  // All retries failed
  console.error("Failed to seed goals after", maxRetries, "attempts:", lastError);
  useGoalsStore.getState().setGoals([]);
} 