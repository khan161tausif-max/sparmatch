import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sparrd — Find Your Sparring Partner in Pune",
  description: "Match with fighters your size. We book the gym, assign a professional referee and judges, and run it like a proper event.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sparrd",
  },
  openGraph: {
    title: "Sparrd — Find Your Sparring Partner",
    description: "Organised sparring bouts in Pune with professional referees and judges.",
    url: "https://sparrd.vercel.app",
    siteName: "Sparrd",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#D85A30",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
