import type { Metadata, Viewport } from "next";
import { Rethink_Sans, Figtree, Montserrat } from "next/font/google";
import "./globals.css";

const rethinkSans = Rethink_Sans({ subsets: ["latin"] });
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
});

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "underscores heardle",
  description:
    "a heardle game with underscores stuff. inspired by heardle.apictureof.me",
  openGraph: {
    title: "underscores heardle",
    description:
      "a heardle game with underscores stuff. inspired by heardle.apictureof.me",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans max-w-screen overflow-x-hidden",
        figtree.variable,
        montserratHeading.variable,
      )}
    >
      <body className={rethinkSans.className}>{children}</body>
    </html>
  );
}
