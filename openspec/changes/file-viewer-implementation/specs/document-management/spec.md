## MODIFIED Requirements

### Requirement: Listar documentos de un store
El sistema SHALL cargar y mostrar todos los documentos de un store seleccionado, usando el endpoint `fileSearchStores.documents.list` con paginación automática. Para los documentos que tengan una copia local, el sistema MUST incluir información que permita generar una URL de previsualización.

#### Scenario: Seleccionar un store
- **WHEN** el usuario hace clic sobre un store en el árbol
- **THEN** el sistema MUST hacer un GET a `/api/stores/:id/documents`, mostrar los documentos como nodos hijos, y habilitar el botón de "Ver" para aquellos con disponibilidad local

### Requirement: Subir archivo a un store
El sistema SHALL permitir subir archivos a un store seleccionado usando el endpoint `media.uploadToFileSearchStore` mediante upload multipart. Simultáneamente, el sistema MUST guardar una copia del archivo en el servidor local para propósitos de previsualización.

#### Scenario: Upload exitoso y persistencia local
- **WHEN** el usuario selecciona un archivo y se completa la subida
- **THEN** el sistema MUST enviar un POST multipart a `/api/stores/:id/upload`, guardar el archivo en `server/uploads/:storeId/`, y agregar el nuevo documento al árbol con la opción de previsualización habilitada
