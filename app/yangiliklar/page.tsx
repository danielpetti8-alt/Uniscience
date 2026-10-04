import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function YangiliklarPage() {
  return (
    <PhasePlaceholder
      module="M7 — Yangiliklar va e'lonlar"
      phase="P6"
      title="Yangiliklar va e'lonlar"
      description="Maqola tanlovlari, konferensiyalar, stipendiya tanlovlari va boshqa e'lonlar; muddati o'tganlari avtomatik arxivga o'tadi."
      requirements={[
        "FR-39 — e'lon turlari: tanlov · konferensiya · stipendiya · boshqa",
        "FR-40 — sarlavha, matn, sana/muddat, havola, PDF ilova; muhim e'lonni «yopishtirish»",
        "FR-41 — lenta: yangi avval, tur bo'yicha filtr, qidiruv (TS-17)",
        "FR-42 — muddati o'tsa avtomatik arxiv",
      ]}
    />
  )
}
