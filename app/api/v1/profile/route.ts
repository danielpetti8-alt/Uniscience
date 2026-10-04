// GET  /api/v1/profile — o'z profilim (FR-12)
// PATCH /api/v1/profile — aloqa maydonini tahrirlash (FR-13: faqat o'zinikilar)
import { getOwnProfile, updateOwnContact } from '@/modules/users/service'
import { requireUser } from '@/lib/rbac'
import { handle, ok } from '@/lib/api'

export async function GET() {
  return handle(async () => {
    const user = await requireUser()
    const profile = await getOwnProfile(user.id)
    return ok(profile)
  })
}

export async function PATCH(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const result = await updateOwnContact(user.id, body)
    return ok(result)
  })
}
