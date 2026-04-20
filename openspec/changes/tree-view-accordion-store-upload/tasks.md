## 1. Preparación y análisis

- [x] 1.1 Revisar `src/hooks/useStores.js` y `src/services/api.js` para entender cómo se cargan los stores actualmente
- [x] 1.2 Revisar `src/hooks/useApiKeys.js` para entender la estructura de datos de las claves

## 2. Refactorizar hook useStores para carga por clave

- [x] 2.1 Modificar `useStores.js` para soportar carga de stores por keyId específico (no solo la clave activa)
- [x] 2.2 Agregar mapa de estado `storesByKey: { [keyId]: stores[] }` al hook
- [x] 2.3 Agregar estado de loading por clave `loadingByKey: { [keyId]: boolean }`

## 3. Modificar App.jsx

- [x] 3.1 Pasar `keys` del hook `useApiKeys` al componente `TreeView`
- [x] 3.2 Pasar `storesByKey` y `loadingByKey` al `TreeView`
- [x] 3.3 Agregar callback `handleLoadStores(keyId)` y pasarlo al `TreeView`
- [x] 3.4 Modificar `handleCreateStore` para aceptar `keyId` como parámetro y usarlo al crear el store
- [x] 3.5 Pasar `handleUploadFile`, `handleCreateStore` y `handleLoadStores` al `TreeView`
- [x] 3.6 Pasar callback `onCreateKey` al `TreeView` para abrir el modal de nueva clave

## 4. Refactorizar TreeView.jsx

- [x] 4.1 Cambiar props del componente: recibir `keys`, `storesByKey`, `loadingByKey`, `onLoadStores`, `onCreateStore`, `onUploadFile`, `onCreateKey` en lugar de `stores`
- [x] 4.2 Agregar estado de acordeón `expandedKeyId` (string | null) en lugar del Set anterior
- [x] 4.3 Implementar lógica del acordeón: al expandir una clave, cerrar la anterior y llamar `onLoadStores(keyId)` si no tiene stores cargados
- [x] 4.4 Crear componente `KeyNode` que renderice la fila de una clave con: nombre, indicador de expansión, botón "Adicionar Store"
- [x] 4.5 Agregar botón "Crear Clave" en la parte superior del árbol que llame a `onCreateKey`
- [x] 4.6 Modificar `StoreNode` para agregar botón de upload con `<input type="file" hidden>` y ref, disparado por clic en el botón de upload
- [x] 4.7 Deshabilitar el botón de upload del store cuando `uploading` es true para ese store
- [x] 4.8 Mostrar spinner en el nodo de clave mientras `loadingByKey[keyId]` es true
- [x] 4.9 Mostrar mensaje "Sin stores" cuando una clave expandida no tiene stores

## 5. Modificar Toolbar.jsx

- [x] 5.1 Eliminar el botón "Crear Store" y su prop `onCreateStore` de la Toolbar
- [x] 5.2 Ajustar la lógica de visibilidad de botones según los nuevos requisitos (sin selección → solo Refrescar)
- [x] 5.3 Verificar que los botones restantes (Eliminar Store, Eliminar Documento, Refrescar) sigan funcionando

## 6. Actualizar App.jsx para modal de crear store con contexto de clave

- [x] 6.1 Modificar el estado del modal `showCreateModal` para incluir el `keyId` de la clave donde se creará el store
- [x] 6.2 Pasar el `keyId` al llamar `handleCreateStore` desde el modal

## 7. Pruebas y ajustes visuales

- [x] 7.1 Verificar que el acordeón funciona correctamente (abrir A cierra B)
- [x] 7.2 Verificar que la subida de archivo desde el árbol funciona y muestra feedback (toast)
- [x] 7.3 Verificar que crear store desde el árbol (por clave) funciona correctamente
- [x] 7.4 Verificar que el botón "Crear Clave" abre el formulario/modal correspondiente
- [x] 7.5 Verificar responsividad en móvil del árbol reestructurado
- [x] 7.6 Ajustar estilos CSS en `index.css` si es necesario para los nuevos elementos del árbol
