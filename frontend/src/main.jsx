import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './styles/portal.css'

// IMPORTAR EL THEME PROVIDER
import { ThemeProvider } from './context/ThemeContext.jsx'

import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import PanelGeneral from './pages/PanelGeneral.jsx'
import Ordenes from './pages/Ordenes.jsx'
import Tecnicos from './pages/Tecnicos.jsx'
import Inventario from './pages/Inventario.jsx'
import Reportes from './pages/Reportes.jsx'
import HistorialVehiculos from './pages/HistorialVehiculos.jsx' // <--- 1. IMPORTAR LA PÁGINA DE HISTORIAL
import RutaProtegida from './components/RutaProtegida.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'
import NuevoTaller from './pages/NuevoTaller.jsx'
import EditarTaller from './pages/EditarTaller.jsx'
import Seguimiento from './pages/Seguimiento.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import OrdenesSinAsignar from './pages/OrdenesSinAsignar'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

          <Route
            path="/panel"
            element={
              <RutaProtegida bloquearRol="super_admin">
                <PanelGeneral />
              </RutaProtegida>
            }
          />
          <Route
            path="/ordenes"
            element={
              <RutaProtegida bloquearRol="super_admin">
                <Ordenes />
              </RutaProtegida>
            }
          />
          <Route
            path="/tecnicos"
            element={
              <RutaProtegida bloquearRol="super_admin">
                <Tecnicos />
              </RutaProtegida>
            }
          />
          <Route
            path="/inventario"
            element={
              <RutaProtegida bloquearRol="super_admin">
                <Inventario />
              </RutaProtegida>
            }
          />
          <Route
            path="/reportes"
            element={
              <RutaProtegida bloquearRol="super_admin">
                <Reportes />
              </RutaProtegida>
            }
          />
          {/* 2. RUTA PROTEGIDA PARA EL HISTORIAL DE VEHÍCULOS */}
          <Route
            path="/historial"
            element={
              <RutaProtegida bloquearRol="super_admin">
                <HistorialVehiculos />
              </RutaProtegida>
            }
          />

          <Route
            path="/super-admin"
            element={
              <RutaProtegida rolRequerido="super_admin">
                <SuperAdmin />
              </RutaProtegida>
            }
          />
          <Route
            path="/super-admin/nuevo-taller"
            element={
              <RutaProtegida rolRequerido="super_admin">
                <NuevoTaller />
              </RutaProtegida>
            }
          />
          <Route
            path="/super-admin/talleres/:id/editar"
            element={
              <RutaProtegida rolRequerido="super_admin">
                <EditarTaller />
              </RutaProtegida>
            }
          />
          
          <Route path="/ordenes-sin-asignar" element={<OrdenesSinAsignar />} />
          <Route path="/seguimiento/:codigo" element={<Seguimiento />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
