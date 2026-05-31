import type { Metadata, Viewport } from "next";
import { Rethink_Sans } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";

import { authOptions } from "@/lib/auth";
import Providers from "./_components/providers";

const rethinkSans = Rethink_Sans({ subsets: ["latin"] });

// Import to stop flash of very large icon.
import "@fortawesome/fontawesome-svg-core/styles.css";
// Now stop fontawesome from doing that itself.
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "pheardle",
  description:
    "guess your favourite artist's songs within one second, once a day. (previously the underscores heardle)",
  openGraph: {
    title: "underscores heardle",
    description:
      "guess your favourite artist's songs within one second, once a day. (previously the underscores heardle)",
    url: process.env.URL,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    creator: "@pearorchards_",
    card: "summary_large_image",
  },
  metadataBase: new URL(process.env.URL || ""),
};

export const viewport: Viewport = {
  themeColor: "#222",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={rethinkSans.className}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
