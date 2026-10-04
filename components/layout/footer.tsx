import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="UniScience" className="h-9 w-auto" />
            <span className="text-lg font-extrabold tracking-tight text-navy">
              UniScience<span className="text-gold">.uz</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Talabalarning raqamli ilmiy portfeli — OAK maqolalar, reyting, ilmiy rahbarlik.
            «35 000 tashabbus» doirasida.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-navy text-sm">Bo'limlar</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/reyting" className="hover:text-navy">Reyting</Link></li>
            <li><Link href="/yoriqnoma" className="hover:text-navy">Yo'riqnomalar</Link></li>
            <li><Link href="/yangiliklar" className="hover:text-navy">Yangiliklar</Link></li>
            <li><Link href="/matching" className="hover:text-navy">Ilmiy rahbarlik</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-navy text-sm">Talabalar uchun</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/royhat" className="hover:text-navy">Ro'yxatdan o'tish</Link></li>
            <li><Link href="/kirish" className="hover:text-navy">Kabinetga kirish</Link></li>
            <li><Link href="/yuklash" className="hover:text-navy">Maqola yuklash</Link></li>
            <li><Link href="/profil" className="hover:text-navy">Profil</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-navy text-sm">Aloqa</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>TDIU — Toshkent davlat iqtisodiyot universiteti</li>
            <li>OAK ro'yxati: oak.uz</li>
            <li>Qo'llanma: admin qo'llanmasi</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        UniScience.uz · Xaitboyev Yusuf Axmad o'g'li · TDIU Iqtisodiyot fakulteti · 2026
      </div>
    </footer>
  )
}
