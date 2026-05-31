"use client";

import Chip from "@mui/material/Chip";
import type { Severity } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/types";

interface Props {
  severity: Severity;
  size?: "small" | "medium";
}

export default function SeverityChip({ severity, size = "small" }: Props) {
  return (
    <Chip
      label={severity}
      size={size}
      sx={{
        backgroundColor: SEVERITY_COLORS[severity],
        color: "#fff",
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    />
  );
}
