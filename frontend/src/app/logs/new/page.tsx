"use client";

//#region Imports
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { FormLogs } from "@/components/form";
import { useCreateLog } from "@/lib/hooks";
import type { LogCreate } from "@/lib/types";
//#endregion

export default function NewLogPage() {
  //#region State
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateLog();
  const [error, setError] = useState<string | null>(null);
  //#endregion

  //#region Handlers
  const handleSubmit = async (data: LogCreate) => {
    setError(null);
    try {
      const log = await mutateAsync(data);
      router.push(`/logs/${log.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };
  //#endregion

  //#region Render
  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/logs" underline="hover" color="inherit">
          Logs
        </Link>
        <Typography color="text.primary">New Log</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Create Log Entry
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormLogs onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create Log" />
    </Box>
  );
  //#endregion
}
