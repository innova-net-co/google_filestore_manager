## 1. Refactorización del Backend

- [x] 1.1 Modificar `server/index.js` para exportar la aplicación Express como un middleware reutilizable.
- [x] 1.2 Asegurar que el middleware de extracción de API Key funcione correctamente fuera del servidor Express independiente.
- [x] 1.3 Eliminar el middleware de CORS de la aplicación principal.

## 2. Integración con Vite (Entorno de Desarrollo)

- [x] 2.1 Modificar `vite.config.js` para importar el middleware de Express.
- [x] 2.2 Implementar el hook `configureServer` en Vite para capturar rutas de `/api`.
- [x] 2.3 Actualizar el script `npm run dev` para eliminar la dependencia de un servidor backend separado.

## 3. Servidor Unificado (Producción)

- [x] 3.1 Actualizar `server/index.js` para detectar si el entorno es producción (ej. `process.env.NODE_ENV === 'production'`).
- [x] 3.2 Configurar el servidor para servir archivos estáticos desde `dist/` usando `express.static`.
- [x] 3.3 Implementar el fallback de SPA para que las rutas del frontend se manejen correctamente en el servidor Express.

## 4. Limpieza y Configuración Final

- [x] 4.1 Actualizar `package.json` unificando scripts de inicio y eliminando dependencias innecesarias si aplica.
- [x] 4.2 Probar que la subida de archivos (upload) sigue funcionando correctamente a través del middleware de Vite.
- [x] 4.3 Eliminar configuraciones de proxy obsoletas en `vite.config.js`.
