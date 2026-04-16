## MODIFIED Requirements

### Requirement: Listar documentos de un store
El sistema SHALL cargar y mostrar todos los documentos de un store seleccionado, usando el endpoint `fileSearchStores.documents.list` con paginación automática. Los documentos ya no incluirán metadatos de previsualización local (`hasLocalPreview`, `previewUrl`). El sistema SHALL gestionar el estado de los documentos mediante React Query, asegurando reactividad automática.

#### Scenario: Seleccionar un store
- **WHEN** el usuario hace clic sobre un store en el árbol
- **THEN** el sistema MUST hacer un GET a `/api/stores/:id/documents` usando `useQuery` y mostrar los documentos como nodos hijos dentro del store.

#### Scenario: Store vacío
- **WHEN** un store no tiene documentos
- **THEN** el sistema MUST mostrar un mensaje "Sin documentos" dentro del nodo del store y habilitar la opción de subir archivos.

#### Scenario: Información del documento
- **WHEN** se muestran los documentos
- **THEN** cada documento MUST mostrar su `displayName`, `mimeType`, `sizeBytes` formateado, y un badge de estado (ACTIVE=verde, PENDING=amarillo, FAILED=rojo) sin ofrecer ninguna acción de "Ver" o "Abrir".

#### Scenario: Actualización automática por estado pendiente
- **WHEN** uno o más documentos están en estado `STATE_PENDING`
- **THEN** el sistema MUST activar un intervalo de refresco automático (polling) cada 5 segundos que se detendrá una vez que todos los documentos alcancen un estado final (`STATE_ACTIVE` o `STATE_FAILED`).

---

### Requirement: Eliminar documento
El sistema SHALL permitir eliminar un documento individual de un store usando el endpoint `fileSearchStores.documents.delete` con `force=true`. La eliminación SHALL realizarse mediante una mutación de React Query que invalide la caché de documentos al completarse.

#### Scenario: Eliminación con confirmación
- **WHEN** el usuario hace clic en "Eliminar" sobre un documento
- **THEN** el sistema MUST mostrar un modal de confirmación con el nombre del documento.

#### Scenario: Eliminación confirmada
- **WHEN** el usuario confirma la eliminación del documento
- **THEN** el sistema MUST ejecutar una mutación que envíe un DELETE a `/api/stores/:storeId/documents/:docId`, invalide la query de documentos del store y remueva el documento del árbol automáticamente.

#### Scenario: Error al eliminar
- **WHEN** la API retorna un error al eliminar un documento
- **THEN** el sistema MUST mostrar una notificación con el detalle del error.

---

### Requirement: Subir archivo a un store
El sistema SHALL permitir subir archivos a un store seleccionado usando el endpoint `media.uploadToFileSearchStore` mediante upload multipart. La carga SHALL realizarse mediante una mutación de React Query que invalide la caché de documentos tras una subida exitosa.

#### Scenario: Seleccionar archivo para subir
- **WHEN** el usuario hace clic en "Subir Archivo" en un store
- **THEN** el sistema MUST abrir un diálogo de selección de archivos del sistema operativo.

#### Scenario: Upload exitoso
- **WHEN** el usuario selecciona un archivo y se completa la subida
- **THEN** el sistema MUST ejecutar una mutación que envíe un POST multipart a `/api/stores/:id/upload`, invalide la query de documentos del store y muestre el nuevo documento en la lista (posiblemente en estado PENDING) sin requerir recarga manual de la página.

#### Scenario: Upload fallido
- **WHEN** la subida falla por error de red o API
- **THEN** el sistema MUST mostrar una notificación de error y mantener la lista de documentos actual.
