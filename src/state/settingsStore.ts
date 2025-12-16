import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SettingsState = {
  aggressiveExtraction: boolean;
};

export type SettingsActions = {
  setAggressiveExtraction: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      aggressiveExtraction: true,
      setAggressiveExtraction: (value) => set({ aggressiveExtraction: value })
    }),
    {
      name: "note-pwa:settings:v1"
    }
  )
);


