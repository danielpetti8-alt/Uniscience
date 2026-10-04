// =============================================================================
// UniScience.uz — global konstantalar
// Enum ishlatilmaydi (MySQL-portability — plan 1-qoida): barcha qiymatlar
// shu yerda markazlashtirilgan. Laravel'ga ko'chganda config/constants.php.
// =============================================================================

/** Foydalanuvchi rollari (TZ 2.1) */
export const ROLES = {
  STUDENT: 'student',
  RESEARCHER: 'researcher',
  PROFESSOR: 'professor',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MANAGEMENT: 'management',
} as const

/** Ro'yxatdan o'tish toifalari (FR-01) */
export const CATEGORIES = {
  BACHELOR: 'bachelor',
  MASTER: 'master',
  RESEARCHER: 'researcher',
  PROFESSOR: 'professor',
} as const

/** Hisob statuslari (FR-06, FR-04) */
export const USER_STATUS = {
  PENDING_EMAIL: 'pending_email', // email tasdiqlanmagan
  PENDING_APPROVAL: 'pending_approval', // professor/tadqiqotchi — admin tasdig'i kutilmoqda
  ACTIVE: 'active',
  BLOCKED: 'blocked',
} as const

export const TOKEN_TYPES = {
  VERIFY: 'verify',
  RESET: 'reset',
} as const

export const AUTHOR_POSITIONS = {
  SOLE: 'sole',
  FIRST: 'first',
  MIDDLE: 'middle',
  LAST: 'last',
} as const

/** Limitlar (FR-02, FR-06, FR-08, FR-10, FR-11) */
export const LIMITS = {
  PASSWORD_MIN: 8,
  SESSION_MAX_DEVICES: 3, // bir vaqtda 3 qurilma
  SESSION_DAYS: 30, // «eslab qolish»
  SESSION_HOURS_NO_REMEMBER: 24,
  LOGIN_MAX_ATTEMPTS: 5, // 5 marta noto'g'ri parol
  LOGIN_BLOCK_MINUTES: 15, // -> 15 daqiqa blok
  VERIFY_TOKEN_HOURS: 24,
  RESET_TOKEN_HOURS: 1,
  UNVERIFIED_CLEANUP_HOURS: 72, // tasdiqlanmagan hisob 72 soatda tozalanadi
  REQUEST_MESSAGE_MAX: 500, // FR-45
} as const

/** Sessiya cookie nomi */
export const SESSION_COOKIE = 'uniscience_session'

/** Bildirishnoma turlari (FR-20, FR-48, FR-68) */
export const NOTIFICATION_TYPES = {
  ARTICLE_STATUS: 'article_status',
  MENTOR_REQUEST: 'mentor_request',
  MENTOR_RESPONSE: 'mentor_response',
  SYSTEM: 'system',
  NEWS: 'news',
} as const

/** Avatar/fayl limitlari (FR-17, TS-05) — StorageAdapter'da ishlatiladi */
export const FILE_LIMITS = {
  AVATAR_MAX_MB: 5,
  PDF_MAX_MB: 20,
  VIDEO_MAX_MB: 512,
} as const

export const ROLE_LABELS: Record<string, string> = {
  student: 'Talaba',
  researcher: 'Tadqiqotchi',
  professor: 'Professor',
  admin: 'Admin',
  moderator: 'Moderator',
  management: 'Rahbariyat',
}

export const CATEGORY_LABELS: Record<string, string> = {
  bachelor: 'Bakalavr',
  master: 'Magistratura',
  researcher: 'Ilmiy tadqiqotchi',
  professor: 'Professor-“o‘qituvchi',
}

export const STATUS_LABELS: Record<string, string> = {
  pending_email: 'Email tasdiqlanmagan',
  pending_approval: 'Admin tasdig‘i kutilmoqda',
  active: 'Faol',
  blocked: 'Bloklangan',
}
