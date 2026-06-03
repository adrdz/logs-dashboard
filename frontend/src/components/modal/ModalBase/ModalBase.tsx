"use client";

//#region Imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
//#endregion

//#region Types
interface Props {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** MUI Dialog maxWidth; defaults to "sm". */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}
//#endregion

/**
 * Reusable modal shell built on MUI Dialog: titled header with a close (X)
 * button, scrollable content, and an optional actions footer. Inherits the
 * active theme's `background.paper`, so it renders correctly in dark mode.
 */
export default function ModalBase({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
}: Props) {
  //#region Render
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
  //#endregion
}
