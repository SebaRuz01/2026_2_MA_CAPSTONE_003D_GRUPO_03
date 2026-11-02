import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import { Lock, X, Plus, AlertCircle, Wrench, Mail, Phone, Car, Trash2 } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'

// Validación de teléfono móvil de Chile (+569XXXXXXXX)
const validarTelefonoChile = (tel) => {
  if (!tel) return true
  const regexTel = /^(\+56)?9[0-9]{8}$/
  return regexTel.test(tel.replace(/\s+/g, ''))
}

// Validación de correo electrónico
const validarEmail = (email) => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regexEmail.test(email)
}

function Tecnicos() {
  const [tecnicos, setTecnicos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [bloqueado, setBloqueado] = useState(false)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  
  const [planTaller, setPlanTaller] = useState(1)
  const [tecnicoAEliminar, setTecnicoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [esAdmin, setEsAdmin] = useState(true) // Control de rol

  const [form, setForm] = useState({
    username: '',
    password: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '+569',
    especialidad: '',
  })

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
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
      }

      const resTecnicos = await api.get('/tecnicos/')
      setTecnicos(resTecnicos.data)
    } catch (err) {
      if (err.response?.status === 403) {
        setBloqueado(true)
      } else {
        setError('No se pudieron cargar los técnicos.')
      }
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!esAdmin) return
    setErrorForm('')

    if (form.email && !validarEmail(form.email)) {
      setErrorForm('El correo electrónico no tiene un formato válido.')
      return
    }

    if (form.telefono && !validarTelefonoChile(form.telefono)) {
      setErrorForm('El teléfono debe ser un celular válido de Chile (+569XXXXXXXX).')
      return
    }

    if (form.password.length < 8) {
      setErrorForm('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setGuardando(true)
    try {
      await api.post('/tecnicos/', form)
      setModalAbierto(false)
      setForm({ username: '', password: '', nombre: '', apellido: '', email: '', telefono: '+569', especialidad: '' })
      cargarDatos()
    } catch (err) {
      if (err.response?.data?.non_field_errors || err.response?.data?.detail) {
        setErrorForm(err.response.data.non_field_errors?.[0] || err.response.data.detail)
      } else if (err.response?.data?.username) {
        setErrorForm('Ese nombre de usuario ya existe, elige otro.')
      } else {
        setErrorForm('Has alcanzado el límite de 5 técnicos permitidos en tu Plan Profesional.')
      }
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminarTecnico = async () => {
    if (!esAdmin || !tecnicoAEliminar) return
    setEliminando(true)
    try {
      await api.delete(`/tecnicos/${tecnicoAEliminar.id}/`)
      setTecnicos((prev) => prev.filter((t) => t.id !== tecnicoAEliminar.id))
      setTecnicoAEliminar(null)
    } catch {
      alert('No se pudo eliminar el técnico. Es posible que tenga órdenes activas asociadas.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="portal-shell portal-layout">
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-300/20 dark:bg-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px] pointer-events-none z-0"></div>

      <Sidebar className="relative z-10" />
      
      <main className="portal-main">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Recursos Humanos</div>
            <div className="flex items-center gap-3">
              <h1 className="portal-title">Equipo Técnico</h1>
              {!bloqueado && !cargando && (
                <span className="text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
                  {tecnicos.length} {tecnicos.length === 1 ? 'registrado' : 'registrados'} {planTaller === 1 && '(Máx. Plan Profesional: 5)'}
                </span>
              )}
            </div>
          </div>
          {/* BOTÓN AGREGAR TÉCNICO: Visible para Administradores de Taller y Superadmins */}
          {!bloqueado && esAdmin && (
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-black/20 text-white text-sm font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Agregar técnico
            </button>
          )}
        </div>

        {cargando && (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg border border-blue-100 dark:border-blue-500/20 shadow-sm max-w-sm">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Cargando equipo técnico...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg px-5 py-4 mb-6 shadow-sm max-w-md">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {bloqueado && (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center max-w-lg mx-auto mt-16 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="font-extrabold text-2xl text-slate-800 dark:text-white mb-3">Módulo no contratado</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium leading-relaxed">
              Tu taller no tiene contratado el módulo de técnicos. Actívalo desde tu plan para asignar personal y medir su rendimiento operativo.
            </p>
          </div>
        )}

        {!cargando && !bloqueado && !error && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tecnicos.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 text-center py-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-bold text-base">No hay técnicos registrados todavía</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 mb-4">Comienza agregando al primer especialista al equipo de trabajo.</p>
                {esAdmin && (
                  <button onClick={() => setModalAbierto(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer">
                    Agregar tu primer técnico
                  </button>
                )}
              </div>
            )}
            
            {tecnicos.map((t, index) => {
              const estaBloqueadoPorPlan = planTaller === 1 && index >= 5

              return (
                <div 
                  key={t.id} 
                  className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl p-6 transition-all group flex flex-col justify-between relative overflow-hidden ${
                    estaBloqueadoPorPlan 
                      ? 'border-amber-400/60 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm' 
                      : 'border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500/50'
                  }`}
                >
                  
                  {estaBloqueadoPorPlan && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-sm flex items-center gap-1 z-10">
                      <Lock className="w-3 h-3" /> Bloqueado (Excede Plan)
                    </div>
                  )}

                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-black/20 ${estaBloqueadoPorPlan ? 'grayscale opacity-65' : ''}`}>
                            {t.nombre?.slice(0, 1).toUpperCase()}{t.apellido?.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{t.nombre} {t.apellido}</h3>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full mt-1.5 border border-blue-100 dark:border-blue-500/20">
                              <Wrench className="w-3 h-3" /> {t.especialidad || 'Mecánico General'}
                            </span>
                          </div>
                        </div>

                        {/* BOTÓN BASURERO ELIMINAR: Visible para Administrador */}
                        {esAdmin && (
                          <button
                            onClick={() => setTecnicoAEliminar(t)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-xl transition-colors cursor-pointer"
                            title="Eliminar técnico"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className={`space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 ${estaBloqueadoPorPlan ? 'opacity-65' : ''}`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate block w-full" title={t.email || ''}>{t.email || 'Sin correo registrado'}</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate block w-full" title={t.telefono || ''}>{t.telefono || 'Sin teléfono registrado'}</span>
                        </div>
                      </div>
                    </div>

                    {estaBloqueadoPorPlan ? (
                      <div className="mt-2 bg-amber-100/80 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 p-4 rounded-lg text-center space-y-3">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-amber-800 dark:text-amber-400">
                          <Lock className="w-4 h-4" /> Técnico inactivo por cambio de plan
                        </div>
                        <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
                          Este técnico supera el límite de 5 activos del Plan Profesional. <strong>Elimínalo</strong> para liberar cupo o vuelve al Plan Empresas.
                        </p>
                        {esAdmin && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => setTecnicoAEliminar(t)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] py-2 px-3 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar técnico
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-blue-500" /> Vehículos asignados
                          </span>
                        </div>
                        
                        {t.vehiculos && t.vehiculos.length > 0 ? (
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                            {t.vehiculos.map((v, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl text-xs border border-slate-100 dark:border-slate-700/50">
                                <span className="font-bold text-slate-800 dark:text-white truncate pr-2">
                                  Cliente: <span className="text-blue-600 dark:text-blue-400">{v.cliente_nombre || 'Sin nombre'}</span>
                                </span>
                                <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono font-bold px-2 py-0.5 rounded-lg text-[10px] shrink-0">
                                  {v.modelo || 'Vehículo'} : {v.patente}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl text-center">
                            Sin vehículos asociados actualmente.
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* MODAL NUEVO TÉCNICO: Protegido */}
        {modalAbierto && esAdmin && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center px-4 z-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-[500px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-extrabold text-xl text-slate-800 dark:text-white">Agregar nuevo técnico</h2>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">🇨🇱 Validación Chile activa</span>
                </div>
                <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Nombre</label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Carlos"
                      required
                      className="portal-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Apellido</label>
                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      placeholder="Ej. Santana"
                      className="portal-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Correo electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="carlos@taller.cl"
                      required
                      className="portal-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Teléfono (Chile)</label>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="+56912345678"
                      required
                      className="portal-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Nombre de usuario</label>
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="csantana"
                      required
                      className="portal-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Contraseña (mín. 8 caracteres)</label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="portal-input"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Especialidad</label>
                  <input
                    name="especialidad"
                    value={form.especialidad}
                    onChange={handleChange}
                    placeholder="Ej. Motor y frenos"
                    className="portal-input"
                  />
                </div>

                {errorForm && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorForm}
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="portal-btn portal-btn-primary w-full"
                  >
                    {guardando ? 'Guardando...' : 'Crear técnico'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tecnicoAEliminar && esAdmin && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center px-4 z-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm p-8 shadow-2xl text-center transition-colors">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 border-8 border-red-50 dark:border-red-500/10 flex items-center justify-center mx-auto mb-5 transition-colors">
                <Trash2 className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="font-extrabold text-xl text-slate-800 dark:text-white mb-2">¿Eliminar este técnico?</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">
                {tecnicoAEliminar.nombre} {tecnicoAEliminar.apellido}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-8">
                Esta acción eliminará el perfil y su acceso al sistema de forma permanente.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setTecnicoAEliminar(null)}
                  className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminarTecnico}
                  disabled={eliminando}
                  className="flex-1 bg-red-500 hover:bg-red-600 transition-colors shadow-md shadow-red-500/20 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60 cursor-pointer"
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

export default Tecnicos



