import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://axial-phi.vercel.app"
  ),
  title: {
    default: "Axial — Instant Capital, Invisible Compliance",
    template: "%s · Axial",
  },
  description:
    "Liquidity and compliance engine for Philippine MSMEs. Unlock cash from tokenized receivables on Stellar while BIR EIS compliance runs automatically.",
  applicationName: "Axial",
  openGraph: {
    type: "website",
    siteName: "Axial",
    title: "Axial — Instant Capital, Invisible Compliance",
    description:
      "Liquidity and compliance engine for Philippine MSMEs. Tokenize receivables on Stellar, fund payroll instantly, automate BIR EIS compliance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axial — Instant Capital, Invisible Compliance",
    description:
      "Liquidity and compliance engine for Philippine MSMEs. Tokenize receivables on Stellar, fund payroll instantly, automate BIR EIS compliance.",
  },
};

/** Same Material Symbols axes as Stitch code.html exports (variable wght and FILL). */
const MATERIAL_SYMBOLS_STITCH_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={MATERIAL_SYMBOLS_STITCH_URL} rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background font-body-md text-body-md text-on-surface antialiased selection:bg-primary/20 selection:text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
