import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function ProfilPage() {
  return (
    <PhasePlaceholder
      module="M2 — Foydalanuvchi profili"
      phase="P2"
      title="Profil"
      description="Shaxsiy kabinet: reyting balli va o'rin, tasdiqlangan maqolalar portfeli, bildirishnomalar lentasi."
      requirements={[
        "FR-12 — profil sahifasi: rasm, reyting va o'rin (guruh/fakultet/universitet), portfel, bildirishnomalar",
        "FR-13 — parol/rasm/aloqa o'zi tahrirlanadi; ism-familiya va universitet — faqat admin orqali",
        "FR-14 — talaba profilida «Ilmiy rahbarlik» bloki",
        "FR-15/16 — professorda «Bo'sh vaqt» va «Kelgan so'rovlar»; professor profili ochiq",
        "TS-05 — rasm ≤5 MB (6 MB rad etiladi)",
      ]}
    />
  )
}
