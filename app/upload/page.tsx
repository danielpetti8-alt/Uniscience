import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    await prisma.paper.create({
      data: {
        studentName: String(formData.get('studentName') || 'Noma\'lum'),
        faculty: String(formData.get('faculty') || 'Iqtisodiyot'),
        groupName: String(formData.get('groupName') || 'IQ-62'),
        title: String(formData.get('title') || 'Sarlavha yo\'q'),
        journal: String(formData.get('journal') || ''),
        year: Number(formData.get('year') || 2025),
        isOAK: formData.get('isOAK') === 'on',
        keywords: String(formData.get('keywords') || ''),
        citations: 0
      }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('UPLOAD ERROR:', e)
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}