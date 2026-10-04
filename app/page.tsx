export default function Home() {
  const faculties = [
    { name: "Iqtisodiyot", count: 124 },
    { name: "Raqamli iqtisodiyot", count: 98 },
    { name: "Moliya va kredit", count: 76 },
    { name: "Menejment", count: 54 },
  ];

  const groups = [
    { name: "IQ-62", papers: 18, oak: 12, place: "🥇" },
    { name: "BI-44", papers: 15, oak: 9, place: "🥈" },
    { name: "MN-31", papers: 13, oak: 8, place: "🥉" },
    { name: "RA-21", papers: 11, oak: 7, place: "4" },
  ];

  return (
    <div>
      {/* HERO */}
      <div className="m-5 rounded-[24px] p-8 md:p-12 text-white" style={{background: 'radial-gradient(1200px 600px at 80% -20%, #1e3a8a 0%, #0f1e3d 60%)'}}>
        <div className="flex justify-between flex-wrap gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-[11px] tracking-wide">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
              LIVE • 12 TA MAQOLA BAZADA • TASDIQLANGAN
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[0.95] mt-4 tracking-tight">
              Talabalarning <span className="text-gold">Ilmiy Portfeli</span><br />Endi Yagona Joyda
            </h1>
            <p className="text-slate-300 mt-3 text-base max-w-lg">
              TDIU talabalari OAK maqolalarini saqlaydi, fakultetlar reytingi real vaqtda shakllanadi. 35 000 tashabbusda tasdiqlangan loyiha.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/papers" className="bg-gold text-navy px-6 py-3 rounded-full font-bold text-sm">Bazani ko'rish →</a>
              <a href="/upload" className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-bold text-sm">+ Maqola qo'shish</a>
            </div>
          </div>
          <div className="bg-white text-navy rounded-2xl p-4 min-w-[320px]">
            <div className="text-[11px] font-extrabold tracking-widest text-slate-500">JONLI STATISTIKA</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-lightBg rounded-xl p-3"><div className="text-[11px] text-slate-500">JAMI</div><div className="text-2xl font-extrabold">12 ta</div><div className="text-[11px] text-green-600">↑ 23% bu oy</div></div>
              <div className="bg-yellow-50 rounded-xl p-3"><div className="text-[11px] text-slate-500">OAK TASDIQLANGAN</div><div className="text-2xl font-extrabold">9 ta</div><div className="text-[11px]">75% tasdiq</div></div>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold">FAKULTETLAR</div>
              {faculties.map(f => (
                <div key={f.name} className="mt-2">
                  <div className="flex justify-between text-xs"><span>{f.name}</span><b>{f.count}</b></div>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-1"><div className="h-full bg-navy rounded-full" style={{width: `${(f.count/124)*100}%`}}></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="px-8 grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold">Fakultetlar Reytingi</h3>
          <div className="mt-4 space-y-3">
            {faculties.map(f => (
              <div key={f.name} className="flex items-center gap-3">
                <div className="w-32 text-xs">{f.name}</div>
                <div className="flex-1 h-3 bg-slate-100 rounded-full"><div className="h-full bg-navy rounded-full" style={{width: `${(f.count/124)*100}%`}}></div></div>
                <div className="text-sm font-bold w-8">{f.count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold">🏆 Guruhlar - TOP 4</h3>
          <table className="w-full mt-3 text-sm">
            <thead><tr className="text-[11px] text-slate-400 text-left"><th className="py-2">GURUH</th><th>MAQOLA</th><th>OAK</th><th>O'RIN</th></tr></thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.name} className="border-t border-slate-100">
                  <td className="py-3 font-bold">{g.name}</td><td>{g.papers}</td><td><span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs">{g.oak}</span></td><td>{g.place}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 bg-gold rounded-xl p-3 flex gap-2 text-xs text-navy"><span>🎯</span><div><b>Xaitboyev Yusuf</b> - TOP 1% da. Sizning profilingiz reytingga ta'sir qilmoqda.</div></div>
        </div>
      </div>
    </div>
  );
}