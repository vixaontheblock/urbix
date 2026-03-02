import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  })

  return NextResponse.json({ user: { id: user.id, email: user.email } })
}