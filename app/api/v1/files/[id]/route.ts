// GET /api/v1/files/[id] — fayl mazmunini qaytaradi (hozircha faqat avatarlar).
// Kirgan foydalanuvchiga: avatarlar ochiq (profil va ochiq professor sahifasi uchun).
import { prisma } from '@/lib/prisma'
import { storageAdapter } from '@/lib/adapters/storage'
import { requireUser } from '@/lib/rbac'
import { AuthError } from '@/modules/auth/errors'
import { handle } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireUser()
    const { id } = await params

    const file = await prisma.file.findUnique({
      where: { id },
      include: { avatarOf: { select: { userId: true } } },
    })
    // P2'da faqat avatar fayllari xizmat qiladi (PDF/video P4/P6'da qo'shiladi)
    if (!file || file.avatarOf.length === 0) {
      throw new AuthError('NOT_FOUND', 'Fayl topilmadi')
    }

    if (!(await storageAdapter.exists(file.storageKey))) {
      throw new AuthError('NOT_FOUND', 'Fayl topilmadi')
    }
    const bytes = await storageAdapter.read(file.storageKey)

    return new NextResponse(bytes as unknown as BodyInit, {
      status: 200,
      headers: {
        'content-type': file.mimeType,
        'content-length': String(file.sizeBytes),
        'cache-control': 'private, max-age=86400',
      },
    })
  })
}
