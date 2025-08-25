import type { Metadata } from "next";
import Head from "next/head";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/FooterBackup";
import MainTitle from "@/components/MainTitle";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/SessionProviderWrapper"; // Import the new wrapper component


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyCredit Whistleblower Portal",
  description: "A secure platform for reporting misconduct",
  icons: {
    icon: [
      { url: "/icon-17x16.png", sizes: "17x16", type: "image/png" },
      { url: "/icon-33x32.png", sizes: "33x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x173",
      type: "image/png",
    },
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <SessionProviderWrapper>
          <Toaster
            position="top-right"
            containerClassName="p-12"
            reverseOrder={false}
            toastOptions={{
              duration: 4000, // ⏳ Toast will stay for 5 seconds

              className:
                "text-base font-bold uppercase px-6 py-5 rounded-lg shadow-lg",
              style: {
                fontSize: "15px",
                padding: "15px",
                maxWidth: "400px",
              },
              success: {
                style: {
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "2px solid white",
                },
              },
              error: {
                style: {
                  background: "#dc2626", // A red tone (can adjust to match your palette)
                  color: "#ffffff",
                  border: "2px solid white",
                },
              },
            }}
          />{" "}
          <Header />
          <MainTitle />
          {children}
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
