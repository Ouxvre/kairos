import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Font Display untuk Landing Page (File Lokal)
const gfsDidot = localFont({
  src: "./fonts/GFS_Didot/GFSDidot-Regular.ttf", // Sesuaikan nama file .ttf kamu di dalam folder
  variable: "--font-serif",
  display: "swap",
});

// Font Primary UI / Body Text
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Font Terminal / Monospace Data
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KAIROS — Master the Moment",
  description: "Institutional-Grade AI Crypto Trading Control Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${gfsDidot.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0C10] text-[#F4F4F6] font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}