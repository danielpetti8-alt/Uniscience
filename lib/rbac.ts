// =============================================================================
// RBAC — rol va sessiya tekshiruvi (route handlerlar va sahifalar uchun)
// =============================================================================
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ROLES } from '@/lib/constants'
import { AuthError } from '@/modules/auth/errors'
import { readSessionCookie, validateSession } from '@/modules/auth/session'

/** Cookie'dagi sessiyadan foydalanuvchini qaytaradi (yoki null) */
export async function getSessionUser() {
  const token = await readSessionCookie()
  if (!token) return null
  const session = await validateSession(prisma, token)
  if (!session) return null
  return session.user
}

/** Kirish shart — aks holda AuthError (API uchun) */
export async function requireUser() {
  const user = await getSessionUser()
  if (!user) throw new AuthError('NOT_AUTHENTICATED', "Tizimga kirish kerak")
  return user
}

/** Rol shart — aks holda AuthError (API uchun) */
export async function requireRole(...roles: string[]) {
  const user = await requireUser()
  if (!roles.includes(user.role)) {
    throw new AuthError('FORBIDDEN', "Bu amal uchun ruxsat yo'q")
  }
  return user
}

/** Sahifalar uchun: rol yo'q bo'lsa — kirish sahifasiga yo'naltirish */
export async function requireRoleOrRedirect(...roles: string[]) {
  const user = await getSessionUser()
  if (!user) redirect('/kirish')
  if (!roles.includes(user.role)) redirect('/')
  return user
}

/** Admin roli tekshiruvi (qisqa yordamchi) */
export async function requireAdmin() {
  return requireRole(ROLES.ADMIN)
}
