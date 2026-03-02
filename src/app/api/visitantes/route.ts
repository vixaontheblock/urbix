import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function GET() {
  const visitantes = await prisma.visitor.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(visitantes)
}

export async function POST(req: Request) {
  const { name, docId, validFrom, validUntil } = await req.json()

  // Busca o crea una comunidad y unidad por defecto
  let community = await prisma.community.findFirst()
  if (!community) {
    community = await prisma.community.create({
      data: { name: 'Mi Comunidad', address: 'Panamá', type: 'CONDO' }
    })
  }

  let unit = await prisma.unit.findFirst({ where: { communityId: community.id } })
  if (!unit) {
    unit = await prisma.unit.create({
      data: { number: 'Unidad 1', communityId: community.id }
    })
  }

  const visitor = await prisma.visitor.create({
    data: {
      name,
      docId,
      unitId: unit.id,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      qrCode: nanoid(12),
      status: 'APPROVED',
    },
  })

  return NextResponse.json(visitor)
}