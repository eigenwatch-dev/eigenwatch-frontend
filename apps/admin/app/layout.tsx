import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "./Provider";

export const metadata: Metadata = {
  title: {
    default: "EigenWatch Admin",
    template: "%s | EigenWatch Admin",
  },
  description: "EigenWatch Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
