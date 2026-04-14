## MODIFIED Requirements

### Requirement: Servidor Express con proxy a Google API
El sistema SHALL exponer un middleware de proxy que actúe entre el frontend y la API de Google Generative Language v1beta, integrado en un servidor unificado.

#### Scenario: Servidor iniciado
- **WHEN** se ejecuta `npm run dev` o el comando de inicio de producción
- **THEN** un único proceso MUST iniciar el servidor que maneja tanto el frontend como los endpoints de `/api`

#### Scenario: API key dinámica obligatoria
- **WHEN** el servidor recibe un request
- **THEN** MUST usar la API Key proporcionada en el header `X-Goog-Api-Key` en todas las llamadas a Google API. Si el header falta, MUST retornar error 401.

#### Scenario: No usar .env
- **WHEN** el servidor inicia o procesa un request
- **THEN** MUST ignorar cualquier variable `GOOGLE_API_KEY` en el `.env`, delegando la autenticación totalmente al cliente

## REMOVED Requirements

### Requirement: CORS habilitado
**Reason**: Al unificar el frontend y el backend en un solo servidor y puerto, ya no se requiere configuración de CORS para la comunicación interna.
**Migration**: Eliminar el middleware de CORS y asegurar que las peticiones se realicen de forma relativa o al mismo host.
