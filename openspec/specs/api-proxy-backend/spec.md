## ADDED Requirements

### Requirement: Servidor Express con proxy a Google API
El sistema SHALL exponer un servidor Express que actúe como proxy entre el frontend y la API de Google Generative Language v1beta.

#### Scenario: Servidor iniciado
- **WHEN** se ejecuta `npm run dev` o `node server/index.js`
- **THEN** el servidor Express MUST iniciar en un puerto configurable (default 3001) y servir los endpoints definidos

#### Scenario: API key desde .env
- **WHEN** el servidor inicia
- **THEN** MUST leer `GOOGLE_API_KEY` desde el archivo `.env` usando dotenv y usarla en todas las llamadas a Google API

#### Scenario: API key no configurada
- **WHEN** `GOOGLE_API_KEY` no está definida en `.env`
- **THEN** el servidor MUST loguear un error claro indicando que la API key es requerida y terminar el proceso

---

### Requirement: Endpoint listar stores
El sistema SHALL exponer `GET /api/stores` que retorna todos los File Search Stores.

#### Scenario: Request exitoso
- **WHEN** se hace GET a `/api/stores`
- **THEN** MUST hacer una llamada a `https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=<API_KEY>` con paginación automática y retornar `{ stores: [...] }`

#### Scenario: Error de Google API
- **WHEN** la API de Google retorna un error
- **THEN** MUST retornar el código de error HTTP apropiado y un JSON `{ error: "<mensaje>" }`

---

### Requirement: Endpoint crear store
El sistema SHALL exponer `POST /api/stores` que crea un nuevo File Search Store.

#### Scenario: Creación exitosa
- **WHEN** se hace POST a `/api/stores` con body `{ displayName: "Mi Store" }`
- **THEN** MUST hacer POST a `https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=<API_KEY>` con el body y retornar el store creado

---

### Requirement: Endpoint eliminar store
El sistema SHALL exponer `DELETE /api/stores/:id` que elimina un File Search Store.

#### Scenario: Eliminación exitosa
- **WHEN** se hace DELETE a `/api/stores/:id`
- **THEN** MUST hacer DELETE a `https://generativelanguage.googleapis.com/v1beta/fileSearchStores/<id>?force=true&key=<API_KEY>` y retornar 200

---

### Requirement: Endpoint listar documentos
El sistema SHALL exponer `GET /api/stores/:id/documents` que retorna los documentos de un store.

#### Scenario: Request exitoso
- **WHEN** se hace GET a `/api/stores/:storeId/documents`
- **THEN** MUST hacer llamada a `https://generativelanguage.googleapis.com/v1beta/fileSearchStores/<storeId>/documents?key=<API_KEY>` con paginación y retornar `{ documents: [...] }`

---

### Requirement: Endpoint eliminar documento
El sistema SHALL exponer `DELETE /api/stores/:id/documents/:docId` que elimina un documento.

#### Scenario: Eliminación exitosa
- **WHEN** se hace DELETE a `/api/stores/:storeId/documents/:docId`
- **THEN** MUST hacer DELETE a `https://generativelanguage.googleapis.com/v1beta/fileSearchStores/<storeId>/documents/<docId>?force=true&key=<API_KEY>` y retornar 200

---

### Requirement: Endpoint subir archivo
El sistema SHALL exponer `POST /api/stores/:id/upload` que sube un archivo a un store usando multipart upload.

#### Scenario: Upload exitoso
- **WHEN** se hace POST multipart a `/api/stores/:id/upload` con un archivo
- **THEN** MUST construir un multipart request a `https://generativelanguage.googleapis.com/upload/v1beta/fileSearchStores/<id>:uploadToFileSearchStore?key=<API_KEY>` con metadata JSON y el blob del archivo, y retornar la respuesta de la operación

#### Scenario: Archivo no proporcionado
- **WHEN** se hace POST sin archivo adjunto
- **THEN** MUST retornar 400 con `{ error: "No file provided" }`

---

### Requirement: CORS habilitado
El sistema SHALL tener CORS habilitado para permitir requests desde el frontend Vite (puerto diferente).

#### Scenario: Request cross-origin
- **WHEN** el frontend en localhost:5173 hace un request al backend en localhost:3001
- **THEN** MUST responder con los headers CORS apropiados permitiendo la comunicación
