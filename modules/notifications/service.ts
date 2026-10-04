// =============================================================================
// Notifications service — bildirishnoma lenta biznes-mantiqi (FR-20, FR-48, FR-68)
// Boshqa modullar (auth, articles, matching) shu service orqali yozadi.
// Route handlerlar faqat shu funksiyalarni chaqiradi (plan 1-qoidasi).
// Laravel'ga ko'chganda: app/Services/NotificationService.php
// =============================================================================
import type { Prisma, PrismaClient } from '@prisma/client'
import { NOTIFICATION_TYPES } from '@/lib/constants'
import { AuthError } from '@/modules/auth/errors'

type Db = PrismaClient | Prisma.TransactionClient

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export interface CreateNotificationInput {
  userId: string
  type?: NotificationType
  title: string
  body?: string
  link?: string
}

/** Yangi bildirishnoma yozuvi (boshqa modullar chaqiradi) */
export async function createNotification(db: Db, input: CreateNotificationInput) {
  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type ?? NOTIFICATION_TYPES.SYSTEM,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    },
  })
}

/** Bir nechta foydalanuvchiga bir xil bildirishnoma (mass-ozlarni keyingi fazalar) */
export async function createNotifications(db: Db, userIds: string[], input: Omit<CreateNotificationInput, 'userId'>) {
  if (userIds.length === 0) return
  await db.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: input.type ?? NOTIFICATION_TYPES.SYSTEM,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    })),
  })
}

export interface ListOptions {
  limit?: number
  unreadOnly?: boolean
}

/** Foydalanuvchi lentasi: eng yangi birinchi + o'qilmaganlar soni */
export async function listNotifications(prisma: PrismaClient, userId: string, opts: ListOptions = {}) {
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 100)
  const where: Prisma.NotificationWhereInput = { userId }
  if (opts.unreadOnly) where.readAt = null

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ])

  return { items, unreadCount }
}

/** O'qilmaganlar soni — navbar bell (FR-68) */
export async function unreadCount(prisma: PrismaClient, userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } })
}

/** Bitta bildirishnomani o'qilgan deb belgilash (faqat o'ziniki — mulkchilik tekshiruvi) */
export async function markRead(prisma: PrismaClient, userId: string, id: string) {
  const row = await prisma.notification.findUnique({ where: { id }, select: { userId: true } })
  if (!row || row.userId !== userId) {
    throw new AuthError('NOT_FOUND', 'Bildirishnoma topilmadi')
  }
  await prisma.notification.update({ where: { id }, data: { readAt: new Date() } })
  return { marked: 1 }
}

/** Barchasini o'qilgan qilish */
export async function markAllRead(prisma: PrismaClient, userId: string) {
  const res = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  })
  return { marked: res.count }
}
