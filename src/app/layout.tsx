import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@/config/wagmi";
import { WagmiProvider } from "wagmi";
import { HyperLiquidProvider } from "@/context/HyperLiquid";
import Header from "@/components/Header";
import ReactQueryProvider from "@/ReactQueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexon",
  description: "Best place to Trade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WagmiProvider config={config}>
      <ReactQueryProvider>
        <HyperLiquidProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <Header />
              {children}
            </body>
          </html>
        </HyperLiquidProvider>
      </ReactQueryProvider>
    </WagmiProvider>
  );
}
