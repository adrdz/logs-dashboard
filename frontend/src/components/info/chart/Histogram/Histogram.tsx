"use client";

//#region Imports
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import { SEVERITY_COLORS } from "@/lib/constants";
import type { HistogramResponse } from "@/lib/types";
//#endregion

//#region Types
interface Props {
  data?: HistogramResponse;
  isLoading?: boolean;
}
//#endregion

export default function Histogram({ data, isLoading }: Props) {
  if (isLoading) {
    return <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2, mb: 3 }} />;
  }

  //#region Derived
  const bars = data?.data ?? [];
  const xLabels = bars.map((b) => b.severity);
  const counts = bars.map((b) => b.count);
  const colors = bars.map((b) => SEVERITY_COLORS[b.severity]);
  //#endregion

  //#region Render
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Severity Distribution
      </Typography>

      {bars.every((b) => b.count === 0) ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No data for the selected filters
        </Typography>
      ) : (
        <BarChart
          xAxis={[{
            scaleType: "band",
            data: xLabels,
            colorMap: {
              type: "ordinal",
              values: xLabels,
              colors,
            },
          }]}
          series={[{ data: counts, label: "Count" }]}
          height={240}
          margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
          slotProps={{ legend: { hidden: true } }}
        />
      )}
    </Paper>
  );
  //#endregion
}
