"use client";

import "@mantine/core/styles.css";
import "./globals.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLocalRoot, setIsLocalRoot] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (pathname === "/" || pathname.startsWith('/myqueue') || pathname.startsWith('/join')) {
      setIsLocalRoot(true);
    } else {
      setIsLocalRoot(false);
    }

    const staffEmail = localStorage.getItem('staff_email');
    const userPhone = localStorage.getItem('user_phone');
    setIsAuthChecked(!!(staffEmail || userPhone));
    
  }, [pathname]);

  const isDashboard = pathname.startsWith('/facilities/') && pathname.endsWith('/dashboard');
  const showNavbar = !isDashboard;
  const shouldShowChildren = isAuthChecked || isLocalRoot;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          {mounted && showNavbar && <Navbar />}
          
          <main>
            {mounted && shouldShowChildren ? children : null}
          </main>
        </MantineProvider>
      </body>
    </html>
  );
}