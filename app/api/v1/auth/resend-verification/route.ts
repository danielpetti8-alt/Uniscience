import { resendVerification } from '@/modules/auth/service'
import { baseUrlFromRequest, handle, ok } from '@/lib/api'

export async function POST(req: Request) {
  return handle(async () => {
    const body = (await req.json().catch(() => ({}))) as { email?: string }
    const result = await resendVerification(String(body.email ?? ''), baseUrlFromRequest(req))
    return ok(result)
  })
}
