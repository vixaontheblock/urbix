'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Pusher from 'pusher-js'
import Sidebar from '@/components/Sidebar'

interface Message {
  id: string
  content: string
  authorName: string
  authorEmail: string
  createdAt: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe('urbix-chat')
    channel.bind('new-message', (data: Message) => {
      setMessages(prev => [...prev, data])
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe('urbix-chat')
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    const res = await fetch('/api/chat')
    const data = await res.json()
    setMessages(data)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !session?.user) return
    setLoading(true)
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: text,
        authorName: session.user.name,
        authorEmail: session.user.email,
      }),
    })
    setText('')
    setLoading(false)
  }

  const groupedMessages = messages.reduce((groups: { date: string, messages: Message[] }[], msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' })
    const last = groups[groups.length - 1]
    if (last && last.date === date) {
      last.messages.push(msg)
    } else {
      groups.push({ date, messages: [msg] })
    }
    return groups
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen pt-0 md:pt-0">

        {/* Header */}
        <div className="px-6 md:px-8 py-5 pt-16 md:pt-5 bg-white border-b border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-lg flex-shrink-0">💬</div>
          <div>
            <h2 className="font-bold text-slate-900">Chat de la comunidad</h2>
            <p className="text-slate-500 text-xs">{messages.length} mensajes · En línea</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-4">💬</div>
              <p className="font-semibold text-slate-700 mb-1">El chat está vacío</p>
              <p className="text-slate-400 text-sm">¡Sé el primero en escribir!</p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium capitalize">{group.date}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="space-y-3">
                  {group.messages.map((m) => {
                    const isMe = m.authorEmail === session?.user?.email
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {!isMe && (
                          <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mb-0.5">
                            {m.authorName?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className={`max-w-xs md:max-w-md flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <span className="text-xs text-slate-500 font-medium px-1">{m.authorName}</span>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-sm shadow-sm shadow-blue-200'
                              : 'bg-white text-slate-900 rounded-bl-sm border border-slate-100 shadow-sm'
                          }`}>
                            {m.content}
                          </div>
                          <span className="text-xs text-slate-400 px-1">
                            {new Date(m.createdAt).toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {isMe && (
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mb-0.5">
                            {session?.user?.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 md:px-8 py-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex gap-3 items-center">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Escribe un mensaje..."
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="bg-blue-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0 shadow-sm shadow-blue-200"
            >
              →
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}