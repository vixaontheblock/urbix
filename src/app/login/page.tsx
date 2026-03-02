'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - solo desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-400/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">Urbi<span className="text-cyan-400">X</span></h1>
          <p className="text-slate-400 mt-2">Gestión Residencial Inteligente</p>
        </div>
        <div className="relative z-10 space-y-6">
          {[
            { icon: '🚪', title: 'Control de acceso', desc: 'Gestiona visitantes con códigos QR en tiempo real' },
            { icon: '💳', title: 'Pagos digitales', desc: 'Cobra cuotas de mantenimiento en línea' },
            { icon: '💬', title: 'Chat comunitario', desc: 'Comunicación instantánea entre residentes' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600/30 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{f.icon}</div>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-slate-400 text-sm mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-slate-600 text-sm">© 2026 UrbiX. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Urbi<span className="text-blue-600">X</span></h1>
            <p className="text-slate-500 mt-1">Gestión Residencial Inteligente</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Bienvenido de vuelta</h2>
            <p className="text-slate-500 mb-8 text-sm">Ingresa a tu comunidad</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shadow-sm shadow-blue-200"
              >
                {loading ? 'Ingresando...' : 'Iniciar sesión →'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-blue-600 font-semibold hover:underline">Regístrate gratis</a>
          </p>
        </div>
      </div>
    </div>
  )
}