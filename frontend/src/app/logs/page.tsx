"use client";

//#region Imports
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import { type GridSortModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { FormFilters, type FilterValues } from "@/components/form";
import { ModalCreateLog } from "@/components/modal";
import TableLogs from "./_components/TableLogs";
import { useLogs, useDebounce } from "@/lib/hooks";
import { logsApi } from "@/lib/api";
import { SOURCES } from "@/lib/constants";
import type { LogQueryParams } from "@/lib/types";
//#endregion

export default function LogsPage() {
  //#region State
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({});
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "timestamp", sort: "desc" }]);
  const [createOpen, setCreateOpen] = useState(false);
  //#endregion

  //#region Derived
  const debouncedSearch = useDebounce(filters.search, 400);

  const queryParams: LogQueryParams = {
    ...filters,
    search: debouncedSearch,
    sort_by: sortModel[0]?.field ?? "timestamp",
    order: (sortModel[0]?.sort as "asc" | "desc") ?? "desc",
    page: paginationModel.page + 1,
    page_size: paginationModel.pageSize,
  };

  const { data, isLoading, isError, error } = useLogs(queryParams);
  //#endregion

  //#region Handlers
  const handleExport = () => {
    const url = logsApi.exportCsvUrl(queryParams);
    window.open(url, "_blank");
  };
  //#endregion

  //#region Render
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Logs List
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} size="small">
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} size="small">
            New Log
          </Button>
        </Box>
      </Box>

      <FormFilters values={filters} onChange={setFilters} sources={SOURCES} showSearch showSeverity />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error).message}
        </Alert>
      )}

      <TableLogs
        rows={data?.items ?? []}
        rowCount={data?.total ?? 0}
        isLoading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        onRowClick={(id) => router.push(`/logs/${id}`)}
      />

      <ModalCreateLog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(log) => router.push(`/logs/${log.id}`)}
      />
    </Box>
  );
  //#endregion
}
