import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const reservas = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reservas)
}

export async function POST(req: Request) {
  const { amenity, date, startTime, endTime, residentName } = await req.json()

  const reserva = await prisma.reservation.create({
    data: { amenity, date, startTime, endTime, residentName, status: 'CONFIRMED' }
  })

  return NextResponse.json(reserva)
}