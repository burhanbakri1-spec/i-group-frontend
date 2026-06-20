import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* Rhode-matching display face.
   Rhode's collection-slider headings ("highlight", "bronze", "tint"),
   the "swipe" cursor label, and the on-image "first access" badge
   are all set in "Rektorat Heavy" — a paid commercial face. We use
   Bricolage Grotesque as the closest open-variable equivalent
   (geometric display, weight 800 matches Rektorat Heavy, supports
   the -0.04em tracking we use). Wire it under --font-rektorat so
   any future Rektorat license swap is a one-line change. */
const rektorat = Bricolage_Grotesque({
  variable: "--font-rektorat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "IGroup - Building The Digital Future",
  description: "An integrated ecosystem of 8 innovative companies shaping the future of beauty, health, luxury, technology, and wellness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rektorat.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
