"use client";

//#region Imports
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme, type ThemeMode } from "@/lib/theme";
//#endregion

//#region Types
export interface ThemeModeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}
//#endregion

//#region Constants
const STORAGE_KEY = "theme-mode";
// Exported so test/Storybook decorators can supply a controlled value.
export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
//#endregion

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within <Providers>");
  return ctx;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  //#region State
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  // SSR and first client render use "light" to match server output; the real
  // preference is applied after mount (the anti-FOUC script in layout.tsx has
  // already set the correct `data-theme` on <html> so token-based surfaces
  // never flash — only MUI widgets briefly settle).
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);
  //#endregion

  //#region Effects
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial =
      stored ??
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setMode(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [mode, mounted]);
  //#endregion

  //#region Handlers
  const toggle = useCallback(
    () => setMode((m) => (m === "dark" ? "light" : "dark")),
    []
  );

  const themeMode = useMemo(() => ({ mode, toggle }), [mode, toggle]);
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  //#endregion

  //#region Render
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeContext.Provider value={themeMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </QueryClientProvider>
  );
  //#endregion
}
