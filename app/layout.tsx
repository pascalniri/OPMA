import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OPMA",
  description:
    "Evidence-based project tracking with weighted milestones and proof-of-work verification.",
};

import { AuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster 
            theme="light" 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                color: '#1a1a1a',
                fontSize: '11px',
                fontWeight: '600'
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
