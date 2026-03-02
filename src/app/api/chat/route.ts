import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export async function GET() {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'asc' },
    take: 50,
  })
  return NextResponse.json(messages)
}

export async function POST(req: Request) {
  const { content, authorName, authorEmail } = await req.json()

  let community = await prisma.community.findFirst()
  if (!community) {
    community = await prisma.community.create({
      data: { name: 'Mi Comunidad', address: 'Panamá', type: 'CONDO' }
    })
  }

  const message = await prisma.message.create({
    data: { content, authorName, authorEmail, communityId: community.id }
  })

  await pusher.trigger('urbix-chat', 'new-message', message)

  return NextResponse.json(message)
}