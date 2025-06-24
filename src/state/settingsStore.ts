import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
      revengeK: 1.0,
      lossSigma: 1.0,
      riskSigma: 1.5,
      riskVR: 0.35,
      setMany: (partial) => set(partial),
      reset: () => set({ revengeK: 1.0, lossSigma: 1.0, riskSigma: 1.5, riskVR: 0.35 }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ revengeK: s.revengeK, lossSigma: s.lossSigma, riskSigma: s.riskSigma, riskVR: s.riskVR }),
    },
  ),
); 