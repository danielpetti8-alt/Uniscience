// =============================================================================
// Auth service — barcha biznes mantiq shu yerda (plan 1-qoidasi).
// Route handlerlar faqat shu funksiyalarni chaqiradi.
// =============================================================================
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { CATEGORIES, LIMITS, NOTIFICATION_TYPES, ROLES, TOKEN_TYPES, USER_STATUS } from '@/lib/constants'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/adapters/mail'
import { createNotification } from '@/modules/notifications/service'
import { AuthError } from './errors'
import { validateRegisterInput, type RegisterInput } from './validation'
import { generateUniqueUsername } from './username'
import {
  createSession,
  destroySession,
  destroyUserSessions,
  hashToken,
  validateSession,
} from './session'

type Tx = Prisma.TransactionClient

// --- Yordamchi funksiyalar ----------------------------------------------------

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 60 * 60 * 60 * 1000)
}

/** Token yaratadi va FAQAT hashini DB'ga yozadi; token matnini qaytaradi */
async function createEmailToken(
  db: PrismaClientLike,
  userId: string,
  type: string,
  hours: number,
): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  await db.emailToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      type,
      expiresAt: hoursFromNow(hours),
    },
  })
  return token
}

type PrismaClientLike = typeof prisma | Tx

function roleForCategory(category: string): string {
  if (category === CATEGORIES.RESEARCHER) return ROLES.RESEARCHER
  if (category === CATEGORIES.PROFESSOR) return ROLES.PROFESSOR
  return ROLES.STUDENT
}

// --- Ro'yxatdan o'tish (FR-01..06) ---------------------------------------------

export async function registerUser(raw: Record<string, unknown>, baseUrl: string) {
  const input: RegisterInput = validateRegisterInput(raw)

  // Email yagonaligi (FR-02)
  const emailTaken = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  })
  if (emailTaken) throw new AuthError('EMAIL_TAKEN', "Bu email bilan hisob mavjud")

  // Username = F.I.Sh. + takror tekshiruvi (FR-05, TS-02)
  const username = await generateUniqueUsername(prisma, input.familiya, input.ism, input.otasiningIsmi)

  const passwordHash = await bcrypt.hash(input.password, 10)
  const role = roleForCategory(input.category)

  let verifyToken = ''
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        username,
        email: input.email,
        passwordHash,
        role,
        category: input.category,
        // Professor/tadqiqotchi — email tasdiqlangach pending_approval bo'ladi (FR-04)
        status: USER_STATUS.PENDING_EMAIL,
        authProvider: 'local', // HEMIS-ready (FR-09, TS-22)
        hemisId: null, // 2-bosqichda to'ladi
        profile: {
          create: {
            universitet: input.universitet,
            fakultet: input.fakultet,
            yonalish: input.yonalish,
            kurs: input.kurs,
            guruh: input.guruh,
            gpa: input.gpa,
            tugilganSana: input.tugilganSana ? new Date(input.tugilganSana) : null,
            daraja: input.daraja,
            lavozim: input.lavozim,
            kafedra: input.kafedra,
            bakalavrOtm: input.bakalavrOtm,
          },
        },
      },
    })
    verifyToken = await createEmailToken(tx, created.id, TOKEN_TYPES.VERIFY, LIMITS.VERIFY_TOKEN_HOURS)
    return created
  })

  // Tasdiqlash emaili (dev mailbox'da ko'rinadi)
  await sendVerificationEmail(user.email, verifyToken, baseUrl)

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    category: user.category,
    status: user.status,
  }
}

// --- Email tasdiqlash (FR-06) --------------------------------------------------

export async function verifyEmail(token: string) {
  const row = await prisma.emailToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  })

  if (!row || row.type !== TOKEN_TYPES.VERIFY) {
    throw new AuthError('TOKEN_INVALID', "Tasdiqlash havolasi yaroqsiz")
  }
  if (row.usedAt) throw new AuthError('TOKEN_USED', "Bu havola allaqachon ishlatilgan")
  if (row.expiresAt <= new Date()) throw new AuthError('TOKEN_EXPIRED', "Havolaning muddati o'tgan")

  const isStudent = row.user.role === ROLES.STUDENT

  await prisma.$transaction(async (tx) => {
    await tx.emailToken.update({ where: { id: row.id }, data: { usedAt: new Date() } })
    await tx.user.update({
      where: { id: row.userId },
      data: {
        emailVerifiedAt: new Date(),
        // Talaba -> faol; professor/tadqiqotchi -> admin tasdig'i kutiladi (FR-04)
        status: isStudent ? USER_STATUS.ACTIVE : USER_STATUS.PENDING_APPROVAL,
      },
    })
    // Birinchi bildirishnoma — lenta keyingi voqealarni ko'rsatadi (FR-68)
    await createNotification(tx, {
      userId: row.userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: isStudent ? 'Hisobingiz faollashtirildi' : 'Hisobingiz tasdiqlashda',
      body: isStudent
        ? 'Endi maqola yuklash va reytingda qatnashishingiz mumkin.'
        : "Admin tasdig'ini kutyapsiz. Tasdiqlangach barcha imkoniyatlar ochiladi.",
      link: '/profil',
    })
  })

  return {
    verified: true,
    needsApproval: !isStudent,
    message: isStudent
      ? "Email tasdiqlandi. Endi kirishingiz mumkin."
      : "Email tasdiqlandi. Hisobingiz admin tasdig'ini kutilmoqda.",
  }
}

/** Tasdiqlash xatini qayta yuborish */
export async function resendVerification(email: string, baseUrl: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  // Foydalanuvchi mavjudligini oshkor qilmaslik uchun har doim "yuborildi"
  if (user && user.status === USER_STATUS.PENDING_EMAIL) {
    const token = await createEmailToken(prisma, user.id, TOKEN_TYPES.VERIFY, LIMITS.VERIFY_TOKEN_HOURS)
    await sendVerificationEmail(user.email, token, baseUrl)
  }
  return { sent: true }
}

// --- Kirish (FR-07, FR-10, FR-11) ----------------------------------------------

export async function login(
  rawIdentifier: string,
  password: string,
  remember: boolean,
  ctx: { userAgent?: string | null; ip?: string | null },
) {
  const identifier = rawIdentifier.trim()
  const isEmail = identifier.includes('@')

  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier.toLowerCase() } : { username: identifier },
  })

  // Hisob topilmasa — brute-force hisobi identifikator bo'yicha yuritiladi
  const attemptKey = (user?.email ?? identifier).toLowerCase()

  // 1) Blok tekshiruvi (FR-11, TS-21)
  const attempt = await prisma.loginAttempt.findUnique({ where: { email: attemptKey } })
  if (attempt?.blockedUntil && attempt.blockedUntil > new Date()) {
    const mins = Math.max(1, Math.ceil((attempt.blockedUntil.getTime() - Date.now()) / 60000))
    throw new AuthError('LOGIN_BLOCKED', `Juda ko'p noto'g'ri urinish. ${mins} daqiqadan keyin qayta urinib ko'ring`, {
      details: { minutesLeft: mins },
    })
  }

  // 2) Parol tekshiruvi — bcrypt (FR-07)
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!user || !ok) {
    const attempts = (attempt?.attempts ?? 0) + 1
    const blocked = attempts >= LIMITS.LOGIN_MAX_ATTEMPTS
    const blockedUntil = blocked ? new Date(Date.now() + LIMITS.LOGIN_BLOCK_MINUTES * 60000) : null
    await prisma.loginAttempt.upsert({
      where: { email: attemptKey },
      update: { attempts: blocked ? 0 : attempts, blockedUntil },
      create: { email: attemptKey, attempts, blockedUntil },
    })
    if (blocked) {
      throw new AuthError(
        'LOGIN_BLOCKED',
        `5 marta noto'g'ri parol. Hisob ${LIMITS.LOGIN_BLOCK_MINUTES} daqiqaga bloklandi.`,
      )
    }
    throw new AuthError('INVALID_CREDENTIALS', "Username yoki parol noto'g'ri")
  }

  // 3) Hisob statusi (TS-03: tasdiqlanmagan professor kira olmaydi)
  if (user.status === USER_STATUS.BLOCKED) {
    throw new AuthError('ACCOUNT_BLOCKED', "Hisobingiz bloklangan. Admin bilan bog'laning.")
  }
  if (user.status === USER_STATUS.PENDING_EMAIL) {
    throw new AuthError('ACCOUNT_PENDING_EMAIL', "Avval emailingizni tasdiqlang.")
  }
  if (user.status === USER_STATUS.PENDING_APPROVAL) {
    throw new AuthError('ACCOUNT_PENDING_APPROVAL', "Hisobingiz admin tasdig'ini kutilmoqda.")
  }

  // 4) Muvaffaqiyatli kirish — urinishlar hisobi tozalanadi (FR-11)
  await prisma.loginAttempt.deleteMany({ where: { email: attemptKey } })

  // 5) Sessiya yaratish (FR-10)
  const { token, expiresAt } = await createSession(prisma, user.id, {
    remember,
    userAgent: ctx.userAgent ?? null,
    ip: ctx.ip ?? null,
  })
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      category: user.category,
    },
  }
}

// --- Chiqish -------------------------------------------------------------------

export async function logout(token: string): Promise<void> {
  await destroySession(prisma, token)
}

// --- Joriy foydalanuvchi --------------------------------------------------------

export async function getMe(token: string) {
  const session = await validateSession(prisma, token)
  if (!session) throw new AuthError('NOT_AUTHENTICATED', "Sessiya topilmadi")
  return {
    id: session.user.id,
    username: session.user.username,
    email: session.user.email,
    role: session.user.role,
    category: session.user.category,
    status: session.user.status,
    emailVerifiedAt: session.user.emailVerifiedAt,
    profile: session.user.profile,
  }
}

// --- Parolni tiklash (FR-08) ---------------------------------------------------

export async function requestPasswordReset(email: string, baseUrl: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (user && user.status !== USER_STATUS.BLOCKED) {
    const token = await createEmailToken(prisma, user.id, TOKEN_TYPES.RESET, LIMITS.RESET_TOKEN_HOURS)
    await sendPasswordResetEmail(user.email, token, baseUrl)
  }
  // Foydalanuvchi mavjudligini oshkor qilmaymiz
  return { sent: true }
}

export async function resetPassword(token: string, newPassword: string) {
  const passErr = validateNewPassword(newPassword)
  if (passErr) throw new AuthError('VALIDATION_ERROR', passErr)

  const row = await prisma.emailToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  })
  if (!row || row.type !== TOKEN_TYPES.RESET) {
    throw new AuthError('TOKEN_INVALID', "Tiklash havolasi yaroqsiz")
  }
  if (row.usedAt) throw new AuthError('TOKEN_USED', "Bu havola allaqachon ishlatilgan")
  if (row.expiresAt <= new Date()) throw new AuthError('TOKEN_EXPIRED', "Havolaning muddati o'tgan")

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.$transaction(async (tx) => {
    await tx.emailToken.update({ where: { id: row.id }, data: { usedAt: new Date() } })
    await tx.user.update({ where: { id: row.userId }, data: { passwordHash } })
    // Parol o'zgarganda BARCHA sessiyalar bekor qilinadi (xavfsizlik)
    await tx.session.deleteMany({ where: { userId: row.userId } })
  })

  return { reset: true, sessionsRevoked: true }
}

function validateNewPassword(pw: string): string | null {
  if (!pw || pw.length < LIMITS.PASSWORD_MIN) {
    return `Parol kamida ${LIMITS.PASSWORD_MIN} belgidan iborat bo'lishi kerak`
  }
  if (!/[A-Za-z]/.test(pw)) return "Parolda kamida bitta harf bo'lishi kerak"
  if (!/[0-9]/.test(pw)) return "Parolda kamida bitta raqam bo'lishi kerak"
  return null
}

// --- Admin: professor/tadqiqotchi tasdig'i (FR-04, FR-50, TS-03/04) ------------

export async function listPendingUsers() {
  return prisma.user.findMany({
    where: { status: USER_STATUS.PENDING_APPROVAL },
    include: { profile: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function approveUser(adminId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AuthError('NOT_FOUND', "Foydalanuvchi topilmadi")
  if (user.status !== USER_STATUS.PENDING_APPROVAL) {
    throw new AuthError('VALIDATION_ERROR', "Bu hisob tasdiqlashni kutmayapti")
  }
  await prisma.user.update({ where: { id: userId }, data: { status: USER_STATUS.ACTIVE } })
  await prisma.auditLog.create({
    data: { adminId, action: 'approve', entity: 'user', entityId: userId },
  })
  // FR-68: holat o'zgarishi foydalanuvchiga bildiriladi
  await createNotification(prisma, {
    userId,
    type: NOTIFICATION_TYPES.SYSTEM,
    title: 'Hisobingiz tasdiqlandi',
    body: 'Admin hisobingizni tasdiqladi. Barcha imkoniyatlar ochiq!',
    link: '/profil',
  })
  return { approved: true }
}

export async function rejectUser(adminId: string, userId: string, reason?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AuthError('NOT_FOUND', "Foydalanuvchi topilmadi")
  await prisma.user.update({ where: { id: userId }, data: { status: USER_STATUS.BLOCKED } })
  await prisma.auditLog.create({
    data: { adminId, action: 'reject', entity: 'user', entityId: userId, meta: JSON.stringify({ reason }) },
  })
  // FR-68: rad etish sababi bildirishnomada ko'rinadi
  await createNotification(prisma, {
    userId,
    type: NOTIFICATION_TYPES.SYSTEM,
    title: 'Hisobingiz tasdiqlanmadi',
    body: reason?.trim() ? `Sabab: ${reason.trim()}` : 'Admin hisobingizni tasdiqlamadi.',
  })
  return { rejected: true }
}

export { destroyUserSessions }
