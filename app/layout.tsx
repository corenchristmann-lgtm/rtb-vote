import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Vote — Road to Business 2026",
  description: "Elis ton coup de coeur parmi les 8 finalistes",
  icons: { icon: "/logos/venturelab.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#7A4AED",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={dmSans.variable}>
      <body className="min-h-dvh bg-bg font-sans text-heading antialiased">
        {children}
      </body>
    </html>
  );
}
