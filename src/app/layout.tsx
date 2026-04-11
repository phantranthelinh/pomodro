import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/ui/nav-bar";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodro — Focus Timer with Ambient Sounds",
  description: "A Pomodoro timer with multi-channel ambient audio mixer",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col text-brand-text"
        style={{
          background:
            "linear-gradient(135deg, #D0FFD6 0%, #E8FFE8 50%, #D0FFD6 100%)",
        }}
      >
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
