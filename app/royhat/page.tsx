'use client'

import { useState } from 'react'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { CATEGORIES } from '@/lib/constants'

type FieldErrors = Record<string, string>

const CATEGORY_CARDS = [
  { value: CATEGORIES.BACHELOR, label: 'Bakalavr', desc: "Bakalavriatura ta'limi oluvchi talaba" },
  { value: CATEGORIES.MASTER, label: 'Magistratura', desc: "Magistratura talabasi" },
  { value: CATEGORIES.RESEARCHER, label: 'Tadqiqotchi', desc: 'Ilmiy tadqiqotchi (admin tasdig‘i kerak)' },
  { value: CATEGORIES.PROFESSOR, label: 'Professor', desc: 'Professor-“o‘qituvchi (admin tasdig‘i kerak)' },
]

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy'
const labelClass = 'block text-sm font-semibold text-navy mb-1.5'

function FieldError({ error }: { error?: string }) {
  if (!error) return null
  return <p className="text-danger text-xs mt-1">{error}</p>
}

export default function RoyhatPage() {
  const [category, setCategory] = useState<string>(CATEGORIES.BACHELOR)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [done, setDone] = useState<{ username: string; email: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const isStudent = category === CATEGORIES.BACHELOR || category === CATEGORIES.MASTER

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setFormError('')
    const fd = new FormData(e.currentTarget)
    const payload: Record<string, unknown> = {
      category,
      familiya: fd.get('familiya'),
      ism: fd.get('ism'),
      otasiningIsmi: fd.get('otasiningIsmi'),
      email: fd.get('email'),
      password: fd.get('password'),
      consent: fd.get('consent') === 'on',
      universitet: fd.get('universitet'),
      fakultet: fd.get('fakultet'),
      yonalish: fd.get('yonalish'),
      kurs: fd.get('kurs'),
      guruh: fd.get('guruh'),
      gpa: fd.get('gpa'),
      tugilganSana: fd.get('tugilganSana'),
      bakalavrOtm: fd.get('bakalavrOtm'),
      daraja: fd.get('daraja'),
      lavozim: fd.get('lavozim'),
      kafedra: fd.get('kafedra'),
    }
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setDone({ username: data.data.username, email: data.data.email })
      } else if (data.error?.fields) {
        setErrors(data.error.fields)
        setFormError(data.error.message)
      } else {
        setFormError(data.error?.message ?? "Ro'yxatdan o'tishda xato")
      }
    } catch {
      setFormError("Server bilan bog'lanishda xato")
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <Card>
          <CardBody className="text-center">
            <div className="text-4xl">📩</div>
            <h1 className="text-xl font-extrabold text-navy mt-3">Emailingizni tasdiqlang</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              <b>{done.email}</b> manziliga tasdiqlash havolasi yuborildi. Havolani bosib
              hisobingizni faollashtiring.
            </p>
            <p className="text-xs text-slate-400 mt-3">
              Username (F.I.Sh.): <b className="text-navy">{done.username}</b>
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <ButtonLink href="/dev/mailbox" variant="gold">Dev mailbox'ni ochish (test)</ButtonLink>
              <ButtonLink href="/kirish" variant="ghost">Kirish sahifasiga o'tish</ButtonLink>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-navy tracking-tight">Ro'yxatdan o'tish</h1>
      <p className="text-slate-500 mt-2 text-sm">
        Toifani tanlang va formani to'ldiring. Username (F.I.Sh.) avtomatik shakllanadi.
      </p>

      {/* 1-qadam: toifa tanlash (FR-01) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {CATEGORY_CARDS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`text-left p-4 rounded-2xl border-2 transition-colors ${
              category === c.value
                ? 'border-navy bg-navy/5'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="font-bold text-navy text-sm">{c.label}</div>
            <div className="text-xs text-slate-500 mt-1 leading-snug">{c.desc}</div>
          </button>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody>
          {formError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-semibold">
              {formError}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* F.I.Sh. (FR-02, FR-05) */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass} htmlFor="familiya">Familiya *</label>
                <input id="familiya" name="familiya" className={inputClass} placeholder="Karimov" />
                <FieldError error={errors.familiya} />
              </div>
              <div>
                <label className={labelClass} htmlFor="ism">Ism *</label>
                <input id="ism" name="ism" className={inputClass} placeholder="Sardor" />
                <FieldError error={errors.ism} />
              </div>
              <div>
                <label className={labelClass} htmlFor="otasiningIsmi">Otasining ismi *</label>
                <input id="otasiningIsmi" name="otasiningIsmi" className={inputClass} placeholder="Ravshanovich" />
                <FieldError error={errors.otasiningIsmi} />
              </div>
            </div>

            {/* Kirish ma'lumotlari (FR-02, FR-07) */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" className={inputClass} placeholder="sardor@example.com" />
                <FieldError error={errors.email} />
              </div>
              <div>
                <label className={labelClass} htmlFor="password">Parol *</label>
                <input id="password" name="password" type="password" className={inputClass} placeholder="Kamida 8 belgi, harf+raqam" />
                <FieldError error={errors.password} />
              </div>
            </div>

            {/* Talaba maydonlari (FR-02, FR-03) */}
            {isStudent && (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="universitet">Universitet *</label>
                    <input id="universitet" name="universitet" className={inputClass} defaultValue="Toshkent davlat iqtisodiyot universiteti" />
                    <FieldError error={errors.universitet} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="fakultet">Fakultet *</label>
                    <input id="fakultet" name="fakultet" className={inputClass} placeholder="Iqtisodiyot" />
                    <FieldError error={errors.fakultet} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="yonalish">Yo'nalish *</label>
                    <input id="yonalish" name="yonalish" className={inputClass} placeholder="Iqtisodiyot" />
                    <FieldError error={errors.yonalish} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="kurs">Kurs *</label>
                    <input id="kurs" name="kurs" type="number" min={1} max={category === CATEGORIES.BACHELOR ? 6 : 3} className={inputClass} placeholder="3" />
                    <FieldError error={errors.kurs} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="guruh">Guruh *</label>
                    <input id="guruh" name="guruh" className={inputClass} placeholder="IQ-62" />
                    <FieldError error={errors.guruh} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="gpa">GPA</label>
                    <input id="gpa" name="gpa" type="number" step="0.1" min={0} max={100} className={inputClass} placeholder="88.5" />
                    <FieldError error={errors.gpa} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="tugilganSana">Tug'ilgan sana *</label>
                    <input id="tugilganSana" name="tugilganSana" type="date" className={inputClass} />
                    <FieldError error={errors.tugilganSana} />
                  </div>
                  {category === CATEGORIES.MASTER && (
                    <div>
                      <label className={labelClass} htmlFor="bakalavrOtm">Bakalavr bitirgan OTM</label>
                      <input id="bakalavrOtm" name="bakalavrOtm" className={inputClass} placeholder="Ixtiyoriy" />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Professor/tadqiqotchi maydonlari (FR-04) */}
            {!isStudent && (
              <>
                <div className="px-4 py-3 rounded-xl bg-warning/10 text-warning text-xs font-semibold">
                  Professor va tadqiqotchi hisoblari admin tasdig'idan o'tadi (FR-04).
                  Tasdiqlangach kirish imkoni paydo bo'ladi.
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="universitet2">Universitet/tashkilot *</label>
                    <input id="universitet2" name="universitet" className={inputClass} placeholder="TDIU" />
                    <FieldError error={errors.universitet} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="kafedra">Kafedra *</label>
                    <input id="kafedra" name="kafedra" className={inputClass} placeholder="Iqtisodiyot nazariyasi" />
                    <FieldError error={errors.kafedra} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="daraja">Ilmiy daraja *</label>
                    <input id="daraja" name="daraja" className={inputClass} placeholder="i.k.d." />
                    <FieldError error={errors.daraja} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="lavozim">Lavozim *</label>
                    <input id="lavozim" name="lavozim" className={inputClass} placeholder="Professor" />
                    <FieldError error={errors.lavozim} />
                  </div>
                </div>
              </>
            )}

            {/* O'RQ-547 rozilik */}
            <label className="flex gap-2.5 items-start text-sm text-slate-600">
              <input type="checkbox" name="consent" className="mt-1 w-4 h-4 accent-navy" />
              <span>
                Shaxsiy ma'lumotlarimni qayta ishlashga rozilik beraman (O'RQ-547).
                Ma'lumotlar faqat platforma ishida uchun ishlatiladi.
              </span>
            </label>
            <FieldError error={errors.consent} />

            <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
              {loading ? 'Yuborilmoqda...' : "Ro'yxatdan o'tish"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Hisobingiz bormi?{' '}
              <a href="/kirish" className="text-navy font-bold hover:underline">Kirish</a>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
