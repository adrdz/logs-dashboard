"use client";

//#region Imports
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { FormLogs } from "@/components/form";
import { ChipSeverity } from "@/components/info/chip";
import { useDeleteLog, useLog, useUpdateLog } from "@/lib/hooks";
import type { LogCreate } from "@/lib/types";
//#endregion

//#region Types
interface Props {
  params: { id: string };
}
//#endregion

export default function LogDetailPage({ params }: Props) {
  //#region State
  const id = parseInt(params.id, 10);
  const router = useRouter();
  const { data: log, isLoading, isError } = useLog(id);
  const { mutateAsync: updateLog, isPending: isUpdating } = useUpdateLog(id);
  const { mutateAsync: deleteLog, isPending: isDeleting } = useDeleteLog();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //#endregion

  //#region Handlers
  const handleUpdate = async (data: LogCreate) => {
    setError(null);
    try {
      await updateLog(data);
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLog(id);
      router.push("/logs");
    } catch (err) {
      setError((err as Error).message);
      setConfirmDelete(false);
    }
  };
  //#endregion

  //#region Render
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !log) {
    return (
      <Alert severity="error">
        Log not found or failed to load.{" "}
        <Link component={NextLink} href="/logs">
          Return to logs
        </Link>
      </Alert>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/logs" underline="hover" color="inherit">
          Logs
        </Link>
        <Typography color="text.primary">Log #{id}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Log #{id}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setConfirmDelete(true)}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!editing && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                Severity
              </Typography>
              <ChipSeverity severity={log.severity} />
            </Box>
            <Divider />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                Source
              </Typography>
              <Typography>{log.source}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                Timestamp
              </Typography>
              <Typography>{dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss Z")}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                Created at
              </Typography>
              <Typography>{dayjs(log.created_at).format("YYYY-MM-DD HH:mm:ss Z")}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Message
              </Typography>
              <Typography
                component="pre"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  backgroundColor: "grey.50",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {log.message}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {editing && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Edit Log
          </Typography>
          <FormLogs initial={log} onSubmit={handleUpdate} isLoading={isUpdating} submitLabel="Save Changes" />
        </Paper>
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete Log #{id}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. The log entry will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
  //#endregion
}
