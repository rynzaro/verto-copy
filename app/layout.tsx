import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NearWalletProvider from "@/providers/wallet";
import PageNav from "@/components/PageNav";
import React from "react";
import ProfileNav from "@/components/ProfileNav";
import HeroNav from "@/components/HeroNav";

export const metadata: Metadata = {
  title: "VERTO",
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
          <header className="fixed top-0 left-0 w-full h-28 flex items-center justify-center z-50 border-b-2 border-b-verto_borders">
            <div className="flex bg-zinc-800 bg-opacity-70 justify-start w-3/4 items-center py-1 px-4 rounded-2xl z-50">
              <HeroNav />
              <PageNav />
            </div>
            <ProfileNav />
          </header>

          <main className="content min-h-screen z-10 bg-verto_bg">
            {children}
          </main>
        </NearWalletProvider>
      </body>
    </html>
  );
}
