'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

interface Payment {
  id: string
  amount: number
  month: string
  status: string
  createdAt: string
  unit: { number: string }
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Payment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ amount: '', month: '' })

  useEffect(() => { fetchPagos() }, [])

  async function fetchPagos() {
    const res = await fetch('/api/pagos')
    const data = await res.json()
    setPagos(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      await fetchPagos()
      setShowForm(false)
      setForm({ amount: '', month: '' })
    }
    setLoading(false)
  }

  async function marcarPagado(id: string) {
    await fetch('/api/pagos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await fetchPagos()
  }

  const total = pagos.reduce((acc, p) => acc + p.amount, 0)
  const pendientes = pagos.filter(p => p.status === 'PENDING').length
  const pagados = pagos.filter(p => p.status === 'PAID').length

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Pagos</h2>
            <p className="text-slate-500 text-sm mt-1">Gestión de cuotas de mantenimiento</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm shadow-sm shadow-blue-200 flex items-center gap-2">
            <span>+</span><span className="hidden sm:inline">Registrar pago</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Total</p>
            <p className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <p className="text-amber-600 text-xs font-medium uppercase tracking-wide mb-2">Pendientes</p>
            <p className="text-2xl font-bold text-amber-700">{pendientes}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
            <p className="text-emerald-600 text-xs font-medium uppercase tracking-wide mb-2">Pagados</p>
            <p className="text-2xl font-bold text-emerald-700">{pagados}</p>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Registrar pago</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto ($)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="150.00" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mes</label>
                  <input type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">Cancelar</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Registrando...' : 'Registrar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {pagos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="text-5xl mb-4">💳</div>
            <p className="font-semibold text-slate-700 mb-1">Sin pagos registrados</p>
            <p className="text-slate-400 text-sm">Registra el primer pago de tu comunidad</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidad</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mes</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pagos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">{p.unit.number}</td>
                      <td className="px-6 py-4 text-slate-500">{p.month}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">${p.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.status === 'PENDING' && (
                          <button onClick={() => marcarPagado(p.id)} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition font-medium">
                            Marcar pagado
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-slate-100">
              {pagos.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{p.unit.number} — {p.month}</p>
                    <p className="text-sm font-bold text-slate-700">${p.amount.toFixed(2)}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                  {p.status === 'PENDING' && (
                    <button onClick={() => marcarPagado(p.id)} className="bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-emerald-700 transition">✓</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}