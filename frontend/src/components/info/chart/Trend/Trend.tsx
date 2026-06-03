"use client";

//#region Imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { SEVERITY_COLORS } from "@/lib/constants";
import type { TimeseriesResponse } from "@/lib/types";
//#endregion

//#region Types
interface Props {
  data?: TimeseriesResponse;
  isLoading?: boolean;
  groupBy: "severity" | "source";
  onGroupByChange: (v: "severity" | "source") => void;
}
//#endregion

//#region Constants
const SOURCE_COLORS = [
  "#1976d2", "#388e3c", "#f57c00", "#7b1fa2", "#c62828", "#00838f",
];
//#endregion

export default function Trend({ data, isLoading, groupBy, onGroupByChange }: Props) {
  if (isLoading) {
    return <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2, mb: 3 }} />;
  }

  //#region Derived
  // Transform flat timeseries points into per-series data
  const labels = new Set<string>();
  const buckets = new Set<string>();

  data?.data.forEach((pt) => {
    labels.add(pt.label);
    buckets.add(pt.bucket);
  });

  const sortedBuckets = Array.from(buckets).sort();
  const sortedLabels = Array.from(labels).sort();

  const xAxis = sortedBuckets.map((b) => new Date(b));

  const series = sortedLabels.map((label, idx) => {
    const color =
      groupBy === "severity"
        ? SEVERITY_COLORS[label as keyof typeof SEVERITY_COLORS] ?? "#888"
        : SOURCE_COLORS[idx % SOURCE_COLORS.length];

    const dataPoints = sortedBuckets.map((bucket) => {
      const pt = data?.data.find((p) => p.bucket === bucket && p.label === label);
      return pt?.count ?? 0;
    });

    return { label, data: dataPoints, color };
  });
  //#endregion

  //#region Render
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Log Trend Over Time
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={groupBy}
          exclusive
          onChange={(_, v) => v && onGroupByChange(v)}
        >
          <ToggleButton value="severity">By Severity</ToggleButton>
          <ToggleButton value="source">By Source</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {series.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No data for the selected filters
        </Typography>
      ) : (
        <LineChart
          xAxis={[{
            data: xAxis,
            scaleType: "time",
            valueFormatter: (v: Date) => dayjs(v).format("MMM D"),
          }]}
          series={series.map((s) => ({
            data: s.data,
            label: s.label,
            color: s.color,
            curve: "linear",
          }))}
          height={280}
          margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
          slotProps={{ legend: { position: { vertical: "bottom", horizontal: "middle" } } }}
        />
      )}
    </Paper>
  );
  //#endregion
}
