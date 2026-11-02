import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import logoIcono from '../assets/logo.png'
import { Lock, Eye, EyeOff, ArrowRight, Home, Sun, Moon, CheckCircle } from 'lucide-react'

function ResetPassword() {
  // Capturamos los parámetros de la URL
  const { uid, token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setCargando(true)
    try {
      // Enviamos el uid, token y la nueva clave al backend
      await api.post('/password-reset-confirm/', {
        uid,
        token,
        new_password: password
      })
      setExito(true)
    } catch (err) {
      setError('El enlace es inválido o ya expiró. Por favor, solicita uno nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="portal-shell min-h-screen flex items-center justify-center font-sans text-slate-900 dark:text-slate-100 bg-[#f3f2ee] dark:bg-[#101513] relative overflow-hidden px-4">
      
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-700"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-slate-200/60 dark:border-slate-800">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-5">
              <img src={logoIcono} alt="SIGMA" className="h-8 w-auto" />
            </div>
            <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Crea tu nueva clave</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Ingresa tu nueva contraseña para acceder</p>
          </div>

          {exito ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">¡Contraseña actualizada!</h3>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">Ya puedes iniciar sesión con tu nueva contraseña.</p>
              <Link to="/" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg flex justify-center text-center">
                Ir al Inicio de Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2 ml-1">Nueva Contraseña</label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2 ml-1">Confirmar Contraseña</label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg px-4 py-3 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="portal-btn portal-btn-primary w-full mt-6"
              >
                {cargando ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword


