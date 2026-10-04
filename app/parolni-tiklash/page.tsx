'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy'
const labelClass = 'block text-sm font-semibold text-navy mb-1.5'

function RequestForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email') }),
      })
      setSent(true)
    } catch {
      setError("Server bilan bog'lanishda xato")
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <Card>
        <CardBody className="text-center">
          <div className="text-4xl">📩</div>
          <h1 className="text-xl font-extrabold text-navy mt-3">Xabar yuborildi</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Agar bu email bilan hisob mavjud bo'lsa, parolni tiklash havolasi yuborildi.
            Havola 1 soat amal qiladi va bir marta ishlatiladi.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <ButtonLink href="/dev/mailbox" variant="gold">Dev mailbox'ni ochish (test)</ButtonLink>
            <ButtonLink href="/kirish" variant="ghost">Kirish sahifasiga qaytish</ButtonLink>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-semibold">{error}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={inputClass} placeholder="sardor@example.com" />
          </div>
          <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
            {loading ? 'Yuborilmoqda...' : 'Tiklash havolasini yuborish'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

function ResetForm({ token }: { token: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const password = String(fd.get('password') ?? '')
    const confirm = String(fd.get('confirm') ?? '')
    if (password !== confirm) {
      setError("Parollar mos kelmaydi")
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.success) setDone(true)
      else setError(data.error?.message ?? 'Parolni tiklashda xato')
    } catch {
      setError("Server bilan bog'lanishda xato")
    }
    setLoading(false)
  }

  if (done) {
    return (
      <Card>
        <CardBody className="text-center">
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-extrabold text-navy mt-3">Parol yangilandi</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Xavfsizlik uchun barcha qurilmalardagi sessiyalar bekor qilindi.
            Yangi parol bilan qayta kiring.
          </p>
          <div className="mt-5">
            <ButtonLink href="/kirish" variant="gold">Kirish sahifasiga o'tish</ButtonLink>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-semibold">{error}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="password">Yangi parol</label>
            <input id="password" name="password" type="password" className={inputClass} placeholder="Kamida 8 belgi, harf+raqam" />
          </div>
          <div>
            <label className={labelClass} htmlFor="confirm">Parolni takrorlang</label>
            <input id="confirm" name="confirm" type="password" className={inputClass} />
          </div>
          <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
            {loading ? 'Saqlanmoqda...' : 'Parolni yangilash'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

function ParolniTiklash() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <h1 className="text-3xl font-extrabold text-navy tracking-tight text-center">Parolni tiklash</h1>
      <p className="text-slate-500 mt-2 text-sm text-center">
        {token ? 'Yangi parol o‘rnating.' : 'Emailingizni kiriting — tiklash havolasi yuboriladi.'}
      </p>
      <div className="mt-6">
        {token ? <ResetForm token={token} /> : <RequestForm />}
      </div>
    </div>
  )
}

export default function ParolniTiklashPage() {
  return (
    <Suspense>
      <ParolniTiklash />
    </Suspense>
  )
}
