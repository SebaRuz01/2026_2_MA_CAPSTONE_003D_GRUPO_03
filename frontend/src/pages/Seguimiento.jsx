import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import logoIcono from '../assets/logo.png'
import { ArrowLeft, AlertCircle, Sun, Moon, RefreshCw } from 'lucide-react'

const ESTADOS_INFO = {
  recibido: { label: 'Recibido en Taller', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500', pct: 15 },
  diagnostico: { label: 'En Diagnóstico', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500', pct: 40 },
  en_reparacion: { label: 'En Reparación', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500', pct: 70 },
  listo: { label: 'Listo para Retiro', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500', pct: 100 },
  entregado: { label: 'Entregado al Cliente', color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500', pct: 100 },
}

function Seguimiento() {
  const { codigo } = useParams()
  const [orden, setOrden] = useState(null)
  const [error, setError] = useState('')
  
  // Modo oscuro por defecto en oscuro ('dark'), recordando la selección del usuario
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('sigma_theme')
    return saved ? saved === 'dark' : true
  })
  
  const [actualizando, setActualizando] = useState(false)

  // Sincronizar modo oscuro con el DOM y localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('sigma_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('sigma_theme', 'light')
    }
  }, [darkMode])

  // Función para obtener la orden por HTTP
  const fetchOrden = (esRecargaManual = false) => {
    if (esRecargaManual) setActualizando(true)
    axios.get(`https://bd-sigma.onrender.com/api/publico/ordenes/${codigo}/`)
      .then((res) => {
        setOrden(res.data)
        setError('')
      })
      .catch(() => {
        if (!orden) setError('No se encontró ninguna orden activa con ese código de seguimiento.')
      })
      .finally(() => {
        if (esRecargaManual) {
          setTimeout(() => setActualizando(false), 500)
        }
      })
  }

  // Carga inicial y Polling automático cada 10 segundos en segundo plano
  useEffect(() => {
    fetchOrden()
    const intervalo = setInterval(() => {
      fetchOrden()
    }, 10000)

    return () => clearInterval(intervalo)
  }, [codigo])

  if (error) {
    return (
      <div className="portal-shell bg-[#eeede8] dark:bg-[#101513] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-5 border-8 border-red-50/50 dark:border-red-500/5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-extrabold text-xl text-slate-800 dark:text-white mb-2">Orden no encontrada</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">{error}</p>
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all w-full shadow-lg shadow-blue-500/20">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="portal-shell bg-[#eeede8] dark:bg-[#101513] text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-lg shadow-lg border border-slate-200/80 dark:border-slate-800">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Buscando información de tu vehículo...
        </div>
      </div>
    )
  }

  const estadoKey = (orden.estado || 'recibido').toLowerCase()
  const info = ESTADOS_INFO[estadoKey] || ESTADOS_INFO.recibido

  return (
    <div className="portal-shell bg-[#eeede8] dark:bg-[#101513] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden transition-colors duration-300">
      
      {/* Fondo Decorativo Luminoso */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-300/20 dark:bg-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0"></div>

      {/* Botones superiores flotantes */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Inicio
        </Link>
        
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          aria-label="Cambiar modo oscuro"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-center mb-3">
            <img src={logoIcono} alt="SIGMA" className="h-8 w-auto" />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">Seguimiento en Línea</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Estado en tiempo real de tu orden de trabajo</p>
        </div>

        {/* Tarjeta Principal de Seguimiento */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] dark:shadow-none transition-colors">
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Código de Seguimiento</span>
            <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-500/20">
              {orden.codigo_seguimiento}
            </span>
          </div>

          <h1 className="font-extrabold text-2xl text-slate-800 dark:text-white mb-6">{orden.equipo}</h1>

          {/* Barra de Progreso Avanzada */}
          <div className="mb-8 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-lg border border-slate-100 dark:border-slate-800/80">
            <div className="flex justify-between text-xs font-bold mb-3 items-center">
              <span className={`flex items-center gap-1.5 ${info.color}`}>
                <span className={`w-2 h-2 rounded-full ${info.bg} animate-pulse`}></span>
                {info.label}
              </span>
              <span className="text-slate-400 font-extrabold">{info.pct}%</span>
            </div>
            <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full ${info.bg} rounded-full transition-all duration-700 shadow-sm`}
                style={{ width: `${info.pct}%` }}
              />
            </div>
          </div>

          {/* Detalles de la Orden */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-sm">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-400 font-medium">Cliente</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{orden.cliente_nombre}</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-slate-400 font-medium">Técnico Asignado</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{orden.tecnico_nombre || 'Asignación pendiente'}</span>
            </div>
          </div>

          {/* Botón de Actualización Manual */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-center">
            <button
              onClick={() => fetchOrden(true)}
              disabled={actualizando}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${actualizando ? 'animate-spin text-blue-600' : ''}`} />
              {actualizando ? 'Sincronizando...' : 'Actualizar Estado'}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-6 font-medium">
          Sistema de gestión automatizado SIGMA Taller Automotriz.
        </p>
      </div>
    </div>
  )
}

export default Seguimiento

