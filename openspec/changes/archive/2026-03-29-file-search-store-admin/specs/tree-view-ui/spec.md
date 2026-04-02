## ADDED Requirements

### Requirement: Layout de dos paneles
El sistema SHALL mostrar una interfaz dividida en panel lateral izquierdo (árbol) y panel principal derecho (contenido/detalles).

#### Scenario: Vista inicial
- **WHEN** la aplicación carga por primera vez
- **THEN** MUST mostrar el panel lateral con el árbol de stores y el panel principal con un mensaje de bienvenida

#### Scenario: Responsividad
- **WHEN** la ventana es menor a 768px
- **THEN** el panel lateral MUST poder ocultarse/mostrarse tipo drawer para priorizar el contenido

---

### Requirement: Árbol de stores como carpetas
El sistema SHALL representar cada store como un nodo de carpeta expandible en el panel lateral.

#### Scenario: Visualización de stores
- **WHEN** los stores se cargan
- **THEN** cada store MUST mostrarse con icono de carpeta, nombre, y un indicador visual del número de documentos

#### Scenario: Expandir store
- **WHEN** el usuario hace clic en un store/carpeta
- **THEN** el nodo MUST expandirse mostrando los documentos como nodos hijos con iconos de archivo

#### Scenario: Colapsar store
- **WHEN** el usuario vuelve a hacer clic en un store expandido
- **THEN** el nodo MUST colapsarse ocultando sus documentos hijos

---

### Requirement: Documentos como archivos en el árbol
El sistema SHALL representar cada documento como un nodo hijo dentro de su store padre con información visual de estado.

#### Scenario: Documento activo
- **WHEN** un documento tiene estado STATE_ACTIVE
- **THEN** MUST mostrarse con badge verde y el icono de archivo normal

#### Scenario: Documento pendiente
- **WHEN** un documento tiene estado STATE_PENDING
- **THEN** MUST mostrarse con badge amarillo y una animación sutil de procesamiento

#### Scenario: Documento fallido
- **WHEN** un documento tiene estado STATE_FAILED
- **THEN** MUST mostrarse con badge rojo e icono de advertencia

---

### Requirement: Toolbar contextual
El sistema SHALL mostrar una barra de herramientas con acciones relevantes según el elemento seleccionado.

#### Scenario: Sin selección
- **WHEN** no hay ningún store seleccionado
- **THEN** la toolbar MUST mostrar solo el botón "Nuevo Store" y "Refrescar"

#### Scenario: Store seleccionado
- **WHEN** un store está seleccionado
- **THEN** la toolbar MUST mostrar "Nuevo Store", "Eliminar Store", "Subir Archivo" y "Refrescar"

#### Scenario: Documento seleccionado
- **WHEN** un documento está seleccionado
- **THEN** la toolbar MUST mostrar "Eliminar Documento" y "Refrescar"

---

### Requirement: Feedback visual de operaciones
El sistema SHALL proporcionar feedback visual durante todas las operaciones asíncronas.

#### Scenario: Operación en progreso
- **WHEN** una operación (crear, eliminar, subir) está en curso
- **THEN** el sistema MUST mostrar un spinner/loading indicator en el elemento afectado y deshabilitar acciones duplicadas

#### Scenario: Operación exitosa
- **WHEN** una operación se completa correctamente
- **THEN** el sistema MUST mostrar un toast de éxito con duración de 3 segundos y actualizar el árbol

#### Scenario: Operación fallida
- **WHEN** una operación falla
- **THEN** el sistema MUST mostrar un toast de error con el mensaje de error y duración de 5 segundos

---

### Requirement: Tema visual dark premium
El sistema SHALL usar un tema oscuro con estética moderna y premium.

#### Scenario: Apariencia general
- **WHEN** la aplicación se renderiza
- **THEN** MUST usar fondo oscuro, colores acentuados (azul/cyan), tipografía Inter/Roboto, bordes sutiles, y animaciones de transición suaves
