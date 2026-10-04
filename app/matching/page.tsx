import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function MatchingPage() {
  return (
    <PhasePlaceholder
      module="M8 — Professor–talaba matching"
      phase="P7"
      title="Ilmiy rahbarlik (matching)"
      description="Professorlarning bo'sh vaqtlarini ko'ring, uchrashuv uchun so'rov yuboring va javobni kuzatib boring."
      requirements={[
        "FR-43 — professor «Bo'sh vaqt» qo'shadi: sana, vaqt oralig'i, joylashuv (xona yoki onlayn)",
        "FR-44 — professorlar ro'yxati fakultet/kafedra filtri bilan, bo'sh vaqtlar ko'rinadi",
        "FR-45 — so'rov: qisqa matn ≤500 belgi, tanlangan vaqt oralig'iga biriktirilgan",
        "FR-46/47 — professor QABUL/RAD tugmalari; qabul qilingan uchrashuv «Rejalashtirilgan» statusida",
        "FR-49 — talabada faqat 3 ta faol so'rov (TS-18, TS-19)",
      ]}
    />
  )
}
