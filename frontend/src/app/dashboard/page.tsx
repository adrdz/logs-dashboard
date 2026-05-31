"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import FilterPanel, { type FilterValues } from "@/components/FilterPanel";
import SummaryCards from "@/components/SummaryCards";
import TrendChart from "@/components/TrendChart";
import SeverityHistogram from "@/components/SeverityHistogram";
import { useSummary, useTimeseries, useHistogram } from "@/lib/queries";
import type { AnalyticsQueryParams } from "@/lib/types";

const SOURCES = [
  "auth-service", "payments-api", "user-service",
  "notification-worker", "api-gateway", "scheduler",
];

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterValues>({});
  const [interval, setInterval] = useState<"hour" | "day" | "week" | "month">("day");
  const [groupBy, setGroupBy] = useState<"severity" | "source">("severity");

  const analyticsParams: AnalyticsQueryParams = {
    ...filters,
    interval,
    group_by: groupBy,
  };

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useSummary(analyticsParams);

  const {
    data: timeseries,
    isLoading: timeseriesLoading,
    isError: timeseriesError,
  } = useTimeseries(analyticsParams);

  const {
    data: histogram,
    isLoading: histogramLoading,
    isError: histogramError,
  } = useHistogram(analyticsParams);

  const hasError = summaryError || timeseriesError || histogramError;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <FilterPanel
        values={filters}
        onChange={setFilters}
        sources={SOURCES}
      />

      {hasError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load analytics data. Please try again.
        </Alert>
      )}

      <SummaryCards summary={summary} isLoading={summaryLoading} />

      <Divider sx={{ my: 3 }} />

      {/* Interval selector for charts */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <Typography variant="subtitle2" color="text.secondary">
          Chart interval:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Interval</InputLabel>
          <Select
            value={interval}
            label="Interval"
            onChange={(e) => setInterval(e.target.value as typeof interval)}
          >
            <MenuItem value="hour">Hour</MenuItem>
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TrendChart
        data={timeseries}
        isLoading={timeseriesLoading}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />

      <SeverityHistogram data={histogram} isLoading={histogramLoading} />
    </Box>
  );
}
