"use client";

//#region Imports
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";
import { NAV_ITEMS, isNavItemActive } from "../navItems";
import "./MobileMenu.css";
//#endregion

//#region Types
interface Props {
  open: boolean;
  onClose: () => void;
}
//#endregion

export default function MobileMenu({ open, onClose }: Props) {
  //#region State
  const pathname = usePathname();
  const tabIndex = open ? 0 : -1;
  //#endregion

  //#region Render
  return (
    <div className={`mobile-menu${open ? " mobile-menu--open" : ""}`} aria-hidden={!open}>
      <nav className="mobile-menu__panel">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              tabIndex={tabIndex}
              className={`mobile-menu__link${active ? " mobile-menu__link--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon fontSize="small" />
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="mobile-menu__theme">
          <ThemeToggle />
          <span className="mobile-menu__theme-label">Toggle theme</span>
        </div>
      </nav>
    </div>
  );
  //#endregion
}
