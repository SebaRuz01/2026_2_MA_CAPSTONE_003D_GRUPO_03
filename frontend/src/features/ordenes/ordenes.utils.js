export const ESTADOS_ORDEN = [
  { key: 'recibido', titulo: 'Recibido', bgHeader: 'bg-slate-100 dark:bg-slate-800/60', textHeader: 'text-slate-600 dark:text-slate-300', borderHeader: 'border-slate-200 dark:border-slate-700/60' },
  { key: 'diagnostico', titulo: 'Diagnóstico', bgHeader: 'bg-blue-50 dark:bg-blue-500/10', textHeader: 'text-blue-600 dark:text-blue-400', borderHeader: 'border-blue-200 dark:border-blue-500/20' },
  { key: 'en_reparacion', titulo: 'En reparación', bgHeader: 'bg-teal-50 dark:bg-teal-500/10', textHeader: 'text-teal-600 dark:text-teal-400', borderHeader: 'border-teal-200 dark:border-teal-500/20' },
  { key: 'listo', titulo: 'Listo para retiro', bgHeader: 'bg-emerald-50 dark:bg-emerald-500/10', textHeader: 'text-emerald-700 dark:text-emerald-400', borderHeader: 'border-emerald-200 dark:border-emerald-500/20' },
]

export const crearPaginasIniciales = () =>
  Object.fromEntries(ESTADOS_ORDEN.map(({ key }) => [key, 1]))

export const validarRutChilenoSimple = (rut) => {
  if (!rut) return false
  return /^\d{7,8}-[0-9K]$/.test(rut.trim().replace(/\./g, '').toUpperCase())
}

export const validarPatenteChilena = (patente) => {
  if (!patente) return false
  const valor = patente.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return /^[A-Z]{4}[0-9]{2}$/.test(valor) || /^[A-Z]{2}[0-9]{4}$/.test(valor) || /^[A-Z]{3}[0-9]{2}$/.test(valor)
}

export const validarTelefonoChile = (telefono) => /^[0-9]{8}$/.test(telefono.trim())

export const formatearFechaCorta = (fecha) => {
  if (!fecha) return null
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return null
  return valor.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
