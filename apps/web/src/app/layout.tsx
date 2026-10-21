import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Literata } from "next/font/google";

import { Sidebar } from "@/components/sidebar";

import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ai-tutor",
  description: "A learning companion that keeps what you learn and makes you think.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${literata.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans md:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 md:py-12 lg:px-14">{children}</main>
      </body>
    </html>
  );
}
