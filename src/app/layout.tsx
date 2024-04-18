import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";

const rethinkSans = Rethink_Sans({ subsets: ["latin"] });

// Import to stop flash of very large icon.
import '@fortawesome/fontawesome-svg-core/styles.css';
// Now stop fontawesome from doing that itself.
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "underscores heardle",
  description: "Made by PearOrchards, inspired by heardle.apictureof.me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={rethinkSans.className}>{children}</body>
    </html>
  );
}
