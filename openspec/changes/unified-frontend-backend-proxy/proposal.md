## Why

Actualmente el proyecto requiere ejecutar dos procesos por separado: el servidor de desarrollo de Vite para el frontend y un servidor Express para el backend. Esto complica el flujo de trabajo, el despliegue y la gestión de puertos. Unificar ambos en un solo sitio mediante un proxy inverso integrado facilitará el desarrollo y simplificará la arquitectura.

## What Changes

- **Eliminación del servidor Express independiente**: Se eliminará la necesidad de ejecutar `node server/index.js` como un proceso separado.
- **Integración de lógica de backend en Vite**: La lógica de proxy y manejo de peticiones a la API de Google se integrará directamente en el servidor de desarrollo de Vite mediante middleware.
- **Servidor Unificado para Producción**: Se creará un punto de entrada único que servirá tanto los archivos estáticos del frontend como la API en producción.
- **Simplificación de la Configuración**: Se unificarán las variables de entorno y la configuración de puertos.

## Capabilities

### New Capabilities
- `unified-proxy-middleware`: Implementación de la lógica de proxy dinámico y manejo de archivos (upload) directamente como middleware de Vite/Node.

### Modified Capabilities
- `api-proxy-backend`: Se modificará para que el proxy no sea un servidor Express separado, sino una función integrada en el ciclo de vida del frontend.

## Impact

- `vite.config.js`: Se expandirá para incluir la lógica de proxy personalizada.
- `package.json`: Se actualizarán los scripts para iniciar un único proceso.
- `server/`: Este directorio será refactorizado o integrado en la estructura raíz/src dependiendo de la estrategia de producción.
- `src/services/api.js`: Debería permanecer igual ya que la ruta `/api` se mantendrá, pero ahora será manejada internamente.
