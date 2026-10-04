// =============================================================================
// API yordamchilari — JSON javoblar va xatolik mexanizmi.
// Laravel'ga ko'chganda: Controller'lar responselari ekvivalenti.
// =============================================================================
import { NextResponse } from 'next/server'
import { isAuthError, type AuthErrorCode } from '@/modules/auth/errors'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function fail(error: unknown) {
  if (isAuthError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code as AuthErrorCode,
          message: error.message,
          fields: error.fields,
          details: error.details,
        },
      },
      { status: error.status },
    )
  }
  console.error('KUTILMAGAN XATO:', error)
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL', message: 'Serverda kutilmagan xato' } },
    { status: 500 },
  )
}

/** So'rovdan bazaviy URL ni aniqlaydi (email havolalari uchun) */
export function baseUrlFromRequest(req: Request): string {
  const headers = req.headers
  const proto = headers.get('x-forwarded-proto') ?? 'http'
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000'
  return `${proto}://${host}`
}

/** Route handlerlar uchun umumiy try/catch o'rami */
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn()
  } catch (e) {
    return fail(e)
  }
}
