// =============================================================================
// AuthProvider — autentifikatsiya provayderi interfeysi (FR-09, HEMIS-ready).
// MVP: LocalAuthProvider (email + parol). 2-bosqichda HemisAuthProvider shu
// interfeysga ulanadi va profil ma'lumotlari avtomatik to'ldiriladi.
// =============================================================================
import type { User } from '@prisma/client'

export interface AuthProvider {
  readonly name: 'local' | 'hemis'
  /** Provayder bo'yicha foydalanuvchini topadi (yoki null) */
  findUser(externalId: string): Promise<User | null>
}

/** MVP: mahalliy autentifikatsiya — tashqi chaqiruvlar yo'q */
export class LocalAuthProvider implements AuthProvider {
  readonly name = 'local' as const
  async findUser(_externalId: string): Promise<User | null> {
    // Local provayderda tashqi ID bilan qidiruv yo'q
    return null
  }
}

export const authProvider: AuthProvider = new LocalAuthProvider()
