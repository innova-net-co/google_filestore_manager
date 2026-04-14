## ADDED Requirements

### Requirement: Middleware de proxy unificado en Vite
El sistema SHALL permitir que la lógica del backend se ejecute como parte del servidor de desarrollo de Vite.

#### Scenario: Configuración de Vite
- **WHEN** se carga `vite.config.js`
- **THEN** MUST incluir un plugin o configuración de middleware que capture las peticiones a `/api` y las procese usando la lógica de proxy a Google.

---

### Requirement: Servidor unificado para producción
El sistema SHALL proveer un único script de servidor para producción que sirva tanto la API como los archivos estáticos.

#### Scenario: Ejecución en producción
- **WHEN** se ejecuta el servidor de producción (ej. `node server/index.js` apuntando a `dist/`)
- **THEN** MUST servir el contenido de la carpeta `dist/` para rutas no pertenecientes a la API y manejar `/api` con el proxy.

---

### Requirement: Punto de entrada unificado
El sistema SHALL centralizar el arranque de la aplicación en un solo comando.

#### Scenario: Comando de desarrollo
- **WHEN** se ejecuta `npm run dev`
- **THEN** MUST iniciar el entorno de desarrollo que incluya automáticamente el soporte para la API sin requerir un segundo comando.
