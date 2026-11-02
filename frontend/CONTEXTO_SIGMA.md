# Contexto de continuidad — Proyecto SIGMA

Última actualización: 2 de noviembre de 2026

## Objetivo del proyecto

SIGMA es una plataforma SaaS para talleres mecánicos. Incluye gestión de órdenes de trabajo, técnicos, inventario, clientes, vehículos, citas, módulos contratados, administración de talleres y un panel de superadministración. También existe una aplicación móvil para clientes que permite agendar citas y consultar el avance de sus vehículos.

## Estructura local

```text
C:\Users\isaac\Desktop\Proyecto-SIGMA-main\
├── backend\
└── frontend\
```

El frontend y el backend se ejecutan localmente como procesos independientes.

## Repositorios remotos

- Frontend/proyecto principal: https://github.com/SebaRuz01/Proyecto-SIGMA.git
- Backend: https://github.com/SebaRuz01/BD-Sigma.git
- Backend desplegado en Render: https://bd-sigma.onrender.com
- API de producción: https://bd-sigma.onrender.com/api
- Frontend público conocido: https://misigma.infinityfree.me

## Estado del frontend

El frontend utiliza React, Vite y Axios.

### Diseño realizado

- Landing page completamente rediseñada con estética mecánica, colores mate y presencia de color plomo sin utilizarlo como color primario.
- Modo oscuro predeterminado y selector para alternar entre modo oscuro y claro.
- Fondo visual relacionado con mecánica y automóviles mediante `SigmaScene`.
- Modo claro corregido en títulos, tarjetas y módulos.
- Se corrigió específicamente el contraste de las tarjetas de módulos al pasar el cursor en modo claro.
- Se rediseñaron las páginas internas siguiendo el lenguaje visual de la landing.
- Los estilos compartidos del portal fueron movidos a `src/styles/portal.css`.
- Los estilos de la landing están en `src/pages/Landing.css`.
- El módulo de órdenes fue dividido en componentes y utilidades dentro de `src/features/ordenes/`.
- Se corrigió la apariencia y tamaño del botón de notificación por correo.
- La paginación de órdenes solo debe mostrarse cuando una columna supera el límite real de tarjetas.
- Se eliminaron espacios de tarjetas vacías en el tablero de órdenes.

### Configuración de API

`src/api/axios.js` utiliza la variable `VITE_API_URL` y, en desarrollo, tiene como respaldo:

```text
http://127.0.0.1:8000/api
```

Configuraciones:

- `.env.development`: `VITE_API_URL=http://127.0.0.1:8000/api`
- `.env.production`: `VITE_API_URL=https://bd-sigma.onrender.com/api`

`.env.production` está versionado porque la URL de la API es pública y es necesario evitar que una compilación publicada apunte a localhost.

### Última publicación del frontend

- Repositorio: `SebaRuz01/Proyecto-SIGMA`
- Rama: `main`
- Commit: `332d5637`
- Mensaje: `Redesign SIGMA frontend and unify portal styling`
- La publicación modificó únicamente `frontend/`.
- La compilación `npm run build` terminó correctamente.

### Observaciones del frontend

- La compilación funciona correctamente.
- ESLint todavía reporta errores heredados en algunas páginas, principalmente variables sin usar y advertencias de efectos de React. Estos errores no bloquearon la compilación.
- Vite advierte que el paquete JavaScript principal supera 500 kB. Una mejora futura sería separar rutas mediante carga diferida.

## Estado del backend

El backend utiliza Django, Django REST Framework, JWT, Channels y PostgreSQL en producción.

### Desarrollo local

- Entorno virtual: `backend/.venv`
- Base local: `backend/db.sqlite3`
- SQLite y el entorno virtual están excluidos de Git.
- Si `DATABASE_URL` no está definida, Django utiliza SQLite.
- Si `DATABASE_URL` está definida, Django utiliza la base PostgreSQL configurada por Render.
- Existe `backend/.env.example` con las variables esperadas.

### Cuenta local

La SQLite local se creó vacía y se agregó una cuenta de superadministración para desarrollo. El usuario es `admin_local`. La contraseña no se guarda en este documento; fue entregada en la conversación original y puede restablecerse localmente con Django si es necesario.

Para cambiar la contraseña:

```powershell
cd C:\Users\isaac\Desktop\Proyecto-SIGMA-main\backend
.\.venv\Scripts\Activate.ps1
python manage.py changepassword admin_local
```

### Mejoras realizadas en backend

- Configuración automática SQLite/PostgreSQL mediante `DATABASE_URL`.
- CORS limitado a los orígenes locales y al frontend público conocido.
- `ALLOWED_HOSTS` contiene localhost y el hostname exacto `bd-sigma.onrender.com`.
- Idioma configurado como `es-cl` y zona horaria `America/Santiago`.
- Se corrigió la configuración de correo de desarrollo.
- Se añadió la dependencia `resend` que era importada por el código.
- Django quedó limitado a `django>=5.1,<5.3` para ser compatible con Python 3.10 en GitHub Actions.
- Se eliminaron llamadas HTTP al webhook de Discord durante el arranque de Django.
- Se retiró `daphne` de `INSTALLED_APPS` para evitar bloqueos durante comandos locales en Windows. Channels y ASGI permanecen configurados.
- Se eliminó el entrenamiento automático y silencioso del modelo desde `OrdenTrabajo.save()`.
- Se corrigió el aislamiento de clientes, vehículos y usuarios por taller.
- Un administrador de taller ya no puede crear un superadministrador ni asignar usuarios a otro taller.
- Se agregaron pruebas automatizadas para aislamiento entre talleres y escalamiento de privilegios.
- Se limpió el repositorio remoto eliminando archivos `__pycache__` y `.pyc` versionados.

### Migraciones

Se generó y publicó:

```text
core/migrations/0003_cita_solicitudcontacto_taller_plan_id_and_more.py
```

Esta migración incorpora citas, solicitudes de contacto, `plan_id`, cambios de roles y la restricción de unicidad de repuestos.

### Verificaciones del backend

- `python manage.py check`: correcto.
- `python manage.py makemigrations --check --dry-run`: sin cambios pendientes.
- `python manage.py test core`: 2 pruebas aprobadas.
- Migraciones locales aplicadas correctamente.

### Última publicación del backend

- Repositorio: `SebaRuz01/BD-Sigma`
- Rama: `main`
- Commit: `7131c55`
- Mensaje: `Prepare backend for local development and secure tenant access`
- GitHub Actions terminó con resultado correcto.
- El endpoint de Render respondió después del despliegue.

## Comandos para ejecutar localmente

### Backend

```powershell
cd C:\Users\isaac\Desktop\Proyecto-SIGMA-main\backend
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver
```

Servidor esperado:

```text
http://127.0.0.1:8000
```

### Frontend

En otra terminal:

```powershell
cd C:\Users\isaac\Desktop\Proyecto-SIGMA-main\frontend
npm install
npm run dev
```

Vite normalmente inicia en:

```text
http://localhost:5173
```

## Flujo recomendado de publicación

### Frontend

1. Ejecutar `npm run build`.
2. Confirmar que `.env.production` apunta a Render.
3. Subir únicamente la carpeta `frontend/` a `Proyecto-SIGMA`.
4. No subir `node_modules`, `dist` ni archivos locales con secretos.

### Backend

1. Ejecutar `python manage.py check`.
2. Ejecutar `python manage.py makemigrations --check --dry-run`.
3. Ejecutar `python manage.py test core`.
4. Confirmar que no se incluyan `.env`, `.venv`, `db.sqlite3`, `__pycache__` o `.pyc`.
5. Subir a `BD-Sigma/main`.
6. GitHub Actions activa el deploy hook de Render.
7. Verificar que las migraciones de producción se ejecuten según la configuración del servicio de Render.

## Puntos importantes para retomar

- El modo oscuro es el predeterminado.
- El frontend local debe utilizar el backend local.
- Producción debe utilizar Render.
- La base SQLite local no contiene los usuarios ni datos de PostgreSQL en Render.
- No reemplazar `DATABASE_URL` en producción.
- Mantener el aislamiento multi-tenant al modificar viewsets o serializers.
- No confiar únicamente en filtros del frontend para seguridad; las restricciones deben permanecer en el backend.
- Antes de publicar nuevas migraciones, confirmar que Render ejecute `python manage.py migrate` durante el despliegue.
- El documento describe el estado posterior a los commits `332d5637` del frontend y `7131c55` del backend.

## Solicitud sugerida para una conversación futura

Puedes adjuntar este archivo y escribir:

> Continúa trabajando en SIGMA usando `CONTEXTO_SIGMA.md` como estado actual del proyecto. Revisa primero los cambios existentes y conserva la separación entre entorno local y producción.
