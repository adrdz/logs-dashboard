"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import type { AnalyticsSummary, Severity } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/types";

interface Props {
  summary?: AnalyticsSummary;
  isLoading?: boolean;
}

export default function SummaryCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={140} height={88} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (!summary) return null;

  const totalCard = {
    label: "Total",
    count: summary.total,
    color: "#455a64",
  };

  const severityCards = summary.by_severity.map((s) => ({
    label: s.severity,
    count: s.count,
    color: SEVERITY_COLORS[s.severity as Severity],
  }));

  const cards = [totalCard, ...severityCards];

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
      {cards.map(({ label, count, color }) => (
        <Card
          key={label}
          variant="outlined"
          sx={{
            minWidth: 130,
            borderLeft: `4px solid ${color}`,
            flex: "0 0 auto",
          }}
        >
          <CardContent sx={{ p: "12px 16px !important" }}>
            <Typography variant="h4" fontWeight={700} color={color}>
              {count.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
