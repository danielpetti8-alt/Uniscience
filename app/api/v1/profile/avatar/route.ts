// POST   /api/v1/profile/avatar — avatar yuklash (jpg/png ≤5 MB, TS-05)
// DELETE /api/v1/profile/avatar — avatarni o'chirish (FR-12)
import { deleteAvatar, saveAvatar } from '@/modules/users/service'
import { requireUser } from '@/lib/rbac'
import { AuthError } from '@/modules/auth/errors'
import { handle, ok } from '@/lib/api'

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser()

    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      throw new AuthError('VALIDATION_ERROR', "So'rov multipart/form-data formatida bo'lishi kerak", {
        fields: { avatar: "fayl multipart/form-data sifatida yuboriladi" },
      })
    }

    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      throw new AuthError('VALIDATION_ERROR', "'file' maydonida rasm yuborilishi kerak", {
        fields: { avatar: "fayl tanlanmagan" },
      })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const result = await saveAvatar(user.id, {
      bytes,
      originalName: file.name || 'avatar',
      mimeType: file.type || 'application/octet-stream',
    })
    return ok(result)
  })
}

export async function DELETE() {
  return handle(async () => {
    const user = await requireUser()
    const result = await deleteAvatar(user.id)
    return ok(result)
  })
}
