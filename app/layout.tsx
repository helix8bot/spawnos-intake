import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SpawnOS — Build Your AI Team",
  description: "Answer a few questions so we can design your custom AI operating system.",
  openGraph: {
    title: "SpawnOS — Build Your AI Team",
    description: "Answer a few questions so we can design your custom AI operating system.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0B1426] text-white`}>
        {children}
      </body>
    </html>
  );
}
