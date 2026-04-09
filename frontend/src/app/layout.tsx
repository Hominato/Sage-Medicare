import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: "Medicare/Medicaid Hospital Management",
  description: "A secure and efficient management platform for healthcare providers.",
};

import { HMSProvider } from "@/context/HMSContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-dash-bg`}>
        <HMSProvider>
          {children}
        </HMSProvider>
      </body>
    </html>
  );
}
