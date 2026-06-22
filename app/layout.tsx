import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rafael Evan Kristanto | Portfolio",
  description:
    "Portfolio of Rafael Evan Kristanto – Undergraduate Student in Information Systems with a passion for Frontend Web Development",
  keywords: [
    "portfolio",
    "developer",
    "software engineer",
    "web development",
    "Rafael Evan Kristanto",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${nunito.variable} ${inter.variable} antialiased transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
