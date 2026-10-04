// =============================================================================
// DB sessiya boshqaruvi (FR-10)
// - Token: 32 bayt random; DB'da FAQAT sha256 hashi saqlanadi
// - Cookie: httpOnly, sameSite=lax, production'da secure
// - «Eslab qolish»: 30 kun; aks holda 24 soat
// - Bir vaqtda maksimal 3 faol sessiya — yangi sessiyada eng eskisi o'chadi
// =============================================================================
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { Prisma, PrismaClient } from '@prisma/client'
import { LIMITS, SESSION_COOKIE } from '@/lib/constants'

type Db = PrismaClient | Prisma.TransactionClient

export function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** Tokenni xavfsiz solishtirish (hash ustidan) */
export function tokensMatch(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

function expiryFor(remember: boolean): Date {
  const d = new Date()
  if (remember) d.setDate(d.getDate() + LIMITS.SESSION_DAYS)
  else d.setHours(d.getHours() + LIMITS.SESSION_HOURS_NO_REMEMBER)
  return d
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

/** Yangi sessiya yaratadi; 3 tadan oshsa eng eski sessiyani o'chiradi (FR-10) */
export async function createSession(
  prisma: Db,
  userId: string,
  opts: { remember: boolean; userAgent?: string | null; ip?: string | null },
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken()
  const expiresAt = expiryFor(opts.remember)

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: opts.userAgent ?? null,
      ip: opts.ip ?? null,
    },
  })

  // Maksimal 3 faol sessiya — ortiqchasini (eng eskilarini) o'chirish
  const active = await prisma.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  if (active.length > LIMITS.SESSION_MAX_DEVICES) {
    const toDelete = active.slice(0, active.length - LIMITS.SESSION_MAX_DEVICES).map((s) => s.id)
    await prisma.session.deleteMany({ where: { id: { in: toDelete } } })
  }

  return { token, expiresAt }
}

/** Cookie'ga sessiya tokenini yozadi */
export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    ...cookieOptions,
    expires: expiresAt,
  })
}

/** Cookie'dan tokenni o'qiydi */
export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value ?? null
}

/** Cookie'ni o'chiradi (logout) */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** Token bo'yicha sessiyani tekshiradi; muddati o'tgan bo'lsa o'chiradi */
export async function validateSession(prisma: Db, token: string) {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { profile: true } } },
  })
  if (!session) return null
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }
  // lastUsedAt yangilash (sekin yozilish — xato bo'lsa jim o'tib ketamiz)
  await prisma.session
    .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
    .catch(() => null)
  return session
}

/** Bitta sessiyani o'chiradi (logout) */
export async function destroySession(prisma: Db, token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } })
}

/** Foydalanuvchining BARCHA sessiyalarini bekor qiladi (parol tiklashda — FR-08) */
export async function destroyUserSessions(prisma: Db, userId: string): Promise<number> {
  const { count } = await prisma.session.deleteMany({ where: { userId } })
  return count
}

/** Faol sessiyalar soni (test uchun) */
export async function countActiveSessions(prisma: Db, userId: string): Promise<number> {
  return prisma.session.count({ where: { userId, expiresAt: { gt: new Date() } } })
}
