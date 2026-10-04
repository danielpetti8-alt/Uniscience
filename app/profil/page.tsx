import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/rbac'
import { CATEGORY_LABELS, ROLE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { ButtonLink } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { LogoutButton } from './logout-button'

export const dynamic = 'force-dynamic'

export default async function ProfilPage() {
  const user = await getSessionUser()
  if (!user) redirect('/kirish')

  const p = user.profile

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-navy text-white font-extrabold text-xl flex items-center justify-center">
            {user.username.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">{user.username}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        <Badge tone="navy">{ROLE_LABELS[user.role] ?? user.role}</Badge>
        {user.category && <Badge tone="cyan">{CATEGORY_LABELS[user.category] ?? user.category}</Badge>}
        <Badge tone={user.status === 'active' ? 'success' : 'warning'}>
          {STATUS_LABELS[user.status] ?? user.status}
        </Badge>
        {user.emailVerifiedAt && <Badge tone="success">Email tasdiqlangan</Badge>}
      </div>

      {user.status === 'pending_approval' && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-warning/10 text-warning text-sm font-semibold">
          Hisobingiz admin tasdig'ini kutilmoqda. Tasdiqlangach barcha imkoniyatlar ochiladi.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardBody>
            <h2 className="font-bold text-navy text-sm">Shaxsiy ma'lumotlar</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="F.I.Sh. (username)" value={user.username} />
              <Row label="Email" value={user.email} />
              <Row label="Universitet" value={p?.universitet} />
              <Row label="Fakultet" value={p?.fakultet} />
              <Row label="Yo'nalish" value={p?.yonalish} />
              {p?.kurs != null && <Row label="Kurs" value={String(p.kurs)} />}
              {p?.guruh && <Row label="Guruh" value={p.guruh} />}
              {p?.gpa != null && <Row label="GPA" value={String(p.gpa)} />}
              {p?.daraja && <Row label="Ilmiy daraja" value={p.daraja} />}
              {p?.lavozim && <Row label="Lavozim" value={p.lavozim} />}
              {p?.kafedra && <Row label="Kafedra" value={p.kafedra} />}
              {p?.bakalavrOtm && <Row label="Bakalavr OTM" value={p.bakalavrOtm} />}
            </dl>
            <p className="text-xs text-slate-400 mt-4">
              Ism-familiya va universitetni faqat admin o'zgartiradi (FR-13).
              To'liq profil imkoniyatlari P2 fazasida.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-bold text-navy text-sm">Portfel va reyting</h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Tasdiqlangan maqolalar, reyting balli va o'rinlar — P2 (profil) va P5 (reyting)
              fazalarida to'ldiriladi.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href="/yuklash" variant="gold" size="sm">Maqola yuklash</ButtonLink>
              <ButtonLink href="/reyting" variant="outline" size="sm">Reyting</ButtonLink>
              {(user.role === 'admin' || user.role === 'moderator') && (
                <ButtonLink href="/admin" variant="outline" size="sm">Admin panel</ButtonLink>
              )}
              {user.role === 'management' && (
                <ButtonLink href="/rahbariyat" variant="outline" size="sm">Rahbariyat paneli</ButtonLink>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-navy text-right">{value}</dd>
    </div>
  )
}
