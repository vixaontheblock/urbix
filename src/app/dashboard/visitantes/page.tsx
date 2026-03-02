'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import QRCode from 'react-qrcode-logo'

interface Visitor {
  id: string
  name: string
  docId: string
  qrCode: string
  status: string
  validFrom: string
  validUntil: string
}

export default function VisitantesPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedQR, setSelectedQR] = useState<Visitor | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    docId: '',
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  })

  useEffect(() => { fetchVisitors() }, [])

  async function fetchVisitors() {
    const res = await fetch('/api/visitantes')
    const data = await res.json()
    setVisitors(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/visitantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      await fetchVisitors()
      setShowForm(false)
      setForm({ ...form, name: '', docId: '' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Visitantes</h2>
            <p className="text-slate-500 text-sm mt-1">Gestiona el acceso a tu comunidad</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm shadow-sm shadow-blue-200 flex items-center gap-2">
            <span>+</span><span className="hidden sm:inline">Nuevo visitante</span>
          </button>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: visitors.length, color: 'text-slate-900' },
            { label: 'Aprobados', value: visitors.filter(v => v.status === 'APPROVED').length, color: 'text-green-600' },
            { label: 'Expirados', value: visitors.filter(v => new Date(v.validUntil) < new Date()).length, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Registrar visitante</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Juan Pérez" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cédula / Pasaporte</label>
                  <input type="text" value={form.docId} onChange={e => setForm({ ...form, docId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="8-123-456" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Desde</label>
                    <input type="datetime-local" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Hasta</label>
                    <input type="datetime-local" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">Cancelar</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Registrando...' : 'Registrar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedQR && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedQR.name}</h3>
              <p className="text-slate-500 text-sm mb-6">Código QR de acceso válido</p>
              <div className="flex justify-center p-4 bg-slate-50 rounded-2xl mb-4">
                <QRCode value={selectedQR.qrCode} size={180} />
              </div>
              <p className="text-xs text-slate-400 mb-6 font-mono bg-slate-50 rounded-lg px-3 py-2">{selectedQR.qrCode}</p>
              <button onClick={() => setSelectedQR(null)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition">Cerrar</button>
            </div>
          </div>
        )}

        {visitors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="text-5xl mb-4">🚪</div>
            <p className="font-semibold text-slate-700 mb-1">Sin visitantes aún</p>
            <p className="text-slate-400 text-sm">Registra el primer visitante de tu comunidad</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Documento</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Válido hasta</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">QR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">{v.name}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-sm">{v.docId}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{v.status}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{new Date(v.validUntil).toLocaleDateString('es-PA')}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedQR(v)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium">Ver QR</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Vista móvil */}
            <div className="md:hidden divide-y divide-slate-100">
              {visitors.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{v.name}</p>
                    <p className="text-sm text-slate-500">{v.docId}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Hasta {new Date(v.validUntil).toLocaleDateString('es-PA')}</p>
                  </div>
                  <button onClick={() => setSelectedQR(v)} className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-blue-700 transition">QR</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}