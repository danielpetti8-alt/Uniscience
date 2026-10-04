import { prisma } from '@/lib/prisma'

export async function GET() {
  const faculties = await prisma.paper.groupBy({
    by: ['faculty'],
    _count: { faculty: true }
  })
  return Response.json(faculties.map(f => ({ faculty: f.faculty, cnt: f._count.faculty })))
}