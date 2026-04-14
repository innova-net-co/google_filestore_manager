## Context

El sistema actual es un proxy que conecta el frontend con la API de Google Gemini para gestionar Filestore. La autenticación se realiza mediante una `GOOGLE_API_KEY` fija en el servidor. El usuario requiere la capacidad de cambiar de clave dinámicamente para acceder a diferentes entornos o proyectos sin reiniciar el servidor.

## Goals / Non-Goals

**Goals:**
- Permitir al usuario registrar múltiples API Keys con nombres descriptivos.
- Persistir las claves localmente en el navegador (LocalStorage).
- Implementar un mecanismo de "Pasarela" en el backend que use exclusivamente la clave enviada por el cliente.
- Asegurar que la aplicación no funcione sin una clave válida (mostrar modal de configuración).
- Eliminar por completo el uso de la clave del archivo `.env`.

**Non-Goals:**
- Almacenamiento de claves en base de datos del servidor.
- Cifrado avanzado de claves en el cliente (se asume entorno de confianza del usuario).
- Soporte para variables de entorno en el servidor para API Keys.

## Decisions

### 1. Header `X-Goog-Api-Key` para transporte de credenciales
**Decisión**: Usar un header personalizado `X-Goog-Api-Key` en todas las peticiones.
**Razón**: El backend dejará de tener una clave estática. Todas las credenciales deben ser proporcionadas por el cliente en cada request.

### 2. Estructura de datos en LocalStorage
**Decisión**: Almacenar un arreglo de objetos `[{ id, name, key, active: boolean }]`.
**Razón**: Permite identificar fácilmente la clave actual y gestionar múltiples perfiles de forma intuitiva.

### 3. Middleware de Requerimiento de Key en Express
**Decisión**: Implementar un middleware que rechace cualquier petición que no incluya el header `X-Goog-Api-Key`.
**Razón**: Garantiza que el proxy no intente realizar llamadas a Google sin credenciales válidas.

## Risks / Trade-offs

- **[Seguridad] Claves en LocalStorage** → Cualquier script malicioso (XSS) podría leer las claves. **Mitigación**: El proyecto no tiene scripts externos de terceros y se limita a uso administrativo controlado.
- **[UX] Pérdida de datos al borrar caché** → Si el usuario borra los datos del sitio, pierde las keys. **Mitigación**: Indicar claramente que las claves se guardan localmente.
- **[Backend] Error de Google API por key inválida** → El backend debe propagar correctamente el error 401/403 de Google. **Mitigación**: El proxy ya maneja y propaga errores de Google API.
