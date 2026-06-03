"use client";

//#region Imports
import { useState } from "react";
import Alert from "@mui/material/Alert";
import { FormLogs } from "@/components/form";
import { useCreateLog } from "@/lib/hooks";
import type { Log, LogCreate } from "@/lib/types";
import { ModalBase } from "../ModalBase";
//#endregion

//#region Types
interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after a log is successfully created (e.g. to navigate to it). */
  onCreated?: (log: Log) => void;
}
//#endregion

export default function ModalCreateLog({ open, onClose, onCreated }: Props) {
  //#region State
  const { mutateAsync, isPending } = useCreateLog();
  const [error, setError] = useState<string | null>(null);
  //#endregion

  //#region Handlers
  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (data: LogCreate) => {
    setError(null);
    try {
      const log = await mutateAsync(data);
      onCreated?.(log);
      handleClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };
  //#endregion

  //#region Render
  return (
    <ModalBase open={open} onClose={handleClose} title="Create Log Entry">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <FormLogs onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create Log" />
    </ModalBase>
  );
  //#endregion
}
