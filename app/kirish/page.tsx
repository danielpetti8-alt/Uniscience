'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy'
const labelClass = 'block text-sm font-semibold text-navy mb-1.5'

function KirishForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const approval = searchParams.get('approval')

  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFields({})
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: fd.get('identifier'),
          password: fd.get('password'),
          remember: fd.get('remember') === 'on',
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/profil')
        router.refresh()
      } else if (data.error?.fields) {
        setFields(data.error.fields)
      } else {
        setError(data.error?.message ?? "Kirishda xato")
      }
    } catch {
      setError("Server bilan bog'lanishda xato")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <h1 className="text-3xl font-extrabold text-navy tracking-tight text-center">Kabinetga kirish</h1>
      <p className="text-slate-500 mt-2 text-sm text-center">
        Username (F.I.Sh.) yoki email va parol bilan kiring.
      </p>

      {verified === '1' && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-success/10 text-success text-sm font-semibold">
          {approval === '1'
            ? "Email tasdiqlandi. Hisobingiz admin tasdig'ini kutilmoqda."
            : "Email tasdiqlandi. Endi kirishingiz mumkin."}
        </div>
      )}
      {verified === '0' && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-semibold">
          Tasdiqlash havolasi yaroqsiz yoki muddati o'tgan.
        </div>
      )}

      <Card className="mt-6">
        <CardBody>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-semibold">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="identifier">Username (F.I.Sh.) yoki email</label>
              <input id="identifier" name="identifier" className={inputClass} placeholder="Karimov Sardor Ravshanovich" autoComplete="username" />
              {fields.identifier && <p className="text-danger text-xs mt-1">{fields.identifier}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor="password">Parol</label>
              <input id="password" name="password" type="password" className={inputClass} autoComplete="current-password" />
              {fields.password && <p className="text-danger text-xs mt-1">{fields.password}</p>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex gap-2 items-center text-slate-600">
                <input type="checkbox" name="remember" defaultChecked className="w-4 h-4 accent-navy" />
                Eslab qolish (30 kun)
              </label>
              <a href="/parolni-tiklash" className="text-navy font-semibold hover:underline">
                Parolni tiklash
              </a>
            </div>
            <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
              {loading ? 'Tekshirilmoqda...' : 'Kirish'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <p className="text-center text-sm text-slate-500 mt-5">
        Hisobingiz yo'qmi?{' '}
        <ButtonLink href="/royhat" variant="ghost" size="sm" className="px-0 font-bold">
          Ro'yxatdan o'ting
        </ButtonLink>
      </p>
    </div>
  )
}

export default function KirishPage() {
  return (
    <Suspense>
      <KirishForm />
    </Suspense>
  )
}
