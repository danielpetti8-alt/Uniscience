import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function ModeratorPage() {
  return (
    <PhasePlaceholder
      module="M9 — Moderator (fakultet)"
      phase="P3"
      title="Moderator paneli"
      description="Fakultet mas'uli o'z fakulteti navbatidagi maqolalarni tekshiradi va qaror qabul qiladi."
      requirements={[
        "FR-56 — moderator roliga fakultet bo'yicha navbat ajratish",
        "FR-23 — tekshiruv tartibi: vaqt-qamrov, PDF mosligi, sertifikat, mualliflik pozitsiyasi",
        "FR-22 — qaror + izoh; tarix saqlanadi",
      ]}
    />
  )
}
