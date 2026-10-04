'use client'

// Profil tahrirlash formalari (FR-13): aloqa (telefon) va parol — faqat o'zi.
// Ism-familiya / universitet tahrirlanmaydi — faqat admin (server ham rad etadi).
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-danger font-semibold mt-1">{msg}</p>
}

export function ContactForm({ telefon }: { telefon: string | null }) {
  const router = useRouter()
  const [value, setValue] = useState(telefon ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const res = await fetch('/api/v1/profile', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ telefon: value.trim() || null }),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.success) {
      setError(json?.error?.message ?? 'Saqlanmadi')
      setBusy(false)
      return
    }
    setValue(json.data?.telefon ?? '')
    setNotice('Aloqa raqami saqlandi')
    setBusy(false)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="telefon" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
          Telefon (aloqa)
        </label>
        <input
          id="telefon"
          type="tel"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="+998901234567"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-cyan"
        />
        <FieldError msg={error} />
        {notice && <p className="text-xs text-success font-semibold mt-1">{notice}</p>}
      </div>
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? 'Saqlanmoqda...' : 'Saqlash'}
      </Button>
    </form>
  )
}

export function PasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const res = await fetch('/api/v1/profile/password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.success) {
      const fields = json?.error?.fields as Record<string, string> | undefined
      setError(fields ? Object.values(fields)[0] : json?.error?.message ?? 'Parol o\'zgarmadi')
      setBusy(false)
      return
    }
    setCurrent('')
    setNext('')
    setNotice("Parol o'zgartirildi. Boshqa qurilmalar chiqarildi.")
    setBusy(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="current-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
          Hozirgi parol
        </label>
        <input
          id="current-password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-cyan"
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
          Yangi parol
        </label>
        <input
          id="new-password"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan focus:border-cyan"
        />
        <p className="text-xs text-slate-400 mt-1">Kamida 8 belgi, kamida bitta harf va bitta raqam</p>
        <FieldError msg={error} />
        {notice && <p className="text-xs text-success font-semibold mt-1">{notice}</p>}
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={busy}>
        {busy ? 'O\'zgartirilmoqda...' : "Parolni o'zgartirish"}
      </Button>
    </form>
  )
}
