import { logout } from '@/modules/auth/service'
import { clearSessionCookie, readSessionCookie } from '@/modules/auth/session'
import { fail, handle, ok } from '@/lib/api'

export async function POST() {
  return handle(async () => {
    const token = await readSessionCookie()
    if (token) await logout(token)
    await clearSessionCookie()
    return ok({ loggedOut: true })
  })
}
