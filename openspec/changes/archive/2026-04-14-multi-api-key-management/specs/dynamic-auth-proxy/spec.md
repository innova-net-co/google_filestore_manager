## ADDED Requirements

### Requirement: Extracción Obligatoria de API Key desde Headers
El servidor SHALL extraer la API Key de Google exclusivamente desde el header `X-Goog-Api-Key` en cada petición recibida desde el frontend. No se debe buscar en variables de entorno.

#### Scenario: Request con header presente
- **WHEN** se recibe un request con el header `X-Goog-Api-Key: mi-clave-dinamica`
- **THEN** el sistema MUST usar `mi-clave-dinamica` para todas las llamadas a la API de Google originadas por ese request

### Requirement: Rechazo de peticiones sin API Key
El sistema SHALL retornar un error 401 si no se proporciona el header `X-Goog-Api-Key`.

#### Scenario: Request sin header
- **WHEN** el backend recibe un request y falta el header `X-Goog-Api-Key`
- **THEN** el sistema MUST retornar `{ error: "No API Key provided. Please configure one in your browser." }` con status 401
