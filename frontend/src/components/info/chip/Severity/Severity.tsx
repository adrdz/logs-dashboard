"use client";

//#region Imports
import type { Severity } from "@/lib/types";
import "./Severity.css";
//#endregion

//#region Types
interface Props {
  severity: Severity;
  size?: "small" | "medium";
}
//#endregion

export default function Severity({ severity, size = "small" }: Props) {
  //#region Render
  const className = `chip chip--${size} chip--${severity.toLowerCase()}`;
  return <span className={className}>{severity}</span>;
  //#endregion
}
