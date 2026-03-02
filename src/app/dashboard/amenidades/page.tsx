'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

interface Reservation {
  id: string
  amenity: string
  date: string
  startTime: string
  endTime: string
  residentName: string
  status: string
}

const amenities = [
  { name: 'Piscina', icon: '🏊' },
  { name: 'Salón de fiestas', icon: '🎉' },
  { name: 'Gimnasio', icon: '💪' },
  { name: 'Cancha', icon: '⚽' },
  { name: 'BBQ', icon: '🔥' },
  { name: 'Sala de cine', icon: '🎬' },
]

export default function AmenidadesPage() {
  const [reservas, setReservas] = useState<Reservation[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    amenity: 'Piscina',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '11:00',
    residentName: '',
  })

  useEffect(() => { fetchReservas() }, [])

  async function fetchReservas() {
    const res = await fetch('/api/amenidades')
    const data = await res.json()
    setReservas(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/amenidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      await fetchReservas()
      setShowForm(false)
      setForm({ ...form, residentName: '' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Amenidades</h2>
            <p className="text-slate-500 text-sm mt-1">Reserva las instalaciones de tu comunidad</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm shadow-sm shadow-blue-200 flex items-center gap-2">
            <span>+</span><span className="hidden sm:inline">Nueva reserva</span>
          </button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {amenities.map((a) => (
            <button
              key={a.name}
              onClick={() => { setForm({ ...form, amenity: a.name }); setShowForm(true) }}
              className="bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{a.icon}</div>
              <p className="text-xs font-semibold text-slate-700 leading-tight">{a.name}</p>
            </button>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Nueva reserva</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Amenidad</label>
                  <div className="grid grid-cols-3 gap-2">
                    {amenities.map(a => (
                      <button key={a.name} type="button" onClick={() => setForm({ ...form, amenity: a.name })}
                        className={`py-2 rounded-xl text-sm font-medium border-2 transition ${form.amenity === a.name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        {a.icon} {a.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Residente</label>
                  <input type="text" value={form.residentName} onChange={e => setForm({ ...form, residentName: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Nombre del residente" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Desde</label>
                    <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Hasta</label>
                    <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">Cancelar</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Reservando...' : 'Reservar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {reservas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="text-5xl mb-4">🏊</div>
            <p className="font-semibold text-slate-700 mb-1">Sin reservas aún</p>
            <p className="text-slate-400 text-sm">Haz clic en una amenidad para reservar</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amenidad</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Residente</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Horario</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reservas.map((r) => {
                    const amenity = amenities.find(a => a.name === r.amenity)
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-semibold text-slate-900">{amenity?.icon} {r.amenity}</td>
                        <td className="px-6 py-4 text-slate-500">{r.residentName}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(r.date).toLocaleDateString('es-PA')}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-sm">{r.startTime} — {r.endTime}</td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{r.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-slate-100">
              {reservas.map((r) => {
                const amenity = amenities.find(a => a.name === r.amenity)
                return (
                  <div key={r.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900">{amenity?.icon} {r.amenity}</p>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{r.status}</span>
                    </div>
                    <p className="text-sm text-slate-500">{r.residentName}</p>
                    <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString('es-PA')} · {r.startTime} — {r.endTime}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}