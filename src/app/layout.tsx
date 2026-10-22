import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { baseMetadata } from "@/lib/metadata";
import { AgeGateProvider } from "@/components/age-gate/AgeGateProvider";
import { AgeGate } from "@/components/age-gate/AgeGate";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { fontClassName, fontStyle } from "@/design/tokens/fonts/h-stadtnacht";
import { defaultFlavor, flavorCssVars } from "@/content/flavors";
import { INTRO_VERSION, storageKeys } from "@/config/intro";
import "./globals.css";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#05090C",
  width: "device-width",
  initialScale: 1,
};

/*
 * Runs before first paint: marks <html> with what storage and media queries
 * already know, so a verified visitor never sees the gate flash and the
 * intro never starts for someone who saw it.
 */
const headScript = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem(${JSON.stringify(
  storageKeys.ageGate,
)})==="verified")d.setAttribute("data-age","verified")}catch(e){}try{var s=localStorage.getItem(${JSON.stringify(
  storageKeys.introSeen,
)});if(s&&s.indexOf(${JSON.stringify(INTRO_VERSION + ":")})===0)d.setAttribute("data-intro","seen")}catch(e){}try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)d.setAttribute("data-motion","reduce")}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  const style = { ...fontStyle, ...flavorCssVars(defaultFlavor) } as CSSProperties;

  return (
    <html
      lang="de"
      data-palette="stadtnacht"
      className={fontClassName}
      style={style}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>
        <MotionProvider>
          <AgeGateProvider>
            <AgeGate />
            {children}
          </AgeGateProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
