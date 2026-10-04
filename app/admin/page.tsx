import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/rbac'
import { PendingApprovals } from './pending-approvals'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user) redirect('/kirish')
  if (user.role !== 'admin' && user.role !== 'moderator') redirect('/')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-navy tracking-tight">Admin panel</h1>
      <p className="text-slate-500 mt-2 text-sm">
        Professor va tadqiqotchi hisoblarini tasdiqlash (FR-04, FR-50, TS-03/04).
        To'liq admin paneli P3/P9 fazalarida.
      </p>

      <div className="mt-8">
        <PendingApprovals canApprove={user.role === 'admin'} />
      </div>
    </div>
  )
}
