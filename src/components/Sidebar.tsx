'use client'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '🚪', label: 'Visitantes', href: '/dashboard/visitantes' },
  { icon: '💳', label: 'Pagos', href: '/dashboard/pagos' },
  { icon: '📢', label: 'Comunicados', href: '/dashboard/comunicados' },
  { icon: '🏊', label: 'Amenidades', href: '/dashboard/amenidades' },
  { icon: '💬', label: 'Chat', href: '/dashboard/chat' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const currentPage = navItems.find(item => item.href === pathname)

  return (
    <>
      {/* Header móvil */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center text-base font-bold hover:bg-slate-700 transition active:scale-95"
            >
              ☰
            </button>
            <span className="font-bold text-slate-900 dark:text-white text-lg">Urbi<span className="text-blue-600">X</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:block">{currentPage?.icon} {currentPage?.label}</span>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-xs font-bold text-white">
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-64 flex flex-col min-h-screen
        bg-gradient-to-b from-slate-900 to-slate-800
        border-r border-slate-700/50
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700/50">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Urbi<span className="text-cyan-400">X</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Panel de control</p>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden w-8 h-8 text-slate-400 hover:text-white flex items-center justify-center rounded-lg hover:bg-slate-700 transition text-lg">✕</button>
        </div>

        {/* Usuario móvil */}
        <div className="md:hidden mx-3 mt-3 p-4 bg-slate-700/30 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2">Menú</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span className="text-base w-6 text-center">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
              </a>
            )
          })}
        </nav>

        {/* Usuario desktop */}
        <div className="hidden md:block p-4 m-3 bg-slate-700/30 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition py-1.5 rounded-lg hover:bg-slate-700/50 mb-2"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-center text-xs text-slate-400 hover:text-white transition py-1.5 rounded-lg hover:bg-slate-700/50"
          >
            Cerrar sesión →
          </button>
        </div>

        {/* Cerrar sesión móvil */}
        <div className="md:hidden p-4 border-t border-slate-700/50 space-y-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition py-2.5 rounded-xl hover:bg-slate-700/50"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition py-2.5 rounded-xl hover:bg-slate-700/50"
          >
            <span>Cerrar sesión →</span>
          </button>
        </div>
      </aside>
    </>
  )
}