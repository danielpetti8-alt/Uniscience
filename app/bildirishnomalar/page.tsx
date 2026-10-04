// Bildirishnomalar sahifasi (FR-68) — lenta + o'qish boshqaruvi.
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/rbac'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { NotificationsList } from './notifications-list'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Bildirishnomalar' }

export default async function BildirishnomalarPage() {
  const user = await getSessionUser()
  if (!user) redirect('/kirish')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-extrabold text-navy tracking-tight">Bildirishnomalar</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        Maqola holati, rahbarlik so'rovlari va tizim voqealari shu yerda ko'rinadi.
      </p>
      <Card>
        <CardHeader title="Lenta" description="Eng yangi voqealar yuqorida" />
        <CardBody>
          <NotificationsList />
        </CardBody>
      </Card>
    </div>
  )
}
