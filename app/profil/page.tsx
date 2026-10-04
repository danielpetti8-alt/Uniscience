// Profil sahifasi (M2 — FR-12..15, TS-05)
// Server komponent: ma'lumot service'dan (thin layer — plan 1-qoidasi).
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/rbac'
import { CATEGORY_LABELS, ROLE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { ButtonLink } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { getOwnProfile } from '@/modules/users/service'
import { LogoutButton } from './logout-button'
import { AvatarUpload } from './avatar-upload'
import { ContactForm, PasswordForm } from './profile-forms'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Profil' }

type ProfileData = Awaited<ReturnType<typeof getOwnProfile>>

function Row({ label, value }: { label: string; value?: string | null }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50 last:border-0">
      <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{label}</dt>
      <dd className="text-navy text-sm font-semibold text-right">{value}</dd>
    </div>
  )
}

function RankBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-[90px] rounded-xl bg-light-bg px-3 py-2.5 text-center">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-navy font-extrabold text-lg mt-0.5">{value}</p>
    </div>
  )
}

export default async function ProfilPage() {
  const user = await getSessionUser()
  if (!user) redirect('/kirish')

  const data = await getOwnProfile(user.id)
  const p = data.profile
  const isStudent = data.role === 'student'
  const isProfessor = data.role === 'professor'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* --- Sarlavha: avatar + F.I.Sh. + holat --- */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {data.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatar.url ?? undefined}
              alt={data.username}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gold"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-navy text-white font-extrabold text-xl flex items-center justify-center">
              {data.username.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">{data.username}</h1>
            <p className="text-sm text-slate-500">{data.email}</p>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="flex gap-2 mt-4 flex-wrap items-center">
        <Badge tone="navy">{ROLE_LABELS[data.role] ?? data.role}</Badge>
        {data.category && <Badge tone="cyan">{CATEGORY_LABELS[data.category] ?? data.category}</Badge>}
        <Badge tone={data.status === 'active' ? 'success' : 'warning'}>
          {STATUS_LABELS[data.status] ?? data.status}
        </Badge>
        {data.emailVerifiedAt && <Badge tone="success">Email tasdiqlangan</Badge>}
      </div>

      {data.status === 'pending_approval' && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-warning/10 text-warning text-sm font-semibold">
          Hisobingiz admin tasdig'ini kutilmoqda. Tasdiqlangach barcha imkoniyatlar ochiladi.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        {/* --- Reyting xulosasi (FR-12; hisoblash P5) --- */}
        <Card>
          <CardHeader title="Reyting" description="Ball va o'rinlar" />
          <CardBody>
            <div className="flex gap-2 flex-wrap">
              <RankBox label="Ball" value={data.rating.totalScore.toFixed(1)} />
              <RankBox label="Guruh" value={data.rating.groupRank ? `#${data.rating.groupRank}` : '—'} />
              <RankBox label="Fakultet" value={data.rating.facultyRank ? `#${data.rating.facultyRank}` : '—'} />
              <RankBox label="Universitet" value={data.rating.universityRank ? `#${data.rating.universityRank}` : '—'} />
            </div>
            {!data.rating.available && (
              <p className="text-xs text-slate-400 mt-3">
                Reyting hali hisoblanmagan — birinchi tasdiqlangan maqolangizdan keyin ko'rinadi (P5).
              </p>
            )}
            <div className="mt-4">
              <ButtonLink href="/reyting" variant="outline" size="sm">Reyting jadvali</ButtonLink>
            </div>
          </CardBody>
        </Card>

        {/* --- Portfel: tasdiqlangan maqolalar (FR-12; yuklash P4) --- */}
        <Card>
          <CardHeader
            title="Portfel"
            description={`Tasdiqlangan maqolalar: ${data.portfolio.count}`}
          />
          <CardBody>
            {data.portfolio.items.length === 0 ? (
              <div className="text-sm text-slate-500 leading-relaxed">
                <p>Hozircha tasdiqlangan maqola yo'q.</p>
                <p className="mt-1 text-slate-400 text-xs">Maqola yuklash P4 fazasida ochiladi — shu kungacha tayyorlaning.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {data.portfolio.items.map((a) => (
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

        {/* --- Shaxsiy ma'lumotlar --- */}
        <Card>
          <CardHeader title="Shaxsiy ma'lumotlar" description="Ism-familiya va universitetni faqat admin o'zgartiradi (FR-13)" />
          <CardBody>
            <dl className="space-y-1 text-sm">
              <Row label="F.I.Sh. (username)" value={data.username} />
              <Row label="Email" value={data.email} />
              <Row label="Universitet" value={p.universitet} />
              <Row label="Fakultet" value={p.fakultet} />
              <Row label="Yo'nalish" value={p.yonalish} />
              {p.kurs != null && <Row label="Kurs" value={String(p.kurs)} />}
              <Row label="Guruh" value={p.guruh} />
              {p.gpa != null && <Row label="GPA" value={String(p.gpa)} />}
              <Row label="Tug'ilgan sana" value={p.tugilganSana ? new Date(p.tugilganSana).toLocaleDateString('uz-UZ') : null} />
              <Row label="Ilmiy daraja" value={p.daraja} />
              <Row label="Lavozim" value={p.lavozim} />
              <Row label="Kafedra" value={p.kafedra} />
              <Row label="Bakalavr OTM" value={p.bakalavrOtm} />
            </dl>
          </CardBody>
        </Card>

        {/* --- Tahrirlash: avatar + aloqa + parol (FR-13, TS-05) --- */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Avatar" />
            <CardBody>
              <AvatarUpload hasAvatar={!!data.avatar} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Aloqa" description="O'zingiz tahrirlaysiz (FR-13)" />
            <CardBody>
              <ContactForm telefon={p.telefon} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Xavfsizlik" description="Parolni o'zgartirish" />
            <CardBody>
              <PasswordForm />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* --- Rol bloklari: FR-14 (talaba) / FR-15 (professor) --- */}
      {isStudent && (
        <Card className="mt-4">
          <CardHeader
            title="Ilmiy rahbarlik"
            description="Professor tanlash, bo'sh vaqtlar va so'rov yuborish"
            action={<ButtonLink href="/matching" variant="gold" size="sm">Bo'limga o'tish</ButtonLink>}
          />
          <CardBody>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hozircha ilmiy rahbar biriktirilmagan. Matching bo'limida professorlarning bo'sh vaqtlarini ko'rib,
              so'rov yuborishingiz mumkin (P7'da to'liq ishga tushadi).
            </p>
          </CardBody>
        </Card>
      )}

      {isProfessor && (
        <Card className="mt-4">
          <CardHeader
            title="Rahbarlik"
            description="Bo'sh vaqtlar va kelgan so'rovlar"
            action={<ButtonLink href="/matching" variant="outline" size="sm">Boshqarish</ButtonLink>}
          />
          <CardBody className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-navy text-sm">Bo'sh vaqt</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Konsultatsiya vaqlarini qo'shish P7'da ochiladi.
              </p>
              <p className="text-xs text-slate-400 mt-2">0 ta slot</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-navy text-sm">Kelgan so'rovlar</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Talabalar so'rovlari P7'da ko'rina boshlaydi.
              </p>
              <p className="text-xs text-slate-400 mt-2">0 ta so'rov</p>
            </div>
          </CardBody>
        </Card>
      )}

      {isProfessor && (
        <p className="text-xs text-slate-400 mt-4">
          Profilingiz tizim foydalanuvchilari uchun ochiq (FR-16):{' '}
          <a href={`/professorlar/${data.id}`} className="font-bold text-cyan-dark hover:underline">
            ochiq profil havolasi
          </a>
        </p>
      )}
    </div>
  )
}
