import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_SETTINGS } from "./defaultSettings";

interface SettingsState {
  revengeK: number;  // 0.5 – 3.0
  lossSigma: number; // 0.75 – 1.5
  riskSigma: number; // 1.0 – 2.0
  riskVR: number;    // 0.20 – 0.50
  setMany: (partial: Partial<SettingsState>) => void;
  reset: () => void;
}

const STORAGE_KEY = "tradehabit_settings";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setMany: (partial) => set(partial),
      reset: () => {
        set({ ...DEFAULT_SETTINGS });
        // Also clear from sessionStorage
        sessionStorage.removeItem(STORAGE_KEY);
        // Notify backend to revert thresholds
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            k: DEFAULT_SETTINGS.revengeK,
            sigma_loss: DEFAULT_SETTINGS.lossSigma,
            sigma_risk: DEFAULT_SETTINGS.riskSigma,
            vr: DEFAULT_SETTINGS.riskVR,
          }),
        }).catch(() => {});
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ revengeK: s.revengeK, lossSigma: s.lossSigma, riskSigma: s.riskSigma, riskVR: s.riskVR }),
    },
  ),
); 