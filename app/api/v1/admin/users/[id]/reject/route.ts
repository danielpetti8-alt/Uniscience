import { rejectUser } from '@/modules/auth/service'
import { requireAdmin } from '@/lib/rbac'
import { handle, ok } from '@/lib/api'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireAdmin()
    const { id } = await params
    const body = (await req.json().catch(() => ({}))) as { reason?: string }
    const result = await rejectUser(admin.id, id, body.reason)
    return ok(result)
  })
}
