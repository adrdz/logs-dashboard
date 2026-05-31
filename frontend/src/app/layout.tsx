import type { Metadata } from "next";
import Box from "@mui/material/Box";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Logs Dashboard",
  description: "Application log management and analytics dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <Box component="main" sx={{ minHeight: "calc(100vh - 64px)", p: 3 }}>
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  );
}
