import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "UniScience.uz — Talabaning raqamli ilmiy portfeli",
    template: "%s · UniScience.uz",
  },
  description:
    "TDIU talabalari ilmiy bazasi: OAK maqolalarni yuklash, tekshirish, reyting va ilmiy rahbarlik. «35 000 tashabbus» doirasida tasdiqlangan loyiha.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
