import { verifyEmail } from '@/modules/auth/service'
import { NextResponse } from 'next/server'

// Emaildagi havolani bosish — GET so'rovi; natija kirish sahifasida ko'rsatiladi
export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') ?? ''
  try {
    const result = await verifyEmail(token)
    const params = new URLSearchParams({ verified: '1' })
    if (result.needsApproval) params.set('approval', '1')
    return NextResponse.redirect(new URL(`/kirish?${params.toString()}`, url.origin))
  } catch {
    return NextResponse.redirect(new URL('/kirish?verified=0', url.origin))
  }
}
