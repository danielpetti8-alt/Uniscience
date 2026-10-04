// POST /api/v1/profile/password — o'z parolini o'zgartirish (FR-13)
// Joriy sessiya saqlanadi, boshqa qurilmalar chiqariladi.
import { changeOwnPassword } from '@/modules/users/service'
import { requireUser } from '@/lib/rbac'
import { readSessionCookie } from '@/modules/auth/session'
import { handle, ok } from '@/lib/api'

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const token = await readSessionCookie()
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const result = await changeOwnPassword(user.id, body, token)
    return ok(result)
  })
}
