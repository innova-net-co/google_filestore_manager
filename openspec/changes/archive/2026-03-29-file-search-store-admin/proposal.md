## Why

Se necesita una herramienta visual para administrar los Google File Search Stores asociados a una API key. Actualmente no existe una interfaz gráfica para gestionar stores y sus documentos, lo que obliga a usar llamadas API directas. Un administrador tipo árbol (carpetas = stores, archivos = documentos) simplificará enormemente la gestión de RAG stores.

## What Changes

- Nueva aplicación web con interfaz de árbol para visualizar y gestionar File Search Stores
- Sidebar tipo explorador de archivos donde cada store se muestra como una carpeta
- Al seleccionar una carpeta/store, se cargan y muestran los documentos contenidos
- Operaciones CRUD sobre stores: crear nueva carpeta/store, eliminar store, subir archivos al store
- Operación de eliminación de documentos individuales dentro de un store
- API key de Google almacenada en archivo `.env` para configuración segura
- Backend proxy (Node/Express) para hacer las llamadas a la API de Google sin exponer la API key en el frontend
- Interfaz oscura, moderna y premium con animaciones y feedback visual

## Capabilities

### New Capabilities

- `store-management`: Listar, crear y eliminar File Search Stores usando la API de Google (`fileSearchStores.list`, `fileSearchStores.create`, `fileSearchStores.delete`)
- `document-management`: Listar y eliminar documentos dentro de un store (`fileSearchStores.documents.list`, `fileSearchStores.documents.delete`), y subir archivos nuevos (`media.uploadToFileSearchStore`)
- `tree-view-ui`: Interfaz tipo árbol/explorador de archivos con stores como carpetas y documentos como archivos, incluyendo estados visuales (pending, active, failed)
- `api-proxy-backend`: Backend Express que actúa como proxy a la API de Google, maneja la API key desde `.env` y expone endpoints REST seguros al frontend

### Modified Capabilities

_(Sin cambios en capacidades existentes — proyecto nuevo)_

## Impact

- **Nuevos archivos**: Proyecto completo frontend + backend
- **APIs consumidas**: Google Generative Language API v1beta (File Search Stores + Documents)
- **Dependencias**: Node.js, Express, dotenv, fetch/axios; Vite + vanilla JS/HTML/CSS para frontend (React)
- **Configuración**: Archivo `.env` con `GOOGLE_API_KEY`
