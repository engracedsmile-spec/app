/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

import type { Metadata } from "next";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/hooks/use-auth';
import { PreloaderProvider } from "@/context/preloader-context";
import FirebaseClientProvider from "@/firebase/client-provider";
import FcmInitializer from "@/components/fcm-initializer";
import { Suspense } from "react";
import { Preloader } from "@/components/preloader";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Engraced Smiles",
  description: "Reliable passenger and courier services.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.png", sizes: "284x284", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
        <head>
         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
         <meta name="application-name" content="Engraced Smiles" />
         <meta name="apple-mobile-web-app-capable" content="yes" />
         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
         <meta name="apple-mobile-web-app-title" content="Engraced Smiles" />
         <meta name="format-detection" content="telephone=no" />
         <meta name="mobile-web-app-capable" content="yes" />
         <meta name="msapplication-config" content="/icons/browserconfig.xml" />
         <meta name="msapplication-TileColor" content="#a67c00" />
         <meta name="msapplication-tap-highlight" content="no" />
         <meta name="theme-color" content="#1A1A1A" />
         <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
         <link rel="icon" href="/icon.png" type="image/png" sizes="284x284" />
         <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
         <link rel="manifest" href="/manifest.json" />
       </head>
       <body className="font-body antialiased" suppressHydrationWarning>
         <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
         >
           <FirebaseClientProvider>
             <AuthProvider>
               <PreloaderProvider>
                    <Suspense fallback={<Preloader />}>
                      <FcmInitializer />
                      {children}
                    </Suspense>
               </PreloaderProvider>
             </AuthProvider>
           </FirebaseClientProvider>
           <Toaster />
         </ThemeProvider>
       </body>
    </html>
  );
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
