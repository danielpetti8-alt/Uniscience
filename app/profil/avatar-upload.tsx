'use client'

// Avatar yuklash (FR-12, TS-05): rasm tanlanadi → canvas orqali MARKAZIY KVADRAT
// CROP qilinadi → POST /api/v1/profile/avatar (jpg/png ≤5 MB — server ham tekshiradi).
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

/** Rasmni markazidan kvadrat qilib kesib, blob qaytaradi */
async function cropToSquare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas ishlamadi')
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, side, side)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Rasmni qayta ishlash muvaffaqiyatsiz'))),
      file.type === 'image/png' ? 'image/png' : 'image/jpeg',
      0.92,
    )
  })
}

export function AvatarUpload({ hasAvatar }: { hasAvatar: boolean }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    setNotice('')
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Faqat JPG yoki PNG rasm qabul qilinadi')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm hajmi 5 MB dan oshmasligi kerak (TS-05)')
      return
    }

    setBusy(true)
    try {
      const cropped = await cropToSquare(file)
      const form = new FormData()
      form.append('file', cropped, file.name.replace(/\.[^.]+$/, '') + (file.type === 'image/png' ? '.png' : '.jpg'))
      const res = await fetch('/api/v1/profile/avatar', { method: 'POST', body: form })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        setError(json?.error?.message ?? 'Avatar yuklanmadi')
        return
      }
      setNotice('Avatar yangilandi')
      router.refresh()
    } catch {
      setError('Rasmni o\'qib bo\'lmadi')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    setBusy(true)
    setError('')
    setNotice('')
    const res = await fetch('/api/v1/profile/avatar', { method: 'DELETE' })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.success) {
      setError(json?.error?.message ?? "Avatar o'chirilmadi")
    } else {
      setNotice("Avatar o'chirildi")
      router.refresh()
    }
    setBusy(false)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={onFileChange}
        disabled={busy}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? 'Yuklanmoqda...' : hasAvatar ? 'Avatarini almashtirish' : 'Avatar yuklash'}
        </Button>
        {hasAvatar && (
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={busy}>
            O'chirish
          </Button>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-2">JPG/PNG, ≤5 MB — kvadratga avtomatik kesiladi (TS-05)</p>
      {error && <p className="text-xs text-danger font-semibold mt-1">{error}</p>}
      {notice && <p className="text-xs text-success font-semibold mt-1">{notice}</p>}
    </div>
  )
}
