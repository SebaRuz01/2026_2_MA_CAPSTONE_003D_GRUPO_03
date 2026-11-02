import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import { History, Search, CheckCircle2, FileSpreadsheet, ShieldAlert, ChevronDown, ChevronUp, Calendar, Wrench, Package } from 'lucide-react'

function HistorialVehiculos() {
  const [ordenesEntregadas, setOrdenesEntregadas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filaExpandida, setFilaExpandida] = useState(null)

  const cargarHistorial = () => {
    api.get('/ordenes/')
      .then((res) => {
        const entregadas = res.data.filter(o => o.estado?.toLowerCase() === 'entregado')
        setOrdenesEntregadas(entregadas)
      })
      .catch((err) => {
        console.error('Error al cargar historial de vehículos', err)
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarHistorial()
  }, [])

  const filtradas = ordenesEntregadas.filter(o => {
    const texto = busqueda.toLowerCase()
    const patente = o.vehiculo_patente?.toLowerCase() || ''
    const modelo = o.equipo?.toLowerCase() || ''
    const cliente = o.cliente_nombre?.toLowerCase() || ''
    const codigo = `ot-${o.id}`.toLowerCase()
    return patente.includes(texto) || modelo.includes(texto) || cliente.includes(texto) || codigo.includes(texto)
  }).sort((a, b) => {
    // Ordenar por fecha de entrega (más reciente primero)
    const fechaA = a.fecha_entrega ? new Date(a.fecha_entrega).getTime() : 0
    const fechaB = b.fecha_entrega ? new Date(b.fecha_entrega).getTime() : 0
    if (fechaA !== fechaB) {
      return fechaB - fechaA
    }
    return b.id - a.id
  })

  const exportarCSV = () => {
    if (ordenesEntregadas.length === 0) return
    
    const headers = ['Codigo OT', 'Vehiculo/Modelo', 'Patente', 'Cliente', 'Tecnico', 'Falla', 'Fecha Ingreso', 'Fecha Entrega', 'Estado']
    const rows = filtradas.map(o => [
      `OT-${o.id.toString().padStart(3, '0')}`,
      `"${o.equipo || 'N/D'}"`,
      o.vehiculo_patente || 'N/D',
      `"${o.cliente_nombre || 'N/D'}"`,
      `"${o.tecnico_nombre || 'Sin asignar'}"`,
      `"${o.descripcion_problema || o.descripcion || 'N/D'}"`,
      o.fecha_recepcion || 'N/D',
      o.fecha_entrega || 'N/D',
      'Entregado'
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `historial_vehiculos_sigma_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No registrada'
    try {
      const fecha = new Date(fechaStr)
      if (isNaN(fecha.getTime())) return fechaStr
      return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return fechaStr
    }
  }

  return (
    <div className="portal-shell portal-layout">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-300/20 dark:bg-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0"></div>

      <Sidebar className="relative z-10" />

      <main className="portal-main">
        
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Archivo General</div>
            <h1 className="portal-title">Historial de Vehículos Atendidos</h1>
          </div>
          
          {ordenesEntregadas.length > 0 && (
            <button
              onClick={exportarCSV}
              className="bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 text-white text-sm font-bold px-5 py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Historial (CSV)
            </button>
          )}
        </div>

        {cargando && (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg border border-blue-100 dark:border-blue-500/20 shadow-sm max-w-sm">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Cargando archivo de vehículos...
          </div>
        )}

        {!cargando && (
          <>
            <div className="mb-6 relative max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código OT, patente, modelo o cliente..."
                className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-colors"
              />
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-[0_4px_30px_rgb(0,0,0,0.03)] transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
                      <th className="px-6 py-4 font-bold">Código / OT</th>
                      <th className="px-4 py-4 font-bold">Vehículo / Patente</th>
                      <th className="px-4 py-4 font-bold">Cliente</th>
                      <th className="px-4 py-4 font-bold">Técnico Atendedor</th>
                      <th className="px-4 py-4 font-bold text-right">Detalles / Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filtradas.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 font-bold text-base">No hay vehículos registrados</p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Los vehículos aparecerán aquí cuando uses el botón "Entregar vehículo".</p>
                        </td>
                      </tr>
                    )}
                    {filtradas.map((o) => {
                      const estaExpandido = filaExpandida === o.id
                      const fechaIngreso = o.fecha_recepcion || null
                      const fechaEntrega = o.fecha_entrega || null
                      const fallaReportada = o.descripcion_problema || o.descripcion || 'Sin descripción de falla registrada.'

                      return (
                        <>
                          <tr 
                            key={o.id} 
                            onClick={() => setFilaExpandida(estaExpandido ? null : o.id)}
                            className={`cursor-pointer transition-colors ${estaExpandido ? 'bg-blue-50/50 dark:bg-slate-800/60' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'}`}
                          >
                            <td className="px-6 py-4 font-black text-slate-800 dark:text-white flex items-center gap-2">
                              {estaExpandido ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                              OT-{o.id.toString().padStart(3, '0')}
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{o.equipo || 'Vehículo'}</div>
                              {o.vehiculo_patente && (
                                <span className="inline-block mt-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold px-1.5 py-0.2 rounded tracking-wide uppercase">
                                  {o.vehiculo_patente}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-slate-600 dark:text-slate-400 font-medium">{o.cliente_nombre || 'N/D'}</td>
                            <td className="px-4 py-4 text-slate-500 dark:text-slate-400 font-medium">{o.tecnico_nombre || 'Sin asignar'}</td>
                            <td className="px-4 py-4 text-right">
                              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Entregado
                              </span>
                            </td>
                          </tr>

                          {estaExpandido && (
                            <tr key={`detalle-${o.id}`} className="bg-slate-50/80 dark:bg-slate-900/60 border-t border-b border-slate-200/60 dark:border-slate-800">
                              <td colSpan={5} className="px-8 py-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                  
                                  <div className="bg-white dark:bg-slate-800/80 p-5 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4" /> Fechas de Operación
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-400 block">Fecha de Ingreso</span>
                                      <span className="font-bold text-slate-800 dark:text-white text-sm">{formatearFecha(fechaIngreso)}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-400 block">Fecha de Entrega</span>
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatearFecha(fechaEntrega)}</span>
                                    </div>
                                  </div>

                                  <div className="bg-white dark:bg-slate-800/80 p-5 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-2">
                                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <Wrench className="w-4 h-4" /> Falla Diagnóstica
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 break-words whitespace-normal">
                                      {fallaReportada}
                                    </p>
                                  </div>

                                  <div className="bg-white dark:bg-slate-800/80 p-5 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-2">
                                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <Package className="w-4 h-4" /> Repuestos Consumidos ({o.repuestos_usados?.length || 0})
                                    </div>
                                    {(!o.repuestos_usados || o.repuestos_usados.length === 0) ? (
                                      <p className="text-xs text-slate-400 italic py-2">No se registraron repuestos en esta orden.</p>
                                    ) : (
                                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                        {o.repuestos_usados.map((rep) => (
                                          <div key={rep.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 break-words pr-2">{rep.repuesto_nombre}</span>
                                            <span className="font-extrabold text-blue-600 dark:text-blue-400 shrink-0">x{rep.cantidad}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default HistorialVehiculos


