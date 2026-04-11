import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "./components/Nav";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { template: "%s | Chip Review", default: "Chip Review" },
  description: "The community platform for reviewing and rating snack chips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <header>
          <Nav />
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="bg-base-200 mt-12 py-8 text-center text-sm opacity-40">
          &copy; {new Date().getFullYear()} Chip Review. All rights reserved.
        </footer>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
