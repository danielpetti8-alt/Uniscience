# UniScience.uz — Bajarish rejasi (IMPLEMENTATION PLAN)

**Versiya:** 1.0 · **Sana:** 2026-10-04 · **Asos:** TZ v2.0 (Xaitboyev Yusuf Axmad o'g'li)
**Maqsad:** TZ'dagi 70 funksional talab (FR-01…70) va 22 qabul testi (TS-01…22) ni to'liq bajarish.

---

## 0. Qarorlar xulosasi (tasdiqlangan)

| Qaror | Qiymat |
|---|---|
| Hozirgi stack (MVP/sandbox) | Next.js 16.3.1 · React 19 · Prisma 5.22 · SQLite · Tailwind 4 |
| Yakuniy production stack (TZ) | Laravel 11 · MySQL 8 · Tailwind — **keyin migratsiya** |
| Arxitektura | Modul-mono: business logic `modules/` da (framework'dan mustaqil), API `/api/v1/` ostida, adapterlar interfeyslar orqali |
| Marshrutlar | TZ sitemap'iga (FR-70) to'liq o'tish; eski `/papers`, `/upload` o'rniga yangilari |
| Ish usuli | Fazama-faza (P0–P10); har faza oxirida: build yashil + testlar + commit |

> **PRINTSIP:** Har bir modul «Laravel'ga ko'chganda 1:1 mapping» qiladigan qilib yoziladi:
> `modules/x/service.ts` → `app/Services/XService.php`, `/api/v1/x` → `routes/api.php`, Prisma model → MySQL migration.

---

## 1. Arxitektura — 5 qoida (Laravel-moslik kafolati)

1. **Business logic faqat `modules/` da.** Route handler va page komponentlarlar — "yupqa qatlam" (thin controller): so'rov → service → javob. Hech qanday hisob-kitob, validatsiya yoki qaror Next.js fayllarida bo'lmaydi.
2. **REST API, Server Action YO'Q.** Barcha o'zgarishlar `POST/PATCH/DELETE /api/v1/...` orqali — Laravel `routes/api.php` ga to'g'ridan-to'g'ri ko'chinadi.
3. **Prisma sxema MySQL-portable:** enum ISHLATILMAYDI (SQLite qo'llab-quvvatlamaydi; Laravel'da `string`/varchar bo'ladi) — barcha status/rol/tur maydonlari `String` + ilova darajasidagi konstantalar. `@db.*` native tiplar yo'q. Provider o'zgarishi (`sqlite` → `mysql`) bitta qator.
4. **Tashqi integratsiyalar faqat adapterlar orqali:** `VerificationAdapter` (OAK tekshiruv), `AuthProvider` (local/HEMIS), `StorageAdapter` (disk/S3), `MailAdapter` (log/SMTP), `RatingConfigStore`. MVP'da mahalliy implementatsiyalar; 2-bosqichda HEMIS/OAK.uz adapterlari shu interfeyslarga ulanadi.
5. **Konfiguratsiya — `settings` jadvalida** (reyting koeffitsientlari, yillik chegara) — hardcode emas; Laravel'da `config()` + settings jadvali ekvivalenti.

---

## 2. Papka tuzilishi

```
uniscience/
├── app/                              # Next.js App Router — faqat routing + render
│   ├── layout.tsx                    # Navbar/Footer + dizayn tizimi (FR-64..66)
│   ├── page.tsx                      # Landing (TZ sitemap "/")
│   ├── royhat/ page.tsx              # Ro'yxatdan o'tish (FR-01..05)
│   ├── kirish/ page.tsx              # Kirish (FR-07)
│   ├── parolni-tiklash/ page.tsx     # Parol tiklash (FR-08)
│   ├── profil/ page.tsx              # Profil (FR-12..16)
│   ├── yuklash/ page.tsx             # Maqola yuklash (FR-17..21)
│   ├── maqola/[id]/ page.tsx         # Maqola kartasi + ball yoyilmasi (FR-24, 5.2)
│   ├── reyting/ page.tsx             # Reyting bo'limi (FR-30..33)
│   ├── yoriqnoma/ page.tsx           # Yo'riqnomalar + video (FR-35..38)
│   ├── yangiliklar/ page.tsx         # Yangiliklar (FR-39..42)
│   ├── matching/ page.tsx            # Professor–talaba (FR-43..49)
│   ├── admin/ ...                    # Admin panel (FR-50..56)
│   ├── moderator/ ...                # Fakultet navbati (FR-56)
│   ├── rahbariyat/ ...               # Dashboard + eksport (FR-57..62)
│   └── api/v1/ ...                   # REST API (yupqa qatlam)
├── modules/                          # ★ BUSINESS LOGIC (framework-agnostic)
│   ├── auth/          service.ts · validation.ts · session.ts · errors.ts
│   ├── users/         service.ts · validation.ts
│   ├── journals/      service.ts · csv-import.ts
│   ├── articles/      service.ts · validation.ts · verification/VerificationAdapter.ts
│   ├── rating/        RatingEngine.ts · recalculate.ts · protections.ts
│   ├── matching/      service.ts
│   ├── content/       guides.ts · videos.ts · news.ts
│   ├── notifications/ service.ts
│   └── admin/         audit.ts · settings.ts
├── lib/
│   ├── prisma.ts
│   ├── adapters/                    # Interfeyslar + MVP implementatsiyalar
│   │   ├── auth-provider.ts         # local | hemis (FR-09)
│   │   ├── verification.ts          # VerificationAdapter (FR-25)
│   │   ├── storage.ts               # StorageAdapter (PDF/rasm/mp4)
│   │   ├── mail.ts                  # MailAdapter (log | smtp)
│   │   └── rating-config.ts         # RatingConfigStore (settings jadvalidan)
│   ├── rbac.ts                      # Rol tekshiruvi (middleware)
│   └── constants.ts                 # Rollar, statuslar, turlar, 23 soha
├── prisma/schema.prisma             # MySQL-portable sxema
├── public/                          # logo.png, logo-icon.png (FR-65) — tayyor
├── storage/                         # Yuklangan fayllar (gitignore)
└── docs/
    ├── IMPLEMENTATION_PLAN.md       # ← shu hujjat
    ├── API.md                       # API yozuvlar (har fazada to'ldiriladi)
    └── LARAVEL_MIGRATION.md         # Migratsiya qo'llanmasi (P10)
```

---

## 3. Ma'lumotlar bazasi sxemasi (TZ 19-A asosida)

> SQLite'da yoziladi, MySQL'ga o'tishda faqat `provider` o'zgaradi. Enumlar yo'q — barcha `String`.

### 3.1 Foydalanuvchi va kirish (M1)

| Model | Asosiy maydonlar |
|---|---|
| **User** | id · username (F.I.Sh., unique) · email (unique) · passwordHash (bcrypt) · role (`student`/`researcher`/`professor`/`admin`/`moderator`/`management`) · category (`bachelor`/`master`, talabalar uchun) · faculty (moderator fakulteti) · status (`pending_email`/`pending_approval`/`active`/`blocked`) · **hemisId (String?, NULL)** · **authProvider (`local`/`hemis`)** · emailVerifiedAt · createdAt |
| **Profile** | userId (PK, 1:1) · universitet · fakultet · yo'nalish · kurs · guruh · gpa · tugilganSana · rasm (path) · daraja (ilmiy) · lavozim · kafedra · bakalavrOtm (FR-03) |
| **Session** | id · userId · tokenHash (unique) · userAgent · ip · expiresAt · lastUsedAt · createdAt — **DB sessiya (Laravel uslubi)**: «eslab qolish» 30 kun, faol 3 ta (eski tushadi) (FR-10) |
| **EmailToken** | userId · token · type (`verify`/`reset`) · expiresAt · usedAt (FR-06, FR-08) |
| **LoginAttempt** | email · ip · attempts · blockedUntil (FR-11: 5 marta → 15 daqiqa) |

### 3.2 Kontent modellari

| Model | Asosiy maydonlar |
|---|---|
| **Journal** | **issn (PK, 0000-0000)** · journalName · field (23 soha) · tier (`A`–`E`, `X`) · listedFrom · listedTo (NULL — vaqt-qamrov, FR-27) · country · publisher · source (`local_oak`/`intl_oak`/`scopus`/`wos`) |
| **Article** | id · userId · title · abstractUz/Ru/En · keywordsUz/Ru/En · type (`scopus_q1q2`/`scopus_q3q4_esci`/`intl_oak`/`local_oak`/`local_conf`/`intl_conf`) · journalIssn (nullable — konferensiyada bo'sh) · conferenceName · publishedDate · pdfPath · status (`pending`/`manual_review`/`approved`/`rejected`) · reviewNote · createdAt |
| **ArticleAuthor** | id · articleId · userId (nullable) · fullName · position (`sole`/`first`/`middle`/`last`) · positionOrder · isSelf (FR-17) |
| **Certificate** | id · articleId · filePath · status (`pending`/`approved`/`rejected`) · verifiedById · note (FR-19, FR-23c) |
| **JournalRequest** | id · userId · journalName · issn? · url? · status (`pending`/`added`/`rejected`) · note (FR-18) |
| **ReviewHistory** | id · articleId · reviewerId · decision (`approved`/`rejected`/`manual`) · reason · createdAt (FR-23 — qaror tarixi) |

### 3.3 Reyting (M5)

| Model | Asosiy maydonlar |
|---|---|
| **RatingItem** | id · articleId · userId · wField · wTier · wAuthor · wDate · penalty · rawScore · finalScore · breakdown (JSON matn) · calculatedAt — **har maqolada ball qanday chiqqani ko'rinadi (5.2)** |
| **Rating** | id · userId · period (`YYYY-MM`) · totalScore · groupRank · facultyRank · universityRank · updatedAt (FR-30, FR-31) |
| **Setting** | key (PK) · value (JSON) · updatedAt — koeffitsientlar, yillik chegara, 23 soha guruhlari (FR-53) |
| **SettingHistory** | id · key · oldValue · newValue · changedById · createdAt (FR-53 — o'zgarish tarixi) |

### 3.4 Matching (M8)

| Model | Asosiy maydonlar |
|---|---|
| **TimeSlot** | id · professorId · date · startTime · endTime · location (xona yoki «onlayn») · status (`open`/`booked`/`cancelled`) · createdAt (FR-43) |
| **MentorRequest** | id · studentId · professorId · slotId · message (≤500) · status (`pending`/`accepted`/`rejected`/`cancelled`) · responseNote · createdAt · respondedAt (FR-45..47) |

### 3.5 Kontent va tizim (M6, M7, M9)

| Model | Asosiy maydonlar |
|---|---|
| **Guide** | id · title · description · filePath · category · sortOrder · createdAt (FR-35, FR-37) |
| **Video** | id · title · description · filePath · durationSec · category · sortOrder · views · createdAt (FR-36..38) |
| **News** | id · title · body · type (`competition`/`conference`/`scholarship`/`other`) · deadline? · link? · attachmentPath? · pinned · status (`active`/`archived`) · createdAt (FR-39..42) |
| **Notification** | id · userId · type · title · body · link? · readAt? · createdAt (FR-20, FR-48, FR-68) |
| **AuditLog** | id · adminId · action · entity · entityId · meta · createdAt (FR-55) |

### 3.6 Reyting konfiguratsiyasi (settings jadvali, MVP defaultlar)

```
W_daraja:   A=10 (Scopus Q1–Q2/WoS) · B=7 (Scopus Q3–Q4/ESCI) · C=5 (xalqaro OAK)
            D=3 (mahalliy OAK) · E=1 (konferensiya tezisi) · X=0 (+ogohlantirish)
W_muallif:  sole=1.0 · first=0.8 · last(rahbar)=0.6 · middle=0.4
W_sana:     ≤1 yil=1.0 · 2 yil=0.8 · 3 yil=0.6 · >3 yil=0.4
W_soha:     mos=1.0 · turdosh=0.7 · boshqa=0.5   (23 soha, guruhlar settings'da)
Himoyalar:  annual_limit=6 · monthly_auto_review=5 · single_journal_penalty=×0.8
```

**Ball = Σ (W_soha × W_daraja × W_muallif × W_sana) − P_xavf**
Misol (TS-13): D=3 × 0.8 × 1.0 × 1.0 = **2.4 ball** — yoyilmasi maqola kartasida ko'rsatiladi.

---

## 4. Modullar rejasi

### M1 — Kirish va ro'yxatdan o'tish (FR-01…11, TS-01…05, TS-21, TS-22)
- **Service:** `modules/auth/service.ts` — register (toifaga qara maydonlar), username = F.I.Sh. avtomatik + takror tekshiruvi (FR-05), parol hash **bcrypt** (FR-07), email tasdiqlash tokeni (FR-06), professor/tadqiqotchi → `pending_approval` (FR-04), DB sessiya 30 kun/3 qurilma (FR-10), brute-force 5→15 daqiq (FR-11), parol tiklash (FR-08)
- **HEMIS-ready:** `hemisId`, `authProvider` maydonlari hoziroq; `AuthProvider` interfeysi `local` implementatsiya bilan (FR-09, TS-22)
- **UI:** `/royhat` (toifa tanlash → shunga mos forma), `/kirish`, `/parolni-tiklash`, email tasdiqlash sahifasi
- **API:** `POST /api/v1/auth/register|login|logout|verify-email|forgot-password|reset-password` · `GET /api/v1/auth/me`
- **Tekshiruv:** TS-01, TS-02, TS-03, TS-04, TS-21, TS-22

### M2 — Profil (FR-12…16, TS-05)
- Avatar yuklash (jpg/png ≤5 MB, kvadrat crop) + rasm hajmi tekshiruvi (TS-05)
- Profil ko'rinishi: reyting balli va o'rin (guruh/fakultet/universitet), tasdiqlangan maqolalar portfeli, bildirishnoma lentasi (bell)
- Tahrirlash: parol/rasm/aloqa — o'zi; ism-familiya/universitet — faqat admin (FR-13)
- Talabada «Ilmiy rahbarlik» bloki (FR-14), professorda «Bo'sh vaqt» + «Kelgan so'rovlar» (FR-15), professor profili ochiq (FR-16)

### M4 — OAK jurnallar ma'lumotnomasi (FR-26…29, TS-09, TS-10)
- `modules/journals/` — CRUD, **CSV/JSON import** (436 jurnal, 23 soha — P3'da yuklanadi), ISSN format tekshiruvi
- **Vaqt-qamrov qoidasi:** ro'yxat yangilanganda eski yozuv o'chirilmaydi — `listed_to` qo'yiladi (FR-27)
- X (xavfli) jurnal belgisi + ogohlantirish matni (FR-28)
- User tomonda faqat qidiruv/autocomplete (FR-29) · «Jurnal ro'yxatda yo'q» arizasi (FR-18)

### M3 — Maqola yuklash va tekshiruv (FR-17…25, TS-06…12)
- Yuklash formasi: 3 tilli annotatsiya + kalit so'zlar (majburiy — TS-07), nashr turi, sana, hammualliflar + pozitsiya, PDF ≤20 MB (FR-17)
- Jurnal autocomplete nom/ISSN bo'yicha (TS-09); topilmasa → `JournalRequest` (TS-10)
- Konferensiya → sertifikat PDF majburiy (TS-08), alohida tekshiruv (FR-19)
- Dubl tekshiruvi: sarlavha+muallif yoki DOI/URL (FR-21)
- Statuslar va bildirishnomalar (FR-20, FR-22); rad sababi to'liq ko'rinadi
- **VerificationAdapter** (`modules/articles/verification/`): (a) jurnal ro'yxatda va nashr sanasida ekanligi — vaqt-qamrov (TS-11, TS-12), (b) PDF sarlavhasi mosligi, (c) sertifikat, (d) mualliflik pozitsiyasi. Qaror + izoh + tarix (FR-23)
- MVP'da ro'yxatni admin yuklaydi; adapter 2-bosqichda OAK.uz/tadqiq.uz API'ga ulanadi (FR-25)

### M5 — Reyting (FR-30…34, TS-13…15)
- `modules/rating/RatingEngine.ts` — formula (3.6); har maqolada `RatingItem` (yoyilma ko'rinadi — TS-13)
- Himoyalar: yillik chegara 6 (7-maqola hisobga olinmaydi + izoh — TS-14); oyiga 5+ → avto `manual_review`; bitta jurnal ×0.8
- Qayta hisoblash: har oy 1-sanasida (cron) + tasdiqlash/rad voqeasida darhol (FR-32)
- Professor reytingi: o'z maqolalari + rahbar (0.6) ballari (FR-33)
- Jadvalar: bakalavr/magistr/tadqiqotchi/professor alohida; top-50 ochiq, qolgani o'z atrofini ko'radi (FR-31, TS-15)
- Eksport CSV (PDF — print-CSS orqali) (FR-34)

### M6/M7 — Yo'riqnomalar, video, yangiliklar (FR-35…42, TS-16, TS-17)
- Yo'riqnomalar: PDF/DOCX yuklash + ko'rish/yuklab olish; faqat admin CRUD (FR-35, FR-37)
- Video: mp4, sayt ichida player (Range-support route), yuklab olish, ko'rilganlik hisobi, «Yangi» belgisi 7 kun (FR-36, FR-38)
- Yangiliklar: 4 tur, filtr+qidiruv, «yopishtirish», muddati o'tsa avtomatik arxiv (FR-39…42, TS-17)

### M8 — Professor–talaba matching (FR-43…49, TS-18, TS-19)
- Professor bo'sh vaqt qo'shadi/tahrirlaydi/o'chiradi (FR-43)
- Talaba «Ilmiy rahbarlik» bo'limi: professorlar (fakultet/kafedra filtr), bo'sh vaqtlar ko'rinadi (FR-44)
- So'rov yuborish ≤500 belgi, slotga biriktirilgan (FR-45); talabada faqat 3 faol so'rov (FR-49)
- Professor: qabul/rad + ixtiyoriy izoh (FR-46); talaba javobni ko'radi, «Rejalashtirilgan» status (FR-47)
- Bildirishnomalar ikkala tomonga (FR-48)

### M9 — Admin panel (FR-50…56)
- Foydalanuvchilar: rol, bloklash, **professor/tadqiqotchi tasdiqlash** (TS-03/04 uchun P1'da minimal, to'liq P9)
- Jurnal CRUD + CSV import (FR-51), tekshiruv navbati + sertifikatlar (FR-52)
- Koeffitsientlar/chegara sozlamalari — **tarix bilan** (FR-53)
- Kontent CRUD (FR-54), audit-log (FR-55), moderator fakultet navbati (FR-56)

### M10 — Rahbariyat paneli (FR-57…63, TS-20)
- Alohida panel, oylik/yillik infografikalar: fakultetlar bo'yicha bar-chart, dinamika line-chart (FR-58)
- Top-ro'yxatlar (FR-59), jurnal darajasi donut (A–E, X) (FR-60), CSV/PDF eksport (FR-61), davr+fakultet filtri (FR-62)
- Vazirlik paneli — tugma joyi band (funksional 2-bosqich) (FR-63)
- Grafiklar — qo'shimcha kutubxonasiz, o'zimiz yozgan SVG komponentlar (yengil, <2 s — FR-69)

---

## 5. Adapterlar (2-bosqich «teshib qo'yish» nuqtalari)

| Adapter | MVP implementatsiyasi | 2-bosqich |
|---|---|---|
| `AuthProvider` | `local` — email+parol | `hemis` — HEMIS SSO (shu interfeysga ulanish) |
| `VerificationAdapter` | Mahalliy OAK ro'yxati (DB) + qo'lda tekshiruv | OAK.uz/tadqiq.uz jonli sync |
| `RatingConfigStore` | `settings` jadvalidan o'qiydi | Xuddi + admin UI tarixi |
| `StorageAdapter` | Mahalliy disk (`storage/`) | S3 |
| `MailAdapter` | `log` — email faylga yoziladi + dev mailbox sahifasi | SMTP (Laravel Mail) |

---

## 6. Dizayn tizimi (FR-64…69)

- **Palitra (TZ):** navy `#122B46` · oltin `#E8B33C` · cyan aksent `#38B6E3` · fon `#ECEFF4`
- **Shrift:** Manrope (hozirgi loyihada bor — saqlanadi)
- **Logo:** `public/logo.png` (kitob+atom, navy+oltin — FR-65) — tayyor
- **Komponentlar:** Button, Input, Select, Checkbox, Card, Badge (status), Table, Modal, Toast, Skeleton (FR-69), FileDropzone, JournalAutocomplete, Avatar, Navbar/Footer, SVG Chart (bar/line/donut)
- **Responsive:** mobil birinchi (FR-66 — so'rovnoma: 42% telefon)
- **Til:** o'zbek lotin asosiy; rus/ingliz kalit so'zlar uchun joy (FR-67)

---

## 7. Xavfsizlik va maxfiylik

- Parol: bcrypt (argon2id keyingi bosqich) · DB sessiya (httpOnly, SameSite=Lax, token hash)
- RBAC middleware (`lib/rbac.ts`) — har API va sahifada rol tekshiruvi
- Fayl tekshiruvi: hajm (PDF ≤20 MB, rasm ≤5 MB, mp4) + **magic-byte** tekshiruvi (faqat PDF/jpeg/png/mp4)
- Rate-limit: kirish 5/15 daqiq (FR-11), API umumiy limit
- CSRF: SameSite cookie + forma tokenlari; XSS: React escaping + tozalash
- O'RQ-547: rozilik belgisi (ro'yxat formasida), faqat zarur maydonlar, o'chirish so'rovi
- Audit-log: barcha admin amallari (FR-55)

---

## 8. Fazalar rejasi va test qamrovi

| Faza | Mazmun | F.R. | Test | Natija (demo) |
|---|---|---|---|---|
| **P0** | Po'devor: 3 kritik xato tuzatiladi (fayl almashuvi, searchParams, prisma.config.ts) · dizayn tizimi · layout/navbar TZ sitemap'iga · DB sxema (24 model) | 64–70 | build yashil | Yangi layout + sxema |
| **P1** | M1 kirish/ro'yxat/rollar · minimal admin tasdiqlash · dev mailbox | 01–11 | TS-01…05, TS-21, TS-22 | Ro'yxatdan o'tish ishlaydi |
| **P2** | M2 profil · avatar · bildirishnomalar · portfel ko'rinishi | 12–16 | TS-05 | Profil to'liq |
| **P3** | M4 jurnallar · CSV import (436) · admin user boshqaruvi · moderator navbat | 26–29, 50, 56 | TS-09, TS-10 | 436 jurnal yuklangan |
| **P4** | M3 yuklash + tekshiruv navbati + sertifikat + tarix | 17–25 | TS-06…12 | Maqola qabul qilish ishlaydi |
| **P5** | M5 reyting · RatingEngine · himoyalar · jadvalar · eksport | 30–34 | TS-13…15 | Reyting to'g'ri hisoblanadi |
| **P6** | M6 yo'riqnoma/video + M7 yangiliklar | 35–42 | TS-16, TS-17 | Kontent bo'limlari |
| **P7** | M8 matching (vaqt, so'rov, qabul) | 43–49 | TS-18, TS-19 | Rahbarlik aloqasi |
| **P8** | M10 rahbariyat dashboard + grafiklar + eksport | 57–63 | TS-20 | Rahbariyat paneli |
| **P9** | M9 admin panel yakuniyligi: audit-log, sozlamalar tarixi | 51–55 | — | Admin to'liq |
| **P10** | Xavfsizlik proyoni, responsive polish, email, README/API/admin qo'llanma, **TS-01…22 to'liq progon** | 67–70 | TS to'liq | **MVP tayyor (pilot)** |

Har faza oxirida: `npm run build` yashil + mos testlar + alohida commit.

---

## 9. Laravel migratsiya strategiyasi (qisqacha)

| Hozir (Next.js) | Laravel'da |
|---|---|
| `modules/*/service.ts` | `app/Services/*.php` (biznes-logika o'zgarmaydi — shu uchun mustaqil yozilgan) |
| `/api/v1/*` route handlerlar | `routes/api.php` + Controller'lar (1:1) |
| Prisma schema (enum'siz, portable) | `database/migrations/*` (MySQL 8) |
| `lib/adapters/*` interfeyslar | `app/Contracts/*` + `app/Services/Adapters/*` |
| DB sessiya | Laravel session (database driver) |
| `settings` jadval | `config()` + settings jadvali |
| bcrypt | `Hash::make` (bcrypt — bir xil) |

Batafsil ko'rsatma P10'da `docs/LARAVEL_MIGRATION.md` sifatida yoziladi.

---

## 10. Riskalar va oldini olish

| Risk | Yechim |
|---|---|
| SQLite → MySQL farqlari | Enum va native tiplarsiz sxema; P10'da `prisma migrate` bilan MySQL'da sinov |
| Fayl hajmlari (mp4) | StorageAdapter + hajm limitlari; sandbox'da kichik namuna fayllar |
| Email yetkazib berish (sandbox'da SMTP yo'q) | MailAdapter `log` rejimi + dev mailbox sahifasi |
| Grafiklar kutubxonasisiz | O'zimiz yozgan SVG komponentlar (bar/line/donut) |
| Katta hajm (10 hafta) | Fazama-faza; har fazada ishlaydigan demo |

---

## 11. Keyingi qadam

Rejani tasdiqlasangiz — **P0**'dan boshlayman:
1. 3 kritik xatoni tuzatish (fayl almashuvi, `searchParams`, `prisma.config.ts`)
2. Dizayn tizimi + TZ palitra + navbar/footer (sitemap bo'yicha)
3. To'liq DB sxemasini (24 model) `prisma/schema.prisma` ga yozish + migratsiya

P0 tugagach build yashil bo'ladi va yangi layout bilan landing sahifasini ko'rsataman.
