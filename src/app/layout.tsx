import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: "Amantra | Boutique online de productos de la India",
  description: "Amantra presenta una experiencia de e-commerce para productos de bienestar, hogar y moda inspirados en la India.",
  openGraph: {
    title: 'Amantra | Boutique online de productos de la India',
    description: 'Amantra presenta una experiencia de e-commerce para productos de bienestar, hogar y moda inspirados en la India.',
    type: 'website',
    siteName: 'Amantra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amantra | Boutique online de productos de la India',
    description: 'Amantra presenta una experiencia de e-commerce para productos de bienestar, hogar y moda inspirados en la India.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
