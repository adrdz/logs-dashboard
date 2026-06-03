"use client";

//#region Imports
import { useEffect, useState } from "react";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";
import { MobileMenu } from "../MobileMenu";
//#endregion

//#region Types
interface Props {
  children: React.ReactNode;
}
//#endregion

export default function AppShell({ children }: Props) {
  //#region State
  const [menuOpen, setMenuOpen] = useState(false);
  //#endregion

  //#region Effects
  // Close the mobile overlay on Escape, and lock body scroll while it's open.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  //#endregion

  //#region Render
  return (
    <>
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((o) => !o)} />
      <Sidebar />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="app-main">{children}</main>
    </>
  );
  //#endregion
}
