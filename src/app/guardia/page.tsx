'use client'
import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface ScanResult {
  success: boolean
  visitor?: {
    name: string
    docId: string
    status: string
    validUntil: string
  }
  message: string
}

type Tab = 'scan' | 'manual' | 'log'

interface LogEntry {
  id: string
  name: string
  time: string
  success: boolean
}

export default function GuardiaPage() {
  const [tab, setTab] = useState<Tab>('scan')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [manualCode, setManualCode] = useState('')
  const [loading, setLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  async function startScan() {
    setResult(null)
    setScanning(true)
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (code) => {
          await scanner.stop()
          setScanning(false)
          await validateCode(code)
        },
        () => {}
      )
    } catch {
      setScanning(false)
      setResult({ success: false, message: 'No se pudo acceder a la cámara. Verifica los permisos.' })
    }
  }

  function stopScan() {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
    }
    setScanning(false)
  }

  async function validateCode(code: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/guardia/validate?code=${code}`)
      const data = await res.json()
      setResult(data)
      if (data.visitor) {
        setLog(prev => [{
          id: Date.now().toString(),
          name: data.visitor.name,
          time: new Date().toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' }),
          success: data.success,
        }, ...prev.slice(0, 9)])
      }
    } catch {
      setResult({ success: false, message: 'Error al validar el código' })
    }
    setLoading(false)
  }

  async function handleManual(e: React.FormEvent) {
    e.preventDefault()
    await validateCode(manualCode)
    setManualCode('')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Urbi<span className="text-cyan-400">X</span> <span className="text-slate-400 font-normal text-base">· Guardia</span></h1>
        </div>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">🛡️</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900">
        {([
          { id: 'scan', label: '📷 Escanear', },
          { id: 'manual', label: '✏️ Manual' },
          { id: 'log', label: `📋 Bitácora (${log.length})` },
        ] as { id: Tab, label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (scanning) stopScan() }}
            className={`flex-1 py-3 text-sm font-medium transition ${tab === t.id ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-md mx-auto">

        {/* TAB: ESCANEAR */}
        {tab === 'scan' && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
              <div id="qr-reader" className="w-full" />
              {!scanning && (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-4">📷</div>
                  <p className="text-slate-400 text-sm mb-4">Escanea el código QR del visitante</p>
                  <button
                    onClick={startScan}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Iniciar cámara
                  </button>
                </div>
              )}
            </div>

            {scanning && (
              <button
                onClick={stopScan}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all"
              >
                ✕ Detener cámara
              </button>
            )}

            {loading && (
              <div className="bg-slate-900 rounded-2xl p-6 text-center border border-slate-800">
                <p className="text-slate-400">Validando...</p>
              </div>
            )}

            {result && !loading && (
              <div className={`rounded-2xl p-6 border ${result.success ? 'bg-emerald-900/30 border-emerald-700' : 'bg-red-900/30 border-red-700'}`}>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{result.success ? '✅' : '❌'}</div>
                  <p className={`text-lg font-bold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.success ? 'Acceso permitido' : 'Acceso denegado'}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">{result.message}</p>
                </div>
                {result.visitor && (
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Nombre</span>
                      <span className="font-semibold">{result.visitor.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Documento</span>
                      <span className="font-mono">{result.visitor.docId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Válido hasta</span>
                      <span>{new Date(result.visitor.validUntil).toLocaleDateString('es-PA')}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => { setResult(null); startScan() }}
                  className="w-full mt-4 bg-slate-700 text-white py-2.5 rounded-xl font-medium hover:bg-slate-600 transition"
                >
                  Escanear otro
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: MANUAL */}
        {tab === 'manual' && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="font-bold mb-1">Ingreso manual</h3>
              <p className="text-slate-400 text-sm mb-6">Ingresa el código QR manualmente si no puedes escanear</p>
              <form onSubmit={handleManual} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Código QR</label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Ej: abc123xyz789"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Validando...' : 'Validar código'}
                </button>
              </form>
            </div>

            {result && !loading && (
              <div className={`rounded-2xl p-6 border ${result.success ? 'bg-emerald-900/30 border-emerald-700' : 'bg-red-900/30 border-red-700'}`}>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{result.success ? '✅' : '❌'}</div>
                  <p className={`text-lg font-bold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.success ? 'Acceso permitido' : 'Acceso denegado'}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">{result.message}</p>
                </div>
                {result.visitor && (
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Nombre</span>
                      <span className="font-semibold">{result.visitor.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Documento</span>
                      <span className="font-mono">{result.visitor.docId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Válido hasta</span>
                      <span>{new Date(result.visitor.validUntil).toLocaleDateString('es-PA')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: BITÁCORA */}
        {tab === 'log' && (
          <div className="space-y-3">
            {log.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-slate-400 text-sm">Sin registros en este turno</p>
              </div>
            ) : (
              log.map((entry) => (
                <div key={entry.id} className={`rounded-xl p-4 border flex items-center gap-4 ${entry.success ? 'bg-emerald-900/20 border-emerald-800' : 'bg-red-900/20 border-red-800'}`}>
                  <div className="text-2xl">{entry.success ? '✅' : '❌'}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{entry.name}</p>
                    <p className={`text-xs ${entry.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.success ? 'Acceso permitido' : 'Acceso denegado'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">{entry.time}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}