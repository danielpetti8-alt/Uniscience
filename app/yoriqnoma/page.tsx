import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function YoriqnomaPage() {
  return (
    <PhasePlaceholder
      module="M6 — Yo'riqnomalar va video darslar"
      phase="P6"
      title="Yo'riqnomalar va video darslar"
      description="Maqola yozish talablari, tartibi va tuzilishi bo'yicha hujjatlar; sayt ichida ko'riladigan video darslar."
      requirements={[
        "FR-35 — PDF/DOCX yo'riqnomalar: ko'rish va yuklab olish",
        "FR-36 — video darslar: mp4, player + yuklab olish; sarlavha, tavsif, davomiylik",
        "FR-37 — faqat admin yuklaydi/tahrirlaydi/o'chiradi; kategoriya va tartib",
        "FR-38 — «Yangi» belgisi (7 kun) va ko'rilganlik hisobi",
      ]}
    />
  )
}
