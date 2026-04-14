## 1. Backend - Adaptación de Proxy Dinámico

- [x] 1.1 Eliminar la validación y dependencia de `GOOGLE_API_KEY` en `server/index.js`.
- [x] 1.2 Implementar middleware de extracción OBLIGATORIA de API Key en `server/index.js` que busque únicamente en `req.headers['x-goog-api-key']`.
- [x] 1.3 Retornar error 401 en el middleware si el header está ausente.
- [x] 1.4 Inyectar la clave extraída en el objeto `req.googleApiKey`.
- [x] 1.5 Actualizar `server/routes/stores.js` para usar `req.googleApiKey` en todas las llamadas fetch a la API de Google.
- [x] 1.6 Actualizar `server/routes/documents.js` para usar `req.googleApiKey` en todas las llamadas fetch a la API de Google.

## 2. Frontend - Gestión de API Keys (LocalStorage)

- [x] 2.1 Crear hook o utilidad para gestionar CRUD de API Keys en `localStorage` (formato: `[{ id, name, key, active }]`).
- [x] 2.2 Modificar `src/services/api.js` para incluir automáticamente el header `X-Goog-Api-Key` en todas las peticiones, obteniéndolo de la clave activa en `localStorage`.
- [x] 2.3 Crear componente `ApiKeyManager.jsx` para listar, añadir y eliminar claves.
- [x] 2.4 Crear componente `ApiKeyModal.jsx` (basado en `InputModal`) para la configuración inicial forzada.

## 3. Integración y Layout

- [x] 3.1 Integrar `ApiKeyManager` en la interfaz principal (posiblemente en una sección de "Configuración" o junto al buscador).
- [x] 3.2 Implementar lógica en `App.jsx` para detectar la ausencia de claves y disparar el `ApiKeyModal`.
- [x] 3.3 Añadir feedback visual (Toast) cuando se cambia de API Key exitosamente.
- [x] 3.4 Verificar que al cambiar la clave, se refresquen automáticamente los stores y documentos.
