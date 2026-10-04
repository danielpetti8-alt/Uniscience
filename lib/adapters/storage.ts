// =============================================================================
// StorageAdapter — fayl saqlash interfeysi (FR-17, TS-05).
// MVP: mahalliy disk (storage/). 2-bosqich/PRODUCTION: S3.
// Fayl validatsiyasi (hajm, MIME, magic-byte) shu yerda — markazlashgan.
// =============================================================================
import { FILE_LIMITS } from '@/lib/constants'

export type FileKind = 'avatar' | 'pdf' | 'video' | 'guide'

const MAX_BYTES: Record<FileKind, number> = {
  avatar: FILE_LIMITS.AVATAR_MAX_MB * 1024 * 1024, // 5 MB
  pdf: FILE_LIMITS.PDF_MAX_MB * 1024 * 1024, // 20 MB
  video: FILE_LIMITS.VIDEO_MAX_MB * 1024 * 1024,
  guide: FILE_LIMITS.PDF_MAX_MB * 1024 * 1024,
}

const ALLOWED_MIME: Record<FileKind, string[]> = {
  avatar: ['image/jpeg', 'image/png'],
  pdf: ['application/pdf'],
  video: ['video/mp4'],
  guide: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

/** Magic-byte (fayl imzosi) — MIME soxtalashtirishiga qarshi */
const MAGIC: Record<FileKind, { offset: number; bytes: number[] }[]> = {
  avatar: [
    { offset: 0, bytes: [0xff, 0xd8, 0xff] }, // JPEG
    { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }, // PNG
  ],
  pdf: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  video: [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }], // ....ftyp (MP4)
  guide: [
    { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }, // PDF
    { offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }, // ZIP (DOCX)
  ],
}

export interface FileValidationInput {
  kind: FileKind
  sizeBytes: number
  mimeType: string
  /** Faylning birinchi baytlari (magic-byte tekshiruvi uchun) */
  head?: Uint8Array
}

export type ValidationResult = { valid: true } | { valid: false; error: string }

/** Hajm + MIME + magic-byte tekshiruvi (TS-05: 6 MB rasm rad etiladi) */
export function validateFile(input: FileValidationInput): ValidationResult {
  const { kind, sizeBytes, mimeType, head } = input

  if (sizeBytes <= 0) return { valid: false, error: "Fayl bo'sh" }
  if (sizeBytes > MAX_BYTES[kind]) {
    const maxMb = MAX_BYTES[kind] / (1024 * 1024)
    return { valid: false, error: `Fayl hajmi ${maxMb} MB dan oshmasligi kerak` }
  }
  if (!ALLOWED_MIME[kind].includes(mimeType)) {
    return { valid: false, error: `Bu turdagi fayl qabul qilinmaydi (${mimeType})` }
  }
  if (head) {
    const signatures = MAGIC[kind]
    const matches = signatures.some((sig) =>
      sig.bytes.every((b, i) => head[sig.offset + i] === b),
    )
    if (!matches) {
      return { valid: false, error: "Fayl mazmuni kengaytmasiga mos kelmaydi" }
    }
  }
  return { valid: true }
}

/** Saqlash kaliti (storageKey) generatsiya qiladi */
export function storageKeyFor(kind: FileKind, originalName: string, userId: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin'
  const rand = Math.random().toString(36).slice(2, 10)
  return `${kind}/${userId}/${Date.now()}-${rand}.${ext}`
}

export interface StorageAdapter {
  save(key: string, data: Uint8Array): Promise<void>
  read(key: string): Promise<Uint8Array>
  exists(key: string): Promise<boolean>
  delete(key: string): Promise<void>
}

/** MVP: mahalliy disk (storage/ papkasi, gitignore qilingan) */
export class LocalStorageAdapter implements StorageAdapter {
  constructor(private root = 'storage') {}

  private path(key: string): string {
    // Path traversal himoyasi
    const safe = key.replace(/\.\./g, '').replace(/^\/+/, '')
    return `${this.root}/${safe}`
  }

  async save(key: string, data: Uint8Array): Promise<void> {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const { dirname } = await import('node:path')
    await mkdir(dirname(this.path(key)), { recursive: true })
    await writeFile(this.path(key), data)
  }

  async read(key: string): Promise<Uint8Array> {
    const { readFile } = await import('node:fs/promises')
    return new Uint8Array(await readFile(this.path(key)))
  }

  async exists(key: string): Promise<boolean> {
    const { access } = await import('node:fs/promises')
    try {
      await access(this.path(key))
      return true
    } catch {
      return false
    }
  }

  async delete(key: string): Promise<void> {
    const { unlink } = await import('node:fs/promises')
    try {
      await unlink(this.path(key))
    } catch {
      /* yo'q — jim */
    }
  }
}

export const storageAdapter: StorageAdapter = new LocalStorageAdapter()
