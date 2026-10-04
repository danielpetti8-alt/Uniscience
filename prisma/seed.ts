import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.paper.deleteMany()
  
  await prisma.paper.createMany({
    data: [
      { studentName: "Xaitboyev Yusuf Axmad o'g'li", faculty: "Iqtisodiyot", groupName: "IQ-62", title: "Raqamli iqtisodiyot sharoitida inflyatsiyani jilovlash omillari", journal: "Iqtisodiyot va innovatsion texnologiyalar", year: 2025, isOAK: true, citations: 23, keywords: "inflyatsiya, raqamli iqtisodiyot" },
      { studentName: "Xaitboyev Yusuf Axmad o'g'li", faculty: "Iqtisodiyot", groupName: "IQ-62", title: "Moliyaviy savodxonlik yoshlar tadbirkorligining asosi sifatida", journal: "Moliya va bank ishi", year: 2025, isOAK: true, citations: 12, keywords: "moliyaviy savodxonlik" },
      { studentName: "Karimova Dilnoza", faculty: "Iqtisodiyot", groupName: "IQ-62", title: "Kichik biznesda soliq yukini optimallashtirish", journal: "Iqtisod va moliya", year: 2025, isOAK: true, citations: 15, keywords: "soliq" },
      { studentName: "Axmedov Sardor", faculty: "Raqamli iqtisodiyot", groupName: "RA-21", title: "Sun'iy intellekt yordamida bozor narxlarini bashorat qilish", journal: "Raqamli iqtisodiyot", year: 2025, isOAK: true, citations: 19, keywords: "AI" },
      { studentName: "Qodirov Bekzod", faculty: "Iqtisodiyot", groupName: "BI-44", title: "Valyuta kursining eksportga ta'siri", journal: "Iqtisodiyot va innovatsion texnologiyalar", year: 2025, isOAK: true, citations: 31, keywords: "valyuta" },
    ]
  })
  console.log("Seed done!")
}

main()