import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/api/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ClinicProvider } from "@/context/ClinicContext";
import CommandPalette from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Clinic Management",
  description: "Smart Diagnosis SaaS – Digitize clinic operations with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ClinicProvider>
            <AuthProvider>
              <CommandPalette />
              {children}
            </AuthProvider>
          </ClinicProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
