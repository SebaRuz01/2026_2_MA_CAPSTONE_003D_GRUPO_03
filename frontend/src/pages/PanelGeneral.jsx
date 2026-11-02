import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import { Activity, Wrench, Package, AlertCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react'

function PanelGeneral() {
  const [ordenes, setOrdenes] = useState([])
  const [repuestos, setRepuestos] = useState([])
  const [inventarioBloqueado, setInventarioBloqueado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  
  // ESTADOS DE FILTRADO, BÚSQUEDA Y PAGINACIÓN
  const [filtroEstado, setFiltroEstado] = useState('todas') // 'todas', 'activas', 'completadas'
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const porPagina = 5 // Filas por página en la tabla

  const navigate = useNavigate()

  useEffect(() => {
    api.get('/ordenes/')
      .then((res) => setOrdenes(res.data))
      .catch(() => setError('No se pudieron cargar las órdenes.'))
      .finally(() => setCargando(false))

    api.get('/repuestos/')
      .then((res) => setRepuestos(res.data))
      .catch((err) => {
        if (err.response?.status === 403) setInventarioBloqueado(true)
      })
  }, [])

  const activas = ordenes.filter((o) => o.estado?.toLowerCase() !== 'entregado')
  const completadas = ordenes.filter((o) => o.estado?.toLowerCase() === 'entregado')
  const stockBajo = repuestos.filter((r) => r.stock_actual <= r.stock_minimo)

  // FILTRADO INTELIGENTE
  const ordenesFiltradas = ordenes.filter((o) => {
    const est = o.estado?.toLowerCase()
    
    if (filtroEstado === 'activas' && est === 'entregado') return false
    if (filtroEstado === 'completadas' && est !== 'entregado') return false

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      const codigoOT = `ot-${o.id}`
      const textoSeguimiento = o.codigo_seguimiento?.toLowerCase() || ''
      const equipo = o.equipo?.toLowerCase() || ''
      const cliente = o.cliente_nombre?.toLowerCase() || ''
      
      return codigoOT.includes(q) || textoSeguimiento.includes(q) || equipo.includes(q) || cliente.includes(q)
    }

    return true
  })

  // CÁLCULO DE PAGINACIÓN
  const totalPaginas = Math.ceil(ordenesFiltradas.length / porPagina) || 1
  const indiceInicio = (paginaActual - 1) * porPagina
  const ordenesPaginadas = ordenesFiltradas.slice(indiceInicio, indiceInicio + porPagina)

  const estadoLabel = {
    recibido: 'Recibido',
    diagnostico: 'Diagnóstico',
    en_reparacion: 'En reparación',
    listo: 'Listo',
    entregado: 'Entregado',
  }
  
  const estadoColor = {
    recibido: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60',
    diagnostico: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20',
    en_reparacion: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20',
    listo: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20',
    entregado: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20',
  }

  return (
    <div className="portal-shell portal-layout">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0 transition-colors duration-300"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-300/20 dark:bg-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0 transition-colors duration-300"></div>

      <Sidebar className="relative z-10" />
      
      <main className="portal-main">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="portal-title">Panel General</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">Resumen en vivo y métricas clave de tu taller mecánico</p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full shadow-sm transition-colors">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Sistema En Línea</span>
          </div>
        </div>

        {cargando && (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 shadow-sm transition-colors">
            <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Cargando información...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl px-4 py-3 mb-6 shadow-sm transition-colors">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* TARJETAS DE MÉTRICAS (INTERACTIVAS) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          <div 
            onClick={() => { setFiltroEstado('activas'); setPaginaActual(1); }}
            className={`bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border rounded-lg p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all cursor-pointer group ${filtroEstado === 'activas' ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full group-hover:scale-105 transition-transform">Ver activas →</span>
            </div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors">Órdenes Activas</div>
            <div className="font-extrabold text-4xl text-slate-800 dark:text-white mt-1 transition-colors">{activas.length}</div>
          </div>
          
          <div 
            onClick={() => { setFiltroEstado('todas'); setPaginaActual(1); }}
            className={`bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border rounded-lg p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all cursor-pointer group ${filtroEstado === 'todas' ? 'border-slate-400 dark:border-slate-600 ring-2 ring-slate-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full group-hover:scale-105 transition-transform">Ver todas →</span>
            </div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors">Total Histórico</div>
            <div className="font-extrabold text-4xl text-slate-800 dark:text-white mt-1 transition-colors">{ordenes.length}</div>
          </div>
          
          <div 
            onClick={() => navigate('/inventario')}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700 rounded-lg p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-400 dark:text-red-400 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full group-hover:scale-105 transition-transform">Ir a inventario →</span>
            </div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors">Repuestos Críticos</div>
            <div className="font-extrabold text-4xl text-red-500 dark:text-red-500 mt-1 transition-colors">
              {inventarioBloqueado ? '—' : stockBajo.length}
            </div>
          </div>

        </div>

        {/* SECCIÓN INFERIOR */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-6 pb-10">
          
          {/* TABLA DE ÓRDENES CON FILTROS, BUSCADOR Y PAGINACIÓN */}
          <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-colors duration-300">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-transparent transition-colors">
              <div>
                <h2 className="font-bold text-slate-800 dark:text-white text-lg transition-colors">Órdenes recientes</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control y estado actual de los vehículos</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* BUSCADOR RÁPIDO */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                    placeholder="Buscar OT, cliente, patente..."
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-medium transition-colors w-52"
                  />
                  {busqueda && (
                    <button onClick={() => setBusqueda('')} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 text-[10px] font-bold cursor-pointer">
                      ✕
                    </button>
                  )}
                </div>

                {/* BOTONES DE FILTRO */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => { setFiltroEstado('todas'); setPaginaActual(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filtroEstado === 'todas' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Todas ({ordenes.length})
                  </button>
                  <button
                    onClick={() => { setFiltroEstado('activas'); setPaginaActual(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filtroEstado === 'activas' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Activas ({activas.length})
                  </button>
                  <button
                    onClick={() => { setFiltroEstado('completadas'); setPaginaActual(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filtroEstado === 'completadas' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Completadas ({completadas.length})
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 transition-colors">
                    <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 transition-colors">Orden</th>
                    <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 transition-colors">Equipo / Patente</th>
                    <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 transition-colors">Cliente</th>
                    <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 transition-colors">Estado</th>
                    <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 transition-colors">Seguimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 transition-colors">
                  {ordenesFiltradas.length === 0 && !cargando && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-slate-400 dark:text-slate-500 text-center text-sm font-medium transition-colors">
                        No se encontraron órdenes con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                  {ordenesPaginadas.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">OT-{o.id.toString().padStart(3, '0')}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{o.equipo}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{o.cliente_nombre || 'Sin registrar'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${estadoColor[o.estado] || 'bg-slate-100 text-slate-600'}`}>
                          {estadoLabel[o.estado] || o.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs font-bold">{o.codigo_seguimiento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINACIÓN OPERATIVOS */}
            {totalPaginas > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 transition-colors">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Mostrando {indiceInicio + 1} - {Math.min(indiceInicio + porPagina, ordenesFiltradas.length)} de {ordenesFiltradas.length} órdenes (Página {paginaActual} de {totalPaginas})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* WIDGET DE ALERTAS DE INVENTARIO */}
          <div 
            onClick={() => navigate('/inventario')}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-lg p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800 dark:text-white transition-colors">Alertas de Stock</h2>
              {!inventarioBloqueado && stockBajo.length > 0 && (
                <span className="bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-[10px] font-black px-2 py-0.5 rounded-full transition-colors animate-pulse">
                  {stockBajo.length} crónicos
                </span>
              )}
            </div>
            
            {inventarioBloqueado ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
                <Package className="w-8 h-8 text-slate-300 dark:text-slate-500 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">Tu taller no tiene contratado este módulo.</p>
                <span className="mt-3 text-blue-500 dark:text-blue-400 text-xs font-bold group-hover:underline">Ver Módulos →</span>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[350px]">
                {stockBajo.length === 0 && !cargando && (
                  <div className="py-12 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">✓</div>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold transition-colors">Stock en niveles óptimos.</p>
                  </div>
                )}
                {stockBajo.map((r) => (
                  <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs block">{r.nombre}</span>
                      <span className="text-[10px] text-slate-400">{r.modelo || 'Universal'}</span>
                    </div>
                    <span className="text-red-500 dark:text-red-400 font-bold text-xs bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-red-100 dark:border-red-500/20 shadow-sm">
                      {r.stock_actual} uds.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default PanelGeneral


