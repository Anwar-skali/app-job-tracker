import { create } from 'zustand';
import { lightTheme, darkTheme, Theme } from '@/constants/theme';

interface ThemeStore {
  isDark: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: false,
  theme: lightTheme,
  toggleTheme: () =>
    set((state) => {
      const newIsDark = !state.isDark;
      return {
        isDark: newIsDark,
        theme: newIsDark ? darkTheme : lightTheme,
      };
    }),
  setTheme: (isDark: boolean) =>
    set({
      isDark,
      theme: isDark ? darkTheme : lightTheme,
    }),
}));

