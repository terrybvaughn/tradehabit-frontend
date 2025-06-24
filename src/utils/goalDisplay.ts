import type { Goals as GoalType } from "@/api/types";
import iconCleanCheckCircle from "@/assets/images/icon-clean-check-circle.svg";
import iconStopAlert from "@/assets/images/icon-stop-alert.svg";
import iconRevengeClock from "@/assets/images/icon-revenge-clock.svg";

// List of mistake identifiers used throughout the app
const allMistakes: string[] = [
  "no stop-loss order",
  "excessive risk",
  "outsized loss",
  "revenge trade",
];

/**
 * Decide which icon to display for a given goal based on its title / mistake_types.
 * Mirrors the visual rules described in the Goals feature spec.
 */
export function getIcon(goal: Partial<GoalType> & { title?: string; mistake_types?: string[] }) {
  const { title = "", mistake_types = [] } = goal;

  // Single revenge-trade → clock icon
  const isRevengeOnly = mistake_types.length === 1 && mistake_types[0] === "revenge trade";
  // All mistakes selected → clean check
  const isAllMistakes = mistake_types.length === allMistakes.length && mistake_types.every((m) => allMistakes.includes(m));

  if (isRevengeOnly || title === "Revenge Trades") return iconRevengeClock;
  if (isAllMistakes || title === "Clean Trades") return iconCleanCheckCircle;
  // Sub-set of mistakes (risk-management) or explicit title
  if ((mistake_types.length >= 1 && mistake_types.length < allMistakes.length) || title === "Risk Management") {
    return iconStopAlert;
  }

  // Default fallback – clean check
  return iconCleanCheckCircle;
}

/**
 * Generate a human-readable description for the goal.
 * The logic is intentionally kept identical between Dashboard and Goals page.
 */
export function buildDescription(goal: Partial<GoalType> & { goal: number; metric?: string; mistake_types?: string[]; title?: string }): string {
  const { goal: target, metric = "trades", mistake_types = [], title = "" } = goal;
  const fmt = (tmpl: string) => tmpl.replace("{goal}", String(target)).replace("{metric}", metric);

  // Title-based fallbacks for legacy server defaults
  if (title === "Revenge Trades") return fmt("Complete {goal} {metric} outside your revenge trading window.");
  if (title === "Clean Trades") return fmt("Complete {goal} {metric} without making a mistake.");
  if (title === "Risk Management") return fmt("Complete {goal} {metric} without making a risk management error.");

  // No mistake_types configured → treat as clean trades
  if (mistake_types.length === 0) {
    return fmt("Complete {goal} {metric} without making a mistake.");
  }

  // Explicitly all mistakes → clean trades
  if (mistake_types.length === allMistakes.length && mistake_types.every((m) => allMistakes.includes(m))) {
    return fmt("Complete {goal} {metric} without making a mistake.");
  }

  // Single mistake specific wording
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