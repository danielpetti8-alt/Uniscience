import { resetPassword } from '@/modules/auth/service'
import { handle, ok } from '@/lib/api'

export async function POST(req: Request) {
  return handle(async () => {
    const body = (await req.json().catch(() => ({}))) as { token?: string; password?: string }
    const result = await resetPassword(String(body.token ?? ''), String(body.password ?? ''))
    return ok(result)
  })
}
