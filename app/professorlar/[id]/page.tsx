// Ochiq professor profili (FR-16) — tizim foydalanuvchilari ko'radi.
import { redirect, notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/rbac'
import { ROLE_LABELS } from '@/lib/constants'
import { AuthError } from '@/modules/auth/errors'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { getPublicProfessor } from '@/modules/users/service'

export const dynamic = 'force-dynamic'

export default async function OchiqProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await getSessionUser()
  if (!viewer) redirect('/kirish')

  const { id } = await params

  let prof: Awaited<ReturnType<typeof getPublicProfessor>>
  try {
    prof = await getPublicProfessor(id)
  } catch (e) {
    if (e instanceof AuthError && e.code === 'NOT_FOUND') notFound()
    throw e
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 flex-wrap">
        {prof.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={prof.avatar.url ?? undefined} alt={prof.username} className="w-16 h-16 rounded-2xl object-cover border-2 border-gold" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-navy text-white font-extrabold text-xl flex items-center justify-center">
            {prof.username.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">{prof.username}</h1>
            <Badge tone="navy">{ROLE_LABELS.professor}</Badge>
          </div>
          {prof.profile.kafedra && <p className="text-sm text-slate-500 mt-0.5">{prof.profile.kafedra}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card className="md:col-span-2">
          <CardHeader title="Ma'lumotlar" description="Ochiq profil (FR-16)" />
          <CardBody>
            <dl className="space-y-1 text-sm">
              {prof.profile.universitet && (
                <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                  <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Universitet</dt>
                  <dd className="text-navy text-sm font-semibold text-right">{prof.profile.universitet}</dd>
                </div>
              )}
              {prof.profile.fakultet && (
                <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                  <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Fakultet</dt>
                  <dd className="text-navy text-sm font-semibold text-right">{prof.profile.fakultet}</dd>
                </div>
              )}
              {prof.profile.daraja && (
                <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                  <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Ilmiy daraja</dt>
                  <dd className="text-navy text-sm font-semibold text-right">{prof.profile.daraja}</dd>
                </div>
              )}
              {prof.profile.lavozim && (
                <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                  <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Lavozim</dt>
                  <dd className="text-navy text-sm font-semibold text-right">{prof.profile.lavozim}</dd>
                </div>
              )}
              {prof.profile.kafedra && (
                <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
                  <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Kafedra</dt>
                  <dd className="text-navy text-sm font-semibold text-right">{prof.profile.kafedra}</dd>
                </div>
              )}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Ilmiy ko'rsatkichlar" />
          <CardBody>
            <div className="rounded-xl bg-light-bg px-3 py-2.5 text-center mb-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Reyting balli</p>
              <p className="text-navy font-extrabold text-lg mt-0.5">{prof.rating.totalScore.toFixed(1)}</p>
            </div>
            <div className="rounded-xl bg-light-bg px-3 py-2.5 text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tasdiqlangan maqolalar</p>
              <p className="text-navy font-extrabold text-lg mt-0.5">{prof.rating.approvedArticles}</p>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Bo'sh vaqtlar va rahbarlik so'rovi P7'da ochiladi.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Portfel"
          description={`Tasdiqlangan maqolalar: ${prof.portfolio.count}`}
          action={<ButtonLink href="/matching" variant="outline" size="sm">Rahbarlik bo'limi</ButtonLink>}
        />
        <CardBody>
          {prof.portfolio.items.length === 0 ? (
            <p className="text-sm text-slate-500">Hozircha tasdiqlangan maqola yo'q.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {prof.portfolio.items.map((a) => (
                <li key={a.id}>
                  <ButtonLink href={`/maqola/${a.id}`} variant="ghost" size="sm" className="!px-0">
                    {a.title}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
