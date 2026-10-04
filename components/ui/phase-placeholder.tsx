import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'

/**
 * P0'da yaratilgan bo'sh sahifalar uchun placeholder.
 * Har bir sahifa o'z moduli va TZ'dagi funksional talablarini ko'rsatadi;
 * kod tegishli fazada yoziladi (docs/IMPLEMENTATION_PLAN.md — 10-faza jadvali).
 */
export function PhasePlaceholder({
  module,
  phase,
  title,
  description,
  requirements = [],
}: {
  module: string
  phase: string
  title: string
  description: string
  requirements?: string[]
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <Badge tone="cyan">
        {module} · {phase} fazasida to&apos;ldiriladi
      </Badge>
      <h1 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight mt-4">{title}</h1>
      <p className="text-slate-500 mt-3 max-w-2xl leading-relaxed">{description}</p>

      {requirements.length > 0 && (
        <Card className="mt-8">
          <CardBody>
            <h2 className="font-bold text-navy text-sm">Bu bo'limda quriladigan funksiyalar (TZ)</h2>
            <ul className="mt-3 space-y-2">
              {requirements.map((r) => (
                <li key={r} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="text-cyan mt-0.5">◆</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
