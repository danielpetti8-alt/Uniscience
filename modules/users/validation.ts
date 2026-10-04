// =============================================================================
// Users moduli validatsiyasi — profil tahrirlash (FR-13) va parol o'zgartirish.
// FR-13 QOIDASI: parol / rasm / aloqa — foydalanuvchi o'zi;
//                ism-familiya (username) / universitet — FAQAT admin.
// Shuning uchun PATCH faqat ruxsat etilgan maydonlarni qabul qiladi;
// himoyalangan maydon yuborilsa — VALIDATION_ERROR (maydonlar ko'rsatiladi).
// =============================================================================
import { LIMITS } from '@/lib/constants'
import { AuthError } from '@/modules/auth/errors'

/** Foydalanuvchi o'zi tahrirlashi MUMKIN bo'lgan maydonlar (FR-13) */
export const SELF_EDITABLE_FIELDS = ['telefon'] as const

/** Faqat admin o'zgartiradigan maydonlar (FR-13) — tekshiruv uchun ro'yxat */
export const ADMIN_ONLY_FIELDS = [
  'username',
  'familiya',
  'ism',
  'otasiningIsmi',
  'universitet',
  'email',
  'role',
  'status',
] as const

export interface ProfileUpdateInput {
  /** undefined = maydon yuborilmagan (o'zgartirilmaydi); null = tozalash */
  telefon: string | null | undefined
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Profil tahrirlash so'rovini tekshiradi.
 * - Faqat `telefon` o'zgartiriladi (+null = tozalash).
 * - Himoyalangan maydonlar yuborilsa — 400 (FR-13 buzilishini erta ushlaymiz).
 * - Noma'lum maydonlar e'tiborga olinmaydi (forward-compat).
 */
export function validateProfileUpdate(raw: Record<string, unknown>): ProfileUpdateInput {
  // FR-13: himoyalangan maydonlar urinishni rad etamiz (o'zgartirmasdan o'tkazib
  // yuborish foydalanuvchini chalg'itadi — aniq xato to'g'ri)
  const attempted: string[] = ADMIN_ONLY_FIELDS.filter((f) => f in raw && raw[f] !== undefined)
  if (attempted.length > 0) {
    throw new AuthError('VALIDATION_ERROR', "Bu maydonlarni faqat admin o'zgartiradi (FR-13)", {
      fields: Object.fromEntries(attempted.map((f) => [f, "faqat admin o'zgartiradi"])),
    })
  }

  let telefon: string | null | undefined
  if ('telefon' in raw) {
    if (raw.telefon === null || str(raw.telefon) === '') {
      telefon = null // tozalash
    } else {
      telefon = str(raw.telefon)
      // E.164-ga yaqin: +998901234567 yoki 998901234567 yoki 901234567 (9..15 raqam)
      const digits = telefon.replace(/[\s()-]/g, '')
      if (!/^\+?\d{9,15}$/.test(digits)) {
        throw new AuthError('VALIDATION_ERROR', 'Telefon raqam formati noto‘g‘ri', {
          fields: { telefon: 'masalan: +998901234567' },
        })
      }
      telefon = digits
    }
  }

  return { telefon }
}

export interface PasswordChangeInput {
  currentPassword: string
  newPassword: string
}

/** Parolni boshqa parolga almashtirish so'rovi (FR-13) */
export function validatePasswordChange(raw: Record<string, unknown>): PasswordChangeInput {
  const currentPassword = str(raw.currentPassword)
  const newPassword = str(raw.newPassword)

  const fields: Record<string, string> = {}
  if (!currentPassword) fields.currentPassword = "hozirgi parol kiritilishi kerak"

  if (!newPassword) {
    fields.newPassword = 'yangi parol kiritilishi kerak'
  } else {
    if (newPassword.length < LIMITS.PASSWORD_MIN) {
      fields.newPassword = `Parol kamida ${LIMITS.PASSWORD_MIN} belgidan iborat bo'lishi kerak`
    } else if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      fields.newPassword = "Parol kamida bitta harf va bitta raqam o'z ichiga olishi kerak"
    } else if (newPassword === currentPassword) {
      fields.newPassword = 'Yangi parol hozirgi paroldan farq qilishi kerak'
    }
  }

  if (Object.keys(fields).length > 0) {
    throw new AuthError('VALIDATION_ERROR', "Ma'lumotlar to'liq emas", { fields })
  }

  return { currentPassword, newPassword }
}
