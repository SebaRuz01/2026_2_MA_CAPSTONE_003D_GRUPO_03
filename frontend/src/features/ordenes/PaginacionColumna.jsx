import { ChevronLeft, ChevronRight } from 'lucide-react'

function PaginacionColumna({ titulo, pagina, total, onAnterior, onSiguiente }) {
  if (total <= 1) return null

  return (
    <div className="flex items-center justify-between gap-2 pt-3 mt-1 border-t border-slate-200/80 dark:border-slate-700/60">
      <button type="button" onClick={onAnterior} disabled={pagina === 1} className="w-8 h-8 grid place-items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed hover:border-blue-400 transition-colors" aria-label={`Página anterior de ${titulo}`}><ChevronLeft className="w-4 h-4" /></button>
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{pagina} / {total}</span>
      <button type="button" onClick={onSiguiente} disabled={pagina === total} className="w-8 h-8 grid place-items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed hover:border-blue-400 transition-colors" aria-label={`Página siguiente de ${titulo}`}><ChevronRight className="w-4 h-4" /></button>
    </div>
  )
}

export default PaginacionColumna
