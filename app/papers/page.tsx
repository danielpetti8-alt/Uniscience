import { prisma } from '@/lib/prisma'

export default async function PapersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams?.q || ''
  
  const papers = await prisma.paper.findMany({
    where: q ? { OR: [{ title: { contains: q } }, { studentName: { contains: q } }] } : {},
    orderBy: { year: 'desc' }
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ilmiy Baza • {papers.length} ta maqola</h2>
        <a href="/upload" className="bg-navy text-white px-5 py-2.5 rounded-full text-sm font-bold">+ Yangi maqola</a>
      </div>

      <form className="bg-white border border-slate-200 rounded-2xl p-4 mt-6 flex gap-3">
        <input name="q" defaultValue={q} placeholder="Qidiruv: inflyatsiya, raqamli so'm..." className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-sm" />
        <button className="bg-navy text-white px-6 py-2.5 rounded-full text-sm font-bold">Qidirish</button>
      </form>

      <div className="mt-6 space-y-3">
        {papers.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex gap-2 items-center text-xs">
              <span className="bg-navy text-white px-2 py-1 rounded-md">{p.year}</span>
              {p.isOAK && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold">OAK ✅</span>}
              <span className="text-slate-500">{p.faculty} • {p.groupName} • {p.citations} iqtibos</span>
            </div>
            <div className="font-bold text-base mt-2">{p.title}</div>
            <div className="text-sm text-slate-500 mt-1">{p.studentName} • {p.journal}</div>
          </div>
        ))}
      </div>
    </div>
  )
}