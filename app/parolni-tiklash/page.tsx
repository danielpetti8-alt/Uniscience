import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function ParolniTiklashPage() {
  return (
    <PhasePlaceholder
      module="M1 — Kirish va ro'yxatdan o'tish"
      phase="P1"
      title="Parolni tiklash"
      description="Email orqali tiklash havolasi yuboriladi; havola bir marta ishlatiladi va muddati cheklangan."
      requirements={[
        "FR-08 — parolni email orqali tiklash",
        "Tokenlar faqat hash ko'rinishida saqlanadi (EmailToken modeli)",
      ]}
    />
  )
}
