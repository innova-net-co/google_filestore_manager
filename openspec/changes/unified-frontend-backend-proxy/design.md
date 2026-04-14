## Context

Actualmente el proyecto está dividido en dos aplicaciones independientes: un frontend basado en Vite y un backend basado en Express. Esto requiere que el desarrollador gestione dos terminales y dos puertos diferentes, lo cual introduce fricción y complica el despliegue a entornos de nube donde un único punto de entrada es preferible.

## Goals / Non-Goals

**Goals:**
- Unificar la ejecución de la aplicación en un solo comando (`npm run dev`).
- Eliminar la necesidad de configuración de CORS entre el frontend y el backend local.
- Asegurar que el servidor de producción sirva tanto la API como los archivos estáticos del frontend.
- Mantener la lógica de proxy dinámico a Google API intacta.

**Non-Goals:**
- Reescribir la lógica de negocio de las rutas existentes.
- Cambiar la tecnología del frontend o del backend.
- Implementar autenticación de usuario (solo se mantiene el API Key dinámico).

## Decisions

### 1. Integración de Middlewares en el servidor de desarrollo de Vite
Se utilizará el hook `configureServer` en `vite.config.js` para inyectar las rutas de Express directamente en el servidor de desarrollo. 
- **Razón**: Esto elimina la necesidad de un proceso de Node separado en desarrollo y permite que Vite maneje todo el ciclo de vida del request.
- **Alternativa**: Usar `concurrently` para lanzar ambos. **Rechazado** porque no soluciona el problema de los dos puertos y el CORS.

### 2. Punto de entrada único para Producción
El archivo `server/index.js` se modificará para detectar si el entorno es producción y, en ese caso, servir los archivos estáticos de la carpeta `dist/`.
- **Razón**: Simplifica el despliegue a servicios como Google Cloud Run o App Engine, que esperan un único proceso escuchando en un puerto.

### 3. Refactorización de rutas a Middlewares Reutilizables
Las rutas en `server/routes/` se mantendrán como routers de Express, lo que permite que sean montadas tanto en el servidor Express independiente como en el middleware de Vite.

## Risks / Trade-offs

- **[Riesgo] Colisión de Rutas** → **Mitigación**: Todas las rutas del backend deben estar bajo el prefijo `/api`. Las rutas del frontend deben ser manejadas por el middleware de fallback de Vite (SPA routing).
- **[Riesgo] Configuración de Entorno** → **Mitigación**: Unificar la carga de `.env` para que ambos componentes compartan la misma configuración de puerto y variables.
