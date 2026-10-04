// =============================================================================
// P2 test skripti — M2 (profil: avatar, tahrirlash, bildirishnomalar, ochiq
// professor profili) qabul testlari. TS-05 va FR-13/14/15/16 yopiladi.
// Ishlatish: dev server ishlab turgan holda  ->  npx tsx scripts/test-p2.ts
// P1 (51) + P2 (15) = 66 test.
// =============================================================================
import { PrismaClient } from '@prisma/client'

const BASE = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000'
const prisma = new PrismaClient()

let passed = 0
let failed = 0
const failures: string[] = []

function check(name: string, cond: boolean, extra = '') {
  if (cond) {
    passed++
    console.log(`  ✅ ${name}`)
  } else {
    failed++
    failures.push(name)
    console.log(`  ❌ ${name} ${extra}`)
  }
}

class Client {
  cookie = ''
  async call(method: string, path: string, body?: unknown) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(this.cookie ? { cookie: this.cookie } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'manual',
    })
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) this.cookie = setCookie.split(';')[0]
    let json: any = null
    const text = await res.text()
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text.slice(0, 120) }
    }
    return { status: res.status, location: res.headers.get('location'), json }
  }

  /** multipart fayl yuklash (avatar) */
  async upload(path: string, file: { name: string; type: string; bytes: Uint8Array }) {
    const form = new FormData()
    form.append('file', new Blob([new Uint8Array(file.bytes)], { type: file.type }), file.name)
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: this.cookie ? { cookie: this.cookie } : {},
      body: form,
      redirect: 'manual',
    })
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) this.cookie = setCookie.split(';')[0]
    let json: any = null
    const text = await res.text()
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text.slice(0, 120) }
    }
    return { status: res.status, json }
  }
}

const stamp = Date.now().toString().slice(-6)
const email = (tag: string) => `p2.${tag}.${stamp}@example.com`

/** Haqiqiy 1x1 kvadrat PNG (magic-byte tekshiruvidan o'tadi) */
const PNG_1X1 = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
  (c) => c.charCodeAt(0),
)
/** Haqiqiy kichik JPEG (magic-byte: FF D8 FF) */
const JPEG_TINY = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])

/** EmailLog'dan oxirgi verify tokenni oladi (P1'dagi kabi) */
async function lastToken(to: string): Promise<string | null> {
  const log = await prisma.emailLog.findFirst({
    where: { to },
    orderBy: { createdAt: 'desc' },
  })
  if (!log?.tokenLink) return null
  const m = log.tokenLink.match(/token=([^&]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

const studentInput = (tag: string) => ({
  category: 'bachelor',
  familiya: 'Sinalov',
  ism: `P2${tag}`,
  otasiningIsmi: 'Testovich',
  email: email(tag),
  password: 'Parol123',
  consent: true,
  universitet: 'TDIU',
  fakultet: 'Iqtisodiyot',
  yonalish: 'Iqtisodiyot',
  kurs: 2,
  guruh: 'IQ-52',
  gpa: 85,
  tugilganSana: '2004-03-21',
})

const professorInput = (tag: string) => ({
  category: 'professor',
  familiya: 'Rahbarov',
  ism: `Prof${tag}`,
  otasiningIsmi: 'Rahbarovich',
  email: email(tag),
  password: 'Parol123',
  consent: true,
  universitet: 'TDIU',
  daraja: 'f.m.d.',
  lavozim: 'Dotsent',
  kafedra: 'Menejment',
})

async function registerAndVerify(client: Client, input: Record<string, unknown>) {
  const reg = await client.call('POST', '/api/v1/auth/register', input)
  if (reg.status !== 201) throw new Error(`register xato: ${reg.status} ${JSON.stringify(reg.json).slice(0, 200)}`)
  const token = await lastToken(input.email as string)
  if (!token) throw new Error('verify token topilmadi')
  // Emaildagi havola — GET so'rovi (P1'dagi kabi)
  await fetch(`${BASE}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, { redirect: 'manual' })
  return reg.json.data as { id: string; username: string; email: string; role: string }
}

/** Login (sessiya cookie'sini Client'ga yozadi) */
async function loginClient(client: Client, identifier: string, password: string) {
  const res = await client.call('POST', '/api/v1/auth/login', { identifier, password })
  if (res.status !== 200) {
    throw new Error(`login xato: ${res.status} ${JSON.stringify(res.json).slice(0, 200)}`)
  }
}

// -----------------------------------------------------------------------------

async function main() {
  console.log('\n=== P2 TESTLAR — M2 Profil (avatar, tahrirlash, bildirishnomalar, ochiq profil) ===\n')

  // --- Tayyorlov: talaba (faol), professor (admin tasdiqlaydi), admin sessiyasi ---
  const s = new Client()
  const student = await registerAndVerify(s, studentInput('talaba'))
  await loginClient(s, student.email, 'Parol123') // talaba email tasdiqlangach faol

  const p = new Client()
  const professor = await registerAndVerify(p, professorInput('sabak'))

  const admin = new Client()
  const adminLogin = await admin.call('POST', '/api/v1/auth/login', {
    identifier: 'admin@uniscience.uz',
    password: 'Admin123',
  })
  if (adminLogin.status !== 200) throw new Error('admin login xato')
  const approve = await admin.call('POST', `/api/v1/admin/users/${professor.id}/approve`)
  if (approve.status !== 200) throw new Error(`approve xato: ${approve.status}`)
  await loginClient(p, professor.email, 'Parol123') // tasdiqlangach professor faol

  // =========================== AVATAR (TS-05, FR-12) ==========================
  console.log('TS-05 — Avatar yuklash (jpg/png ≤5 MB, kvadrat):')

  const up1 = await s.upload('/api/v1/profile/avatar', {
    name: 'avatar.png',
    type: 'image/png',
    bytes: PNG_1X1,
  })
  const profAfter = await s.call('GET', '/api/v1/profile')
  const avatarId: string | undefined = up1.json?.data?.avatar?.id
  check(
    'avatar yuklanadi va profilga bog\'lanadi',
    up1.status === 200 &&
      !!avatarId &&
      profAfter.json?.data?.avatar?.id === avatarId &&
      profAfter.json?.data?.avatar?.originalName === 'avatar.png',
    `status=${up1.status}`,
  )

  const fileRes = await fetch(`${BASE}/api/v1/files/${avatarId}`, {
    headers: { cookie: s.cookie },
  })
  check(
    'avatar fayli API orqali ko\'rinadi (image/png)',
    fileRes.status === 200 && (fileRes.headers.get('content-type') ?? '').includes('image/png'),
    `status=${fileRes.status}`,
  )

  const bigBytes = new Uint8Array(6 * 1024 * 1024)
  bigBytes.set(PNG_1X1.slice(0, 8), 0)
  const upBig = await s.upload('/api/v1/profile/avatar', { name: 'big.png', type: 'image/png', bytes: bigBytes })
  check('6 MB rasm rad etiladi (TS-05)', upBig.status === 400, `status=${upBig.status}`)

  const upPdf = await s.upload('/api/v1/profile/avatar', {
    name: 'fake.png',
    type: 'image/png',
    bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]),
  })
  check("noto'g'ri turdagi fayl rad etiladi (PDF avatar sifatida)", upPdf.status === 400, `status=${upPdf.status}`)

  const upMagic = await s.upload('/api/v1/profile/avatar', {
    name: 'magic.png',
    type: 'image/png',
    bytes: new Uint8Array(1024),
  })
  check('magic-byte mos kelmasa rad etiladi', upMagic.status === 400, `status=${upMagic.status}`)

  const del = await s.call('DELETE', '/api/v1/profile/avatar')
  const profDel = await s.call('GET', '/api/v1/profile')
  check(
    "avatar o'chiriladi (profil avatarsiz qoladi)",
    del.status === 200 && profDel.json?.data?.avatar === null,
    `status=${del.status}`,
  )
  // Qayta yuklaymiz — keyingi testlar uchun profil to'liq holatda qolsin
  await s.upload('/api/v1/profile/avatar', { name: 'p.jpg', type: 'image/jpeg', bytes: JPEG_TINY })

  // ====================== TAHRIRLASH (FR-13) ==================================
  console.log('\nFR-13 — Profil tahrirlash qoidalari:')

  const patchPhone = await s.call('PATCH', '/api/v1/profile', { telefon: '+998 90 123 45 67' })
  check(
    "o'z aloqa raqamini o'zi tahrirlaydi",
    patchPhone.status === 200 && patchPhone.json?.data?.telefon === '+998901234567',
    `status=${patchPhone.status}`,
  )

  const patchProtected = await s.call('PATCH', '/api/v1/profile', {
    username: 'O\'zgargan Ism',
    universitet: 'Boshqa Universitet',
  })
  const dbStudent = await prisma.user.findUnique({
    where: { id: student.id },
    include: { profile: true },
  })
  check(
    "ism-familiya/universitet o'zgartirilmaydi — 400 (FR-13)",
    patchProtected.status === 400 && patchProtected.json?.error?.code === 'VALIDATION_ERROR',
    `status=${patchProtected.status}`,
  )

  check(
    "DB'da username va universitet o'zgarmagan (FR-13)",
    dbStudent?.username === student.username && dbStudent?.profile?.universitet === 'TDIU',
    `username=${dbStudent?.username}`,
  )

  const wrongCurrent = await s.call('POST', '/api/v1/profile/password', {
    currentPassword: 'Noto`g`ri1',
    newPassword: 'YangiParol456',
  })
  check(
    "parol o'zgartirishda hozirgi parol tekshiriladi (xato bo'lsa 400/401)",
    wrongCurrent.status === 400 || wrongCurrent.status === 401,
    `status=${wrongCurrent.status}`,
  )

  const changePw = await s.call('POST', '/api/v1/profile/password', {
    currentPassword: 'Parol123',
    newPassword: 'YangiParol456',
  })
  const oldLogin = await new Client().call('POST', '/api/v1/auth/login', {
    identifier: student.email,
    password: 'Parol123',
  })
  const newLogin = await new Client().call('POST', '/api/v1/auth/login', {
    identifier: student.email,
    password: 'YangiParol456',
  })
  check(
    "parol o'zgaradi: yangi parol kirishda ishlaydi, eskisi rad (FR-13)",
    changePw.status === 200 && oldLogin.status === 401 && newLogin.status === 200,
    `change=${changePw.status} old=${oldLogin.status} new=${newLogin.status}`,
  )

  // ==================== BILDIRISHNOMALAR (FR-68) ==============================
  console.log('\nFR-68 — Bildirishnoma lentasi:')

  const list = await s.call('GET', '/api/v1/notifications')
  const items = list.json?.data?.items ?? []
  check(
    "hisob faollashganda bildirishnoma kelgan (lentada ko'rinadi)",
    list.status === 200 && items.length >= 1 && !!items[0]?.title,
    `status=${list.status} items=${items.length}`,
  )

  const unreadBefore = list.json?.data?.unreadCount ?? -1
  const readAll = await s.call('POST', '/api/v1/notifications/read', { all: true })
  const listAfter = await s.call('GET', '/api/v1/notifications')
  check(
    "o'qilmaganlar soni ko'rinadi va «barchasini o'qilgan qilish» ishlaydi",
    unreadBefore >= 1 && readAll.json?.data?.marked >= 1 && listAfter.json?.data?.unreadCount === 0,
    `unread=${unreadBefore} marked=${readAll.json?.data?.marked}`,
  )

  // ==================== OCHIQ PROFIL (FR-16) ==================================
  console.log('\nFR-16 — Ochiq professor profili:')

  const openProf = await s.call('GET', `/api/v1/professors/${professor.id}`)
  const privateLeak =
    openProf.json?.data?.email != null || openProf.json?.data?.profile?.telefon != null
  check(
    "talaba professorning ochiq profilini ko'radi (kafedra/daraja, maxfiy maydolarsiz)",
    openProf.status === 200 &&
      openProf.json?.data?.profile?.kafedra === 'Menejment' &&
      openProf.json?.data?.profile?.daraja === 'f.m.d.' &&
      !privateLeak,
    `status=${openProf.status}`,
  )

  const openStudent = await s.call('GET', `/api/v1/professors/${student.id}`)
  check(
    'faqat professor profili ochiq — talabaniki topilmadi (404)',
    openStudent.status === 404,
    `status=${openStudent.status}`,
  )

  // ==================== ROL BLOKLARI SAHIFADA (FR-14, FR-15) ==================
  console.log('\nFR-14/FR-15 — Profil sahifasidagi rol bloklari:')

  const studentPage = await fetch(`${BASE}/profil`, { headers: { cookie: s.cookie }, redirect: 'manual' })
  const studentHtml = await studentPage.text()
  const profPage = await fetch(`${BASE}/profil`, { headers: { cookie: p.cookie }, redirect: 'manual' })
  const profHtml = await profPage.text()
  check(
    "talabada «Ilmiy rahbarlik», professorda «Bo'sh vaqt» + «Kelgan so'rovlar» bloklari ko'rinadi",
    studentPage.status === 200 &&
      studentHtml.includes('Ilmiy rahbarlik') &&
      profPage.status === 200 &&
      profHtml.includes("Bo'sh vaqt") &&
      profHtml.includes("Kelgan so'rovlar"),
    `student=${studentPage.status} prof=${profPage.status}`,
  )

  // --- Tozalash ----------------------------------------------------------------
  console.log('\nTozalash...')
  const testEmails = [student.email, professor.email]
  const users = await prisma.user.findMany({
    where: { email: { in: testEmails } },
    select: { id: true },
  })
  const userIds = users.map((u) => u.id)
  await prisma.profile.deleteMany({ where: { userId: { in: userIds } } })
  const files = await prisma.file.findMany({ where: { uploadedById: { in: userIds } } })
  await prisma.file.deleteMany({ where: { id: { in: files.map((f) => f.id) } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.auditLog.deleteMany({
    where: { entity: 'user', entityId: { in: userIds } },
  })
  console.log(`  ${userIds.length} ta test hisobi o'chirildi`)

  // --- Natija -------------------------------------------------------------------
  console.log(`\n${'='.repeat(56)}`)
  console.log(`NATIJA: ${passed} o'tdi, ${failed} yiqildi (P2)`)
  if (failures.length) {
    console.log('YIQILGANLAR:')
    failures.forEach((f) => console.log(`  - ${f}`))
  }
  console.log('='.repeat(56))
  process.exit(failed > 0 ? 1 : 0)
}

main()
  .catch((e) => {
    console.error('TEST XATOSI:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
