## MODIFIED Requirements

### Requirement: Toolbar contextual
El sistema SHALL mostrar una barra de herramientas con acciones relevantes según el elemento seleccionado, eliminando cualquier acción relacionada con la previsualización.

#### Scenario: Documento seleccionado
- **WHEN** un documento está seleccionado
- **THEN** la toolbar MUST mostrar solo "Eliminar Documento" y "Refrescar" como acciones principales

## REMOVED Requirements

### Requirement: Acción de ver documento
**Reason**: La previsualización ya no está soportada para archivos en Google Filestore.
**Migration**: El usuario puede gestionar el documento solo a través de metadatos o herramientas externas de Google Cloud.
