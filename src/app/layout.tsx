import type { Metadata, Viewport } from "next";
import { Archivo, Atkinson_Hyperlegible, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { appConfig } from "@/config/app.config";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${appConfig.appName} · ${appConfig.appLocation}`,
    template: `%s · ${appConfig.appName}`,
  },
  description: appConfig.appTagline,
  icons: { icon: "/images/play-ready-logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#0a0f0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${archivo.variable} ${atkinson.variable} ${jetbrainsMono.variable} antialiased bg-field text-ink font-body min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
