import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider";
import { AppWrapper } from "@/components/layout/AppWrapper";
import { LinguiProvider } from "@/components/i18n/LinguiProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SUPERCARS - Find Your Dream Car",
  description: "Search and browse premium supercars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          fontFamily: `${geistSans.style.fontFamily}, Arial, Helvetica, sans-serif`,
          margin: 0,
          padding: 0,
        }}
      >
        <Provider>
          <LinguiProvider>
            <AppWrapper>{children}</AppWrapper>
          </LinguiProvider>
        </Provider>
      </body>
    </html>
  );
}
