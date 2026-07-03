import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBSE Class 10 Study Assistant",
  description:
    "Personal AI study assistant for CBSE Class 10: study subject by subject, ask AI doubts, take mock tests and solve previous year papers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
