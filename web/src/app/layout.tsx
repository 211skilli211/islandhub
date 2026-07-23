import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ProvidersClient } from './providers-client';

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IslandHub",
  description: "The Caribbean's community-driven marketplace — food, products, tours, rentals, rides.",
  manifest: "/manifest.json",
  themeColor: "#0d9488",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IslandHub",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} antialiased`}
      >
        <ProvidersClient>
          {children}
        </ProvidersClient>
      </body>
    </html>
  );
}