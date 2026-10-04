// =============================================================================
// UniScience.uz — boshlang'ich ma'lumotlar (seed)
//
// Ishlatish:  npx prisma db seed
//
// DIQQAT: jurnal ro'yxatidagi yozuvlar — DEMO. P3 fazasida haqiqiy OAK
// ro'yxati (436 jurnal, 23 soha) CSV orqali import qilinadi (FR-51).
// =============================================================================
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// --- Sozlamalar (FR-53): reyting koeffitsientlari va himoyalar ---------------
const SETTINGS: { key: string; value: unknown }[] = [
  {
    key: 'rating.w_tier',
    value: { A: 10, B: 7, C: 5, D: 3, E: 1, X: 0 }, // W_daraja (5.2)
  },
  {
    key: 'rating.w_author',
    value: { sole: 1.0, first: 0.8, last: 0.6, middle: 0.4 }, // W_muallif
  },
  {
    key: 'rating.w_date',
    value: { y1: 1.0, y2: 0.8, y3: 0.6, older: 0.4 }, // W_sana
  },
  {
    key: 'rating.w_field',
    value: { mos: 1.0, turdosh: 0.7, boshqa: 0.5 }, // W_soha
  },
  { key: 'rating.annual_limit', value: 6 }, // yillik chegara (TS-14)
  { key: 'rating.monthly_auto_review', value: 5 }, // oyiga 5+ -> qo'lda tekshiruv
  { key: 'rating.single_journal_penalty', value: 0.8 },
  {
    // 23 soha va «turdosh» guruhlari — W_soha aniqlash uchun (5.2)
    key: 'fields.groups',
    value: {
      iqtisot: ['iqtisodiyot', 'menejment', 'moliya', 'raqamli-iqtisodiyot'],
      gumanitar: ['filologiya', 'tarix', 'falsafa', 'madaniyatshunoslik', 'pedagogika'],
      huquq: ['yurispridensiya', 'psixologiya'],
      tabiiy: ['matematika', 'fizika', 'kimyo', 'biologiya'],
      yer: ['geografiya', 'geologiya', 'qishloq-xojaligi'],
      texnika: ['texnika', 'informatika', 'arxitektura'],
      salomatlik: ['tibbiyot', 'farmatsiya'],
    },
  },
  { key: 'system.name', value: 'UniScience.uz' },
]

// --- DEMO jurnallar (P3'da haqiqiy 436 jurnal import qilinadi) ---------------
const JOURNALS = [
  {
    issn: '2234-0001',
    journalName: 'Iqtisodiyot va innovatsion texnologiyalar',
    field: 'iqtisodiyot',
    tier: 'D',
    listedFrom: new Date('2015-01-01'),
    listedTo: null,
    country: "O'zbekiston",
    publisher: 'TDIU',
    source: 'local_oak',
  },
  {
    issn: '2181-1234',
    journalName: 'Moliya va bank ishi',
    field: 'moliya',
    tier: 'D',
    listedFrom: new Date('2016-01-01'),
    listedTo: null,
    country: "O'zbekiston",
    publisher: 'Moliya instituti',
    source: 'local_oak',
  },
  {
    issn: '2091-5678',
    journalName: 'International Journal of Economic Perspectives',
    field: 'iqtisodiyot',
    tier: 'C',
    listedFrom: new Date('2018-06-01'),
    listedTo: null,
    country: 'Xalqaro',
    publisher: 'IJEP',
    source: 'intl_oak',
  },
  {
    issn: '2587-9012',
    journalName: 'Central Asian Journal of Management',
    field: 'menejment',
    tier: 'B',
    listedFrom: new Date('2020-01-01'),
    listedTo: null,
    country: 'Xalqaro',
    publisher: 'Scopus indexed',
    source: 'scopus',
  },
  {
    issn: '2000-4321',
    journalName: "Soxta ilmiy jurnal (xavfli)",
    field: 'iqtisodiyot',
    tier: 'X',
    listedFrom: new Date('2010-01-01'),
    listedTo: new Date('2019-12-31'), // vaqt-qamrov namunasi
    country: 'Xalqaro',
    publisher: "Soxta nashriyot",
    source: 'intl_oak',
  },
]

// --- Demo foydalanuvchilar ---------------------------------------------------
const USERS = [
  {
    username: "Xaitboyev Yusuf Axmad o'g'li",
    email: 'admin@uniscience.uz',
    password: 'Admin123',
    role: 'admin',
    category: null,
    status: 'active',
    emailVerified: true,
    profile: {
      universitet: 'Toshkent davlat iqtisodiyot universiteti',
      fakultet: 'Iqtisodiyot',
      yonalish: 'Iqtisodiyot (bakalavr)',
    },
  },
  {
    username: 'Karimova Dilnoza Shavkatovna',
    email: 'professor@uniscience.uz',
    password: 'Professor123',
    role: 'professor',
    category: null,
    status: 'active',
    emailVerified: true,
    profile: {
      universitet: 'Toshkent davlat iqtisodiyot universiteti',
      fakultet: 'Iqtisodiyot',
      daraja: 'i.k.d.',
      lavozim: 'Professor',
      kafedra: 'Iqtisodiyot nazariyasi',
    },
  },
  {
    username: 'Karimov Sardor Ravshanovich',
    email: 'student@uniscience.uz',
    password: 'Student123',
    role: 'student',
    category: 'bachelor',
    status: 'active',
    emailVerified: true,
    profile: {
      universitet: 'Toshkent davlat iqtisodiyot universiteti',
      fakultet: 'Iqtisodiyot',
      yonalish: 'Iqtisodiyot',
      kurs: 3,
      guruh: 'IQ-62',
      gpa: 88.5,
    },
  },
]

async function main() {
  // Sozlamalar
  for (const s of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: JSON.stringify(s.value) },
      create: { key: s.key, value: JSON.stringify(s.value) },
    })
  }
  console.log(`✔ ${SETTINGS.length} ta sozlama yozildi`)

  // Jurnallar
  for (const j of JOURNALS) {
    await prisma.journal.upsert({
      where: { issn: j.issn },
      update: { ...j },
      create: { ...j },
    })
  }
  console.log(`✔ ${JOURNALS.length} ta demo jurnal yozildi (P3'da 436 haqiqiy jurnal)`)

  // Foydalanuvchilar
  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    const passwordHash = await bcrypt.hash(u.password, 10)
      const data = {
        username: u.username,
        email: u.email,
        passwordHash,
      role: u.role,
      category: u.category,
      status: u.status,
      emailVerifiedAt: u.emailVerified ? new Date() : null,
      profile: { create: u.profile },
    }
    if (existing) {
      await prisma.user.update({
        where: { email: u.email },
        data: {
          username: data.username,
          passwordHash: data.passwordHash,
          role: data.role,
          category: data.category,
          status: data.status,
          profile: { upsert: { create: u.profile, update: u.profile } },
        },
      })
    } else {
      await prisma.user.create({ data })
    }
  }
  console.log(`✔ ${USERS.length} ta demo foydalanuvchi yozildi`)
  console.log('')
  console.log('Demo hisoblar (parollar — faqat test uchun):')
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(10)} ${u.email.padEnd(26)} ${u.password}`)
  }
}

main()
  .catch((e) => {
    console.error('SEED XATOSI:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
