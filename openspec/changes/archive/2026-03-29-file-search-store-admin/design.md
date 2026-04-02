## Context

Se necesita una aplicación web para administrar Google File Search Stores. La API de Google Generative Language v1beta expone endpoints para gestionar stores (colecciones de documentos RAG) y sus documentos. No existe herramienta visual oficial; los usuarios deben usar curl o SDKs directamente.

El proyecto es greenfield — no hay código existente en el workspace.

**API Base URL**: `https://generativelanguage.googleapis.com/v1beta`

**Endpoints clave**:
- `fileSearchStores.list` / `create` / `delete` / `get`
- `fileSearchStores.documents.list` / `delete`
- `media.uploadToFileSearchStore` (multipart upload)

**Autenticación**: API key como query parameter `?key=<API_KEY>`

## Goals / Non-Goals

**Goals:**
- Aplicación web con UI tipo árbol/explorador que liste stores como carpetas
- Crear y eliminar stores
- Subir archivos a un store (upload multipart)
- Listar y eliminar documentos dentro de un store
- API key almacenada en `.env`, nunca expuesta al frontend
- Backend proxy Express que maneje todas las llamadas a Google API
- Interfaz premium, dark mode, con animaciones y feedback visual

**Non-Goals:**
- Editar metadatos de stores o documentos
- Búsqueda/query dentro de los stores (RAG queries)
- Gestión de chunks dentro de documentos
- Autenticación de usuarios / multi-tenancy
- Importar archivos desde File Service (`importFile`)

## Decisions

### 1. Arquitectura: Monorepo con Backend Express + Frontend Vite React

**Decisión**: Separar backend (Express + Node) y frontend (Vite + React) en una sola estructura de proyecto.

**Alternativas consideradas**:
- Full SPA con llamadas directas a Google API → Expone la API key en el navegador. Descartado por seguridad.
- Next.js fullstack → Demasiada complejidad para este administrador.
- Solo backend con templates SSR → Menos interactividad y UX pobre para un file manager.
- Vanilla JS → Menor complejidad de dependencias pero pierde la componentización y gestión de estado reactiva que React ofrece para una UI tipo explorador.

**Rationale**: Express proxy mantiene la API key segura en el servidor. Vite da hot-reload rápido y build optimizado. React proporciona componentes declarativos, estado reactivo con hooks, y renderizado eficiente — ideal para una UI de árbol con updates frecuentes.

### 2. Estructura del proyecto

```
/
├── server/
│   ├── index.js          # Express server
│   ├── routes/
│   │   ├── stores.js     # CRUD stores
│   │   └── documents.js  # List/delete/upload docs
│   └── .env              # GOOGLE_API_KEY
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Root component con layout
│   ├── styles/
│   │   └── index.css     # Design system + global styles
│   ├── components/
│   │   ├── TreeView.jsx  # Árbol de stores/docs
│   │   ├── StorePanel.jsx # Panel de detalle de store
│   │   ├── Toolbar.jsx   # Acciones (crear, eliminar, subir)
│   │   ├── Modal.jsx     # Modales de confirmación/creación
│   │   └── Toast.jsx     # Sistema de notificaciones
│   ├── hooks/
│   │   ├── useStores.js  # Hook para gestión de stores
│   │   └── useDocuments.js # Hook para gestión de documentos
│   └── services/
│       └── api.js        # Cliente HTTP al backend proxy
├── index.html
├── vite.config.js
├── package.json
└── .env
```

### 3. API Proxy: Diseño de endpoints backend

| Método | Endpoint Backend | API Google |
|--------|-----------------|------------|
| GET | `/api/stores` | `fileSearchStores.list` |
| POST | `/api/stores` | `fileSearchStores.create` |
| DELETE | `/api/stores/:id` | `fileSearchStores.delete` (force=true) |
| GET | `/api/stores/:id/documents` | `documents.list` |
| DELETE | `/api/stores/:id/documents/:docId` | `documents.delete` (force=true) |
| POST | `/api/stores/:id/upload` | `media.uploadToFileSearchStore` |

### 4. Upload de archivos

**Decisión**: Usar `multer` en Express para recibir archivos multipart del frontend, luego reenviar a Google API usando `media.uploadToFileSearchStore`.

**Rationale**: El upload a Google es un multipart request con metadata JSON + blob. Multer permite recibir el archivo del browser y luego construir el request correcto a Google.

### 5. UI: Árbol + Panel lateral

**Decisión**: Layout de dos paneles:
- **Panel izquierdo (sidebar)**: Árbol con stores como nodos padre (iconos de carpeta). Al expandir/seleccionar un store, se cargan los documentos como nodos hijos (iconos de archivo).
- **Panel derecho (contenido)**: Muestra detalles del store o documento seleccionado, barra de herramientas con acciones contextuales.

**Indicadores visuales de estado**:
- Documentos: estado con badge de color (🟢 ACTIVE, 🟡 PENDING, 🔴 FAILED)
- Stores: contadores de documentos activos/pendientes/fallidos

### 6. Gestión de estado frontend

**Decisión**: Estado local con React hooks (`useState`, `useEffect`) y custom hooks para encapsular la lógica de negocio. No se usará Redux/Zustand.

**Rationale**: Con React hooks, custom hooks como `useStores()` y `useDocuments()` encapsulan la lógica de fetch, loading, y error handling. La app tiene pocos estados globales (lista de stores, store seleccionado, documentos) que se pueden manejar con prop drilling o un Context simple si es necesario.

## Risks / Trade-offs

- **[Rate Limiting]** → Google API puede limitar requests. **Mitigación**: Cache local de la lista de stores, refrescar solo cuando el usuario lo solicite o tras operaciones.
- **[Upload de archivos grandes]** → Puede tener timeouts. **Mitigación**: Mostrar progress bar, timeout largo en Express (5 min).
- **[API key expuesta en .env]** → Si alguien accede al servidor, puede leer la key. **Mitigación**: `.env` en `.gitignore`, uso exclusivo en desarrollo local.
- **[Operaciones asíncronas de upload]** → El upload retorna un Operation que puede no estar completo inmediatamente. **Mitigación**: Mostrar estado "Procesando" y opcionalmente polling del status de la operación.
