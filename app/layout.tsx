import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Geist, Newsreader } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3efe6",
};

export const metadata: Metadata = {
  title: "Lofthus Road Open",
  applicationName: "Lofthus",
  description:
    "Lofthus Road Open — miniligaen som skal føles som et mesterskap.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Lofthus",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "apple-mobile-web-app-title": "Lofthus",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nb"
      className={`${geistSans.variable} ${newsreader.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
