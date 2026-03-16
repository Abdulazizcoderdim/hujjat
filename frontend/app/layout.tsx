import ClickScript from "@/components/ClickScript";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doclab - Hujjatlar bozori",
  description: "O'quv va ilmiy hujjatlar platformasi",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.doclab.uz",
  ), // Bu juda muhim!
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    title: "Doclab - Hujjatlar bozori",
    description: "O'quv va ilmiy hujjatlar platformasi",
    url: "https://www.doclab.uz",
    siteName: "Doclab",
    images: [
      {
        url: "https://www.doclab.uz/icon.png",
        width: 1200,
        height: 630,
        alt: "Doclab platformasi",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doclab - Hujjatlar bozori",
    description: "O'quv va ilmiy hujjatlar platformasi",
    images: ["https://www.doclab.uz/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <main>{children}</main>

          <Toaster />

          <ClickScript />
        </Providers>
      </body>
    </html>
  );
}
