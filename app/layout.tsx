import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react"
import Navigation from "@/components/navigation";
import NearWalletProvider from "@/providers/wallet";

export const metadata: Metadata = {
  title: {
    default: "Verto",
    template: "%s | Verto",
  }
  ,
  description: "Trustless Swaps on NEAR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-full">
        <NearWalletProvider>
          <Navigation />

          <main className="content min-h-screen z-10 bg-verto_bg">
            {children}
          </main>
        </NearWalletProvider>
      </body>
    </html>
  );
}
