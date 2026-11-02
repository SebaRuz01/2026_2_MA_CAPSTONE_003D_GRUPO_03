import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import { Lock, X, Search, Plus, AlertCircle, PackagePlus, Trash2, Layers, AlertTriangle, DollarSign, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'

const formatearPrecio = (valor) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(valor)
}

function Inventario() {
  const [repuestos, setRepuestos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [bloqueado, setBloqueado] = useState(false)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalStockAbierto, setModalStockAbierto] = useState(false)
  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState(null)
  const [repuestoAEliminar, setRepuestoAEliminar] = useState(null)
  const [cantidadAgregada, setCantidadAgregada] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [errorStock, setErrorStock] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos') // 'todos' | 'optimo' | 'alerta'
  const [esAdmin, setEsAdmin] = useState(true)
  const [planTaller, setPlanTaller] = useState(1) // 1 = Profesional, 2 = Empresas

  // PAGINACIÓN AVANZADA
  const [paginaActual, setPaginaActual] = useState(1)
  const [articulosPorPagina, setArticulosPorPagina] = useState(20)

  const [form, setForm] = useState({
    nombre: '',
    stock_actual: '',
    stock_minimo: '',
    precio: '',
    anio: '',
    modelo: '',
    compatibilidades: '',
  })

  const cargarRepuestos = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        // Verificamos correctamente incluyendo 'admin_taller'
        if (decoded.is_staff || decoded.is_superuser || decoded.rol === 'admin' || decoded.rol === 'admin_taller' || decoded.is_admin) {
          setEsAdmin(true)
        } else {
          setEsAdmin(false)
        }

        if (decoded.taller_id) {
          const resTaller = await api.get(`/talleres/${decoded.taller_id}/`)
          setPlanTaller(resTaller.data.plan_id || 1)
        }
      } catch (e) {
        console.error('Error al decodificar token', e)
      }
    }

    api.get('/repuestos/')
      .then((res) => setRepuestos(res.data))
      .catch((err) => {
        if (err.response?.status === 403) {
          setBloqueado(true)
        } else {
          setError('No se pudieron cargar los repuestos.')
        }
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarRepuestos()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!esAdmin) return
    setErrorForm('')

    const nombreTrim = form.nombre.trim().toLowerCase()
    const modeloTrim = (form.modelo || '').trim().toLowerCase()

    const yaExiste = repuestos.some(
      (r) => 
        r.nombre?.trim().toLowerCase() === nombreTrim && 
        (r.modelo || '').trim().toLowerCase() === modeloTrim
    )

    if (yaExiste) {
      setErrorForm('Ya existe un repuesto registrado con este mismo nombre y modelo.')
      return
    }

    if (Number(form.stock_actual) < 0 || Number(form.stock_minimo) < 0 || Number(form.precio) < 0) {
      setErrorForm('Los valores numéricos no pueden ser negativos.')
      return
    }

    setGuardando(true)
    try {
      await api.post('/repuestos/', {
        nombre: form.nombre.trim(),
        stock_actual: Number(form.stock_actual) || 0,
        stock_minimo: Number(form.stock_minimo) || 0,
        precio: Number(form.precio) || 0,
        anio: form.anio ? Number(form.anio) : null,
        modelo: form.modelo.trim(),
        compatibilidades: form.compatibilidades.trim(),
      })
      setModalAbierto(false)
      setForm({ nombre: '', stock_actual: '', stock_minimo: '', precio: '', anio: '', modelo: '', compatibilidades: '' })
      cargarRepuestos()
    } catch (err) {
      setErrorForm('No se pudo crear el repuesto. Revisa los datos.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSumarStock = async (e) => {
    e.preventDefault()
    if (!esAdmin || !repuestoSeleccionado) return
    setErrorStock('')

    const cantidad = Number(cantidadAgregada)
    if (isNaN(cantidad) || cantidad <= 0) {
      setErrorStock('Ingresa una cantidad válida mayor a 0.')
      return
    }

    const nuevoStock = repuestoSeleccionado.stock_actual + cantidad

    setGuardando(true)
    try {
      await api.patch(`/repuestos/${repuestoSeleccionado.id}/`, {
        stock_actual: nuevoStock,
      })
      setModalStockAbierto(false)
      setRepuestoSeleccionado(null)
      setCantidadAgregada(1)
      cargarRepuestos()
    } catch (err) {
      setErrorStock('No se pudo actualizar el stock.')
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminarRepuesto = async () => {
    if (!esAdmin || !repuestoAEliminar) return
    setEliminando(true)
    try {
      await api.delete(`/repuestos/${repuestoAEliminar.id}/`)
      setRepuestos((prev) => prev.filter((r) => r.id !== repuestoAEliminar.id))
      setRepuestoAEliminar(null)
    } catch (err) {
      alert('No se pudo eliminar el repuesto. Es posible que esté asociado a una orden de trabajo activa.')
    } finally {
      setEliminando(false)
    }
  }

  const repuestosFiltrados = repuestos.filter((r) => {
    const texto = busqueda.toLowerCase()
    const nombre = r.nombre?.toLowerCase() || ''
    const modelo = r.modelo?.toLowerCase() || ''
    const compatibilidades = r.compatibilidades?.toLowerCase() || ''
    
    const coincideTexto = nombre.includes(texto) || modelo.includes(texto) || compatibilidades.includes(texto)
    const bajoStock = r.stock_actual <= r.stock_minimo

    if (filtroEstado === 'optimo') return coincideTexto && !bajoStock
    if (filtroEstado === 'alerta') return coincideTexto && bajoStock
    return coincideTexto
  })

  const totalPaginas = Math.ceil(repuestosFiltrados.length / Number(articulosPorPagina)) || 1
  const indiceUltimoArticulo = paginaActual * Number(articulosPorPagina)
  const indicePrimerArticulo = indiceUltimoArticulo - Number(articulosPorPagina)
  const repuestosPaginados = repuestosFiltrados.slice(indicePrimerArticulo, indiceUltimoArticulo)

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value)
    setPaginaActual(1)
  }

  const handleFiltroEstadoChange = (estado) => {
    setFiltroEstado(estado)
    setPaginaActual(1)
  }

  const exportarCSV = () => {
    if (planTaller === 1) {
      alert('La exportación de datos está disponible únicamente para el Plan Empresas.')
      return
    }

    const headers = ['Nombre', 'Modelo', 'Anio', 'Compatibilidades', 'Stock Actual', 'Stock Minimo', 'Precio']
    const filas = repuestosFiltrados.map(r => [
      `"${(r.nombre || '').replace(/"/g, '""')}"`,
      `"${(r.modelo || '').replace(/"/g, '""')}"`,
      r.anio || '',
      `"${(r.compatibilidades || '').replace(/"/g, '""')}"`,
      r.stock_actual,
      r.stock_minimo,
      r.precio
    ])

    const csvContent = "\uFEFF" + [headers.join(','), ...filas.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'inventario_sigma.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalRepuestos = repuestos.length
  const alertasStock = repuestos.filter(r => r.stock_actual <= r.stock_minimo).length
  const valorTotalInventario = repuestos.reduce((acc, r) => acc + (Number(r.precio) * Number(r.stock_actual)), 0)

  return (
    <div className="portal-shell portal-layout">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0 transition-colors duration-300"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-300/20 dark:bg-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0 transition-colors duration-300"></div>

      <Sidebar className="relative z-10" />
      
      <main className="portal-main">
        
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="portal-title">Repuestos y stock</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium transition-colors">Control corporativo de inventario, existencias y compatibilidades de taller.</p>
          </div>
          <div className="flex items-center gap-3">
            {!bloqueado && repuestos.length > 0 && planTaller > 1 && (
              <button
                onClick={exportarCSV}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all text-sm font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                Exportar CSV (Plan Empresas)
              </button>
            )}

            {/* BOTÓN NUEVO REPUESTO: Visible para Administradores de Taller y Superadmins */}
            {!bloqueado && esAdmin && (
              <button
                onClick={() => setModalAbierto(true)}
                className="bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-black/20 text-white text-sm font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nuevo repuesto
              </button>
            )}
          </div>
        </div>

        {cargando && (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg border border-blue-100 dark:border-blue-500/20 shadow-sm transition-colors">
            <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Cargando inventario...
          </div>
        )}

        {bloqueado && (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center max-w-md mx-auto mt-10 shadow-sm transition-colors">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 transition-colors">
              <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-white mb-2 transition-colors">Módulo no contratado</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium transition-colors">
              Tu taller no tiene contratado el módulo de Inventario. Contáctanos para habilitarlo.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg px-4 py-3 mb-6 shadow-sm transition-colors">
            {error}
          </div>
        )}

        {!cargando && !bloqueado && !error && (
          <>
            {/* TARJETAS KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-4 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Catálogo</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalRepuestos}</p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-4 transition-colors">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${alertasStock > 0 ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alertas de Stock</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{alertasStock}</p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-4 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Valor Inventario</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{formatearPrecio(valorTotalInventario)}</p>
                </div>
              </div>
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={handleBusquedaChange}
                  placeholder="Buscar por repuesto, modelo o compatibilidad..."
                  className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium shadow-sm transition-colors"
                />
              </div>

              <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <button
                  onClick={() => handleFiltroEstadoChange('todos')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filtroEstado === 'todos' ? 'bg-blue-600 text-white shadow-md shadow-black/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  Todos ({repuestos.length})
                </button>
                <button
                  onClick={() => handleFiltroEstadoChange('optimo')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filtroEstado === 'optimo' ? 'bg-blue-600 text-white shadow-md shadow-black/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  Óptimos
                </button>
                <button
                  onClick={() => handleFiltroEstadoChange('alerta')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${filtroEstado === 'alerta' ? 'bg-blue-600 text-white shadow-md shadow-black/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  Bajo Stock ({alertasStock})
                </button>
              </div>
            </div>

            {/* TABLA PRINCIPAL */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-[0_4px_30px_rgb(0,0,0,0.03)] transition-colors flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
                      <th className="px-6 py-4 font-bold">Repuesto</th>
                      <th className="px-4 py-4 font-bold">Modelo / Año</th>
                      <th className="px-4 py-4 font-bold">Compatibilidades</th>
                      <th className="px-4 py-4 font-bold">Stock</th>
                      <th className="px-4 py-4 font-bold">Mínimo</th>
                      <th className="px-4 py-4 font-bold">Precio</th>
                      <th className="px-4 py-4 font-bold">Estado</th>
                      <th className="px-6 py-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {repuestosPaginados.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-16 text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <Filter className="w-5 h-5" />
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 font-bold text-base">No se encontraron resultados</p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Intenta ajustando los filtros de búsqueda o el criterio seleccionado.</p>
                        </td>
                      </tr>
                    )}
                    {repuestosPaginados.map((r) => {
                      const bajoStock = r.stock_actual <= r.stock_minimo
                      return (
                        <tr key={r.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{r.nombre}</td>
                          <td className="px-4 py-4 text-slate-500 dark:text-slate-400 font-medium">
                            {r.modelo || 'N/A'} {r.anio ? `(${r.anio})` : ''}
                          </td>
                          <td className="px-4 py-4 text-slate-500 dark:text-slate-400 font-medium max-w-xs truncate" title={r.compatibilidades}>
                            {r.compatibilidades || 'Universal / Sin especificar'}
                          </td>
                          <td className="px-4 py-4 font-extrabold text-slate-700 dark:text-slate-200">{r.stock_actual}</td>
                          <td className="px-4 py-4 text-slate-400 dark:text-slate-500 font-medium">{r.stock_minimo}</td>
                          <td className="px-4 py-4 font-bold text-slate-800 dark:text-white">{formatearPrecio(r.precio)}</td>
                          <td className="px-4 py-4">
                            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${bajoStock ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-200/50 dark:border-red-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${bajoStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                              {bajoStock ? 'Bajo stock' : 'Óptimo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            {/* BOTÓN AÑADIR STOCK: Visible para Administradores */}
                            {esAdmin && (
                              <button
                                onClick={() => {
                                  setRepuestoSeleccionado(r)
                                  setCantidadAgregada(1)
                                  setErrorStock('')
                                  setModalStockAbierto(true)
                                }}
                                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                title="Añadir stock"
                              >
                                <PackagePlus className="w-3.5 h-3.5" /> Stock
                              </button>
                            )}

                            {/* BOTÓN ELIMINAR: Visible para Administradores */}
                            {esAdmin && (
                              <button
                                onClick={() => setRepuestoAEliminar(r)}
                                className="bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold p-2 rounded-xl transition-colors cursor-pointer"
                                title="Eliminar repuesto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* BARRA DE PAGINACIÓN */}
              {repuestosFiltrados.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50 dark:bg-slate-800/10">
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Mostrar:</span>
                    <select
                      value={articulosPorPagina}
                      onChange={(e) => {
                        setArticulosPorPagina(Number(e.target.value))
                        setPaginaActual(1)
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-xs font-medium text-slate-400">
                      ({indicePrimerArticulo + 1}-{Math.min(indiceUltimoArticulo, repuestosFiltrados.length)} de {repuestosFiltrados.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">
                      Página {paginaActual} de {totalPaginas}
                    </span>
                    <button
                      onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                      disabled={paginaActual === 1}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                      title="Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={paginaActual === totalPaginas}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                      title="Siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* MODAL NUEVO REPUESTO: Visible para Administradores */}
        {modalAbierto && esAdmin && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center px-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-8 shadow-2xl transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-xl text-slate-800 dark:text-white tracking-tight">Nuevo repuesto</h2>
                <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Nombre del repuesto</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Pastillas de freno delanteras"
                    required
                    className="portal-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Modelo</label>
                    <input
                      name="modelo"
                      value={form.modelo}
                      onChange={handleChange}
                      placeholder="Ej. Hilux / Spark"
                      className="portal-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Año</label>
                    <input
                      name="anio"
                      type="number"
                      value={form.anio}
                      onChange={handleChange}
                      placeholder="Ej. 2020"
                      className="portal-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Compatibilidades</label>
                  <input
                    name="compatibilidades"
                    value={form.compatibilidades}
                    onChange={handleChange}
                    placeholder="Ej. Toyota Hilux 2.4, Fortuner (2016-2022)"
                    className="portal-input"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Stock actual</label>
                    <input
                      name="stock_actual"
                      type="number"
                      min="0"
                      value={form.stock_actual}
                      onChange={handleChange}
                      required
                      className="portal-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Stock mínimo</label>
                    <input
                      name="stock_minimo"
                      type="number"
                      min="0"
                      value={form.stock_minimo}
                      onChange={handleChange}
                      required
                      className="portal-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Precio ($)</label>
                    <input
                      name="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.precio}
                      onChange={handleChange}
                      required
                      className="portal-input"
                    />
                  </div>
                </div>

                {errorForm && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorForm}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="portal-btn portal-btn-primary w-full"
                  >
                    {guardando ? 'Guardando...' : 'Crear repuesto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL AÑADIR STOCK: Visible para Administradores */}
        {modalStockAbierto && repuestoSeleccionado && esAdmin && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center px-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm p-8 shadow-2xl transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-lg text-slate-800 dark:text-white">Añadir stock</h2>
                <button onClick={() => setModalStockAbierto(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
                Repuesto: <strong className="text-slate-700 dark:text-slate-200">{repuestoSeleccionado.nombre}</strong> (Actual: {repuestoSeleccionado.stock_actual})
              </p>

              <form onSubmit={handleSumarStock} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Cantidad a sumar</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadAgregada}
                    onChange={(e) => setCantidadAgregada(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {errorStock && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl px-3 py-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorStock}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="portal-btn portal-btn-primary w-full"
                  >
                    {guardando ? 'Actualizando...' : 'Confirmar ingreso'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMAR ELIMINACIÓN: Visible para Administradores */}
        {repuestoAEliminar && esAdmin && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center px-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm p-8 shadow-2xl text-center transition-colors">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 border-8 border-red-50 dark:border-red-500/10 flex items-center justify-center mx-auto mb-5 transition-colors">
                <Trash2 className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="font-extrabold text-xl text-slate-800 dark:text-white mb-2">¿Eliminar repuesto?</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-bold mb-1">
                {repuestoAEliminar.nombre}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-8">
                Esta acción eliminará el repuesto permanentemente del inventario.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setRepuestoAEliminar(null)}
                  className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminarRepuesto}
                  disabled={eliminando}
                  className="flex-1 bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60 cursor-pointer"
                >
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Inventario



