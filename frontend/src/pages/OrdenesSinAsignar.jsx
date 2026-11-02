import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import { AlertCircle, UserCheck, Wrench, ShieldAlert } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'

function OrdenesSinAsignar() {
  const [ordenes, setOrdenes] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [asignaciones, setAsignaciones] = useState({}) // { ordenId: tecnicoId }
  const [guardandoId, setGuardandoId] = useState(null)
  const [planTaller, setPlanTaller] = useState(1)
  
  const navigate = useNavigate()

  // Validar rol de Admin de Taller
  const token = localStorage.getItem('access_token')
  let rolUsuario = ''
  if (token) {
    try {
      rolUsuario = jwtDecode(token).rol
    } catch {
      rolUsuario = ''
    }
  }
  const esAdminTaller = rolUsuario === 'admin_taller'

  useEffect(() => {
    if (!esAdminTaller) {
      navigate('/ordenes')
      return
    }

    const tokenLocal = localStorage.getItem('access_token')
    let tallerIdLocal = null
    if (tokenLocal) {
      try {
        tallerIdLocal = jwtDecode(tokenLocal).taller_id
      } catch (e) {
        // Error silencioso
      }
    }

    const peticiones = [
      api.get('/ordenes/'),
      api.get('/tecnicos/')
    ]

    if (tallerIdLocal) {
      peticiones.push(api.get(`/talleres/${tallerIdLocal}/`))
    }

    Promise.all(peticiones)
      .then((res) => {
        const resOrdenes = res[0]
        const resTecnicos = res[1]
        
        if (res[2]) {
          setPlanTaller(res[2].data.plan_id || 1)
        }

        const sinAsignar = resOrdenes.data.filter(
          (o) => !o.tecnico && o.estado?.toLowerCase() !== 'entregado'
        )
        setOrdenes(sinAsignar)
        setTecnicos(resTecnicos.data)
      })
      .catch(() => setError('No se pudieron cargar los datos.'))
      .finally(() => setCargando(false))
  }, [esAdminTaller, navigate])

  const handleSelectChange = (ordenId, tecnicoId) => {
    setAsignaciones({ ...asignaciones, [ordenId]: tecnicoId })
  }

  const asignarTecnico = async (ordenId) => {
    const tecnicoId = asignaciones[ordenId]
    if (!tecnicoId) {
      alert('Por favor selecciona un técnico de la lista.')
      return
    }

    setGuardandoId(ordenId)
    try {
      await api.patch(`/ordenes/${ordenId}/`, { tecnico: tecnicoId })
      setOrdenes((prev) => prev.filter((o) => o.id !== ordenId))
      alert('¡Técnico asignado exitosamente!')
    } catch (err) {
      const mensajeError = err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'No se pudo asignar el técnico.'
      alert(mensajeError)
    } finally {
      setGuardandoId(null)
    }
  }

  // Si el plan es Profesional (1), solo permitimos elegir entre los primeros 5 técnicos más antiguos.
  const tecnicosDisponibles = tecnicos.filter((t, index) => {
    if (planTaller === 1) {
      return index < 5
    }
    return true
  })

  if (!esAdminTaller) return null

  return (
    <div className="portal-shell portal-layout">
      <Sidebar />
      <main className="portal-main">
        
        <div className="mb-8">
          <h1 className="portal-title">Órdenes sin asignar</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Asigna técnicos responsables a los vehículos ingresados recientemente.</p>
        </div>

        {cargando && (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Cargando órdenes pendientes...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 text-sm font-medium rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {!cargando && ordenes.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
            <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">¡Todo al día!</h3>
            <p className="text-slate-400 text-sm mt-1">No hay órdenes de trabajo pendientes de asignación de técnico.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordenes.map((o) => (
            <div key={o.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black px-2.5 py-1 rounded-md">
                    OT-{o.id.toString().padStart(3, '0')}
                  </span>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Estado: {o.estado}</span>
                </div>
                
                <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">{o.equipo}</h3>
                {o.vehiculo_patente && (
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Patente: {o.vehiculo_patente}</p>
                )}
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2">{o.descripcion_problema || 'Sin descripción'}</p>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 text-xs space-y-1">
                  <p className="text-slate-600 dark:text-slate-300"><strong>Cliente:</strong> {o.cliente_nombre}</p>
                  <p className="text-slate-600 dark:text-slate-300"><strong>Código Seguimiento:</strong> <span className="font-mono font-bold">{o.codigo_seguimiento}</span></p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Seleccionar técnico {planTaller === 1 && '(Máx. 5 habilitados)'}:
                  </label>
                  <select
                    value={asignaciones[o.id] || ''}
                    onChange={(e) => handleSelectChange(o.id, e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccione un técnico...</option>
                    {tecnicosDisponibles.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre} {t.apellido || ''}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => asignarTecnico(o.id)}
                  disabled={guardandoId === o.id}
                  className="portal-btn portal-btn-primary w-full"
                >
                  <UserCheck className="w-4 h-4" />
                  {guardandoId === o.id ? 'Asignando...' : 'Asignar técnico'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}

export default OrdenesSinAsignar



