import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import logoIcono from '../assets/logo.png'
import { ArrowLeft } from 'lucide-react'
import datosChile from '../utils/regiones.json' // <-- IMPORTAMOS EL JSON LOCAL

function EditarTaller() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  
  // ESTADO PARA GUARDAR LAS COMUNAS FILTRADAS
  const [comunasDisponibles, setComunasDisponibles] = useState([])

  useEffect(() => {
    api.get(`/talleres/${id}/`)
      .then((res) => {
        const tallerData = res.data
        setForm(tallerData)
        
        // PRE-CARGAR COMUNAS: Si el taller ya tiene región, cargamos sus comunas
        if (tallerData.comuna_region) {
          const regionData = datosChile.regiones.find(r => r.region === tallerData.comuna_region)
          setComunasDisponibles(regionData ? regionData.comunas : [])
        }
      })
      .finally(() => setCargando(false))
  }, [id])

  const handleChange = (e) => {
    // Nos aseguramos de convertir el plan_id a número entero si es el campo correspondiente
    const value = e.target.name === 'plan_id' ? Number(e.target.value) : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  // MANEJADOR DE REGIÓN INSTANTÁNEO
  const handleRegionChange = (e) => {
    const regionElegida = e.target.value
    
    // Guardamos la región y limpiamos la comuna
    setForm({ ...form, comuna_region: regionElegida, comuna_nombre: '' })
    
    // Buscamos las comunas de esa región
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
      await api.patch(`/talleres/${id}/`, {
        nombre_comercial: form.nombre_comercial,
        rut: form.rut,
        rubro: form.rubro,
        calle: form.calle,
        numero: form.numero,
        comuna_nombre: form.comuna_nombre,
        comuna_region: form.comuna_region,
        estado: form.estado,
        plan_id: form.plan_id, // <-- SE AÑADE EL PLAN ACTUALIZADO
      })
      navigate('/super-admin')
    } catch (err) {
      setError('No se pudo guardar. Revisa los datos.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <div className="portal-shell bg-base-950 text-ink min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!form) {
    return <div className="portal-shell bg-base-950 text-ink min-h-screen flex items-center justify-center">Taller no encontrado.</div>
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
          <h1 className="font-display font-bold text-2xl">Editar taller</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-base-850 border border-base-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">Nombre comercial</label>
            <input
              name="nombre_comercial"
              value={form.nombre_comercial || ''}
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
                value={form.rut || ''}
                onChange={handleChange}
                required
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Estado</label>
              <select
                name="estado"
                value={form.estado || 'prueba'}
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
              value={form.plan_id || 1}
              onChange={handleChange}
              className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand font-bold text-blue-400"
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
              value={form.rubro || ''}
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
                value={form.calle || ''}
                onChange={handleChange}
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Número</label>
              <input
                name="numero"
                value={form.numero || ''}
                onChange={handleChange}
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* SELECTS ALIMENTADOS POR EL JSON LOCAL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1.5">Región</label>
              <select
                value={form.comuna_region || ''}
                onChange={handleRegionChange}
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
                value={form.comuna_nombre || ''}
                onChange={handleChange}
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

          {error && (
            <div className="bg-red-400/10 border border-red-400/30 text-red-400 text-xs rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-brand hover:bg-brand-dark transition-colors text-white font-semibold py-3 rounded-lg disabled:opacity-60 mt-4 cursor-pointer"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditarTaller
