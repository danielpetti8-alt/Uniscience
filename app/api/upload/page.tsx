'use client'
import { useState } from 'react'

export default function UploadPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        alert('✅ Saqlandi! Endi bazada ko\'rinadi.')
        window.location.href = '/papers'
      } else {
        alert('Xatolik: ' + data.error)
      }
    } catch (err) {
      alert('Xatolik yuz berdi, terminalni tekshir')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold">+ Yangi ilmiy ish yuklash</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input name="studentName" defaultValue="Xaitboyev Yusuf Axmad o'g'li" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200" placeholder="F.I.SH" />
          <div className="grid grid-cols-2 gap-3">
            <select name="faculty" className="px-4 py-2.5 rounded-xl border border-slate-200">
              <option>Iqtisodiyot</option>
              <option>Raqamli iqtisodiyot</option>
              <option>Moliya va kredit</option>
            </select>
            <input name="groupName" defaultValue="IQ-62" className="px-4 py-2.5 rounded-xl border border-slate-200" placeholder="Guruh" />
          </div>
          <input name="title" required placeholder="Maqola sarlavhasi" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
          <input name="journal" placeholder="Jurnal nomi" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
          <input name="year" type="number" defaultValue={2025} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
          <input name="keywords" placeholder="Kalit so'zlar" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
          <div className="flex gap-2 items-center">
            <input type="checkbox" name="isOAK" defaultChecked />
            <label className="text-sm">OAK jurnalida chiqqan</label>
          </div>
          <button disabled={loading} className="w-full bg-[#0F1E3D] text-white py-3 rounded-full font-bold">
            {loading ? 'Yuklanmoqda...' : 'Saqlash 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}