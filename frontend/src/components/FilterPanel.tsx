"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { SEVERITIES, type Severity } from "@/lib/types";

export interface FilterValues {
  start?: string;
  end?: string;
  severity?: Severity[];
  source?: string;
  search?: string;
}

interface Props {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  sources?: string[];
  showSearch?: boolean;
}

export default function FilterPanel({ values, onChange, sources = [], showSearch = false }: Props) {
  const handleChange = (key: keyof FilterValues, value: unknown) => {
    onChange({ ...values, [key]: value || undefined });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-start" }}>
          {showSearch && (
            <TextField
              label="Search messages"
              size="small"
              value={values.search ?? ""}
              onChange={(e) => handleChange("search", e.target.value)}
              sx={{ minWidth: 200 }}
            />
          )}

          <DateTimePicker
            label="Start date"
            value={values.start ? dayjs(values.start) : null}
            onChange={(v: Dayjs | null) => handleChange("start", v?.toISOString())}
            slotProps={{ textField: { size: "small" } }}
          />

          <DateTimePicker
            label="End date"
            value={values.end ? dayjs(values.end) : null}
            onChange={(v: Dayjs | null) => handleChange("end", v?.toISOString())}
            slotProps={{ textField: { size: "small" } }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              multiple
              value={values.severity ?? []}
              onChange={(e) => handleChange("severity", e.target.value)}
              input={<OutlinedInput label="Severity" />}
              renderValue={(selected) => (selected as string[]).join(", ")}
            >
              {SEVERITIES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {sources.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Source</InputLabel>
              <Select
                value={values.source ?? ""}
                onChange={(e) => handleChange("source", e.target.value)}
                input={<OutlinedInput label="Source" />}
              >
                <MenuItem value="">All sources</MenuItem>
                {sources.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={() => onChange({})}
            sx={{ alignSelf: "center" }}
          >
            Reset
          </Button>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
}
