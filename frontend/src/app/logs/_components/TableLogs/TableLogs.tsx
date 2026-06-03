"use client";

//#region Imports
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { ChipSeverity } from "@/components/info/chip";
import type { Log, Severity } from "@/lib/types";
//#endregion

//#region Types
interface Props {
  rows: Log[];
  rowCount: number;
  isLoading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onRowClick: (id: number) => void;
}
//#endregion

//#region Constants
const COLUMNS: GridColDef[] = [
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
    renderCell: (params) => <ChipSeverity severity={params.value as Severity} />,
  },
  { field: "source", headerName: "Source", width: 170 },
  { field: "message", headerName: "Message", flex: 1, minWidth: 300 },
];
//#endregion

export default function TableLogs({
  rows,
  rowCount,
  isLoading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  onRowClick,
}: Props) {
  //#region Render
  return (
    <DataGrid
      rows={rows}
      columns={COLUMNS}
      rowCount={rowCount}
      loading={isLoading}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      pageSizeOptions={[25, 50, 100]}
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      onRowClick={(params) => onRowClick(params.id as number)}
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
  );
  //#endregion
}
