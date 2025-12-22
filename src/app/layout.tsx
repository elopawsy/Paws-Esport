import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import CookieBanner from "@/components/compliance/CookieBanner";
import { ThemeProvider } from "@/components/theme-provider";

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
  title: {
    default: "PawsEsport | Transfer Market & Match Tracker",
    template: "%s | PawsEsport",
  },
  description: "Professional Esport Transfer Simulator and Real-time Match Tracker. Follow CS2, LoL, Valorant tournaments and manage your dream team.",
  keywords: ["esports", "CS2", "counter-strike", "transfer market", "simulator", "match tracker", "tournament", "pandascore"],
  authors: [{ name: "PawsEsport Team" }],
  creator: "PawsEsport",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pawsesport.com",
    siteName: "PawsEsport",
    title: "PawsEsport | Transfer Market & Match Tracker",
    description: "Professional Esport Transfer Simulator and Real-time Match Tracker.",
    images: [
      {
        url: "/og-image.jpg", // Make sure this exists or is a placeholder
        width: 1200,
        height: 630,
        alt: "PawsEsport",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PawsEsport | Transfer Market & Match Tracker",
    description: "Professional Esport Transfer Simulator and Real-time Match Tracker.",
    images: ["/og-image.jpg"],
    creator: "@pawsesport",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to main content link for keyboard users */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          
          <Navbar />
          <main id="main-content" className="pt-16 min-h-screen pb-10 flex flex-col" tabIndex={-1}>
            <div className="flex-1">{children}</div>
          </main>
          <Footer />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
