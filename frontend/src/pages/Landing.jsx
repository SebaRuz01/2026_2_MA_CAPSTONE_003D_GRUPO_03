import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Boxes, BrainCircuit, CalendarCheck, Check, ChevronDown, ClipboardList, Gauge, Menu, Moon, PackageCheck, Search, Send, ShieldCheck, Smartphone, Sparkles, Sun, Users, Wrench, X, Zap } from 'lucide-react'
import api from '../api/axios'
import logo from '../assets/logo.png'
import SigmaScene from '../components/SigmaScene'
import { useTheme } from '../context/ThemeContext'
import './Landing.css'

const modules = [
  [ClipboardList, 'Órdenes de trabajo', 'Centraliza diagnóstico, responsables, repuestos, evidencias y avance de cada vehículo.'],
  [PackageCheck, 'Inventario conectado', 'Descuenta insumos desde cada orden y anticipa quiebres de stock.'],
  [BarChart3, 'Flujo Kanban', 'Visualiza carga, prioridades y bloqueos desde el ingreso hasta la entrega.'],
  [Zap, 'Avisos automatizados', 'Mantén informado al cliente mediante comunicaciones integradas con Brevo.'],
  [Smartphone, 'Experiencia móvil', 'Permite buscar talleres, agendar una visita y consultar el avance.'],
  [BrainCircuit, 'Estimación predictiva', 'Proyecta tiempos de entrega usando el historial operativo.'],
]

const faqs = [
  ['¿SIGMA funciona para más de una sucursal?', 'Sí. La arquitectura multi-tenant separa la información de cada taller y permite administrar distintas operaciones y equipos.'],
  ['¿Qué ocurre con los datos de mis clientes?', 'Cada taller opera en un entorno segregado y los permisos por rol limitan el acceso a la información.'],
  ['¿Puedo migrar mi inventario actual?', 'La puesta en marcha puede contemplar la carga inicial. El alcance definitivo se revisa durante el diagnóstico comercial.'],
  ['¿Cómo se valida la información chilena?', 'Los formularios aplican reglas específicas para RUT mediante módulo 11, patentes y teléfonos nacionales.'],
  ['¿La aplicación móvil está conectada al portal?', 'Sí. Las citas y estados visibles para el cliente se integran con el flujo operativo del taller.'],
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
  const [selectedPlan, setSelectedPlan] = useState('Independiente')
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
    if (form.nombreTaller.trim().length < 2 || form.nombreContacto.trim().length < 3) return setFormState({ loading: false, success: false, error: 'Completa el taller y la persona de contacto.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.telefono.length !== 8) return setFormState({ loading: false, success: false, error: 'Revisa el correo y los 8 dígitos del teléfono.' })
    setFormState({ loading: true, success: false, error: '' })
    try {
      await api.post('/contacto/', { nombre_taller: form.nombreTaller.trim(), nombre_contacto: form.nombreContacto.trim(), email: form.email.trim(), telefono: `+569${form.telefono}`, plan: selectedPlan, mensaje: form.mensaje.trim() || 'Solicitud enviada desde la nueva landing.' })
      setFormState({ loading: false, success: true, error: '' })
    } catch {
      setFormState({ loading: false, success: false, error: 'No pudimos registrar la solicitud. Confirma que el servidor local esté activo.' })
    }
  }

  return <div className={`sigma-site ${theme === 'light' ? 'is-light' : ''}`}>
    <div className="scroll-progress" aria-hidden="true" />
    <SigmaScene />
    <div className="ambient" aria-hidden="true"><i /><i /><i /></div>

    <header className="sigma-nav">
      <a className="brand" href="#inicio" onClick={(e) => { e.preventDefault(); scrollTo('inicio') }}><span className="brand-mark"><img src={logo} alt="" /></span><span>SIGMA</span></a>
      <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
        {[['modulos', 'Módulos'], ['arquitectura', 'Arquitectura'], ['flujo', 'Operación'], ['planes', 'Planes'], ['faq', 'Preguntas']].map(([id, label]) => <button key={id} onClick={() => scrollTo(id)}>{label}</button>)}
      </nav>
      <div className="nav-actions"><Link to="/login" className="text-link">Acceso taller</Link><button className="theme-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>{theme === 'dark' ? <Sun /> : <Moon />}</button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button></div>
    </header>

    <main>
      <section className="hero section" id="inicio">
        <div className="hero-copy"><span className="eyebrow"><Sparkles /> Ecosistema v2.1 activo · Multi-tenant</span><h1>Control operativo para talleres que necesitan <em>avanzar sin fricción.</em></h1><p className="hero-lead">SIGMA conecta recepción, técnicos, inventario y clientes en un mismo flujo. Cada orden conserva su trazabilidad desde el ingreso del vehículo hasta la entrega.</p><form className="access-form" onSubmit={submitAccess}><input type="email" value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} placeholder="Correo corporativo" aria-label="Correo corporativo" required /><button className="button">Pide acceso al taller <ArrowRight /></button></form><small className="access-meta">Sin tarjeta de crédito · Implementación guiada según alcance</small><div className="hero-actions"><button className="button button-secondary" onClick={() => scrollTo('flujo')}>Ver flujo operativo</button></div><div className="trust-row"><span><ShieldCheck /> Validaciones para Chile</span><span><Users /> Roles por equipo</span><span><Gauge /> Operación trazable</span></div></div>
        <div className="hero-console"><div className="console-head"><span>Operación del taller</span><b><i /> En línea</b></div><div className="console-metric"><span>Órdenes activas</span><strong>24</strong><small>6 requieren atención</small></div><div className="console-grid"><div><span>Ingresadas</span><strong>08</strong></div><div><span>En proceso</span><strong>11</strong></div><div><span>Listas</span><strong>05</strong></div></div><div className="order-line"><span><i className="status cyan" />OT-2048 · Mazda CX-5</span><b>Diagnóstico</b></div><div className="order-line"><span><i className="status green" />OT-2041 · Toyota Yaris</span><b>Listo para retiro</b></div><form className="tracking" onSubmit={submitTracking}><label htmlFor="tracking">¿Ya tienes una orden?</label><div><Search /><input id="tracking" value={tracking} onChange={(e) => { setTracking(e.target.value); setTrackingError('') }} placeholder="Código de seguimiento" /><button>Consultar</button></div>{trackingError && <small className="form-error">{trackingError}</small>}</form></div>
      </section>

      <section className="metrics-strip" aria-label="Indicadores de referencia"><div><strong>99,8%</strong><span>Disponibilidad objetivo</span></div><div><strong>+45%</strong><span>Eficiencia potencial en OT</span></div><div><strong>4,9/5</strong><span>Meta de satisfacción</span></div><div><strong>0</strong><span>Errores RUT esperados</span></div></section>

      <section className="section" id="modulos"><div className="section-heading"><span className="eyebrow">Módulos conectados</span><h2>Una sola fuente de verdad para toda la operación.</h2><p>El trabajo administrativo y mecánico comparte información actualizada, sin duplicar registros ni perder contexto.</p></div><div className="module-grid">{modules.map(([Icon, title, text], index) => <article className="module-card" key={title}><span className="module-number">0{index + 1}</span><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="section split" id="arquitectura"><div><span className="eyebrow">Diseñado para operar en Chile</span><h2>Datos consistentes desde el primer registro.</h2><p>Las reglas de validación evitan que información crítica avance incompleta o con formatos que después impiden identificar clientes y vehículos.</p><ul className="check-list"><li><Check /> RUT validado mediante módulo 11</li><li><Check /> Patentes normalizadas para evitar duplicados</li><li><Check /> Teléfonos preparados para comunicaciones</li><li><Check /> Separación segura entre talleres</li></ul></div><div className="validation-card"><div className="validation-head"><ShieldCheck /><span>Motor de validación</span><b>Activo</b></div>{[['RUT', '12.345.678-5'], ['Patente', 'SB·JD·42'], ['Teléfono', '+56 9 8765 4321']].map(([label, value]) => <div className="validation-row" key={label}><span>{label}</span><code>{value}</code><Check /></div>)}<small>Las reglas se ejecutan antes de guardar el registro.</small></div></section>

      <section className="section" id="flujo"><div className="section-heading kanban-heading"><div><span className="eyebrow">Tablero Kanban en acción</span><h2>Cada orden avanza con responsable, contexto y próximo paso.</h2></div><label className="kanban-search"><Search /><input value={kanbanSearch} onChange={(event) => setKanbanSearch(event.target.value)} placeholder="Buscar vehículo u OT" /></label></div><div className="kanban">{[['Ingresado', ['Nissan Versa', 'Kia Sportage']], ['En proceso', ['Mazda CX-5', 'Toyota Yaris']], ['Finalizado', ['Suzuki Swift', 'Ford Ranger']]].map(([title, cars], column) => <div className="kanban-column" key={title}><header><span>{title}</span><b>{cars.length} órdenes</b></header>{cars.filter((car) => car.toLowerCase().includes(kanbanSearch.toLowerCase()) || `OT-${2048 - column * 10 - cars.indexOf(car)}`.includes(kanbanSearch.toUpperCase())).map((car, index) => { const progress = column === 2 ? 100 : column === 1 ? 62 : 12; return <article key={car}><small>OT-{2048 - column * 10 - index}</small><h3>{car}</h3><p>{column === 0 ? 'Pendiente de diagnóstico' : column === 1 ? 'Técnico asignado · En ejecución' : 'Cliente notificado'}</p><footer><span>{progress}%</span><i><b style={{ width: `${progress}%` }} /></i></footer></article>})}</div>)}</div><div className="kanban-pagination"><button disabled>Anterior</button><span>Página 1 de 1</span><button disabled>Siguiente</button></div></section>

      <section className="section intelligence"><div className="intelligence-panel"><span className="eyebrow">Estimación predictiva</span><h2>Promesas de entrega basadas en capacidad real.</h2><p>El módulo analiza información histórica y condiciones de la orden para apoyar una fecha estimada más consistente.</p><div className="prediction"><BrainCircuit /><div><span>Entrega estimada</span><strong>Miércoles · 16:30</strong><small>Según carga y tipo de servicio</small></div></div></div><div className="mobile-panel"><div className="phone"><span className="eyebrow">Mi vehículo</span><h3>Tu servicio está avanzando</h3><div className="mobile-status"><i /><div><b>En reparación</b><span>Actualizado hace 8 minutos</span></div></div><button>Ver detalle de la orden</button></div><div><span className="eyebrow">Aplicación para clientes</span><h2>Agenda y seguimiento desde el teléfono.</h2><p>El cliente encuentra el taller, reserva una hora y consulta el estado sin interrumpir al equipo.</p><ul className="check-list"><li><CalendarCheck /> Reserva en pocos pasos</li><li><Wrench /> Avance visible por etapas</li><li><Boxes /> Historial asociado al vehículo</li></ul></div></div></section>

      <section className="section testimonials"><div className="section-heading"><span className="eyebrow">Escenarios demostrativos</span><h2>El impacto se nota en cada rol del taller.</h2><p>Referencias ilustrativas del tipo de resultado operacional que SIGMA busca habilitar.</p></div><div className="testimonial-grid">{[['JR', 'Jefe de taller', 'Menos tiempo preguntando dónde está cada vehículo; el tablero concentra responsables, bloqueos y avance.'], ['AM', 'Administración', 'Inventario y órdenes comparten el mismo contexto, reduciendo ajustes manuales al cierre del día.'], ['CV', 'Coordinación de servicio', 'El cliente recibe visibilidad sin interrumpir continuamente a recepción con llamadas de seguimiento.']].map(([initials, role, quote]) => <article key={role}><span className="avatar">{initials}</span><p>“{quote}”</p><strong>{role}</strong><small>Testimonio de muestra</small></article>)}</div></section>

      <section className="section" id="planes"><div className="section-heading"><span className="eyebrow">Modalidades</span><h2>Una base sólida para crecer con tu operación.</h2><p>La configuración comercial se define según sucursales, técnicos e integraciones requeridas.</p></div><div className="plans">{[['Independiente', ['Órdenes de trabajo', 'Inventario y alertas', 'Portal de seguimiento', 'Gestión de técnicos']], ['Multi-taller', ['Todo el plan Independiente', 'Operación multi-taller', 'Estimación predictiva', 'Reportes y soporte prioritario']]].map(([name, features], index) => <article className={`plan ${index ? 'featured' : ''}`} key={name}>{index === 1 && <span className="plan-badge">Operación escalable</span>}<h3>{name}</h3><p>{index ? 'Para administrar más de una sede con visibilidad central.' : 'Para digitalizar un taller y ordenar el flujo completo.'}</p><strong>Evaluación personalizada</strong><ul>{features.map((feature) => <li key={feature}><Check />{feature}</li>)}</ul><button className={`button ${index ? '' : 'button-secondary'}`} onClick={() => { setSelectedPlan(name); scrollTo('contacto') }}>Consultar modalidad</button></article>)}</div></section>

      <section className="section faq" id="faq"><div><span className="eyebrow">Preguntas frecuentes</span><h2>Lo esencial antes de comenzar.</h2><p>Si tu operación tiene requerimientos particulares, los revisamos en la demostración.</p></div><div className="faq-list">{faqs.map(([question, answer], index) => <article className={faqOpen === index ? 'is-open' : ''} key={question}><button onClick={() => setFaqOpen(faqOpen === index ? -1 : index)} aria-expanded={faqOpen === index}><span>{question}</span><ChevronDown /></button><div><p>{answer}</p></div></article>)}</div></section>

      <section className="section contact" id="contacto"><div><span className="eyebrow">Conversemos sobre tu operación</span><h2>Agenda una demostración con el flujo de tu taller.</h2><p>Cuéntanos cómo trabajan hoy. Revisaremos órdenes, inventario, equipo y experiencia de clientes.</p><div className="contact-note"><ShieldCheck /><span><b>Modalidad seleccionada: {selectedPlan}</b><small>Tus datos se usan únicamente para gestionar la solicitud.</small></span></div></div>{formState.success ? <div className="success-card"><Check /><h3>Solicitud recibida</h3><p>Registramos los datos de {form.nombreTaller}.</p><button className="button button-secondary" onClick={() => setFormState({ loading: false, error: '', success: false })}>Enviar otra solicitud</button></div> : <form className="contact-form" onSubmit={submitContact} noValidate><div className="form-grid"><label>Taller<input name="nombreTaller" value={form.nombreTaller} onChange={updateForm} placeholder="Nombre del taller" /></label><label>Contacto<input name="nombreContacto" value={form.nombreContacto} onChange={updateForm} placeholder="Nombre y apellido" /></label><label>Correo<input name="email" type="email" value={form.email} onChange={updateForm} placeholder="contacto@taller.cl" /></label><label>Teléfono<div className="phone-input"><span>+56 9</span><input name="telefono" inputMode="numeric" value={form.telefono} onChange={updateForm} placeholder="12345678" /></div></label></div><label>Mensaje<textarea name="mensaje" value={form.mensaje} onChange={updateForm} placeholder="Cantidad de técnicos, sucursales o necesidades" rows="3" /></label>{formState.error && <p className="form-error">{formState.error}</p>}<button className="button" disabled={formState.loading}><Send />{formState.loading ? 'Enviando…' : 'Solicitar demostración'}</button></form>}</section>
    </main>

    <div className={`toast ${formState.success ? 'is-visible' : ''}`} role="status"><Check /><span><b>¡Solicitud recibida!</b> Registramos tus datos correctamente.</span></div>

    <footer className="sigma-footer"><div className="footer-brand"><span className="brand"><span className="brand-mark"><img src={logo} alt="" /></span><span>SIGMA</span></span><p>Sistema Integrado de Gestión para Mecánica y Administración.</p></div><div><b>Producto</b><button onClick={() => scrollTo('modulos')}>Módulos</button><button onClick={() => scrollTo('flujo')}>Operación</button><button onClick={() => scrollTo('planes')}>Modalidades</button></div><div><b>Acceso</b><Link to="/login">Portal del taller</Link><button onClick={() => scrollTo('contacto')}>Agendar demo</button></div><div><b>Información</b><button onClick={() => scrollTo('faq')}>Preguntas frecuentes</button><span>Chile</span></div><small>© {new Date().getFullYear()} SIGMA. Gestión operacional para talleres automotrices.</small></footer>
  </div>
}

export default Landing

