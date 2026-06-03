"use client";

//#region Imports
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ChartTrend } from "@/components/info/chart";
import type { TimeseriesResponse } from "@/lib/types";
//#endregion

//#region Types
interface Props {
  data?: TimeseriesResponse;
  isLoading: boolean;
  interval: "hour" | "day" | "week" | "month";
  onIntervalChange: (v: "hour" | "day" | "week" | "month") => void;
  groupBy: "severity" | "source";
  onGroupByChange: (v: "severity" | "source") => void;
}
//#endregion

export default function SectionTrend({
  data,
  isLoading,
  interval,
  onIntervalChange,
  groupBy,
  onGroupByChange,
}: Props) {
  //#region Render
  return (
    <>
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <Typography variant="subtitle2" color="text.secondary">
          Chart interval:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="trend-interval-label">Interval</InputLabel>
          <Select
            labelId="trend-interval-label"
            id="trend-interval"
            value={interval}
            label="Interval"
            onChange={(e) => onIntervalChange(e.target.value as typeof interval)}
          >
            <MenuItem value="hour">Hour</MenuItem>
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <ChartTrend
        data={data}
        isLoading={isLoading}
        groupBy={groupBy}
        onGroupByChange={onGroupByChange}
      />
    </>
  );
  //#endregion
}
