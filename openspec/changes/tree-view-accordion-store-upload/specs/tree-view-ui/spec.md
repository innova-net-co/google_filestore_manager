## MODIFIED Requirements

### Requirement: Árbol de stores como carpetas
El sistema SHALL representar la estructura del árbol con jerarquía Clave API → Stores → Documentos, donde cada store es un nodo hijo de su clave correspondiente.

#### Scenario: Visualización de stores bajo su clave
- **WHEN** el usuario expande una clave API en el árbol
- **THEN** los stores de esa clave MUST mostrarse como nodos hijos con icono de carpeta, nombre, y un indicador visual del número de documentos activos

#### Scenario: Expandir store para ver documentos
- **WHEN** el usuario hace clic en un store dentro de una clave expandida
- **THEN** el store MUST expandirse mostrando sus documentos como nodos hijos con iconos de archivo

#### Scenario: Colapsar store
- **WHEN** el usuario vuelve a hacer clic en un store expandido
- **THEN** el nodo MUST colapsarse ocultando sus documentos hijos

---

## MODIFIED Requirements

### Requirement: Toolbar contextual
El sistema SHALL mostrar una barra de herramientas con acciones relevantes según el elemento seleccionado, sin incluir el botón de creación de stores (que fue movido al árbol).

#### Scenario: Sin selección
- **WHEN** no hay ningún store seleccionado
- **THEN** la toolbar MUST mostrar solo el botón "Refrescar" (el botón "Nuevo Store" fue eliminado de la toolbar)

#### Scenario: Store seleccionado
- **WHEN** un store está seleccionado
- **THEN** la toolbar MUST mostrar "Eliminar Store" y "Refrescar" (la subida de archivo se hace desde el árbol)

#### Scenario: Documento seleccionado
- **WHEN** un documento está seleccionado
- **THEN** la toolbar MUST mostrar "Eliminar Documento" y "Refrescar"
