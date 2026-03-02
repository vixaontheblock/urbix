import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const comunicados = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(comunicados)
}

export async function POST(req: Request) {
  const { title, content, category } = await req.json()

  let community = await prisma.community.findFirst()
  if (!community) {
    community = await prisma.community.create({
      data: { name: 'Mi Comunidad', address: 'Panamá', type: 'CONDO' }
    })
  }

  const comunicado = await prisma.announcement.create({
    data: { title, content, category, communityId: community.id }
  })

  return NextResponse.json(comunicado)
}