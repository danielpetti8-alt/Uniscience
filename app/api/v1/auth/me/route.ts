import { getMe } from '@/modules/auth/service'
import { readSessionCookie } from '@/modules/auth/session'
import { AuthError } from '@/modules/auth/errors'
import { fail, handle, ok } from '@/lib/api'

export async function GET() {
  return handle(async () => {
    const token = await readSessionCookie()
    if (!token) throw new AuthError('NOT_AUTHENTICATED', "Tizimga kirish kerak")
    const user = await getMe(token)
    return ok(user)
  })
}
