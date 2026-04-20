## Context

La aplicación gestiona File Search Stores de la API de Google. Actualmente, el panel lateral muestra un `ApiKeyManager` separado (para gestionar claves API) y debajo un `TreeView` que lista los stores de la clave activa en una lista plana. El usuario solicita que el árbol agrupe los stores bajo su clave API correspondiente, con comportamiento acordeón (solo una clave expandida a la vez), botones contextuales inline por clave (crear store) y por store (subir archivo), y eliminar el botón de crear store de la toolbar.

Estado actual:
- `TreeView.jsx` recibe `stores[]` ya cargados, sin conocimiento de claves
- `ApiKeyManager.jsx` gestiona las claves de forma independiente
- `Toolbar.jsx` tiene el botón "Crear Store" globalApp.jsx controla la clave activa y carga stores solo de la clave activa

## Goals / Non-Goals

**Goals:**
- Árbol jerárquico: Clave API → Stores → Documentos
- Acordeón en el nivel de claves (solo una expandida a la vez)
- Botón "Crear Clave" en la cabecera del panel lateral
- Botón "Adicionar Store" inline en cada fila de clave
- Botón de subida de archivo inline en cada fila de store
- Eliminar botón "Crear Store" de la Toolbar
- Carga de stores bajo demanda al expandir una clave

**Non-Goals:**
- Cambiar el backend/API de stores o documentos
- Eliminar la toolbar (solo modificarla)
- Cambiar el panel derecho (StorePanel)
- Cargar documentos inline en el árbol (siguen cargando en el panel derecho)

## Decisions

### Decisión 1: Carga de stores bajo demanda por clave

**Elegido**: Cargar stores solo cuando el usuario expande la clave en el árbol.

**Alternativas consideradas**:
- Cargar todos los stores de todas las claves al inicio → Demasiadas peticiones paralelas, mala performance con múltiples claves
- Mantener carga solo de la clave activa → No cumple el requisito visual de mostrar stores agrupados por clave

**Rationale**: La carga bajo demanda reduce el número de peticiones iniciales y es el patrón natural para un árbol acordeón. El estado de stores por clave se mantiene en caché local mientras la sesión esté activa.

---

### Decisión 2: Estado del acordeón en TreeView (expandedKeyId: string | null)

**Elegido**: Un solo estado `expandedKeyId` (string o null) en `TreeView.jsx` o manejado en `App.jsx`.

**Alternativas consideradas**:
- `Set` de claves expandidas como antes → No corresponde al comportamiento acordeón requerido
- Estado en `App.jsx` → Agrega complejidad innecesaria al padre; el acordeón es UI pura

**Rationale**: El acordeón es comportamiento visual, no estado de negocio. Mantenerlo en `TreeView` o en un nuevo `KeyNode` component es correcto. Al expandir una clave, se asigna su id a `expandedKeyId`; al hacer clic en la misma, se setea a null.

---

### Decisión 3: Botón de subida inline por store usando input file oculto

**Elegido**: Cada `StoreNode` dentro del árbol tiene un `<input type="file" hidden>` con un `ref`, disparado por clic en el botón de upload.

**Alternativas consideradas**:
- Abrir modal de confirmación antes → Agrega un paso innecesario para una acción simple
- Reutilizar el input de file de Toolbar → Acoplamiento no deseable entre árbol y toolbar

**Rationale**: El patrón de input oculto con ref es el estándar en React para disparar selección de archivo sin usar elementos nativos visibles. Permite que cada store tenga su propio contexto de upload.

---

### Decisión 4: Eliminar botón "Crear Store" de Toolbar

**Elegido**: Remover el botón de Toolbar y delegar esa acción al botón inline de cada clave en el árbol.

**Rationale**: La intención del usuario es explícita — crear un store bajo una clave específica. Tener el botón en el árbol, junto a la clave, hace más claro el contexto del store a crear.

---

### Decisión 5: Refactorizar TreeView para recibir keys y callback de carga de stores

**Elegido**: `TreeView` recibe `keys[]`, un mapa `storesByKey: { [keyId]: stores[] }`, loading states, y callbacks: `onLoadStores(keyId)`, `onCreateStore(keyId, name)`, `onUploadFile(storeId, file)`.

**Rationale**: Permite que `App.jsx` controle la lógica de datos mientras `TreeView` maneja solo la UI. Mantiene separación de responsabilidades.

## Risks / Trade-offs

- **[Riesgo] Latencia visible al expandir claves** → Mitigation: mostrar spinner en el nodo de clave mientras carga sus stores; usar caché local para no recargar si ya se cargaron
- **[Riesgo] Múltiples uploads simultáneos desde el árbol** → Mitigation: deshabilitar el botón de upload del store mientras hay un upload en progreso para ese store; el hook `useDocuments` ya tiene estado `uploading`
- **[Riesgo] ApiKeyManager actual se vuelve redundante** → Mitigation: integrar el botón "Crear Clave" en el header del sidebar; el ApiKeyManager puede simplificarse o integrarse directamente en el sidebar header

## Migration Plan

1. Modificar `App.jsx` para pasar `keys` al `TreeView` y agregar lógica de carga de stores por clave
2. Refactorizar `TreeView.jsx` completamente con la nueva estructura acordeón
3. Modificar `Toolbar.jsx` para eliminar el botón "Crear Store"
4. Agregar botón "Crear Clave" en el sidebar header (o en la parte superior del árbol)
5. Verificar que los modales de crear store y eliminar aún funcionen correctamente

**Rollback**: Los cambios son todos en el frontend. Para revertir, restaurar los componentes originales de TreeView, Toolbar y App.jsx.
