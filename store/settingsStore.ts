import { create } from 'zustand';

interface SettingsState {
  isDarkMode: boolean;
  language: string;
  notificationsEnabled: boolean;
  remindersEnabled: boolean;
  biometricEnabled: boolean;
  autoSaveEnabled: boolean;

  // Actions
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
  toggleNotifications: () => void;
  toggleReminders: () => void;
  toggleBiometric: () => void;
  toggleAutoSave: () => void;
  resetSettings: () => void;
}

const defaultSettings = {
  isDarkMode: false,
  language: 'en',
  notificationsEnabled: true,
  remindersEnabled: true,
  biometricEnabled: false,
  autoSaveEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  (set) => ({
      ...defaultSettings,

      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),

      setLanguage: (lang: string) => set({ language: lang }),

      toggleNotifications: () => set(state => ({
        notificationsEnabled: !state.notificationsEnabled
      })),

      toggleReminders: () => set(state => ({
        remindersEnabled: !state.remindersEnabled
      })),

      toggleBiometric: () => set(state => ({
        biometricEnabled: !state.biometricEnabled
      })),

      toggleAutoSave: () => set(state => ({
        autoSaveEnabled: !state.autoSaveEnabled
      })),

      resetSettings: () => set(defaultSettings),
    })
);
