import { login } from '@/modules/auth/service'
import { setSessionCookie } from '@/modules/auth/session'
import { validateLoginInput } from '@/modules/auth/validation'
import { baseUrlFromRequest, fail, handle, ok } from '@/lib/api'

export async function POST(req: Request) {
  return handle(async () => {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const { identifier, password, remember } = validateLoginInput(body)

    const result = await login(identifier, password, remember, {
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    })

    await setSessionCookie(result.token, result.expiresAt)
    return ok({ user: result.user })
  })
}
