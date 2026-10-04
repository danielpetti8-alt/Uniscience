import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function YuklashPage() {
  return (
    <PhasePlaceholder
      module="M3 — Maqola yuklash va tekshiruv"
      phase="P4"
      title="Yangi ilmiy ish yuklash"
      description="Maqola forma to'ldiriladi, moderator/admin tekshiruv navbatiga tushadi; natija bildirishnoma bilan keladi."
      requirements={[
        "FR-17 — 3 tilda annotatsiya va kalit so'zlar (majburiy), nashr turi, sana, hammualliflar, PDF ≤20 MB",
        "FR-18 — jurnal ro'yxatdan ISSN bo'yicha autocomplete; topilmasa «ro'yxatda yo'q» arizasi",
        "FR-19 — konferensiya tanlansa tasdiqlovchi sertifikat PDF majburiy (TS-08)",
        "FR-21 — dubl tekshiruvi (sarlavha+muallif yoki DOI/URL)",
        "FR-22 — statuslar: Ko'rib chiqilmoqda / Tasdiqlandi / Rad etildi (sababi bilan)",
      ]}
    />
  )
}
