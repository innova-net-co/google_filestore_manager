## Why

Actualmente, el sistema depende de una única API Key de Google configurada en el archivo `.env` del servidor. Esto limita la flexibilidad, ya que el usuario no puede cambiar entre diferentes cuentas o proyectos de Google de forma dinámica desde la interfaz. Además, no existe un mecanismo para que un nuevo usuario configure su propia clave sin modificar archivos del servidor.

## What Changes

- **Gestión Multi-Key**: Se implementará un sistema para almacenar, nombrar y seleccionar múltiples API Keys en el navegador del usuario.
- **Persistencia Local**: Las claves se guardarán exclusivamente en el `localStorage` del navegador.
- **Inyección Dinámica de Keys**: El frontend enviará la API Key seleccionada en cada petición al backend mediante un header personalizado (`X-Goog-Api-Key`).
- **Middleware de Validación**: El servidor se modificará para utilizar únicamente la API Key enviada en el header. Se dejará de utilizar la clave del archivo `.env`.
- **UI de Configuración**: Se añadirá un selector de API Keys en el layout principal y un modal automático para usuarios que inicien el sistema sin ninguna clave configurada.

## Capabilities

### New Capabilities
- `api-key-management`: Gestión de ciclo de vida de API Keys en el frontend (CRUD en LocalStorage).
- `dynamic-auth-proxy`: Capacidad del backend para usar API Keys dinámicas proporcionadas por el cliente.

### Modified Capabilities
- `api-proxy-backend`: Se elimina la dependencia de `GOOGLE_API_KEY` en el `.env`. La autenticación ahora es responsabilidad total del cliente.
- `store-management`: Las operaciones de listado y gestión ahora dependerán del contexto de la API Key activa proporcionada por el cliente.

## Impact

- **Frontend**: `src/services/api.js`, `src/App.jsx`, nuevos componentes `ApiKeyManager` y `ApiKeyModal`.
- **Backend**: `server/index.js`, `server/routes/stores.js`, `server/routes/documents.js`.
- **Seguridad**: La API Key ya no se expone en la URL como query parameter en las llamadas internas entre frontend y backend (se usa headers), aunque sigue viajando a Google desde el servidor proxy.
