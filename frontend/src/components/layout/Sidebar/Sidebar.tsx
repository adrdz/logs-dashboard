"use client";

//#region Imports
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "../navItems";
import "./Sidebar.css";
//#endregion

export default function Sidebar() {
  //#region State
  const pathname = usePathname();
  //#endregion

  //#region Render
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar__link${active ? " sidebar__link--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon fontSize="small" className="sidebar__icon" />
              <span className="sidebar__label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
  //#endregion
}
