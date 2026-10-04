import { approveUser } from '@/modules/auth/service'
import { requireAdmin } from '@/lib/rbac'
import { handle, ok } from '@/lib/api'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireAdmin()
    const { id } = await params
    const result = await approveUser(admin.id, id)
    return ok(result)
  })
}
