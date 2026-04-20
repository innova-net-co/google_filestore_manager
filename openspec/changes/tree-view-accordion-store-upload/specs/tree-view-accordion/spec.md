## ADDED Requirements

### Requirement: Árbol jerárquico Clave→Store→Documentos
El sistema SHALL organizar el panel lateral izquierdo en una jerarquía de tres niveles: Clave API → Stores → Documentos.

#### Scenario: Visualización de claves en el árbol
- **WHEN** la aplicación carga con claves API configuradas
- **THEN** el árbol MUST mostrar cada clave API como un nodo raíz con su nombre y un indicador de expansión

#### Scenario: Expansión de clave para ver sus stores
- **WHEN** el usuario hace clic en una clave API en el árbol
- **THEN** el nodo MUST expandirse mostrando los stores asociados a esa clave como nodos hijos

#### Scenario: Carga bajo demanda de stores por clave
- **WHEN** el usuario expande una clave por primera vez
- **THEN** el sistema MUST mostrar un indicador de carga mientras obtiene los stores de esa clave y luego renderizarlos como nodos hijos

---

### Requirement: Comportamiento acordeón en el nivel de claves
El sistema SHALL implementar comportamiento acordeón en los nodos de clave del árbol, permitiendo que solo una clave esté expandida a la vez.

#### Scenario: Abrir clave cuando no hay ninguna abierta
- **WHEN** ninguna clave está expandida y el usuario hace clic en una clave
- **THEN** esa clave MUST expandirse mostrando sus stores

#### Scenario: Abrir clave cuando hay otra abierta
- **WHEN** la clave A está expandida y el usuario hace clic en la clave B
- **THEN** la clave A MUST colapsarse y la clave B MUST expandirse

#### Scenario: Cerrar clave expandida
- **WHEN** una clave está expandida y el usuario hace clic sobre ella
- **THEN** esa clave MUST colapsarse ocultando sus stores hijos

---

### Requirement: Botón "Crear Clave" en el panel lateral
El sistema SHALL mostrar un botón "Crear Clave" en la parte superior del panel lateral del árbol.

#### Scenario: Acción de crear clave
- **WHEN** el usuario hace clic en el botón "Crear Clave"
- **THEN** el sistema MUST abrir el formulario/modal para configurar una nueva API Key

---

### Requirement: Botón "Adicionar Store" inline por clave
El sistema SHALL mostrar un botón de acción rápida para crear store directamente en la fila de cada clave API del árbol.

#### Scenario: Visibilidad del botón adicionar store
- **WHEN** se renderizan los nodos de clave en el árbol
- **THEN** cada nodo de clave MUST mostrar un botón pequeño de "Adicionar Store" al final de su fila

#### Scenario: Crear store desde el árbol
- **WHEN** el usuario hace clic en el botón "Adicionar Store" de una clave específica
- **THEN** el sistema MUST abrir el modal de creación de store con la clave correspondiente como contexto, y al confirmar, crear el store bajo esa clave

---

### Requirement: Botón de subida de archivo inline por store
El sistema SHALL mostrar un botón de acción de subida de archivo directamente en la fila de cada store del árbol.

#### Scenario: Visibilidad del botón de subida en stores
- **WHEN** los stores de una clave están visibles en el árbol
- **THEN** cada nodo de store MUST mostrar un botón de upload al final de su fila

#### Scenario: Subir archivo desde el árbol
- **WHEN** el usuario hace clic en el botón de upload de un store
- **THEN** el sistema MUST abrir el selector de archivos del sistema operativo para ese store específico

#### Scenario: Inicio de subida
- **WHEN** el usuario selecciona un archivo en el selector
- **THEN** el sistema MUST iniciar la subida al store correspondiente y mostrar feedback visual de progreso en ese nodo

#### Scenario: Botón deshabilitado durante subida
- **WHEN** hay una subida en progreso para un store
- **THEN** el botón de upload de ese store MUST estar deshabilitado para evitar subidas duplicadas
