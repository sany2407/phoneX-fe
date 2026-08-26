import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip">
        <Navbar />
        <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
        <Footer />
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
