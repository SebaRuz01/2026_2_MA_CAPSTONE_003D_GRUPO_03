import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import logoIcono from '../assets/logo.png'
import { User, Lock, Eye, EyeOff, ArrowRight, Home, Sun, Moon, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'

function Login() {
  // ESTADOS DE LOGIN
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  
  // ESTADOS PARA RECUPERAR CONTRASEÑA (SOPORTE)
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoverySuccess, setRecoverySuccess] = useState(false)

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark')
  })
  
  const navigate = useNavigate()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await api.post('token/', { 
        username, 
        password,
        origen: 'web' 
      })
      
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)

      const { rol } = jwtDecode(res.data.access)
      if (rol === 'super_admin') {
        navigate('/super-admin')
      } else {
        navigate('/panel')
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
    } finally {
      setCargando(false)
    }
  }

  const handleRecoverySubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await api.post('/password-reset/', { email: recoveryEmail })
      setRecoverySuccess(true)
    } catch (err) {
      setError('No pudimos encontrar una cuenta con ese correo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="portal-shell min-h-screen flex items-center justify-center font-sans text-slate-900 dark:text-slate-100 bg-[#f3f2ee] dark:bg-[#101513] relative overflow-hidden selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 px-4 transition-colors duration-300">
      
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-md border border-slate-200 dark:border-slate-700 transition-colors"
          aria-label="Cambiar modo oscuro"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c9cdc8_1px,transparent_1px),linear-gradient(to_bottom,#c9cdc8_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#2f3331_1px,transparent_1px),linear-gradient(to_bottom,#2f3331_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 transition-colors"></div>
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-300/20 dark:bg-cyan-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten"></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-slate-200/60 dark:border-slate-800 transition-colors">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-5 transition-colors">
              <img src={logoIcono} alt="SIGMA" className="h-8 w-auto" />
            </div>
            
            <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
              {isRecovering ? 'Soporte y Recuperación' : 'Acceso a SIGMA'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
              {isRecovering 
                ? 'Ingresa tu correo para recuperar tu contraseña' 
                : 'Ingresa tus credenciales para continuar'}
            </p>
          </div>

          {/* VISTA 1: INICIAR SESIÓN */}
          {!isRecovering && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 ml-1">Usuario</label>
                <div className="relative group">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin_taller"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 ml-1">Contraseña</label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
                className="portal-btn portal-btn-primary w-full mt-6 group"
              >
                {cargando ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VISTA 2: RECUPERAR CONTRASEÑA */}
          {isRecovering && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {recoverySuccess ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">¡Correo enviado!</h3>
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Revisa tu bandeja de entrada. Te hemos enviado las instrucciones para restablecer tu contraseña.
                  </p>
                  <button
                    onClick={() => { setIsRecovering(false); setRecoverySuccess(false); }}
                    className="mt-4 w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-white font-bold py-3.5 rounded-lg"
                  >
                    Volver al login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 ml-1">Correo Electrónico</label>
                    <div className="relative group">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
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
                    className="portal-btn portal-btn-primary w-full"
                  >
                    {cargando ? 'Enviando...' : 'Enviar instrucciones'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => { setIsRecovering(false); setError(''); }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white py-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Cancelar y volver
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {!isRecovering && (
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8 font-medium">
            ¿Olvidaste tu clave o necesitas ayuda?{' '}
            <button 
              onClick={() => { setIsRecovering(true); setError(''); }}
              className="text-blue-600 dark:text-blue-400 hover:underline transition-colors font-bold"
            >
              Soporte técnico
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login


