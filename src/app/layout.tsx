import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "ArchiDesignAid",
  description: "Collaborative Architectural Design Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ArchiDesignAid
            </Link>
            <nav className="flex gap-6">
              <Link href="/projects" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Projects
              </Link>
              <Link href="/library" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Library
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
