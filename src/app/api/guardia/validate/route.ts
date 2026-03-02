import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ success: false, message: 'Código inválido' })
  }

  const visitor = await prisma.visitor.findUnique({
    where: { qrCode: code }
  })

  if (!visitor) {
    return NextResponse.json({ success: false, message: 'Código no encontrado en el sistema' })
  }

  const now = new Date()
  const validUntil = new Date(visitor.validUntil)
  const validFrom = new Date(visitor.validFrom)

  if (now < validFrom) {
    return NextResponse.json({
      success: false,
      message: 'Este código aún no es válido',
      visitor: { name: visitor.name, docId: visitor.docId, status: visitor.status, validUntil: visitor.validUntil }
    })
  }

  if (now > validUntil) {
    return NextResponse.json({
      success: false,
      message: 'Este código ha expirado',
      visitor: { name: visitor.name, docId: visitor.docId, status: visitor.status, validUntil: visitor.validUntil }
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Visitante autorizado',
    visitor: { name: visitor.name, docId: visitor.docId, status: visitor.status, validUntil: visitor.validUntil }
  })
}