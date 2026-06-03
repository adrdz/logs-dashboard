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
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
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
      </Paper>
    </Stack>
  );
  //#endregion
}
