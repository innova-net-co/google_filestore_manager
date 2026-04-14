## MODIFIED Requirements

### Requirement: Listar documentos de un store
El sistema SHALL cargar y mostrar todos los documentos de un store seleccionado, usando el endpoint `fileSearchStores.documents.list` con paginación automática. Los documentos ya no incluirán metadatos de previsualización local (`hasLocalPreview`, `previewUrl`).

#### Scenario: Seleccionar un store
- **WHEN** el usuario hace clic sobre un store en el árbol
- **THEN** el sistema MUST hacer un GET a `/api/stores/:id/documents` y mostrar los documentos como nodos hijos dentro del store, omitiendo cualquier lógica de previsualización de archivos local

#### Scenario: Información del documento
- **WHEN** se muestran los documentos
- **THEN** cada documento MUST mostrar su `displayName`, `mimeType`, `sizeBytes` formateado, y un badge de estado (ACTIVE=verde, PENDING=amarillo, FAILED=rojo) sin ofrecer ninguna acción de "Ver" o "Abrir"

## REMOVED Requirements

### Requirement: Visualización de archivos locales
**Reason**: Los archivos de Google Filestore no son directamente accesibles o descargables desde la infraestructura actual del administrador.
**Migration**: Ninguna. La gestión de archivos se realizará exclusivamente a través de los metadatos y estados proporcionados por la API de Google.
