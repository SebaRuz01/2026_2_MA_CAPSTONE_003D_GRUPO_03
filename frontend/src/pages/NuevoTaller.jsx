import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import logoIcono from '../assets/logo.png'
import { ArrowLeft } from 'lucide-react'
import datosChile from '../utils/regiones.json' // <-- IMPORTAMOS EL JSON LOCAL

function NuevoTaller() {
  const navigate = useNavigate()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [comunasDisponibles, setComunasDisponibles] = useState([]) // Solo necesitamos guardar las comunas filtradas

  const [form, setForm] = useState({
    nombre_comercial: '',
    rut: '',
    rubro: 'mecánico',
    calle: '',
    numero: '',
    comuna_nombre: '',
    comuna_region: '',
    estado: 'prueba',
    plan_id: 1, // <-- 1 por defecto (Plan Profesional)
    admin_username: '',
    admin_password: '',
    admin_nombre: '',
    admin_apellido: '',
  })

  const handleChange = (e) => {
    // Si viene del select de plan, asegurarnos de guardarlo como número entero
    const value = e.target.name === 'plan_id' ? Number(e.target.value) : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  // MANEJADOR DE REGIÓN INSTANTÁNEO
  const handleRegionChange = (e) => {
    const regionElegida = e.target.value
    
    // 1. Guardamos la región y limpiamos la comuna
    setForm({ ...form, comuna_region: regionElegida, comuna_nombre: '' })
    
    // 2. Buscamos las comunas de esa región en nuestro JSON local
    if (regionElegida) {
      const regionData = datosChile.regiones.find(r => r.region === regionElegida)
      setComunasDisponibles(regionData ? regionData.comunas : [])
    } else {
      setComunasDisponibles([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await api.post('/talleres/', form)
      navigate('/super-admin')
    } catch (err) {
      if (err.response?.data?.rut) {
        setError('Ese RUT ya está registrado.')
      } else if (err.response?.data?.admin_username) {
        setError('Ese nombre de usuario ya existe, elige otro.')
      } else {
        setError('No se pudo crear el taller. Revisa los datos.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="portal-shell bg-base-950 text-ink min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <Link to="/super-admin" className="flex items-center gap-2 text-muted hover:text-ink text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a talleres clientes
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <img src={logoIcono} alt="SIGMA" className="h-8 w-auto" />
          <h1 className="font-display font-bold text-2xl">Nuevo taller cliente</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-base-850 border border-base-700 rounded-xl p-6 space-y-6">

          <div>
            <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-3">Datos del taller</div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1.5">Nombre comercial</label>
                <input
                  name="nombre_comercial"
                  value={form.nombre_comercial}
                  onChange={handleChange}
                  required
                  className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">RUT</label>
                  <input
                    name="rut"
                    value={form.rut}
                    onChange={handleChange}
                    placeholder="12.345.678-9"
                    required
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Estado</label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                  >
                    <option value="prueba">Prueba</option>
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
              </div>

              {/* SELECCIÓN DE PLAN */}
              <div>
                <label className="text-xs text-muted block mb-1.5">Plan Contratado</label>
                <select
                  name="plan_id"
                  value={form.plan_id}
                  onChange={handleChange}
                  className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                >
                  <option value={1}>Plan Profesional (Gestión y Stock)</option>
                  <option value={2}>Plan Empresas (Incluye IA y Avanzados)</option>
                </select>
              </div>
              {/* FIN SELECCIÓN DE PLAN */}

              <div>
                <label className="text-xs text-muted block mb-1.5">Rubro</label>
                <input
                  name="rubro"
                  value={form.rubro}
                  onChange={handleChange}
                  required
                  className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Calle</label>
                  <input
                    name="calle"
                    value={form.calle}
                    onChange={handleChange}
                    placeholder="Ej: Av. Pajaritos"
                    required
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Número</label>
                  <input
                    name="numero"
                    value={form.numero}
                    onChange={handleChange}
                    placeholder="Ej: 1234"
                    required
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* SELECTS ALIMENTADOS POR EL JSON LOCAL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Región</label>
                  <select
                    value={form.comuna_region}
                    onChange={handleRegionChange}
                    required
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                  >
                    <option value="">Selecciona región...</option>
                    {datosChile.regiones.map(r => (
                      <option key={r.region} value={r.region}>{r.region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Comuna</label>
                  <select
                    name="comuna_nombre"
                    value={form.comuna_nombre}
                    onChange={handleChange}
                    required
                    disabled={!form.comuna_region}
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecciona comuna...</option>
                    {comunasDisponibles.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* FIN SELECTS */}

            </div>
          </div>

          <div className="pt-2 border-t border-base-700">
            <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-3 mt-4">
              Administrador del taller
            </div>
            <p className="text-muted text-xs mb-4">
              Esta persona va a poder iniciar sesión y gestionar el taller desde el día uno.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Nombre</label>
                  <input
                    name="admin_nombre"
                    value={form.admin_nombre}
                    onChange={handleChange}
                    required
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Apellido</label>
                  <input
                    name="admin_apellido"
                    value={form.admin_apellido}
                    onChange={handleChange}
                    className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">Usuario de acceso</label>
                <input
                  name="admin_username"
                  value={form.admin_username}
                  onChange={handleChange}
                  required
                  className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">Contraseña temporal</label>
                <input
                  name="admin_password"
                  type="password"
                  value={form.admin_password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
                <p className="text-muted text-[11px] mt-1">Mínimo 8 caracteres, no puede ser solo numérica.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-400/10 border border-red-400/30 text-red-400 text-xs rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-brand hover:bg-brand-dark transition-colors text-white font-semibold py-3 rounded-lg disabled:opacity-60"
          >
            {guardando ? 'Creando taller...' : 'Crear taller y administrador'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default NuevoTaller
