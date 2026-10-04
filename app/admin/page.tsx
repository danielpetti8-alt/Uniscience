import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function AdminPage() {
  return (
    <PhasePlaceholder
      module="M9 — Admin panel"
      phase="P3 / P9"
      title="Admin panel"
      description="Foydalanuvchilar, jurnal ma'lumotnomasi, tekshiruv navbati, sozlamalar, kontent va audit-log — bir joyda."
      requirements={[
        "FR-50 — foydalanuvchilar: rol berish, bloklash, professor/tadqiqotchi hisoblarni TASDIQLASH (TS-03/04)",
        "FR-51 — jurnal ma'lumotnomasi CRUD + CSV/JSON import (436 jurnal)",
        "FR-52 — tekshiruv navbati: maqolalar + sertifikatlar; qaror, izoh, tarix",
        "FR-53 — koeffitsientlar va yillik chegara sozlamalari — o'zgarish TARIXI bilan",
        "FR-55 — audit-log: admin amallari (kim, nima, qachon)",
      ]}
    />
  )
}
