## Why

El árbol de navegación izquierdo actualmente muestra todos los stores de la clave activa en una lista plana sin agruparlos por clave API. Esto dificulta la gestión cuando se trabaja con múltiples claves, ya que no hay visibilidad de qué stores pertenecen a qué clave. Además, la subida de archivos requiere seleccionar un store y luego usar la toolbar superior, añadiendo fricción innecesaria.

## What Changes

- **Agregar botón "Crear Clave"** en la parte superior del panel lateral, reemplazando la funcionalidad de ApiKeyManager actual o integrado en el árbol
- **Reorganizar el árbol** para mostrar cada clave API como nodo raíz colapsable, con sus stores como hijos directos
- **Comportamiento acordeón**: solo una clave puede estar expandida a la vez; al abrir una, se cierra la que estaba abierta
- **Botón "Adicionar Store"** inline en cada fila de clave API (en lugar del botón global en toolbar)
- **Botón de subir archivo** inline en cada fila de store dentro del árbol
- **Eliminar el botón "Crear Store"** de la Toolbar superior
- Cargar stores de cada clave bajo demanda al expandir su nodo en el árbol

## Capabilities

### New Capabilities

- `tree-view-accordion`: Árbol de navegación con estructura jerárquica Clave→Store→Documentos, acordeón de claves, botón de crear store por clave y botón de subir archivo por store

### Modified Capabilities

- `tree-view-ui`: Cambio en requisitos de estructura del árbol — de lista plana de stores a jerarquía Clave→Store; cambio en el punto de entrada para crear stores (de toolbar global a inline por clave); adición de acción de upload inline por store

## Impact

- `src/components/TreeView.jsx`: Refactorización completa para estructura acordeón por clave
- `src/components/ApiKeyManager.jsx`: Posible integración o simplificación (botón "Crear Clave" se mueve al árbol)
- `src/components/Toolbar.jsx`: Eliminar botón "Crear Store"; mantener Eliminar Store, Refrescar, Eliminar Documento
- `src/App.jsx`: Lógica de carga de stores por clave activa; pasar callbacks de upload y crear store al TreeView
- `src/hooks/useStores.js`: Potencialmente cargar stores por clave bajo demanda
