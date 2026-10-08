import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fundament — Intentional Life Dashboard",
  description: "A calm dashboard for seeing what is stable, choosing one focus and moving the next meaningful steps.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
