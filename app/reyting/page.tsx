import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function ReytingPage() {
  return (
    <PhasePlaceholder
      module="M5 — Reyting bo'limi"
      phase="P5"
      title="Reyting"
      description="Bakalavrlar, magistrlar, tadqiqotchilar va professorlar bo'yicha alohida reyting; guruh, fakultet va universitet kesimida."
      requirements={[
        "FR-30 — «Mening reytingim»: ball, o'rinlar, har maqola bo'yicha yoyilma",
        "FR-31 — toifalar bo'yicha jadvallar; top-50 ochiq, qolgani o'z atrofini ko'radi (TS-15)",
        "FR-32 — har oy 1-sanasida + tasdiqlash/rad voqeasida darhol qayta hisoblash",
        "FR-33 — professor reytingi: o'z maqolalari + rahbar (0.6) ballari",
        "FR-34 — eksport: CSV / PDF",
        "TS-13 — D=3 × 0.8 × 1.0 × 1.0 = 2.4 ball, yoyilma ko'rinadi",
      ]}
    />
  )
}
