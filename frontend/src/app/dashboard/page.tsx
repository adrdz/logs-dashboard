"use client";

//#region Imports
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { FormFilters, type FilterValues } from "@/components/form";
import { ChartHistogram } from "@/components/info/chart";
import { SectionSummary } from "./_components/SectionSummary";
import SectionTrend from "./_components/SectionTrend";
import { useSummary, useTimeseries, useHistogram } from "@/lib/hooks";
import { SOURCES } from "@/lib/constants";
import type { AnalyticsQueryParams } from "@/lib/types";
//#endregion

export default function DashboardPage() {
  //#region State
  const [filters, setFilters] = useState<FilterValues>({});
  const [interval, setInterval] = useState<"hour" | "day" | "week" | "month">("day");
  const [groupBy, setGroupBy] = useState<"severity" | "source">("severity");
  //#endregion

  //#region Derived
  const analyticsParams: AnalyticsQueryParams = {
    ...filters,
    interval,
    group_by: groupBy,
  };

  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useSummary(analyticsParams);
  const { data: timeseries, isLoading: timeseriesLoading, isError: timeseriesError } = useTimeseries(analyticsParams);
  const { data: histogram, isLoading: histogramLoading, isError: histogramError } = useHistogram(analyticsParams);

  const hasError = summaryError || timeseriesError || histogramError;
  //#endregion

  //#region Render
  return (
    <div>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <FormFilters values={filters} onChange={setFilters} sources={SOURCES} />

      {hasError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load analytics data. Please try again.
        </Alert>
      )}

      <SectionSummary summary={summary} isLoading={summaryLoading} />

      <Divider sx={{ my: 3 }} />

      <SectionTrend
        data={timeseries}
        isLoading={timeseriesLoading}
        interval={interval}
        onIntervalChange={setInterval}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />

      <ChartHistogram data={histogram} isLoading={histogramLoading} />
    </div>
  );
  //#endregion
}
