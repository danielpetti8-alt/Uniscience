// =============================================================================
// Auth validatsiyasi — PURE funksiyalar (framework'dan mustaqil).
// Laravel'ga ko'chganda: FormRequest klasslariga aynan mos keladi.
// =============================================================================
import { CATEGORIES, LIMITS } from '@/lib/constants'
import { AuthError } from './errors'

export type RegisterInput = {
  category: string
  familiya: string
  ism: string
  otasiningIsmi: string
  email: string
  password: string
  consent: boolean
  // talabalar
  universitet?: string
  fakultet?: string
  yonalish?: string
  kurs?: number
  guruh?: string
  gpa?: number
  tugilganSana?: string
  bakalavrOtm?: string
  // professor/tadqiqotchi
  daraja?: string
  lavozim?: string
  kafedra?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

/** Parol qoidasi (FR-02): min 8 belgi, kamida bitta harf va bitta raqam */
export function validatePassword(password: string): string | null {
  if (!password || password.length < LIMITS.PASSWORD_MIN) {
    return `Parol kamida ${LIMITS.PASSWORD_MIN} belgidan iborat bo'lishi kerak`
  }
  if (!/[A-Za-z]/.test(password)) {
    return "Parolda kamida bitta harf bo'lishi kerak"
  }
  if (!/[0-9]/.test(password)) {
    return "Parolda kamida bitta raqam bo'lishi kerak"
  }
  return null
}

export function validateEmail(email: string): string | null {
  if (!email) return "Email kiritilishi shart"
  if (!EMAIL_RE.test(email)) return "Email formati noto'g'ri"
  return null
}

/** F.I.Sh. maydonlari validatsiyasi (FR-02, FR-04) */
export function validateFio(familiya: string, ism: string, otasiningIsmi: string): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!familiya) errors.familiya = "Familiya kiritilishi shart"
  if (!ism) errors.ism = "Ism kiritilishi shart"
  if (!otasiningIsmi) errors.otasiningIsmi = "Otasining ismi kiritilishi shart"
  return errors
}

/**
 * Ro'yxatdan o'tish ma'lumotlarini to'liq tekshiradi.
 * Xatolarda AuthError(VALIDATION_ERROR, fields) qaytaradi.
 */
export function validateRegisterInput(raw: Record<string, unknown>): RegisterInput {
  const errors: Record<string, string> = {}

  const category = str(raw.category)
  if (!Object.values(CATEGORIES).includes(category as never)) {
    errors.category = "Toifa tanlanishi shart"
  }

  const familiya = str(raw.familiya)
  const ism = str(raw.ism)
  const otasiningIsmi = str(raw.otasiningIsmi)
  Object.assign(errors, validateFio(familiya, ism, otasiningIsmi))

  const email = str(raw.email).toLowerCase()
  const emailErr = validateEmail(email)
  if (emailErr) errors.email = emailErr

  const password = str(raw.password)
  const passErr = validatePassword(password)
  if (passErr) errors.password = passErr

  const universitet = str(raw.universitet)
  const fakultet = str(raw.fakultet)
  const yonalish = str(raw.yonalish)
  const kurs = raw.kurs === undefined || raw.kurs === '' ? undefined : Number(raw.kurs)
  const guruh = str(raw.guruh)
  const gpa = raw.gpa === undefined || raw.gpa === '' ? undefined : Number(raw.gpa)
  const tugilganSana = str(raw.tugilganSana)
  const bakalavrOtm = str(raw.bakalavrOtm)
  const daraja = str(raw.daraja)
  const lavozim = str(raw.lavozim)
  const kafedra = str(raw.kafedra)

  if (category === CATEGORIES.BACHELOR || category === CATEGORIES.MASTER) {
    if (!universitet) errors.universitet = "Universitet kiritilishi shart"
    if (!fakultet) errors.fakultet = "Fakultet kiritilishi shart"
    if (!yonalish) errors.yonalish = "Yo'nalish kiritilishi shart"
    if (kurs === undefined || Number.isNaN(kurs)) errors.kurs = "Kurs kiritilishi shart"
    else if (kurs < 1 || kurs > (category === CATEGORIES.BACHELOR ? 6 : 3))
      errors.kurs = `Kurs 1–${category === CATEGORIES.BACHELOR ? 6 : 3} oralig'ida bo'lishi kerak`
    if (!guruh) errors.guruh = "Guruh kiritilishi shart"
    if (gpa !== undefined && (Number.isNaN(gpa) || gpa < 0 || gpa > 100))
      errors.gpa = "GPA 0–100 oralig'ida bo'lishi kerak"
    if (!tugilganSana) errors.tugilganSana = "Tug'ilgan sana kiritilishi shart"
  }

  if (category === CATEGORIES.RESEARCHER || category === CATEGORIES.PROFESSOR) {
    if (!universitet) errors.universitet = "Universitet/tashkilot kiritilishi shart"
    if (!daraja) errors.daraja = "Ilmiy daraja kiritilishi shart"
    if (!lavozim) errors.lavozim = "Lavozim kiritilishi shart"
    if (!kafedra) errors.kafedra = "Kafedra kiritilishi shart"
  }

  // O'RQ-547 rozilik belgisi (majburiy)
  if (raw.consent !== true && raw.consent !== 'true' && raw.consent !== 'on') {
    errors.consent = "Shaxsiy ma'lumotlarni qayta ishlashga rozilik bildirilishi shart (O'RQ-547)"
  }

  if (Object.keys(errors).length > 0) {
    throw new AuthError('VALIDATION_ERROR', "Formada xatolar bor", { fields: errors })
  }

  return {
    category,
    familiya,
    ism,
    otasiningIsmi,
    email,
    password,
    consent: true,
    universitet: universitet || undefined,
    fakultet: fakultet || undefined,
    yonalish: yonalish || undefined,
    kurs: kurs ?? undefined,
    guruh: guruh || undefined,
    gpa: gpa ?? undefined,
    tugilganSana: tugilganSana || undefined,
    bakalavrOtm: bakalavrOtm || undefined,
    daraja: daraja || undefined,
    lavozim: lavozim || undefined,
    kafedra: kafedra || undefined,
  }
}

/** Login formasi validatsiyasi (FR-07) */
export function validateLoginInput(raw: Record<string, unknown>): { identifier: string; password: string; remember: boolean } {
  const identifier = str(raw.identifier)
  const password = typeof raw.password === 'string' ? raw.password : ''
  const errors: Record<string, string> = {}
  if (!identifier) errors.identifier = "Username (F.I.Sh.) yoki email kiritilishi shart"
  if (!password) errors.password = "Parol kiritilishi shart"
  if (Object.keys(errors).length > 0) {
    throw new AuthError('VALIDATION_ERROR', "Formada xatolar bor", { fields: errors })
  }
  return { identifier, password, remember: raw.remember === true || raw.remember === 'on' || raw.remember === 'true' }
}

/** Parol tiklash formasi validatsiyasi (FR-08) */
export function validateResetInput(raw: Record<string, unknown>): { token: string; password: string } {
  const token = str(raw.token)
  const password = typeof raw.password === 'string' ? raw.password : ''
  const errors: Record<string, string> = {}
  if (!token) errors.token = "Token kiritilishi shart"
  const passErr = validatePassword(password)
  if (passErr) errors.password = passErr
  if (Object.keys(errors).length > 0) {
    throw new AuthError('VALIDATION_ERROR', "Formada xatolar bor", { fields: errors })
  }
  return { token, password }
}
