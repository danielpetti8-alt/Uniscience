// =============================================================================
// MailAdapter — email yuborish interfeysi (2-bosqich: SMTP).
// MVP'da LogMailAdapter: email EmailLog jadvaliga yoziladi va
// /dev/mailbox sahifasida ko'rinadi (SMTP yo'q).
// =============================================================================
import { prisma } from '@/lib/prisma'

export interface MailMessage {
  to: string
  subject: string
  body: string
  /** Dev mailbox'da kliklanadigan havola (tasdiqlash/tiklash) */
  tokenLink?: string
}

export interface MailAdapter {
  send(message: MailMessage): Promise<void>
}

/** MVP implementatsiyasi — emailni DB'ga yozadi (dev mailbox manbai) */
export class LogMailAdapter implements MailAdapter {
  async send(message: MailMessage): Promise<void> {
    await prisma.emailLog.create({
      data: {
        to: message.to,
        subject: message.subject,
        body: message.body,
        tokenLink: message.tokenLink ?? null,
      },
    })
  }
}

export const mailAdapter: MailAdapter = new LogMailAdapter()

// --- Tayyor email shablonlari ------------------------------------------------

export async function sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const link = `${baseUrl}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`
  await mailAdapter.send({
    to,
    subject: 'UniScience.uz — emailni tasdiqlash',
    body:
      `Assalomu alaykum!\n\n` +
      `UniScience.uz hisobingizni tasdiqlash uchun quyidagi havolani bosing:\n${link}\n\n` +
      `Havola 24 soat davomida amal qiladi va bir marta ishlatiladi.\n` +
      `Agar ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.`,
    tokenLink: link,
  })
}

export async function sendPasswordResetEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const link = `${baseUrl}/parolni-tiklash?token=${encodeURIComponent(token)}`
  await mailAdapter.send({
    to,
    subject: 'UniScience.uz — parolni tiklash',
    body:
      `Assalomu alaykum!\n\n` +
      `Parolni tiklash uchun quyidagi havolani bosing:\n${link}\n\n` +
      `Havola 1 soat davomida amal qiladi va bir marta ishlatiladi.\n` +
      `Parolni tiklashni so'ramagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.`,
    tokenLink: link,
  })
}
