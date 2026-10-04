// GET /api/v1/professors/[id] — ochiq professor profili (FR-16).
// Tizimga kirgan har qanday foydalanuvchi ko'radi; boshqa rollar yopiq.
import { getPublicProfessor } from '@/modules/users/service'
import { requireUser } from '@/lib/rbac'
import { handle, ok } from '@/lib/api'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireUser()
    const { id } = await params
    const professor = await getPublicProfessor(id)
    return ok(professor)
  })
}
