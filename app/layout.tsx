import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABIS - AI Boardroom Intelligence System",
  description: "High-stakes CXO boardroom simulator with Socratic questioning constraint.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
