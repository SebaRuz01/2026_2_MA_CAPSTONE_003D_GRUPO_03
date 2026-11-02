import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Boxes, BrainCircuit, CalendarCheck, Check, ChevronDown, ClipboardList, Gauge, Menu, Moon, PackageCheck, Search, Send, ShieldCheck, Smartphone, Sparkles, Sun, Users, Wrench, X, Zap } from 'lucide-react'
import api from '../api/axios'
import logo from '../assets/logo.png'
import SigmaScene from '../components/SigmaScene'
import { useTheme } from '../context/ThemeContext'
import './Landing.css'

const modules = [
  [ClipboardList, 'Órdenes de trabajo', 'Lleva el control de cada vehículo: diagnóstico, repuestos, estado y quién está a cargo en un solo lugar.'],
  [PackageCheck, 'Inventario al día', 'Controla stock de repuestos y evita quedarte sin insumos críticos a mitad del trabajo.'],
  [BarChart3, 'Tablero Kanban', 'Visualiza el flujo de trabajo de tu taller de forma gráfica, desde que entra el auto hasta que se retira.'],
  [Zap, 'Avisos automáticos', 'Mantén al cliente informado de su vehículo mediante alertas integradas.'],
  [Smartphone, 'Portal de clientes', 'Permite que tus clientes busquen su taller, agenden horas y consulten el avance de su auto desde el teléfono.'],
  [BrainCircuit, 'Estimación de tiempos', 'Calcula plazos de entrega más precisos basados en el rendimiento anterior del taller.'],
]

const faqs = [
  ['¿Puedo usar SIGMA en más de una sucursal?', 'Sí. El sistema permite separar y administrar las operaciones de distintos talleres de forma independiente.'],
  ['¿Qué pasa con la seguridad de los datos?', 'Cada taller opera en su propio entorno privado con accesos y permisos según el rol de cada trabajador.'],
  ['¿Puedo importar mi inventario actual?', 'Sí, podemos coordinar la carga inicial de tus repuestos y datos durante la puesta en marcha.'],
  ['¿Valida los datos y documentos de Chile?', 'Sí. Los formularios comprueban automáticamente formatos de RUT mediante módulo 11, patentes y números de teléfono.'],
  ['¿La aplicación móvil se conecta con el taller?', 'Sí. Las reservas y consultas de los clientes se sincronizan directamente con el panel operativo del equipo.'],
]

function Landing() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(0)
  const [tracking, setTracking] = useState('')
  const [trackingError, setTrackingError] = useState('')
  const [accessEmail, setAccessEmail] = useState('')
  const [kanbanSearch, setKanbanSearch] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('Profesional')
  const [form, setForm] = useState({ nombreTaller: '', nombreContacto: '', email: '', telefono: '', mensaje: '' })
  const [formState, setFormState] = useState({ loading: false, error: '', success: false })

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      document.documentElement.style.setProperty('--scroll-progress', `${max > 0 ? (window.scrollY / max) * 100 : 0}%`)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const submitTracking = (event) => {
    event.preventDefault()
    const code = tracking.trim().toUpperCase().replace(/^OT-0*/, '')
    if (!code) return setTrackingError('Ingresa un código de seguimiento válido.')
    navigate(`/seguimiento/${code}`)
  }

  const submitAccess = (event) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accessEmail)) return
    setForm((current) => ({ ...current, email: accessEmail }))
    scrollTo('contacto')
  }

  const updateForm = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: name === 'telefono' ? value.replace(/\D/g, '').slice(0, 8) : value }))
    setFormState((current) => ({ ...current, error: '' }))
  }

  const submitContact = async (event) => {
    event.preventDefault()
    if (form.nombreTaller.trim().length < 2 || form.nombreContacto.trim().length < 3) return setFormState({ loading: false, success: false, error: 'Indica el nombre de tu taller y de contacto.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.telefono.length !== 8) return setFormState({ loading: false, success: false, error: 'Revisa tu correo y los 8 dígitos del teléfono.' })
    setFormState({ loading: true, success: false, error: '' })
    try {
      await api.post('/contacto/', { 
        nombre_taller: form.nombreTaller.trim(), 
        nombre_contacto: form.nombreContacto.trim(), 
        email: form.email.trim(), 
        telefono: `+569${form.telefono}`, 
        plan: selectedPlan, 
        mensaje: form.mensaje.trim() || 'Solicitud enviada desde la landing de SIGMA.' 
      })
      setFormState({ loading: false, success: true, error: '' })
    } catch {
      setFormState({ loading: false, success: false, error: 'No pudimos enviar el mensaje. Revisa tu conexión o intenta más tarde.' })
    }
  }

  return <div className={`sigma-site ${theme === 'light' ? 'is-light' : ''}`}>
    <div className="scroll-progress" aria-hidden="true" />
    <SigmaScene />
    <div className="ambient" aria-hidden="true"><i /><i /><i /></div>

    <header className="sigma-nav">
      <a className="brand" href="#inicio" onClick={(e) => { e.preventDefault(); scrollTo('inicio') }}><span className="brand-mark"><img src={logo} alt="" /></span><span>SIGMA</span></a>
      <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
        {[['modulos', 'Módulos'], ['arquitectura', 'Sistema'], ['flujo', 'Operación'], ['planes', 'Planes'], ['faq', 'Preguntas']].map(([id, label]) => <button key={id} onClick={() => scrollTo(id)}>{label}</button>)}
      </nav>
      <div className="nav-actions"><Link to="/login" className="text-link">Acceso taller</Link><button className="theme-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>{theme === 'dark' ? <Sun /> : <Moon />}</button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button></div>
    </header>

    <main>
      <section className="hero section" id="inicio">
        <div className="hero-copy">
          <h1>Ordena tu taller mecánico y trabaja sin enredos.</h1>
          <p className="hero-lead">SIGMA junta la recepción, el trabajo de los mecánicos, los repuestos y los avisos a clientes en una sola plataforma rápida y fácil de usar.</p>
          <form className="access-form" onSubmit={submitAccess}>
            <input type="email" value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} placeholder="Tu correo corporativo" aria-label="Correo corporativo" required />
            <button className="button">Probar SIGMA <ArrowRight /></button>
          </form>
          <small className="access-meta">Sin tarjetas de crédito · Configuración a tu medida</small>
          <div className="hero-actions">
            <button className="button button-secondary" onClick={() => scrollTo('flujo')}>Ver cómo funciona</button>
          </div>
          <div className="trust-row">
            <span><ShieldCheck /> Datos adaptados a Chile</span>
            <span><Users /> Permisos por equipo</span>
            <span><Gauge /> Trazabilidad total</span>
          </div>
        </div>
        <div className="hero-console">
          <div className="console-head"><span>Estado del taller</span><b><i /> Activo</b></div>
          <div className="console-metric"><span>Órdenes en curso</span><strong>24</strong><small>6 necesitan atención</small></div>
          <div className="console-grid"><div><span>Ingresados</span><strong>08</strong></div><div><span>En taller</span><strong>11</strong></div><div><span>Listos</span><strong>05</strong></div></div>
          <div className="order-line"><span><i className="status cyan" />OT-2048 · Mazda CX-5</span><b>Diagnóstico</b></div>
          <div className="order-line"><span><i className="status green" />OT-2041 · Toyota Yaris</span><b>Listo para retiro</b></div>
          <form className="tracking" onSubmit={submitTracking}>
            <label htmlFor="tracking">Consulta una orden</label>
            <div>
              <Search />
              <input id="tracking" value={tracking} onChange={(e) => { setTracking(e.target.value); setTrackingError('') }} placeholder="Ej: OT-2048" />
              <button>Buscar</button>
            </div>
            {trackingError && <small className="form-error">{trackingError}</small>}
          </form>
        </div>
      </section>

      <section className="metrics-strip" aria-label="Indicadores de referencia">
        <div><strong>99.8%</strong><span>Tiempo en línea</span></div>
        <div><strong>+45%</strong><span>Agilidad en órdenes</span></div>
        <div><strong>4.9/5</strong><span>Satisfacción estimada</span></div>
        <div><strong>0</strong><span>Errores de RUT</span></div>
      </section>

      <section className="section" id="modulos">
        <div className="section-heading">
          <span className="eyebrow">Herramientas clave</span>
          <h2>Todo lo que tu taller necesita en un solo panel.</h2>
          <p>Mecánicos y administración conectados en tiempo real, sin papeles perdidos ni información duplicada.</p>
        </div>
        <div className="module-grid">
          {modules.map(([Icon, title, text], index) => (
            <article className="module-card" key={title}>
              <span className="module-number">0{index + 1}</span>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split" id="arquitectura">
        <div>
          <span className="eyebrow">Hecho para Chile</span>
          <h2>Información limpia desde el primer clic.</h2>
          <p>Evitamos errores comunes de tipeo con validaciones automáticas para que cada registro quede correcto de entrada.</p>
          <ul className="check-list">
            <li><Check /> Validación de RUT chileno con módulo 11</li>
            <li><Check /> Normalización de patentes</li>
            <li><Check /> Formato de teléfonos listo para contacto</li>
            <li><Check /> Datos 100% aislados por taller</li>
          </ul>
        </div>
        <div className="validation-card">
          <div className="validation-head"><ShieldCheck /><span>Filtro de datos</span><b>Verificando</b></div>
          {[['RUT', '12.345.678-5'], ['Patente', 'SB·JD·42'], ['Teléfono', '+56 9 8765 4321']].map(([label, value]) => (
            <div className="validation-row" key={label}>
              <span>{label}</span>
              <code>{value}</code>
              <Check />
            </div>
          ))}
          <small>Comprobación automática antes de guardar.</small>
        </div>
      </section>

      <section className="section" id="flujo">
        <div className="section-heading kanban-heading">
          <div>
            <span className="eyebrow">Organización visual</span>
            <h2>Sigue el estado de cada vehículo sin enredos.</h2>
          </div>
          <label className="kanban-search">
            <Search />
            <input value={kanbanSearch} onChange={(event) => setKanbanSearch(event.target.value)} placeholder="Busca un auto o número de orden" />
          </label>
        </div>
        <div className="kanban">
          {[
            ['Ingresado', ['Nissan Versa', 'Kia Sportage']],
            ['En proceso', ['Mazda CX-5', 'Toyota Yaris']],
            ['Finalizado', ['Suzuki Swift', 'Ford Ranger']]
          ].map(([title, cars], column) => (
            <div className="kanban-column" key={title}>
              <header>
                <span>{title}</span>
                <b>{cars.length} autos</b>
              </header>
              {cars
                .filter((car) => car.toLowerCase().includes(kanbanSearch.toLowerCase()) || `OT-${2048 - column * 10 - cars.indexOf(car)}`.includes(kanbanSearch.toUpperCase()))
                .map((car, index) => {
                  const progress = column === 2 ? 100 : column === 1 ? 62 : 12;
                  return (
                    <article key={car}>
                      <small>OT-{2048 - column * 10 - index}</small>
                      <h3>{car}</h3>
                      <p>{column === 0 ? 'Esperando revisión' : column === 1 ? 'Mecánico asignado' : 'Cliente avisado'}</p>
                      <footer>
                        <span>{progress}%</span>
                        <i><b style={{ width: `${progress}%` }} /></i>
                      </footer>
                    </article>
                  );
                })}
            </div>
          ))}
        </div>
        <div className="kanban-pagination"><button disabled>Anterior</button><span>Página 1 de 1</span><button disabled>Siguiente</button></div>
      </section>

      <section className="section intelligence">
        <div className="intelligence-panel">
          <span className="eyebrow">Predicción de plazos</span>
          <h2>Dale fechas más exactas a tus clientes.</h2>
          <p>El sistema analiza trabajos pasados para ayudarte a estimar cuándo estará listo el vehículo.</p>
          <div className="prediction">
            <BrainCircuit />
            <div>
              <span>Entrega probable</span>
              <strong>Miércoles · 16:30</strong>
              <small>Calculado según carga actual</small>
            </div>
          </div>
        </div>
        <div className="mobile-panel">
          <div className="phone">
            <span className="eyebrow">Vista del cliente</span>
            <h3>Tu auto va en buen camino</h3>
            <div className="mobile-status">
              <i />
              <div>
                <b>En reparación</b>
                <span>Actualizado hace un momento</span>
              </div>
            </div>
            <button>Ver detalle</button>
          </div>
          <div>
            <span className="eyebrow">App para conductores</span>
            <h2>Menos llamadas preguntando por el auto.</h2>
            <p>Tus clientes revisan el estado de su reparación directo en su celular.</p>
            <ul className="check-list">
              <li><CalendarCheck /> Agendamiento simple</li>
              <li><Wrench /> Etapas del servicio claras</li>
              <li><Boxes /> Historial del vehículo guardado</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section testimonials">
        <div className="section-heading">
          <span className="eyebrow">Roles del taller</span>
          <h2>Diseñado para el día a día real del taller.</h2>
          <p>Pensado tanto para quien administra como para quien está con las manos en los autos.</p>
        </div>
        <div className="testimonial-grid">
          {[['JR', 'Jefe de taller', 'Ya no hay que andar preguntando por los pasillos en qué va cada auto; el tablero muestra todo al tiro.'], ['AM', 'Administración', 'El inventario y las órdenes van de la mano, lo que nos ahorra horas al cuadrar el día.'], ['CV', 'Recepción', 'Los clientes ven su avance por la web y llaman mucho menos para preguntar lo mismo.']].map(([initials, role, quote]) => (
            <article key={role}>
              <span className="avatar">{initials}</span>
              <p>“{quote}”</p>
              <strong>{role}</strong>
              <small>Experiencia esperada</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="planes">
        <div className="section-heading">
          <span className="eyebrow">Planes y precios</span>
          <h2>Elige el nivel que necesita tu taller.</h2>
          <p>Planes transparentes que se adaptan al tamaño de tu equipo y cantidad de sucursales.</p>
        </div>
        <div className="plans">
          {[
            ['Profesional', ['Órdenes de trabajo', 'Inventario y alertas', 'Portal de seguimiento', 'Hasta 5 técnicos', 'Sin estimación predictiva'], 'Perfecto para talleres que buscan ordenar su flujo diario y digitalizar la operación principal.'],
            ['Empresas', ['Todo lo del plan Profesional', 'Operación multi-taller', 'Estimación de tiempos con IA', 'Técnicos ilimitados', 'Soporte prioritario'], 'Pensado para redes de talleres o locales múltiples que requieren control centralizado.']
          ].map(([name, features, description], index) => (
            <article className={`plan ${index ? 'featured' : ''}`} key={name}>
              {index === 1 && <span className="plan-badge">Recomendado</span>}
              <h3>Plan {name}</h3>
              <p>{description}</p>
              <strong>Cotización a medida</strong>
              <ul>
                {features.map((feature, fIndex) => (
                  <li key={fIndex}><Check />{feature}</li>
                ))}
              </ul>
              <button className={`button ${index ? '' : 'button-secondary'}`} onClick={() => { setSelectedPlan(name); scrollTo('contacto') }}>Elegir este plan</button>
            </article>
          ))}
        </div>
      </section>

      <section className="section faq" id="faq">
        <div>
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales antes de empezar.</h2>
          <p>¿Tienes requerimientos especiales? Los podemos revisar directo en una demo.</p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <article className={faqOpen === index ? 'is-open' : ''} key={question}>
              <button onClick={() => setFaqOpen(faqOpen === index ? -1 : index)} aria-expanded={faqOpen === index}>
                <span>{question}</span>
                <ChevronDown />
              </button>
              <div><p>{answer}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section contact" id="contacto">
        <div>
          <span className="eyebrow">Hablemos de tu taller</span>
          <h2>Agenda una demo adaptada a tu operación.</h2>
          <p>Cuéntanos cómo trabajan hoy y te mostramos cómo SIGMA se ajusta a tus necesidades.</p>
          <div className="contact-note"><ShieldCheck /><span><b>Plan seleccionado: Plan {selectedPlan}</b><small>Tus datos solo se usarán para contactarte.</small></span></div>
        </div>
        {formState.success ? (
          <div className="success-card">
            <Check />
            <h3>¡Mensaje enviado!</h3>
            <p>Recibimos la solicitud de {form.nombreTaller}. Te contactaremos pronto.</p>
            <button className="button button-secondary" onClick={() => setFormState({ loading: false, error: '', success: false })}>Enviar otra consulta</button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submitContact} noValidate>
            <div className="form-grid">
              <label>Taller<input name="nombreTaller" value={form.nombreTaller} onChange={updateForm} placeholder="Nombre de tu taller" /></label>
              <label>Contacto<input name="nombreContacto" value={form.nombreContacto} onChange={updateForm} placeholder="Tu nombre" /></label>
              <label>Correo<input name="email" type="email" value={form.email} onChange={updateForm} placeholder="contacto@taller.cl" /></label>
              <label>Teléfono<div className="phone-input"><span>+56 9</span><input name="telefono" inputMode="numeric" value={form.telefono} onChange={updateForm} placeholder="12345678" /></div></label>
            </div>
            <label>Mensaje<textarea name="mensaje" value={form.mensaje} onChange={updateForm} placeholder="¿Cuántos técnicos son o qué necesitas?" rows="3" /></label>
            {formState.error && <p className="form-error">{formState.error}</p>}
            <button className="button" disabled={formState.loading}><Send />{formState.loading ? 'Enviando…' : 'Solicitar demostración'}</button>
          </form>
        )}
      </section>
    </main>

    <div className={`toast ${formState.success ? 'is-visible' : ''}`} role="status"><Check /><span><b>¡Listo!</b> Guardamos tus datos con éxito.</span></div>

    <footer className="sigma-footer">
      <div className="footer-brand"><span className="brand"><span className="brand-mark"><img src={logo} alt="" /></span><span>SIGMA</span></span><p>Sistema de gestión para talleres mecánicos.</p></div>
      <div><b>Producto</b><button onClick={() => scrollTo('modulos')}>Módulos</button><button onClick={() => scrollTo('flujo')}>Operación</button><button onClick={() => scrollTo('planes')}>Planes</button></div>
      <div><b>Acceso</b><Link to="/login">Portal del taller</Link><button onClick={() => scrollTo('contacto')}>Agendar demo</button></div>
      <div><b>Información</b><button onClick={() => scrollTo('faq')}>Ayuda</button><span>Chile</span></div>
      <small>© {new Date().getFullYear()} SIGMA. Control operacional automotriz.</small></footer>
  </div>
}

export default Landing