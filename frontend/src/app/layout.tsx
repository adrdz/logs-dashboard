import type { Metadata } from "next";
import { NavBar } from "@/components/layout/NavBar";
import Providers from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Logs Dashboard",
  description: "Application log management and analytics dashboard",
};

// Runs before hydration so token-based surfaces render in the correct theme
// without a flash. Keep in sync with the storage key/logic in providers.tsx.
const themeInitScript = `(function(){try{var m=localStorage.getItem("theme-mode");if(!m){m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",m);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>
          <NavBar />
          <main className="app-main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
