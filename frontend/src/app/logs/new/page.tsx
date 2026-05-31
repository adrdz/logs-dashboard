"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import LogForm from "@/components/LogForm";
import { useCreateLog } from "@/lib/queries";
import type { LogCreate } from "@/lib/types";

export default function NewLogPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateLog();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: LogCreate) => {
    setError(null);
    try {
      const log = await mutateAsync(data);
      router.push(`/logs/${log.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

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

      <LogForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create Log" />
    </Box>
  );
}
