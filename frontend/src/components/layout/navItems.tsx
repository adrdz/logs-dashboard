import AssessmentIcon from "@mui/icons-material/Assessment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

//#region Types
export interface NavItem {
  href: string;
  label: string;
  Icon: SvgIconComponent;
}
//#endregion

// Single source of truth for the app's primary navigation, shared by the
// desktop Sidebar and the mobile overlay menu.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Summary", Icon: AssessmentIcon },
  { href: "/logs", label: "Logs List", Icon: ListAltIcon },
  { href: "/about", label: "About", Icon: InfoOutlinedIcon },
];

/**
 * Active-route check. "/" must match exactly (otherwise it would be active on
 * every route); section roots like "/logs" also match their nested pages
 * (e.g. "/logs/123").
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
