//#region Imports
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
//#endregion

export const metadata = {
  title: "About — Logs Dashboard",
};

export default function AboutPage() {
  //#region Render
  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        About
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography paragraph>
          <strong>ZeroBoard</strong> is a log management and analytics dashboard for
          browsing, filtering, and visualizing application logs. Use the{" "}
          <Link component={NextLink} href="/" underline="hover">
            Summary
          </Link>{" "}
          view for severity and trend analytics, and the{" "}
          <Link component={NextLink} href="/logs" underline="hover">
            Logs List
          </Link>{" "}
          to search, sort, paginate, and create individual entries.
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
          Tech stack
        </Typography>
        <Typography component="ul" sx={{ pl: 3, m: 0 }}>
          <li>Frontend: Next.js (App Router), React, MUI, TanStack Query</li>
          <li>Backend: FastAPI, SQLAlchemy (async), PostgreSQL</li>
          <li>Charts: MUI X Charts · Table: MUI X Data Grid</li>
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>
          Backend testing
        </Typography>
        <Typography component="ul" sx={{ pl: 3, m: 0 }}>
          <li>pytest + pytest-asyncio — async test suite (auto mode)</li>
          <li>httpx — HTTP client for FastAPI endpoint integration tests</li>
          <li>aiosqlite — in-memory SQLite DB replaces PostgreSQL during tests</li>
          <li>Test files: <code>test_logs.py</code>, <code>test_analytics.py</code></li>
          <li>Run: <code>pytest</code> from the <code>backend/</code> directory</li>
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>
          Frontend testing
        </Typography>
        <Typography component="ul" sx={{ pl: 3, m: 0 }}>
          <li>Vitest — unit &amp; component tests (<code>npm test</code> / <code>npm run test:watch</code>)</li>
          <li>Playwright — end-to-end tests (<code>npm run test:e2e</code>, UI mode: <code>npm run test:e2e:ui</code>)</li>
          <li>E2E specs: navigation, logs list, log CRUD, summary view</li>
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3 }}>
          Storybook
        </Typography>
        <Typography component="ul" sx={{ pl: 3, m: 0 }}>
          <li>Storybook v10 — component explorer at <code>localhost:6006</code> (<code>npm run storybook</code>)</li>
          <li>addon-vitest — runs story-level tests inside Vitest via <code>@storybook/addon-vitest</code></li>
          <li>Playwright browser integration via <code>@vitest/browser</code> + <code>@vitest/browser-playwright</code></li>
          <li>Stories co-located with components as <code>ComponentName.stories.tsx</code></li>
        </Typography>
      </Paper>
    </Stack>
  );
  //#endregion
}
