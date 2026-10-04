// =============================================================================
// P1 test skripti — M1 (kirish/ro'yxat) qabul testlari.
// Ishlatish: dev server ishlab turgan holda  ->  npx tsx scripts/test-p1.ts
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
}

const stamp = Date.now().toString().slice(-6)
const email = (tag: string) => `test.${tag}.${stamp}@example.com`

const studentInput = (tag: string, fio: { f: string; i: string; o: string }) => ({
  category: 'bachelor',
  familiya: fio.f,
  ism: fio.i,
  otasiningIsmi: fio.o,
  email: email(tag),
  password: 'Parol123',
  consent: true,
  universitet: 'TDIU',
  fakultet: 'Iqtisodiyot',
  yonalish: 'Iqtisodiyot',
  kurs: 3,
  guruh: 'IQ-62',
  gpa: 88,
  tugilganSana: '2003-05-14',
})

const professorInput = (tag: string) => ({
  category: 'professor',
  familiya: 'Testov',
  ism: `Prof${tag}`,
  otasiningIsmi: 'Profvich',
  email: email(tag),
  password: 'Parol123',
  consent: true,
  universitet: 'TDIU',
  daraja: 'i.k.d.',
  lavozim: 'Professor',
  kafedra: 'Iqtisodiyot nazariyasi',
})

/** EmailLog'dan oxirgi tokenni oladi (dev mailbox manbai) */
async function lastToken(to: string): Promise<string | null> {
  const log = await prisma.emailLog.findFirst({
    where: { to },
    orderBy: { createdAt: 'desc' },
  })
  if (!log?.tokenLink) return null
  const m = log.tokenLink.match(/token=([^&]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

async function dbUser(emailAddr: string) {
  return prisma.user.findUnique({ where: { email: emailAddr } })
}

async function activeSessions(userId: string) {
  return prisma.session.count({ where: { userId, expiresAt: { gt: new Date() } } })
}

// -----------------------------------------------------------------------------

async function main() {
  console.log('\n=== P1 TESTLAR — M1 Kirish va ro\'yxatdan o\'tish ===\n')

  // --- TS-01 / TS-02: bakalavr ro'yxatdan o'tadi, username = F.I.Sh. -------
  console.log('TS-01/TS-02 — bakalavr ro\'yxatdan o\'tish:')
  const s1 = studentInput('student1', { f: 'Yusupov', i: 'Jasur', o: 'Akmalovich' })
  const reg1 = await new Client().call('POST', '/api/v1/auth/register', s1)
  check('ro\'yxatdan o\'tish 201', reg1.status === 201, `status=${reg1.status} ${JSON.stringify(reg1.json).slice(0, 150)}`)
  check(
    "username = to'liq F.I.Sh. (nikname yo'q)",
    reg1.json?.data?.username === 'Yusupov Jasur Akmalovich',
    `username=${reg1.json?.data?.username}`,
  )
  check('status pending_email', reg1.json?.data?.status === 'pending_email')

  // --- Duplicate email -------------------------------------------------------
  console.log('\nDuplicate email:')
  const dupEmail = await new Client().call('POST', '/api/v1/auth/register', {
    ...studentInput('student1', { f: 'Boshqa', i: 'Odam', o: 'Boshqaevich' }),
  })
  check('duplicate email 409 EMAIL_TAKEN', dupEmail.status === 409 && dupEmail.json?.error?.code === 'EMAIL_TAKEN', `status=${dupEmail.status}`)

  // --- Duplicate F.I.Sh. -----------------------------------------------------
  console.log('\nDuplicate F.I.Sh.:')
  const dupFio = await new Client().call('POST', '/api/v1/auth/register', {
    ...studentInput('student1b', { f: 'Yusupov', i: 'Jasur', o: 'Akmalovich' }),
  })
  check(
    'duplicate F.I.Sh. — raqamli qo\'shimcha bilan yagona username',
    dupFio.status === 201 && /^Yusupov Jasur Akmalovich \d+$/.test(dupFio.json?.data?.username ?? ''),
    `username=${dupFio.json?.data?.username}`,
  )

  // --- Validatsiya: rozilik va parol ----------------------------------------
  console.log('\nValidatsiya:')
  const noConsent = await new Client().call('POST', '/api/v1/auth/register', {
    ...studentInput('noconsent', { f: 'Test', i: 'Rozilik', o: 'Testovich' }),
    consent: false,
  })
  check('rozilik belgisisiz — 400 (O\'RQ-547)', noConsent.status === 400 && !!noConsent.json?.error?.fields?.consent)

  const weakPass = await new Client().call('POST', '/api/v1/auth/register', {
    ...studentInput('weakpass', { f: 'Test', i: 'Parol', o: 'Testovich' }),
    password: 'qisqa',
  })
  check('zaif parol — 400', weakPass.status === 400 && !!weakPass.json?.error?.fields?.password)

  const shortFio = await new Client().call('POST', '/api/v1/auth/register', {
    ...studentInput('shortfio', { f: '', i: 'Ism', o: 'Otasining' }),
  })
  check('F.I.Sh. to\'liq emas — 400', shortFio.status === 400 && !!shortFio.json?.error?.fields?.familiya)

  // --- Login oldin tasdiqlashdan ---------------------------------------------
  console.log('\nEmail tasdiqlanishidan oldin kirish:')
  const c1 = new Client()
  const loginEarly = await c1.call('POST', '/api/v1/auth/login', {
    identifier: s1.email,
    password: s1.password,
    remember: true,
  })
  check(
    'tasdiqlanmagan hisob 403 ACCOUNT_PENDING_EMAIL',
    loginEarly.status === 403 && loginEarly.json?.error?.code === 'ACCOUNT_PENDING_EMAIL',
    `status=${loginEarly.status}`,
  )

  // --- TS-06/FR-06: email tasdiqlash -----------------------------------------
  console.log('\nEmail tasdiqlash:')
  const token1 = await lastToken(s1.email)
  check('tasdiqlash tokeni emailda bor', !!token1)
  const verify = await fetch(`${BASE}/api/v1/auth/verify-email?token=${token1}`, { redirect: 'manual' })
  check('verify havolasi redirect qiladi', verify.status >= 300 && verify.status < 400, `status=${verify.status}`)
  const u1 = await dbUser(s1.email)
  check('status active ga o\'tdi', u1?.status === 'active', `status=${u1?.status}`)
  check('emailVerifiedAt to\'ldi', !!u1?.emailVerifiedAt)

  // --- Reused token ----------------------------------------------------------
  const verifyAgain = await fetch(`${BASE}/api/v1/auth/verify-email?token=${token1}`, { redirect: 'manual' })
  check('qayta ishlatilgan token ishlamaydi (redirect verified=0)', verifyAgain.headers.get('location')?.includes('verified=0') === true)

  // --- TS-01 yakuniylik: login ------------------------------------------------
  console.log('\nTS-01 yakuniylik — kirish:')
  const login1 = await c1.call('POST', '/api/v1/auth/login', {
    identifier: s1.email,
    password: s1.password,
    remember: true,
  })
  check('login 200', login1.status === 200, `status=${login1.status} ${JSON.stringify(login1.json).slice(0, 120)}`)
  check('cookie o\'rnatildi', !!c1.cookie)
  const me1 = await c1.call('GET', '/api/v1/auth/me')
  check('/me ishlaydi', me1.status === 200 && me1.json?.data?.username === 'Yusupov Jasur Akmalovich')
  check(
    'username (F.I.Sh.) bilan ham kirish ishlaydi',
    (await new Client().call('POST', '/api/v1/auth/login', { identifier: 'Yusupov Jasur Akmalovich', password: s1.password })).status === 200,
  )

  // --- Noto\'g\'ri parol -------------------------------------------------------
  console.log('\nNoto\'g\'ri parol:')
  const wrongPass = await new Client().call('POST', '/api/v1/auth/login', {
    identifier: s1.email,
    password: 'Notogri123',
  })
  check('noto\'g\'ri parol 401', wrongPass.status === 401 && wrongPass.json?.error?.code === 'INVALID_CREDENTIALS')

  // --- TS-21: brute-force -----------------------------------------------------
  console.log('\nTS-21 — brute-force himoyasi:')
  const bfInput = studentInput('bruteforce', { f: 'Blok', i: 'Blokovich', o: 'Blokaev' })
  await new Client().call('POST', '/api/v1/auth/register', bfInput)
  const bfToken = await lastToken(bfInput.email)
  await fetch(`${BASE}/api/v1/auth/verify-email?token=${bfToken}`, { redirect: 'manual' })

  const bfClient = new Client()
  let blocked = false
  for (let i = 1; i <= 5; i++) {
    const r = await bfClient.call('POST', '/api/v1/auth/login', { identifier: bfInput.email, password: 'Notogri123' })
    if (r.status === 429 && r.json?.error?.code === 'LOGIN_BLOCKED') blocked = true
  }
  check('5 marta noto\'g\'ri parol -> blok', blocked)

  const blockedLogin = await bfClient.call('POST', '/api/v1/auth/login', { identifier: bfInput.email, password: bfInput.password })
  check('blok davrida to\'g\'ri parol bilan ham kirish yo\'q (429)', blockedLogin.status === 429, `status=${blockedLogin.status}`)

  // Blok muddatini o'tkazib yuboramiz (vaqtni sun'iy surish)
  await prisma.loginAttempt.update({
    where: { email: bfInput.email },
    data: { blockedUntil: new Date(Date.now() - 1000), attempts: 0 },
  })
  const afterBlock = await bfClient.call('POST', '/api/v1/auth/login', { identifier: bfInput.email, password: bfInput.password })
  check('blokdan keyin kirish ishlaydi va urinishlar tozalanadi', afterBlock.status === 200)
  const attemptRow = await prisma.loginAttempt.findUnique({ where: { email: bfInput.email } })
  check('muvaffaqiyatli kirishda attempt holati tozalandi', attemptRow === null)

  // --- Sessiya: 3 qurilma + eviction -----------------------------------------
  console.log('\nSessiya boshqaruvi:')
  const devices = [new Client(), new Client(), new Client(), new Client()]
  for (const d of devices) {
    await d.call('POST', '/api/v1/auth/login', { identifier: s1.email, password: s1.password, remember: true })
  }
  const u1b = await dbUser(s1.email)
  const sessionCount = await activeSessions(u1b!.id)
  check('4-qurilma kirganda eng eski sessiya o\'chadi (3 ta faol)', sessionCount === 3, `sessions=${sessionCount}`)
  check('eng eski sessiya endi ishlamaydi', (await devices[0].call('GET', '/api/v1/auth/me')).status === 401)
  check('eng yangi sessiya ishlaydi', (await devices[3].call('GET', '/api/v1/auth/me')).status === 200)

  // --- Logout / session invalidation -----------------------------------------
  console.log('\nChiqish:')
  const logoutRes = await devices[3].call('POST', '/api/v1/auth/logout')
  check('logout 200', logoutRes.status === 200)
  check('logout\'dan keyin /me 401', (await devices[3].call('GET', '/api/v1/auth/me')).status === 401)

  // --- TS-03/TS-04: professor tasdig'i ---------------------------------------
  console.log('\nTS-03/TS-04 — professor hisobi:')
  const prof = professorInput('prof1')
  const regProf = await new Client().call('POST', '/api/v1/auth/register', prof)
  check('professor ro\'yxatdan o\'tdi', regProf.status === 201)
  const profToken = await lastToken(prof.email)
  await fetch(`${BASE}/api/v1/auth/verify-email?token=${profToken}`, { redirect: 'manual' })
  const profUser = await dbUser(prof.email)
  check('email tasdiqdan keyin pending_approval', profUser?.status === 'pending_approval', `status=${profUser?.status}`)

  const profLogin = await new Client().call('POST', '/api/v1/auth/login', { identifier: prof.email, password: prof.password })
  check(
    'tasdiqlanmagan professor kira olmaydi (403)',
    profLogin.status === 403 && profLogin.json?.error?.code === 'ACCOUNT_PENDING_APPROVAL',
    `status=${profLogin.status}`,
  )

  // Admin tasdig'i
  const adminClient = new Client()
  const adminLogin = await adminClient.call('POST', '/api/v1/auth/login', {
    identifier: 'admin@uniscience.uz',
    password: 'Admin123',
  })
  check('admin login 200', adminLogin.status === 200)
  const pendingList = await adminClient.call('GET', '/api/v1/admin/users/pending')
  const pendingIds: string[] = (pendingList.json?.data ?? []).map((u: any) => u.id)
  check('pending ro\'yxatda professor bor', pendingIds.includes(profUser!.id))

  const approve = await adminClient.call('POST', `/api/v1/admin/users/${profUser!.id}/approve`, {})
  check('admin tasdiqladi 200', approve.status === 200)
  const profLogin2 = await new Client().call('POST', '/api/v1/auth/login', { identifier: prof.email, password: prof.password })
  check('tasdiqdan keyin professor kira oladi', profLogin2.status === 200, `status=${profLogin2.status}`)

  // --- TS-22: HEMIS-ready maydonlar ------------------------------------------
  console.log('\nTS-22 — HEMIS-ready:')
  check('hemisId NULL', u1?.hemisId === null && profUser?.hemisId === null)
  check('authProvider = local', u1?.authProvider === 'local' && profUser?.authProvider === 'local')

  // --- Parol tiklash ----------------------------------------------------------
  console.log('\nParol tiklash (FR-08):')
  const resetInput = studentInput('reset', { f: 'Tiklash', i: 'Tiklovich', o: 'Tiklashov' })
  await new Client().call('POST', '/api/v1/auth/register', resetInput)
  const rToken = await lastToken(resetInput.email)
  await fetch(`${BASE}/api/v1/auth/verify-email?token=${rToken}`, { redirect: 'manual' })

  // Sessiya yaratamiz, keyin parolni tiklaymiz — sessiya bekor bo'lishi kerak
  const resetClient = new Client()
  await resetClient.call('POST', '/api/v1/auth/login', { identifier: resetInput.email, password: resetInput.password, remember: true })
  check('resetdan oldin sessiya ishlaydi', (await resetClient.call('GET', '/api/v1/auth/me')).status === 200)

  await new Client().call('POST', '/api/v1/auth/forgot-password', { email: resetInput.email })
  const resetToken = await lastToken(resetInput.email)
  check('reset tokeni emailda', !!resetToken && resetToken !== rToken)

  const doReset = await new Client().call('POST', '/api/v1/auth/reset-password', {
    token: resetToken,
    password: 'YangiParol1',
  })
  check('parol tiklandi', doReset.status === 200)
  check(
    'parol o\'zgarganda barcha sessiyalar bekor qilindi',
    (await resetClient.call('GET', '/api/v1/auth/me')).status === 401,
  )
  const loginNew = await new Client().call('POST', '/api/v1/auth/login', { identifier: resetInput.email, password: 'YangiParol1' })
  check('yangi parol bilan kirish ishlaydi', loginNew.status === 200)

  // Qayta ishlatilgan reset token
  const reuseReset = await new Client().call('POST', '/api/v1/auth/reset-password', { token: resetToken, password: 'YangiParol2' })
  check('qayta ishlatilgan reset token rad etiladi', reuseReset.status === 400 && reuseReset.json?.error?.code === 'TOKEN_USED')

  // Muddati o'tgan token (DB'ga sun'iy yozamiz)
  const expiredUser = await dbUser(resetInput.email)
  const expiredRaw = 'expired-token-abc123'
  const { createHash } = await import('node:crypto')
  await prisma.emailToken.create({
    data: {
      userId: expiredUser!.id,
      tokenHash: createHash('sha256').update(expiredRaw).digest('hex'),
      type: 'reset',
      expiresAt: new Date(Date.now() - 60_000),
    },
  })
  const expiredRes = await new Client().call('POST', '/api/v1/auth/reset-password', { token: expiredRaw, password: 'YangiParol3' })
  check('muddati o\'tgan token rad etiladi', expiredRes.status === 400 && expiredRes.json?.error?.code === 'TOKEN_EXPIRED')

  // --- TS-05 (validatsiya qismi): fayl limitlari ------------------------------
  console.log('\nTS-05 — fayl validatsiyasi (StorageAdapter):')
  const { validateFile } = await import('../lib/adapters/storage')
  const big = validateFile({ kind: 'avatar', sizeBytes: 6 * 1024 * 1024, mimeType: 'image/png', head: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) })
  check('6 MB rasm rad etiladi', !big.valid)
  const ok4 = validateFile({ kind: 'avatar', sizeBytes: 4 * 1024 * 1024, mimeType: 'image/png', head: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) })
  check('4 MB rasm qabul qilinadi', ok4.valid)
  const wrongMime = validateFile({ kind: 'avatar', sizeBytes: 1024, mimeType: 'application/pdf' })
  check('noto\'g\'ri tur rad etiladi', !wrongMime.valid)
  const fakeMagic = validateFile({ kind: 'avatar', sizeBytes: 1024, mimeType: 'image/png', head: new Uint8Array([0x00, 0x01, 0x02, 0x03]) })
  check('magic-byte mos kelmasa rad etiladi', !fakeMagic.valid)
  const bigPdf = validateFile({ kind: 'pdf', sizeBytes: 21 * 1024 * 1024, mimeType: 'application/pdf', head: new Uint8Array([0x25, 0x50, 0x44, 0x46]) })
  check('21 MB PDF rad etiladi (≤20 MB)', !bigPdf.valid)

  // --- Parol plaintext saqlanmasligi ------------------------------------------
  console.log('\nXavfsizlik:')
  const uCheck = await dbUser(s1.email)
  check('DB\'da parol plaintext emas (bcrypt hash)', !!uCheck?.passwordHash.startsWith('$2') && uCheck.passwordHash !== s1.password)

  // --- Tozalash ----------------------------------------------------------------
  console.log('\nTozalash...')
  const testEmails = [s1.email, dupFio.json?.data?.email, bfInput.email, prof.email, resetInput.email].filter(Boolean) as string[]
  await prisma.user.deleteMany({ where: { email: { in: testEmails } } })
  await prisma.loginAttempt.deleteMany({ where: { email: { in: testEmails } } })
  console.log(`  ${testEmails.length} ta test hisobi o'chirildi`)

  // --- Natija -------------------------------------------------------------------
  console.log(`\n${'='.repeat(56)}`)
  console.log(`NATIJA: ${passed} o'tdi, ${failed} yiqildi`)
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
