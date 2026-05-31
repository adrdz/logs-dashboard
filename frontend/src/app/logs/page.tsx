"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, type GridColDef, type GridSortModel } from "@mui/x-data-grid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import FilterPanel, { type FilterValues } from "@/components/FilterPanel";
import SeverityChip from "@/components/SeverityChip";
import { useLogs } from "@/lib/queries";
import { logsApi } from "@/lib/api";
import type { LogQueryParams, Severity } from "@/lib/types";

const SOURCES = [
  "auth-service", "payments-api", "user-service",
  "notification-worker", "api-gateway", "scheduler",
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function LogsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({});
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "timestamp", sort: "desc" }]);

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

  const columns: GridColDef[] = [
    {
      field: "timestamp",
      headerName: "Timestamp",
      width: 200,
      renderCell: (params) => dayjs(params.value as string).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      field: "severity",
      headerName: "Severity",
      width: 130,
      renderCell: (params) => <SeverityChip severity={params.value as Severity} />,
    },
    { field: "source", headerName: "Source", width: 170 },
    { field: "message", headerName: "Message", flex: 1, minWidth: 300 },
  ];

  const handleExport = () => {
    const url = logsApi.exportCsvUrl(queryParams);
    window.open(url, "_blank");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Logs
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            size="small"
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href="/logs/new"
            size="small"
          >
            New Log
          </Button>
        </Box>
      </Box>

      <FilterPanel
        values={filters}
        onChange={setFilters}
        sources={SOURCES}
        showSearch
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error).message}
        </Alert>
      )}

      <DataGrid
        rows={data?.items ?? []}
        columns={columns}
        rowCount={data?.total ?? 0}
        loading={isLoading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[25, 50, 100]}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        onRowClick={(params) => router.push(`/logs/${params.id}`)}
        autoHeight
        sx={{
          cursor: "pointer",
          "& .MuiDataGrid-row:hover": { backgroundColor: "action.hover" },
        }}
        slotProps={{
          loadingOverlay: {
            variant: "skeleton",
            noRowsVariant: "skeleton",
          },
        }}
      />
    </Box>
  );
}
