"use client";

//#region Imports
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { SEVERITIES, SOURCES } from "@/lib/constants";
import type { Log, LogCreate, Severity } from "@/lib/types";
//#endregion

//#region Types
interface Props {
  initial?: Partial<Log>;
  onSubmit: (data: LogCreate) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

interface FormErrors {
  message?: string;
  severity?: string;
  source?: string;
}
//#endregion

export default function Logs({
  initial,
  onSubmit,
  submitLabel = "Save",
  isLoading = false,
}: Props) {
  //#region State
  const [message, setMessage] = useState(initial?.message ?? "");
  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? "INFO");
  const [source, setSource] = useState(initial?.source ?? "");
  const [timestamp, setTimestamp] = useState<Dayjs | null>(
    initial?.timestamp ? dayjs(initial.timestamp) : null
  );
  const [errors, setErrors] = useState<FormErrors>({});
  //#endregion

  //#region Handlers
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!message.trim()) newErrors.message = "Message is required";
    if (!severity) newErrors.severity = "Severity is required";
    if (!source.trim()) newErrors.source = "Source is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      message: message.trim(),
      severity,
      source: source.trim(),
      timestamp: timestamp?.toISOString(),
    });
  };
  //#endregion

  //#region Render
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
        <TextField
          label="Message"
          multiline
          minRows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={!!errors.message}
          helperText={errors.message}
          required
          inputProps={{ maxLength: 10000 }}
          // Keep the textarea on the theme surface (no white box in dark mode).
          sx={{ "& .MuiInputBase-root": { backgroundColor: "background.paper" } }}
        />

        <FormControl error={!!errors.severity}>
          <InputLabel id="log-severity-label" required>Severity</InputLabel>
          <Select
            labelId="log-severity-label"
            id="log-severity"
            value={severity}
            label="Severity"
            onChange={(e) => setSeverity(e.target.value as Severity)}
          >
            {SEVERITIES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
          {errors.severity && <FormHelperText>{errors.severity}</FormHelperText>}
        </FormControl>

        <FormControl error={!!errors.source}>
          <InputLabel id="log-source-label" required>Source</InputLabel>
          <Select
            labelId="log-source-label"
            id="log-source"
            value={source}
            label="Source"
            onChange={(e) => setSource(e.target.value)}
          >
            {SOURCES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
          {errors.source && <FormHelperText>{errors.source}</FormHelperText>}
        </FormControl>

        <DateTimePicker
          label="Timestamp (optional — defaults to now)"
          value={timestamp}
          onChange={(v) => setTimestamp(v)}
          disableFuture
          maxDateTime={dayjs()}
          slotProps={{ textField: { fullWidth: true } }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          size="large"
          sx={{ alignSelf: "flex-start" }}
        >
          {isLoading ? "Saving…" : submitLabel}
        </Button>
      </Box>
    </LocalizationProvider>
  );
  //#endregion
}
