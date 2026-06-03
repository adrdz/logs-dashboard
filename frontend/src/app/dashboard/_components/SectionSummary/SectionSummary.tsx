"use client";

//#region Imports
import { SEVERITY_COLORS } from "@/lib/constants";
import type { AnalyticsSummary, Severity } from "@/lib/types";
import "./SectionSummary.css";
//#endregion

//#region Types
interface Props {
  summary?: AnalyticsSummary;
  isLoading?: boolean;
}

interface CardData {
  label: string;
  count: number;
  color: string;
}
//#endregion

//#region Constants
const SKELETON_COUNT = 6;
const TOTAL_COLOR = "#455a64";
//#endregion

export default function SectionSummary({ summary, isLoading }: Props) {
  //#region Render
  if (isLoading) {
    return (
      <div className="summary">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className="summary__skeleton" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards: CardData[] = [
    { label: "Total", count: summary.total, color: TOTAL_COLOR },
    ...summary.by_severity.map((s) => ({
      label: s.severity,
      count: s.count,
      color: SEVERITY_COLORS[s.severity as Severity],
    })),
  ];

  return (
    <div className="summary">
      {cards.map(({ label, count, color }) => (
        <div
          key={label}
          className="summary__card"
          style={{ "--accent": color } as React.CSSProperties}
        >
          <p className="summary__count">{count.toLocaleString()}</p>
          <p className="summary__label">{label}</p>
        </div>
      ))}
    </div>
  );
  //#endregion
}
