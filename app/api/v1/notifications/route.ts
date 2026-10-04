// GET /api/v1/notifications — bildirishnoma lentasi (FR-68)
// Parametrlar: ?unread=1 — faqat o'qilmaganlar, ?limit=50
import { listNotifications } from '@/modules/notifications/service'
import { requireUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { handle, ok } from '@/lib/api'

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const url = new URL(req.url)
    const unreadOnly = url.searchParams.get('unread') === '1'
    const limitParam = Number(url.searchParams.get('limit') ?? '30')
    const limit = Number.isFinite(limitParam) ? limitParam : 30

    const result = await listNotifications(prisma, user.id, { limit, unreadOnly })
    return ok(result)
  })
}
