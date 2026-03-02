'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  createdAt: string
}

const categoryConfig: Record<string, { color: string, bg: string, icon: string }> = {
  URGENTE: { color: 'text-red-700', bg: 'bg-red-100', icon: '🚨' },
  INFORMATIVO: { color: 'text-blue-700', bg: 'bg-blue-100', icon: 'ℹ️' },
  EVENTO: { color: 'text-purple-700', bg: 'bg-purple-100', icon: '🎉' },
}

export default function ComunicadosPage() {
  const [comunicados, setComunicados] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'INFORMATIVO' })

  useEffect(() => { fetchComunicados() }, [])

  async function fetchComunicados() {
    const res = await fetch('/api/comunicados')
    const data = await res.json()
    setComunicados(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/comunicados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      await fetchComunicados()
      setShowForm(false)
      setForm({ title: '', content: '', category: 'INFORMATIVO' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Comunicados</h2>
            <p className="text-slate-500 text-sm mt-1">Avisos e información para tu comunidad</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm shadow-sm shadow-blue-200 flex items-center gap-2">
            <span>+</span><span className="hidden sm:inline">Nuevo comunicado</span>
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Nuevo comunicado</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Título</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Corte de agua programado" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(categoryConfig).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, category: key })}
                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition ${form.category === key ? `${val.bg} ${val.color} border-current` : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        {val.icon} {key}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Contenido</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition" placeholder="Detalle del comunicado..." required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">Cancelar</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Publicando...' : 'Publicar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {comunicados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="text-5xl mb-4">📢</div>
            <p className="font-semibold text-slate-700 mb-1">Sin comunicados aún</p>
            <p className="text-slate-400 text-sm">Publica el primer aviso para tu comunidad</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comunicados.map((c) => {
              const cat = categoryConfig[c.category] || { color: 'text-slate-700', bg: 'bg-slate-100', icon: '📌' }
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-sm transition">
                  <div className="flex items-start gap-4">
                    <div className={`${cat.bg} w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>{cat.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`${cat.bg} ${cat.color} text-xs font-bold px-3 py-1 rounded-full`}>{c.category}</span>
                        <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">{c.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{c.content}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}