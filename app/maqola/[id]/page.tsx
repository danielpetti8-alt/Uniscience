import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default async function MaqolaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <PhasePlaceholder
      module="M3 — Maqola yuklash va tekshiruv"
      phase="P4"
      title={`Maqola #${id}`}
      description="Maqola kartasi: annotatsiya (3 til), mualliflar va pozitsiyalar, jurnal ma'lumotlari, tekshiruv tarixi va ball yoyilmasi."
      requirements={[
        "FR-22/24 — holat tarixi va tekshiruv qarorlari",
        "5.2 — har maqola kartasida ball qanday hisoblangani koefitsientlar bilan ko'rsatiladi",
        "FR-23 — tekshiruv qadamlari: vaqt-qamrov, PDF sarlavhasi, sertifikat, mualliflik pozitsiyasi",
      ]}
    />
  )
}
