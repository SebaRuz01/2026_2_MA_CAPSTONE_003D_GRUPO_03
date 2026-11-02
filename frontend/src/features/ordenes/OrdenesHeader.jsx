import { Plus, Search } from 'lucide-react'

function OrdenesHeader({ puedeMover, busqueda, onBusquedaChange, onLimpiar, puedeCrear, onCrear }) {
  return (
    <div className="portal-page-header">
      <div>
        <h1 className="portal-title">Órdenes de trabajo</h1>
        <p className="portal-subtitle">
          {puedeMover ? 'Gestiona y mueve las órdenes arrastrando las tarjetas.' : 'Visualiza las órdenes y gestiona los repuestos del vehículo.'}
        </p>
      </div>

      <div className="portal-toolbar">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(event) => onBusquedaChange(event.target.value)}
            placeholder="Buscar por código (Ej: OT-01)..."
            className="portal-search-input"
          />
          {busqueda && <button type="button" onClick={onLimpiar} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-200">Limpiar</button>}
        </div>

        {puedeCrear && <button type="button" onClick={onCrear} className="portal-btn portal-btn-primary"><Plus />Nueva orden</button>}
      </div>
    </div>
  )
}

export default OrdenesHeader
