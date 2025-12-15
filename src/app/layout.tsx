import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUS | Transfer Market",
  description: "Professional Esport Transfer Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${oswald.variable} ${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        <Navbar />
        <main className="pt-20 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
