import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const nohemi = localFont({
  src: "../../public/fonts/Nohemi-VF.ttf",
  variable: "--font-nohemi",
  display: "swap",
  // Variable font — expose the full weight range
  weight: "100 900",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://phonex.in"),
  title: {
    default: "phoneX — Premium Skins for Phones & Laptops",
    template: "%s | phoneX",
  },
  description:
    "Precision-cut vinyl skins for phones and laptops. Choose from hundreds of designs or create your own in the phoneX studio.",
  openGraph: {
    siteName: "phoneX",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nohemi.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip">
        <Navbar />
        <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
        <Footer />
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
