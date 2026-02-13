import "@mantine/core/styles.css";
import "./globals.css";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";

export const metadata = {
  title: "QueueCare | Clinical Management",
  description: "Advanced healthcare queuing system",
};

export default function RootLayout({ children }) {
  return (
    /* Add suppressHydrationWarning here to fix the Mantine theme mismatch */
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}