import { listPendingUsers } from '@/modules/auth/service'
import { requireAdmin } from '@/lib/rbac'
import { handle, ok } from '@/lib/api'

export async function GET() {
  return handle(async () => {
    await requireAdmin()
    const users = await listPendingUsers()
    return ok(users)
  })
}
