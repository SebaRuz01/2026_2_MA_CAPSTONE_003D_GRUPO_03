import { Trash2 } from 'lucide-react'

function EliminarOrdenModal({ orden, visible, eliminando, onCancelar, onConfirmar }) {
  if (!visible || !orden) return null

  return (
    <div className="portal-modal-overlay">
      <div className="portal-modal text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 border-8 border-red-50 dark:border-red-500/10 flex items-center justify-center mx-auto mb-5"><Trash2 className="w-8 h-8 text-red-500 dark:text-red-400" /></div>
        <h2 className="font-extrabold text-xl text-slate-800 dark:text-white mb-2">¿Eliminar esta orden?</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">OT-{orden.id.toString().padStart(3, '0')} — {orden.equipo}</p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-8">Esta acción es permanente y no se puede deshacer.</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancelar} className="portal-btn portal-btn-secondary flex-1">Cancelar</button>
          <button type="button" onClick={onConfirmar} disabled={eliminando} className="portal-btn portal-btn-danger flex-1">{eliminando ? 'Eliminando...' : 'Sí, eliminar'}</button>
        </div>
      </div>
    </div>
  )
}

export default EliminarOrdenModal
