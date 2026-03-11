import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import ConditionalFooter from "./components/ConditionalFooter";
import "./globals.scss";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "munch — UW Seattle Dining Guide",
  description:
    "An interactive dining guide for UW Seattle students with dietary restrictions. Take a quiz, get matched to restaurants, and see where everyone's eating.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${ibmPlexMono.variable}`}
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        <Navbar />
        <main>{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
