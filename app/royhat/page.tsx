import { PhasePlaceholder } from '@/components/ui/phase-placeholder'

export default function RoyhatPage() {
  return (
    <PhasePlaceholder
      module="M1 — Kirish va ro'yxatdan o'tish"
      phase="P1"
      title="Ro'yxatdan o'tish"
      description="Bakalavr va magistr talabalar o'zini-o'zi ro'yxatdan o'tkazadi; professor va tadqiqotchilar admin tasdig'idan o'tadi."
      requirements={[
        "FR-01 — toifa tanlash (bakalavr / magistr / tadqiqotchi / professor)",
        "FR-02..04 — toifaga mos maydonlar (GPA, kurs, guruh; ilmiy daraja, lavozim, kafedra)",
        "FR-05 — username = to'liq F.I.Sh. avtomatik shakllanadi (nikname yo'q)",
        "FR-06 — emailga tasdiqlash havolasi, tasdiqlanmagan hisob 72 soatda tozalanadi",
        "FR-09 — HEMIS-maydonlar (hemis_id, auth_provider) tayyor",
      ]}
    />
  )
}
