import { type Metadata } from "next";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fast Chat",
  description: "AI Chat Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <ClerkProvider afterSignOutUrl="/chat">
        <html
          lang="en"
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable}`}
        >
          <head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, viewport-fit=cover"
            />
            <style>{`
              html {
                font-family: var(--font-geist-sans);
              }
            `}</style>
          </head>
          <body className="antialiased bg-grey-50">
            <TopNav />
            <div className="max-w-5xl mx-auto">{children}</div>
          </body>
        </html>
      </ClerkProvider>
    </Suspense>
  );
}

const TopNav = () => {
  return (
    <nav className="sticky top-0 border-b bg-gray-900 z-10 h-[60px]">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/chat"
          className="flex items-center gap-2 text-white hover:text-gray-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="font-medium">Home</span>
        </Link>
        <div className="flex items-center gap-4 text-white w-[28px] h-[28px]">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};
