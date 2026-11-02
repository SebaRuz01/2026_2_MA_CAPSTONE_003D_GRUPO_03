import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import logoIcono from '../assets/logo.png'
import { LogOut, Plus, Search, Sun, Moon, ChevronLeft, ChevronRight, ShieldAlert, Building2, CheckCircle2, Layers, SlidersHorizontal, Award } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function SuperAdmin() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [talleres, setTalleres] = useState([])
  const [modulos, setModulos] = useState([])
  const [contratados, setContratados] = useState([])
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardandoModulo, setGuardandoModulo] = useState(null)
  
  // PAGINACIÓN Y FILTROS AVANZADOS
  const [pagina, setPagina] = useState(1)
  const [talleresPorPagina, setTalleresPorPagina] = useState(8)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos') // 'todos' | 'activo' | 'prueba' | 'suspendido'

  const cargarTodo = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    Promise.all([
      api.get('/talleres/'),
      api.get('/modulos/'),
      api.get('/modulos-contratados/'),
    ])
      .then(([t, m, mc]) => {
        setTalleres(t.data)
        setModulos(m.data)
        setContratados(mc.data)
        if (t.data.length > 0 && !tallerSeleccionado) {
          setTallerSeleccionado(t.data[0].id)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          navigate('/login')
        }
      })
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  const modulosDelTaller = (tallerId) =>
    contratados.filter((c) => c.taller === tallerId)

  const toggleModulo = async (modulo) => {
    const existente = contratados.find(
      (c) => c.taller === tallerSeleccionado && c.modulo === modulo.id
    )
    setGuardandoModulo(modulo.id)
    try {
      if (existente) {
        const res = await api.patch(`/modulos-contratados/${existente.id}/`, {
          activo: !existente.activo,
        })
        setContratados((prev) =>
          prev.map((c) => (c.id === existente.id ? res.data : c))
        )
      } else {
        const res = await api.post('/modulos-contratados/', {
          taller: tallerSeleccionado,
          modulo: modulo.id,
          activo: true,
        })
        setContratados((prev) => [...prev, res.data])
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login')
      }
    } finally {
      setGuardandoModulo(null)
    }
  }

  const toggleSuspension = async (tallerObj, e) => {
    e.stopPropagation()
    try {
      const nuevoEstado = tallerObj.estado === 'suspendido' ? 'activo' : 'suspendido'
      const res = await api.patch(`/talleres/${tallerObj.id}/`, { estado: nuevoEstado })
      setTalleres((prev) => prev.map((t) => (t.id === tallerObj.id ? res.data : t)))
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login')
      }
    }
  }

  const taller = talleres.find((t) => t.id === tallerSeleccionado)

  // FILTRADO INTELIGENTE
  const talleresFiltrados = talleres.filter((t) => {
    const coincideTexto = t.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) || 
                          (t.rubro && t.rubro.toLowerCase().includes(busqueda.toLowerCase()))
    
    if (filtroEstado === 'todos') return coincideTexto
    return coincideTexto && t.estado === filtroEstado
  })

  const totalPaginas = Math.max(1, Math.ceil(talleresFiltrados.length / Number(talleresPorPagina)))
  const indiceUltimo = pagina * Number(talleresPorPagina)
  const indicePrimero = indiceUltimo - Number(talleresPorPagina)
  const talleresVisibles = talleresFiltrados.slice(indicePrimero, indiceUltimo)

  // ESTADÍSTICAS GLOBALES (KPIs)
  const totalTalleres = talleres.length
  const talleresActivosCount = talleres.filter(t => t.estado === 'activo').length
  const totalModulosActivosGlobal = contratados.filter(c => c.activo).length

  return (
    <div className="portal-shell portal-layout">
      
      {/* Fondo Decorativo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-300/20 dark:bg-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0"></div>

      {/* SIDEBAR SUPER-ADMIN */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800/60 min-h-screen p-6 hidden lg:flex flex-col bg-white/90 dark:bg-[#101513]/95 backdrop-blur-xl z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors">
        <Link to="/" className="flex items-center gap-3 mb-2 pl-2">
          <img src={logoIcono} alt="SIGMA" className="h-8 w-auto" />
          <span className="font-extrabold text-xl text-slate-800 dark:text-white tracking-tight">SIGMA</span>
        </Link>
        
        <div className="text-[10px] uppercase tracking-widest text-red-500 font-extrabold mb-10 pl-2">
          Panel de Super Administrador
        </div>

        <nav className="space-y-1.5 text-sm font-medium flex-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-sm">
            Talleres y Módulos
          </div>
        </nav>

        {/* SECCIÓN INFERIOR CON MODO OSCURO Y CERRAR SESIÓN */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
          
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm font-semibold">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-400 transition-colors" />
              ) : (
                <Sun className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
              )}
              <span>{theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </div>
            
            <div className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-semibold px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 group cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="portal-main">
        
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Gestión Global de Clientes</div>
            <h1 className="portal-title">Panel de Control General</h1>
          </div>
          <Link
            to="/super-admin/nuevo-taller"
            className="bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-black/20 text-white text-sm font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nuevo taller
          </Link>
        </div>

        {cargando && (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg border border-blue-100 dark:border-blue-500/20 shadow-sm max-w-sm">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Cargando talleres y licencias...
          </div>
        )}

        {!cargando && (
          <>
            {/* TARJETAS KPI SUPERIORES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-4 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Talleres</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalTalleres}</p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-4 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Talleres Activos</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{talleresActivosCount}</p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-4 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Licencias Activas</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalModulosActivosGlobal}</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
              
              {/* TABLA DE TALLERES */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-[0_4px_30px_rgb(0,0,0,0.03)] transition-colors flex flex-col">
                
                {/* Barra superior de búsqueda y pestañas rápidas */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4 flex-wrap bg-white/50 dark:bg-transparent">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar taller por nombre o rubro..."
                      value={busqueda}
                      onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-medium transition-colors"
                    />
                  </div>

                  {/* Filtros de Estado */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                    {['todos', 'activo', 'prueba', 'suspendido'].map((est) => (
                      <button
                        key={est}
                        onClick={() => { setFiltroEstado(est); setPagina(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          filtroEstado === est 
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                      >
                        {est.charAt(0).toUpperCase() + est.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60">
                        <th className="px-6 py-4 font-bold">Taller</th>
                        <th className="px-4 py-4 font-bold">Plan</th>
                        <th className="px-4 py-4 font-bold">Rubro</th>
                        <th className="px-4 py-4 font-bold text-right">Estado / Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {talleresVisibles.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 font-bold text-base">No se encontraron talleres</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Intenta ajustando el filtro de búsqueda o estado.</p>
                          </td>
                        </tr>
                      )}
                      {talleresVisibles.map((t) => {
                        const seleccionado = tallerSeleccionado === t.id
                        return (
                          <tr
                            key={t.id}
                            onClick={() => setTallerSeleccionado(t.id)}
                            className={`cursor-pointer transition-colors ${
                              seleccionado 
                                ? 'bg-blue-50/70 dark:bg-blue-900/30 border-l-4 border-blue-600' 
                                : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{t.nombre_comercial}</td>
                            
                            {/* COLUMNA PLAN */}
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                                t.plan_id === 2 
                                  ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20' 
                                  : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                              }`}>
                                <Award className="w-3.5 h-3.5" />
                                {t.plan_id === 2 ? 'Plan Empresas' : 'Plan Profesional'}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-slate-600 dark:text-slate-400 capitalize font-medium">{t.rubro}</td>
                            
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                                  t.estado === 'activo' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                                  t.estado === 'prueba' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                                  'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                }`}>
                                  {t.estado}
                                </span>
                                
                                <Link
                                  to={`/super-admin/talleres/${t.id}/editar`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-1.5 rounded-xl transition-colors border border-blue-200 dark:border-blue-500/30"
                                >
                                  Editar
                                </Link>
                                
                                <button
                                  onClick={(e) => toggleSuspension(t, e)}
                                  className={`text-xs font-bold transition-colors px-3 py-1.5 rounded-xl border ${
                                    t.estado === 'suspendido' 
                                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' 
                                      : 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                                  }`}
                                >
                                  {t.estado === 'suspendido' ? 'Reactivar' : 'Suspender'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINACIÓN PROFESIONAL */}
                {talleresFiltrados.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/20 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <span>Mostrar:</span>
                      <select
                        value={talleresPorPagina}
                        onChange={(e) => {
                          setTalleresPorPagina(Number(e.target.value))
                          setPagina(1)
                        }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value={4}>4</option>
                        <option value={8}>8</option>
                        <option value={16}>16</option>
                        <option value={32}>32</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Página {pagina} de {totalPaginas}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPagina((p) => Math.max(1, p - 1))}
                          disabled={pagina === 1}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                          disabled={pagina === totalPaginas}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* GESTOR DE MÓDULOS DEL TALLER SELECCIONADO */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 shadow-[0_4px_30px_rgb(0,0,0,0.03)] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Módulos Contratados
                  </div>
                  {taller && (
                    <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-500/20">
                      ID: {taller.id}
                    </span>
                  )}
                </div>
                
                <div className="font-extrabold text-xl text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  {taller?.nombre_comercial || 'Selecciona un taller'}
                </div>

                {!taller ? (
                  <p className="text-slate-400 text-sm text-center py-10 font-medium">Haz clic en un taller de la lista para gestionar sus accesos y licencias.</p>
                ) : (
                  <div className="space-y-3.5">
                    {modulos.map((m) => {
                      const contrato = contratados.find(
                        (c) => c.taller === tallerSeleccionado && c.modulo === m.id
                      )
                      const activo = contrato?.activo || false
                      return (
                        <div key={m.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 transition-colors">
                          <div className="pr-4">
                            <div className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                              {m.nombre}
                              {activo && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.descripcion}</div>
                          </div>
                          
                          <button
                            onClick={() => toggleModulo(m)}
                            disabled={guardandoModulo === m.id}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${
                              activo ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            } disabled:opacity-50 cursor-pointer`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                                activo ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default SuperAdmin


