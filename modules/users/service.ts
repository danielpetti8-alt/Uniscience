// =============================================================================
// Users service — profil ko'rish/tahrirlash, avatar, parol (M2: FR-12..16).
// Laravel'ga ko'chganda: app/Services/UserService.php + ProfileService.php
// =============================================================================
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { FILE_LIMITS, ROLE_LABELS, ROLES } from '@/lib/constants'
import { AuthError } from '@/modules/auth/errors'
import { destroyOtherSessions } from '@/modules/auth/session'
import { storageAdapter, storageKeyFor, validateFile } from '@/lib/adapters/storage'
import { validatePasswordChange, validateProfileUpdate } from './validation'

// --- Yordamchi: foydalanuvchini profil va avatar bilan yuklaydi ----------------

async function userWithProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: { include: { avatar: true } } },
  })
  if (!user) throw new AuthError('NOT_FOUND', 'Foydalanuvchi topilmadi')
  return user
}

/** Avatar fayli uchun API manzili (img src) */
export function avatarUrlFor(fileId: string | null | undefined): string | null {
  return fileId ? `/api/v1/files/${fileId}` : null
}

/** Reyting xulosasi — P5'da RatingEngine to'ladi; hozir bo'sh holat */
async function ratingSummary(userId: string) {
  const [latest, approvedCount] = await Promise.all([
    prisma.rating.findFirst({
      where: { userId },
      orderBy: { period: 'desc' },
    }),
    prisma.article.count({ where: { userId, status: 'approved' } }),
  ])
  return {
    totalScore: latest?.totalScore ?? 0,
    groupRank: latest?.groupRank ?? null,
    facultyRank: latest?.facultyRank ?? null,
    universityRank: latest?.universityRank ?? null,
    approvedArticles: approvedCount,
    available: latest != null, // false = reyting hali hisoblanmagan (P5)
  }
}

/** Tasdiqlangan maqolalar portfeli — P4'da yuklash ochiladi, hozir bo'sh */
async function portfolio(userId: string) {
  const articles = await prisma.article.findMany({
    where: { userId, status: 'approved' },
    orderBy: { publishedDate: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      type: true,
      publishedDate: true,
      fieldMatch: true,
    },
  })
  return articles
}

// --- Profil ko'rinishi (FR-12, FR-14, FR-15) -----------------------------------

/**
 * Foydalanuvchining to'liq profil kartasi:
 * shaxsiy ma'lumot + avatar + reyting xulosasi + portfel + rol bloklari.
 */
export async function getOwnProfile(userId: string) {
  const user = await userWithProfile(userId)
  const [rating, portfolioItems] = await Promise.all([
    ratingSummary(userId),
    portfolio(userId),
  ])

  const isStudent = user.role === ROLES.STUDENT
  const isProfessor = user.role === ROLES.PROFESSOR

  // FR-14: talabada «Ilmiy rahbarlik» bloki (P7 matching ma'lumotlari bilan to'ladi)
  // FR-15: professorda «Bo'sh vaqt» + «Kelgan so'rovlar» (P7'da to'ladi)
  const blocks = isStudent
    ? {
        mentorship: {
          title: 'Ilmiy rahbarlik',
          activeMentor: null as null | { professorId: string; professorName: string },
          availableFrom: 'P7', // matching faza ochilganda blok to'ladi
        },
      }
    : isProfessor
      ? {
          mentoring: {
            title: 'Rahbarlik',
            slots: [] as unknown[],
            incomingRequests: [] as unknown[],
            availableFrom: 'P7',
          },
        }
      : {}

  return {
    id: user.id,
    username: user.username, // F.I.Sh. — faqat admin o'zgartiradi (FR-13)
    email: user.email,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] ?? user.role,
    category: user.category,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    avatar: user.profile?.avatar
      ? {
          id: user.profile.avatar.id,
          url: avatarUrlFor(user.profile.avatar.id),
          originalName: user.profile.avatar.originalName,
          sizeBytes: user.profile.avatar.sizeBytes,
          maxMb: FILE_LIMITS.AVATAR_MAX_MB,
        }
      : null,
    profile: {
      universitet: user.profile?.universitet ?? null, // faqat admin (FR-13)
      fakultet: user.profile?.fakultet ?? null,
      yonalish: user.profile?.yonalish ?? null,
      kurs: user.profile?.kurs ?? null,
      guruh: user.profile?.guruh ?? null,
      gpa: user.profile?.gpa ?? null,
      tugilganSana: user.profile?.tugilganSana ?? null,
      telefon: user.profile?.telefon ?? null, // o'zi tahrirlaydi (FR-13)
      daraja: user.profile?.daraja ?? null,
      lavozim: user.profile?.lavozim ?? null,
      kafedra: user.profile?.kafedra ?? null,
      bakalavrOtm: user.profile?.bakalavrOtm ?? null,
    },
    rating,
    portfolio: {
      items: portfolioItems,
      count: portfolioItems.length,
    },
    blocks,
  }
}

// --- Profil tahrirlash (FR-13) ---------------------------------------------------

/** Faqat o'zi tahrirlaydigan maydonlar (FR-13): aloqa (telefon). */
export async function updateOwnContact(userId: string, raw: Record<string, unknown>) {
  const input = validateProfileUpdate(raw)
  const data: { telefon?: string | null } = {}
  if (input.telefon !== undefined) data.telefon = input.telefon

  await prisma.profile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  })

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { telefon: true },
  })
  return { telefon: profile?.telefon ?? null }
}

// --- Parol o'zgartirish (FR-13) ---------------------------------------------------

/**
 * O'z parolini o'zgartirish: hozirgi parol tekshiriladi, boshqa sessiyalar
 * yopiladi (joriy sessiya saqlanadi) — xavfsizlik (FR-08 mantiqining davomi).
 */
export async function changeOwnPassword(
  userId: string,
  raw: Record<string, unknown>,
  keepSessionToken: string | null,
) {
  const { currentPassword, newPassword } = validatePasswordChange(raw)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AuthError('NOT_FOUND', 'Foydalanuvchi topilmadi')

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    throw new AuthError('INVALID_CREDENTIALS', 'Hozirgi parol noto‘g‘ri', {
      fields: { currentPassword: "hozirgi parol noto'g'ri" },
    })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  // Boshqa qurilmalar chiqariladi, joriy sessiya saqlanadi
  await destroyOtherSessions(prisma, userId, keepSessionToken)

  return { changed: true }
}

// --- Avatar (FR-12, TS-05) ----------------------------------------------------------

export interface AvatarUpload {
  bytes: Uint8Array
  originalName: string
  mimeType: string
}

/**
 * Avatar yuklash: jpg/png ≤5 MB (TS-05), magic-byte tekshiruvi,
 * kvadrat crop klient tomonda (canvas) — server yagona fayl sifatida saqlaydi.
 * Eski avatar fayli (disk + DB) o'chiriladi.
 */
export async function saveAvatar(userId: string, upload: AvatarUpload) {
  const validation = validateFile({
    kind: 'avatar',
    sizeBytes: upload.bytes.byteLength,
    mimeType: upload.mimeType,
    head: upload.bytes.slice(0, 8),
  })
  if (!validation.valid) {
    throw new AuthError('VALIDATION_ERROR', validation.error, {
      fields: { avatar: validation.error },
    })
  }

  const user = await userWithProfile(userId)
  const oldAvatarFileId = user.profile?.avatarFileId ?? null

  const storageKey = storageKeyFor('avatar', upload.originalName, userId)
  await storageAdapter.save(storageKey, upload.bytes)

  const file = await prisma.file.create({
    data: {
      storageKey,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      sizeBytes: upload.bytes.byteLength,
      uploadedById: userId,
    },
  })

  await prisma.profile.upsert({
    where: { userId },
    update: { avatarFileId: file.id },
    create: { userId, avatarFileId: file.id },
  })

  // Eski avatar faylini tozalash (yangisi allaqachon bog'landi)
  if (oldAvatarFileId && oldAvatarFileId !== file.id) {
    const old = await prisma.file.findUnique({ where: { id: oldAvatarFileId } })
    if (old) {
      await storageAdapter.delete(old.storageKey)
      await prisma.file.delete({ where: { id: old.id } })
    }
  }

  return {
    avatar: {
      id: file.id,
      url: avatarUrlFor(file.id),
      originalName: file.originalName,
      sizeBytes: file.sizeBytes,
      maxMb: FILE_LIMITS.AVATAR_MAX_MB,
    },
  }
}

/** Avatarni o'chirish (fayl diskda ham o'chadi) */
export async function deleteAvatar(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile?.avatarFileId) {
    throw new AuthError('NOT_FOUND', 'Avatar topilmadi')
  }
  const file = await prisma.file.findUnique({ where: { id: profile.avatarFileId } })
  await prisma.profile.update({ where: { userId }, data: { avatarFileId: null } })
  if (file) {
    await storageAdapter.delete(file.storageKey)
    await prisma.file.delete({ where: { id: file.id } })
  }
  return { removed: true }
}

// --- Ochiq professor profili (FR-16) -------------------------------------------------

/**
 * Professor profili tizimdagi barcha kirgan foydalanuvchilarga OCHIQ (FR-16).
 * Boshqa rollar profili yopiq (NOT_FOUND — mavjudligi ham oshkor qilinmaydi).
 */
export async function getPublicProfessor(professorId: string) {
  const user = await prisma.user.findUnique({
    where: { id: professorId },
    include: { profile: { include: { avatar: true } } },
  })
  if (!user || user.role !== ROLES.PROFESSOR) {
    throw new AuthError('NOT_FOUND', 'Professor topilmadi')
  }

  const rating = await ratingSummary(user.id)
  const portfolioItems = await portfolio(user.id)

  return {
    id: user.id,
    username: user.username,
    avatar: user.profile?.avatar ? { id: user.profile.avatar.id, url: avatarUrlFor(user.profile.avatar.id) } : null,
    profile: {
      universitet: user.profile?.universitet ?? null,
      fakultet: user.profile?.fakultet ?? null,
      daraja: user.profile?.daraja ?? null,
      lavozim: user.profile?.lavozim ?? null,
      kafedra: user.profile?.kafedra ?? null,
    },
    rating: {
      totalScore: rating.totalScore,
      approvedArticles: rating.approvedArticles,
    },
    portfolio: {
      items: portfolioItems,
      count: portfolioItems.length,
    },
    // matching slots P7'da shu javobga qo'shiladi (FR-44: talaba bo'sh vaqtlarni ko'radi)
  }
}
