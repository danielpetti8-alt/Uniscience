import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function RahbariyatPage() {
  return (
    <PhasePlaceholder
      module="M10 — Rahbariyat paneli"
      phase="P8"
      title="Rahbariyat paneli"
      description="Universitet rahbariyati uchun statistika-dashboard: fakultetlar bo'yicha maqolalar, dinamika, reytinglar va eksport."
      requirements={[
        "FR-58 — oylik/yillik infografikalar: bar-chart (fakultetlar), line-chart (dinamika)",
        "FR-59 — talabalar, magistrlar, professorlar top-ro'yxatlari",
        "FR-60 — jurnal darajasi taqsimoti (A–E, X — donut)",
        "FR-61 — eksport: CSV va PDF (bir klik) (TS-20)",
        "FR-62 — davr tanlash (oy/chorak/yil) va fakultet filtri",
        "FR-63 — vazirlik paneli: tugma joyi band (2-bosqich)",
      ]}
    />
  )
}
