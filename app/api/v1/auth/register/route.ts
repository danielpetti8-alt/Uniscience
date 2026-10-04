import { registerUser } from '@/modules/auth/service'
import { baseUrlFromRequest, fail, handle, ok } from '@/lib/api'

export async function POST(req: Request) {
  return handle(async () => {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const user = await registerUser(body, baseUrlFromRequest(req))
    return ok(user, 201)
  })
}
