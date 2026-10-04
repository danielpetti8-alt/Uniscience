// POST /api/v1/notifications/read — o'qilgan deb belgilash (FR-68)
// Tana: { id: "..." } — bittasini, yoki { all: true } — barchasini.
import { markAllRead, markRead } from '@/modules/notifications/service'
import { requireUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { handle, ok } from '@/lib/api'

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const body = (await req.json().catch(() => ({}))) as { id?: string; all?: boolean }

    if (body.all === true) {
      const result = await markAllRead(prisma, user.id)
      return ok(result)
    }
    if (typeof body.id === 'string' && body.id.length > 0) {
      const result = await markRead(prisma, user.id, body.id)
      return ok(result)
    }
    return ok({ marked: 0 })
  })
}
