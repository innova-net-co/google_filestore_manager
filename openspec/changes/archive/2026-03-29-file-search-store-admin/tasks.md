## 1. Inicialización del Proyecto

- [x] 1.1 Inicializar proyecto React con Vite usando `npx create-vite` (template react)
- [x] 1.2 Crear archivo `.env.example` con `GOOGLE_API_KEY=your_key_here`
- [x] 1.3 Crear `.gitignore` con `.env`, `node_modules/`, `dist/`
- [x] 1.4 Instalar dependencias frontend adicionales si necesarias

## 2. Backend - Express Proxy Server

- [x] 2.1 Instalar dependencias backend: `express`, `dotenv`, `cors`, `multer`, `node-fetch`
- [x] 2.2 Crear `server/index.js` con Express server, dotenv, CORS, validación de API key
- [x] 2.3 Crear `server/routes/stores.js` con endpoints GET/POST/DELETE para stores
- [x] 2.4 Crear `server/routes/documents.js` con endpoints GET/DELETE para documentos
- [x] 2.5 Crear endpoint POST upload en `server/routes/documents.js` con multer para subir archivos
- [x] 2.6 Verificar que todos los endpoints proxy hacen las llamadas correctas a Google API

## 3. Frontend - Design System y Layout

- [x] 3.1 Crear `src/styles/index.css` con design tokens (colores dark, tipografía, spacing, animaciones)
- [x] 3.2 Crear `App.jsx` con layout base: sidebar + panel principal + toolbar
- [x] 3.3 Configurar `vite.config.js` con proxy a backend Express en desarrollo

## 4. Frontend - Servicios y Hooks

- [x] 4.1 Crear `src/services/api.js` cliente HTTP con funciones para todos los endpoints del backend
- [x] 4.2 Crear `src/hooks/useStores.js` custom hook para listar, crear y eliminar stores
- [x] 4.3 Crear `src/hooks/useDocuments.js` custom hook para listar, eliminar documentos y subir archivos

## 5. Frontend - Componentes React

- [x] 5.1 Crear `src/components/TreeView.jsx` componente de árbol con stores como carpetas expandibles
- [x] 5.2 Crear `src/components/StorePanel.jsx` panel de detalle del store seleccionado con info y listado
- [x] 5.3 Crear `src/components/Toolbar.jsx` barra de herramientas contextual (Nuevo, Eliminar, Subir, Refrescar)
- [x] 5.4 Crear `src/components/Modal.jsx` modales reutilizables (confirmación, crear store)
- [x] 5.5 Crear `src/components/Toast.jsx` sistema de notificaciones toast para feedback

## 6. Frontend - Integración y Flujos

- [x] 6.1 Integrar en `App.jsx`: inicializar app, conectar hooks con componentes
- [x] 6.2 Implementar flujo: seleccionar store → cargar documentos → mostrar en árbol
- [x] 6.3 Implementar flujo: crear store → refrescar árbol
- [x] 6.4 Implementar flujo: eliminar store → confirmación → refrescar árbol
- [x] 6.5 Implementar flujo: subir archivo → seleccionar archivo → progress → refrescar documentos
- [x] 6.6 Implementar flujo: eliminar documento → confirmación → refrescar documentos

## 7. Polish y UX

- [x] 7.1 Agregar animaciones de transición al expandir/colapsar nodos del árbol
- [x] 7.2 Agregar estados de loading (spinners) durante las operaciones asíncronas
- [x] 7.3 Agregar badges de estado para documentos (verde=active, amarillo=pending, rojo=failed)
- [x] 7.4 Asegurar responsividad para pantallas menores a 768px (drawer sidebar)
- [x] 7.5 Verificación end-to-end: crear store, subir archivo, ver archivo, eliminar archivo, eliminar store
