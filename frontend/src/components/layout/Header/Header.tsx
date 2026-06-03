"use client";

//#region Imports
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import "./Header.css";
//#endregion

//#region Types
interface Props {
  menuOpen: boolean;
  onMenuToggle: () => void;
}
//#endregion

export default function Header({ menuOpen, onMenuToggle }: Props) {
  //#region Render
  return (
    <header className="header">
      <Link href="/" className="header__brand">
        Logs Dashboard
      </Link>

      <div className="header__actions">
        <div className="header__theme-desktop">
          <ThemeToggle />
        </div>

        <button
          type="button"
          className={`header__burger${menuOpen ? " header__burger--open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={onMenuToggle}
        >
          <span className="header__burger-bar" />
          <span className="header__burger-bar" />
          <span className="header__burger-bar" />
        </button>
      </div>
    </header>
  );
  //#endregion
}
