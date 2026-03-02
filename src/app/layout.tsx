import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UrbiX',
  description: 'Plataforma de Gestión Residencial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.className} bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}