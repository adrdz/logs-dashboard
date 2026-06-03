"use client";

//#region Imports
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";
import "./NavBar.css";
//#endregion

//#region Constants
const NAV_LINKS = [
  { href: "/logs", label: "Logs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/logs/new", label: "New Log" },
];
//#endregion

export default function NavBar() {
  //#region State
  const pathname = usePathname();
  //#endregion

  //#region Render
  return (
    <nav className="navbar">
      <p className="navbar__brand">Logs Dashboard</p>
      <div className="navbar__links">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`navbar__link${isActive ? " navbar__link--active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <ThemeToggle />
    </nav>
  );
  //#endregion
}
