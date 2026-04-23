import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SurveySG — Ask Singapore",
  description: "Interactive population explorer for Singapore using synthetic personas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full antialiased overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
