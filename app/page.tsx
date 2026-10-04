import { ButtonLink } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const steps = [
  {
    n: '1',
    title: "Ro'yxatdan o'ting",
    text: "Bakalavr yoki magistr — o'zingiz, bir necha daqiqada. Professor va tadqiqotchilar admin tasdig'idan o'tadi.",
  },
  {
    n: '2',
    title: 'Maqolani yuklang',
    text: "3 tilda annotatsiya, kalit so'zlar, jurnalni ISSN bo'yicha tanlang va PDF'ni biriktiring.",
  },
  {
    n: '3',
    title: 'Reytingda ko‘rining',
    text: "Moderator tekshiradi, tasdiqlangan maqola portfelga va reytingga — ochiq formula bilan ball oladi.",
  },
]

const features = [
  {
    icon: '📄',
    title: 'OAK tekshiruvi',
    text: "Jurnal ro'yxati va nashr sanasi bo'yicha avtomatik tekshirush — vaqt-qamrov qoidasi bilan.",
    href: '/yuklash',
    cta: 'Maqola yuklash',
  },
  {
    icon: '🏆',
    title: 'Ochiq reyting',
    text: "Har maqolaning balli koefitsientlar bilan yoyilib ko'rsatiladi: daraja, mualliflik, sana, soha.",
    href: '/reyting',
    cta: "Reytingni ko'rish",
  },
  {
    icon: '🤝',
    title: 'Ilmiy rahbarlik',
    text: "Professorlarning bo'sh vaqtlarini ko'ring, uchrashuv uchun so'rov yuboring va javobni kuting.",
    href: '/matching',
    cta: "Professorlarni ko'rish",
  },
  {
    icon: '📚',
    title: "Yo'riqnoma va video",
    text: "Maqola yozish talablari, tuzilishi va video darslar — bir joyda, yuklab olish mumkin.",
    href: '/yoriqnoma',
    cta: "Yo'riqnomalar",
  },
]

export default function LandingPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(1100px 520px at 85% -10%, rgba(56,182,227,0.28) 0%, transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(232,179,60,0.22) 0%, transparent 55%), #122B46',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div>
            <Badge tone="gold" className="mb-5">
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              35 000 TASHABBUS · TASDIQLANGAN LOYIHA
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.05] tracking-tight text-white">
              Talabalarning{' '}
              <span className="text-gold">raqamli ilmiy portfeli</span>{' '}
              endi yagona joyda
            </h1>
            <p className="text-slate-300 mt-5 text-base md:text-lg max-w-xl leading-relaxed">
              OAK maqolalaringizni saqlang, fakultet va guruh reytingi real vaqtda
              shakllanadi, professor bilan ilmiy rahbarlik aloqasini o'rnating.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/royhat" variant="gold" size="lg">
                Ro'yxatdan o'tish →
              </ButtonLink>
              <ButtonLink
                href="/kirish"
                size="lg"
                className="bg-white/10 border border-white/25 text-white hover:bg-white/20"
              >
                Kabinetga kirish
              </ButtonLink>
            </div>
          </div>

          <Card className="p-6 shadow-xl shadow-navy-dark/20">
            <div className="text-[11px] font-extrabold tracking-widest text-slate-400">
              QANDAY ISHLAYDI
            </div>
            <div className="mt-4 space-y-4">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-navy text-white font-extrabold flex items-center justify-center shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">{s.title}</div>
                    <div className="text-sm text-slate-500 mt-0.5 leading-relaxed">{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight">
            Talaba, professor va rahbariyat uchun bir platforma
          </h2>
          <p className="text-slate-500 mt-3">
            Maqoladan tortib universitet statistikasigacha — barcha bosqichlar bir tizimda.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {features.map((f) => (
            <Card key={f.title} className="p-5 flex flex-col hover:border-navy/30 transition-colors">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="font-bold text-navy mt-3">{f.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed flex-1">{f.text}</p>
              <ButtonLink href={f.href} variant="ghost" size="sm" className="mt-3 self-start px-0">
                {f.cta} →
              </ButtonLink>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-navy text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Ilmiy portfelingizni bugundan shakllantiring
            </h2>
            <p className="text-slate-300 mt-2 max-w-lg">
              Ro'yxatdan o'ting, birinchi maqolani yuklang va guruh reytingida o'rningizni egallang.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <ButtonLink href="/royhat" variant="gold" size="lg">
              Boshlash
            </ButtonLink>
            <ButtonLink href="/yoriqnoma" size="lg" className="bg-white/10 border border-white/25 text-white hover:bg-white/20">
              Yo'riqnoma
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
