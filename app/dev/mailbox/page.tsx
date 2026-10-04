import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// =============================================================================
// DEV MAILBOX — SMTP bo'lmagani uchun yuborilgan emaillar shu yerda ko'rinadi.
// PRODUCTION BUILD'DA BU SAHIFA YOPIQ (notFound) — TZ talabi.
// =============================================================================
export const dynamic = 'force-dynamic'

export default async function DevMailboxPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  const emails = await prisma.emailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Dev mailbox</h1>
        <Badge tone="warning">faqat test muhiti</Badge>
      </div>
      <p className="text-slate-500 mt-2 text-sm">
        SMTP yo'q — tasdiqlash va tiklash emaillari shu yerda saqlanadi.
        Production build'da bu sahifa avtomatik yopiladi.
      </p>

      {emails.length === 0 ? (
        <Card className="mt-6">
          <CardBody className="text-center text-sm text-slate-500 py-10">
            Hozircha email yuborilmagan.
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3 mt-6">
          {emails.map((e) => (
            <Card key={e.id}>
              <CardBody>
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <div className="font-bold text-navy text-sm">{e.subject}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {e.to} · {new Date(e.createdAt).toLocaleString('uz-UZ')}
                    </div>
                  </div>
                  {e.tokenLink && (
                    <a
                      href={e.tokenLink}
                      className="text-xs font-bold text-cyan hover:underline break-all"
                    >
                      Havolani ochish →
                    </a>
                  )}
                </div>
                <pre className="mt-3 text-xs text-slate-600 whitespace-pre-wrap bg-light-bg rounded-xl p-3">
                  {e.body}
                </pre>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
