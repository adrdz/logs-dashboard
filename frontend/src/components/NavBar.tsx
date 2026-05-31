"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/logs", label: "Logs", icon: <ListAltIcon fontSize="small" /> },
  { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> },
  { href: "/logs/new", label: "New Log", icon: <AddBoxIcon fontSize="small" /> },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 0, mr: 4 }}>
          Logs Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Button
              key={href}
              component={Link}
              href={href}
              color="inherit"
              startIcon={icon}
              variant={pathname.startsWith(href) ? "outlined" : "text"}
              sx={{ borderColor: "rgba(255,255,255,0.6)" }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
