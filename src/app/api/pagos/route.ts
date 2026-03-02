import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const pagos = await prisma.payment.findMany({
    include: { unit: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(pagos)
}

export async function POST(req: Request) {
  const { amount, month } = await req.json()

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

  const pago = await prisma.payment.create({
    data: { amount: parseFloat(amount), month, unitId: unit.id, status: 'PENDING' }
  })

  return NextResponse.json(pago)
}

export async function PATCH(req: Request) {
  const { id } = await req.json()

  const pago = await prisma.payment.update({
    where: { id },
    data: { status: 'PAID' }
  })

  return NextResponse.json(pago)
}