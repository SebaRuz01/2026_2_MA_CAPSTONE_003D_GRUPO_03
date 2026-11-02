import { NavLink, Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import logoIcono from '../assets/logo.png'
import { LayoutDashboard, ClipboardList, Wrench, Package, BarChart3, History, LogOut, Sun, Moon, ShieldAlert } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const links = [
  { to: '/panel', label: 'Panel general', icon: LayoutDashboard },
  { to: '/ordenes', label: 'Órdenes', icon: ClipboardList },
  { to: '/tecnicos', label: 'Técnicos', icon: Wrench },
  { to: '/inventario', label: 'Inventario', icon: Package },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/historial', label: 'Historial', icon: History },
]

function Sidebar({ className = '' }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const token = localStorage.getItem('access_token')
  
  let username = 'Usuario'
  let rol = ''

  if (token) {
    try {
      const decoded = jwtDecode(token)
      username = decoded.username || 'Usuario'
      rol = decoded.rol || ''
    } catch {
      // token inválido
    }
  }

  const esAdminTaller = rol === 'admin_taller'

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  return (
    <aside className={`w-64 shrink-0 border-r border-slate-200 dark:border-slate-800/60 min-h-screen p-6 hidden lg:flex flex-col bg-white/90 dark:bg-[#101513]/95 backdrop-blur-xl z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300 ${className}`}>
      
      {/* LOGO */}
      <Link to="/" className="flex items-center gap-3 mb-10 pl-2 group">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
          <img src={logoIcono} alt="SIGMA" className="h-6 w-auto" />
        </div>
        <span className="font-extrabold text-xl text-slate-800 dark:text-white tracking-tight transition-colors">SIGMA</span>
      </Link>

      {/* NAVEGACIÓN */}
      <nav className="space-y-1.5 text-sm font-medium flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-black/20 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* ENLACE CONDICIONAL: SÓLO PARA EL ADMIN DEL TALLER */}
        {esAdminTaller && (
          <NavLink
            to="/ordenes-sin-asignar"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ShieldAlert className={`w-5 h-5 ${isActive ? 'text-white' : 'text-amber-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span>Sin asignar</span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      {/* SECCIÓN INFERIOR */}
      <div className="mt-auto pt-6 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors space-y-4">
        
        {/* BOTÓN MODO OSCURO */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-200 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3 text-sm font-semibold">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-400 transition-colors" />
            ) : (
              <Sun className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            )}
            <span>{theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}</span>
          </div>
          
          <div className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-black/20 shrink-0">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-sm overflow-hidden">
            <div className="font-bold text-slate-800 dark:text-slate-200 truncate transition-colors">{username}</div>
            <div className="text-slate-400 dark:text-slate-500 text-xs font-semibold capitalize truncate transition-colors">
              {rol.replace('_', ' ')}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-semibold px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 group cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
