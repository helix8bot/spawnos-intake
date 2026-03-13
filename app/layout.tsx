import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0B0F14",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://audit.spawnos.io"),
  title: "SpawnOS Audit Application",
  description: "Apply for the SpawnOS Audit to diagnose operating bottlenecks, map AI team opportunities, and determine the right implementation path.",
  openGraph: {
    title: "SpawnOS Audit Application",
    description: "Apply for the SpawnOS Audit to diagnose operating bottlenecks, map AI team opportunities, and determine the right implementation path.",
    url: "https://audit.spawnos.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0B0F14] text-[#F5F7FA]`}>
        {children}
      </body>
    </html>
  );
}
