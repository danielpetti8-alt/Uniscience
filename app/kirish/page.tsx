import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function KirishPage() {
  return (
    <PhasePlaceholder
      module="M1 — Kirish va ro'yxatdan o'tish"
      phase="P1"
      title="Kabinetga kirish"
      description="Username (F.I.Sh.) yoki email va parol bilan kirish. «Eslab qolish» 30 kun, bir vaqtda 3 qurilma."
      requirements={[
        "FR-07 — username (F.I.Sh.) yoki email + parol; parol bcrypt bilan hashlanadi",
        "FR-08 — parolni email orqali tiklash",
        "FR-10 — sessiya: 30 kun «eslab qolish», 3 qurilma, chiqish tugmasi",
        "FR-11 — 5 marta noto'g'ri parol → 15 daqiqa blokirovka (TS-21)",
      ]}
    />
  )
}
