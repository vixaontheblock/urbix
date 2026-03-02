'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Stats {
  visitantes: number
  pagosPendientes: number
  comunicados: number
  reservas: number
  mensajes: number
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ visitantes: 0, pagosPendientes: 0, comunicados: 0, reservas: 0, mensajes: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') fetchStats()
  }, [status])

  async function fetchStats() {
    const [visitantes, pagos, comunicados, reservas, mensajes] = await Promise.all([
      fetch('/api/visitantes').then(r => r.json()),
      fetch('/api/pagos').then(r => r.json()),
      fetch('/api/comunicados').then(r => r.json()),
      fetch('/api/amenidades').then(r => r.json()),
      fetch('/api/chat').then(r => r.json()),
    ])
    setStats({
      visitantes: visitantes.length,
      pagosPendientes: pagos.filter((p: { status: string }) => p.status === 'PENDING').length,
      comunicados: comunicados.length,
      reservas: reservas.length,
      mensajes: mensajes.length,
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">Urbi<span className="text-cyan-400">X</span></div>
          <p className="text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Visitantes', value: stats.visitantes, icon: '🚪', bg: 'bg-blue-500', href: '/dashboard/visitantes', desc: 'Registrados' },
    { label: 'Pagos pendientes', value: stats.pagosPendientes, icon: '💳', bg: 'bg-amber-500', href: '/dashboard/pagos', desc: 'Por cobrar' },
    { label: 'Comunicados', value: stats.comunicados, icon: '📢', bg: 'bg-emerald-500', href: '/dashboard/comunicados', desc: 'Publicados' },
    { label: 'Reservas', value: stats.reservas, icon: '🏊', bg: 'bg-purple-500', href: '/dashboard/amenidades', desc: 'Activas' },
    { label: 'Mensajes', value: stats.mensajes, icon: '💬', bg: 'bg-pink-500', href: '/dashboard/chat', desc: 'En el chat' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-500 text-sm font-medium">{getGreeting()},</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{session?.user?.name} 👋</h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`${card.bg} w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-0.5">{card.value}</div>
              <div className="text-sm font-medium text-slate-700">{card.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{card.desc}</div>
            </a>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Nuevo visitante', icon: '🚪', href: '/dashboard/visitantes', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
              { label: 'Registrar pago', icon: '💳', href: '/dashboard/pagos', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
              { label: 'Comunicado', icon: '📢', href: '/dashboard/comunicados', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
              { label: 'Reservar', icon: '🏊', href: '/dashboard/amenidades', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`${action.color} rounded-xl px-4 py-3 flex items-center gap-3 transition font-medium text-sm`}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}