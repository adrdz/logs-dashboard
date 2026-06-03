"use client";

//#region Imports
import { useThemeMode } from "@/app/providers";
import "./ThemeToggle.css";
//#endregion

export default function ThemeToggle() {
  //#region State
  const { mode, toggle } = useThemeMode();
  const isDark = mode === "dark";
  //#endregion

  //#region Render
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
  //#endregion
}
