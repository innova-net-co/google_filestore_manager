## MODIFIED Requirements

### Requirement: Servidor Express con proxy a Google API
El sistema SHALL exponer un servidor Express que actúe como proxy entre el frontend y la API de Google Generative Language v1beta.

#### Scenario: Servidor iniciado
- **WHEN** se ejecuta `npm run dev` o `node server/index.js`
- **THEN** el servidor Express MUST iniciar en un puerto configurable (default 3001) y servir los endpoints definidos

#### Scenario: API key dinámica obligatoria
- **WHEN** el servidor recibe un request
- **THEN** MUST usar la API Key proporcionada en el header `X-Goog-Api-Key` en todas las llamadas a Google API. Si el header falta, MUST retornar error 401.

#### Scenario: No usar .env
- **WHEN** el servidor inicia o procesa un request
- **THEN** MUST ignorar cualquier variable `GOOGLE_API_KEY` en el `.env`, delegando la autenticación totalmente al cliente
