import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniScience.uz - Talabaning Raqamli Ilmiy Portfeli",
  description: "TDIU talabalari ilmiy bazasi - 35 000 tashabbusda Respublika bo'yicha tasdiqlangan loyiha. Xaitboyev Yusuf",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="antialiased">
        <nav className="flex justify-between items-center px-8 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="UniScience" className="h-9 bg-white rounded-lg p-1" />
            <span className="bg-gold text-navy px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide">
              35 000 TASHABBUS • TASDIQLANGAN
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm font-semibold text-slate-600">
            <a href="/" className="text-navy font-bold">Dashboard</a>
            <a href="/papers" className="hover:text-navy">Baza</a>
            <a href="/upload" className="bg-navy text-white px-4 py-2 rounded-full hover:bg-navyLight">
              + Maqola
            </a>
            <img 
              src="https://ui-avatars.com/api/?name=Yusuf+Xaitboyev&background=FFC300&color=0F1E3D&bold=true" 
              alt="Yusuf"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </nav>
        <main>{children}</main>
        <footer className="text-center py-8 text-slate-400 text-xs mt-10">
          UniScience.uz • Xaitboyev Yusuf Axmad o'g'li • TDIU Iqtisodiyot fakulteti • 35 000 Tashabbus • 2026
        </footer>
      </body>
    </html>
  );
}