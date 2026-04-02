## ADDED Requirements

### Requirement: Listar documentos de un store
El sistema SHALL cargar y mostrar todos los documentos de un store seleccionado, usando el endpoint `fileSearchStores.documents.list` con paginación automática.

#### Scenario: Seleccionar un store
- **WHEN** el usuario hace clic sobre un store en el árbol
- **THEN** el sistema MUST hacer un GET a `/api/stores/:id/documents` y mostrar los documentos como nodos hijos dentro del store

#### Scenario: Store vacío
- **WHEN** un store no tiene documentos
- **THEN** el sistema MUST mostrar un mensaje "Sin documentos" dentro del nodo del store y habilitar la opción de subir archivos

#### Scenario: Información del documento
- **WHEN** se muestran los documentos
- **THEN** cada documento MUST mostrar su `displayName`, `mimeType`, `sizeBytes` formateado, y un badge de estado (ACTIVE=verde, PENDING=amarillo, FAILED=rojo)

---

### Requirement: Eliminar documento
El sistema SHALL permitir eliminar un documento individual de un store usando el endpoint `fileSearchStores.documents.delete` con `force=true`.

#### Scenario: Eliminación con confirmación
- **WHEN** el usuario hace clic en "Eliminar" sobre un documento
- **THEN** el sistema MUST mostrar un modal de confirmación con el nombre del documento

#### Scenario: Eliminación confirmada
- **WHEN** el usuario confirma la eliminación del documento
- **THEN** el sistema MUST enviar un DELETE a `/api/stores/:storeId/documents/:docId` y remover el documento del árbol

#### Scenario: Error al eliminar
- **WHEN** la API retorna un error al eliminar un documento
- **THEN** el sistema MUST mostrar una notificación con el detalle del error

---

### Requirement: Subir archivo a un store
El sistema SHALL permitir subir archivos a un store seleccionado usando el endpoint `media.uploadToFileSearchStore` mediante upload multipart.

#### Scenario: Seleccionar archivo para subir
- **WHEN** el usuario hace clic en "Subir Archivo" en un store
- **THEN** el sistema MUST abrir un diálogo de selección de archivos del sistema operativo

#### Scenario: Upload exitoso
- **WHEN** el usuario selecciona un archivo y se completa la subida
- **THEN** el sistema MUST enviar un POST multipart a `/api/stores/:id/upload` con el archivo, mostrar un indicador de progreso durante la subida, y agregar el nuevo documento al árbol (posiblemente en estado PENDING)

#### Scenario: Upload fallido
- **WHEN** la subida falla por error de red o API
- **THEN** el sistema MUST mostrar una notificación de error y mantener el árbol sin cambios
