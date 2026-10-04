// =============================================================================
// USERNAME = to'liq F.I.Sh. (FR-05)
// Avtomatik shakllanadi, nikname YO'Q. Takrorlanish tekshiruvi bor:
// bazada bor bo'lsa — raqamli qo'shimcha qo'yiladi ("Karimov Sardor 2").
// =============================================================================
import type { Prisma, PrismaClient } from '@prisma/client'

/** Har bir so'zni bosh harfi katta qilib normallashtiradi */
function capitalize(word: string): string {
  if (!word) return word
  return word.charAt(0).toLocaleUpperCase('uz') + word.slice(1).toLocaleLowerCase('uz')
}

/** "karimov   sardor ravshanovich" -> "Karimov Sardor Ravshanovich" */
export function normalizeFio(familiya: string, ism: string, otasiningIsmi: string): string {
  return [familiya, ism, otasiningIsmi]
    .filter((p) => p && p.trim().length > 0)
    .map((p) => capitalize(p.trim()))
    .join(' ')
}

/** Bazada yagona username generatsiya qiladi */
export async function generateUniqueUsername(
  prisma: PrismaClient | Prisma.TransactionClient,
  familiya: string,
  ism: string,
  otasiningIsmi: string,
): Promise<string> {
  const base = normalizeFio(familiya, ism, otasiningIsmi)
  let candidate = base
  let n = 1
  // Izchil takror tekshiruvi (FR-05)
  while (await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })) {
    n += 1
    candidate = `${base} ${n}`
  }
  return candidate
}
