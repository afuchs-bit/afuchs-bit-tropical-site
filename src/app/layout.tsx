import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { baseMetadata } from "@/lib/metadata";
import { AgeGateProvider } from "@/components/age-gate/AgeGateProvider";
import { AgeGate } from "@/components/age-gate/AgeGate";
import "./globals.css";

/*
 * Fonts: deliberately not chosen yet. The design round picks an OFL pairing
 * and wires it here via next/font/google (self-hosted at build time, no
 * runtime request to Google). Example:
 *
 *   import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
 *   const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
 *   ...and add `${display.variable} ${body.variable} ${mono.variable}` to <html className>.
 */

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#0e0d0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <AgeGateProvider>
          <AgeGate />
          {children}
        </AgeGateProvider>
      </body>
    </html>
  );
}
