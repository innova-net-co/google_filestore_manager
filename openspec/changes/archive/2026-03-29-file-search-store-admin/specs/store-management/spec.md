## ADDED Requirements

### Requirement: Listar stores
El sistema SHALL obtener y mostrar todos los File Search Stores asociados a la API key configurada, usando el endpoint `fileSearchStores.list` con paginación automática.

#### Scenario: Carga inicial de stores
- **WHEN** la aplicación se inicia
- **THEN** el sistema MUST hacer un GET a `/api/stores` y mostrar todos los stores como nodos de carpeta en el árbol

#### Scenario: Store sin documentos cargados
- **WHEN** se listan los stores
- **THEN** cada store MUST mostrar su `displayName` (o el `name` si no tiene `displayName`), y los contadores de documentos activos/pendientes/fallidos

#### Scenario: No hay stores
- **WHEN** la API retorna una lista vacía
- **THEN** el sistema MUST mostrar un mensaje indicando que no hay stores y un botón para crear uno

---

### Requirement: Crear store
El sistema SHALL permitir crear un nuevo File Search Store proporcionando un nombre, usando el endpoint `fileSearchStores.create`.

#### Scenario: Creación exitosa
- **WHEN** el usuario hace clic en "Nuevo Store" e ingresa un nombre en el modal
- **THEN** el sistema MUST enviar un POST a `/api/stores` con `{ displayName: "<nombre>" }` y agregar el nuevo store al árbol

#### Scenario: Nombre vacío
- **WHEN** el usuario intenta crear un store sin nombre
- **THEN** el sistema MUST mostrar un error de validación y no enviar el request

#### Scenario: Error de API
- **WHEN** la API retorna un error al crear
- **THEN** el sistema MUST mostrar un toast/notificación con el mensaje de error

---

### Requirement: Eliminar store
El sistema SHALL permitir eliminar un File Search Store existente usando el endpoint `fileSearchStores.delete` con `force=true`.

#### Scenario: Eliminación con confirmación
- **WHEN** el usuario hace clic en "Eliminar" sobre un store
- **THEN** el sistema MUST mostrar un modal de confirmación indicando que se eliminarán todos los documentos contenidos

#### Scenario: Confirmación aceptada
- **WHEN** el usuario confirma la eliminación
- **THEN** el sistema MUST enviar un DELETE a `/api/stores/:id` y remover el store del árbol

#### Scenario: Confirmación cancelada
- **WHEN** el usuario cancela la confirmación
- **THEN** el store MUST permanecer sin cambios
