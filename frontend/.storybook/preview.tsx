import * as React from "react";
import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeModeContext } from "../src/app/providers";
import { createAppTheme, type ThemeMode } from "../src/lib/theme";
// Design tokens + BEM surfaces, so plain-CSS components render correctly.
import "../src/styles/globals.css";

// One client for the whole Storybook session; components that read TanStack
// Query never fetch here (they receive data via args), but the provider must
// exist for the hooks to be callable.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

// Wraps every story in the app's runtime: QueryClient + a controlled ThemeMode
// context (so `useThemeMode()` works) + the MUI theme. The toolbar global seeds
// the initial mode; `toggle` flips local state so interactive components like
// ThemeToggle behave exactly as they do in the app.
const WithProviders: Decorator = (Story, context) => {
  const initial = (context.globals.theme as ThemeMode) ?? "light";
  const [mode, setMode] = React.useState<ThemeMode>(initial);

  React.useEffect(() => setMode(initial), [initial]);
  React.useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const toggle = React.useCallback(
    () => setMode((m) => (m === "dark" ? "light" : "dark")),
    []
  );
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeContext.Provider value={{ mode, toggle }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </QueryClientProvider>
  );
};

const preview: Preview = {
  decorators: [WithProviders],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  initialGlobals: { theme: "light" },
  globalTypes: {
    theme: {
      description: "App theme (light / dark)",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
