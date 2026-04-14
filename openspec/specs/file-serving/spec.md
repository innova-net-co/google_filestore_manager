## ADDED Requirements

### Requirement: Acceso a archivos locales
El sistema SHALL proveer un servicio para servir archivos almacenados localmente a través de una API.

#### Scenario: Acceso directo vía URL
- **WHEN** el frontend solicita un archivo usando `/api/files/:storeId/:docId`
- **THEN** el sistema MUST buscar el archivo correspondiente en la ruta local y retornarlo con el `Content-Type` adecuado

#### Scenario: Validación de existencia
- **WHEN** un archivo no existe localmente al ser solicitado por el frontend
- **THEN** el sistema MUST retornar un código 404 No Encontrado con un mensaje "Archivo no disponible localmente"
