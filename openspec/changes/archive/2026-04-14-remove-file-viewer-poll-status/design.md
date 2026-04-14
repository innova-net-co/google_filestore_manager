## Contexto

La funcionalidad de visualización de archivos implementada previamente dependía de una copia local de los archivos que no es viable mantener con Google Filestore. Esto causa que el botón de "Ver" sea inútil y confuso. Adicionalmente, el ciclo de vida de un documento subido a Google incluye una fase de indexación/procesamiento (estado `PENDING`) que actualmente requiere que el usuario refresque la página manualmente para ver el resultado final (`ACTIVE` o `FAILED`).

## Objetivos / No Objetivos

**Objetivos:**
- Eliminar el componente `FileViewer` y todas las referencias a previsualización local.
- Implementar una actualización automática de la lista de documentos cuando hay archivos en procesamiento.
- Reducir la carga cognitiva del usuario al automatizar el seguimiento del estado de subida.

**No Objetivos:**
- Implementar un nuevo sistema de previsualización basado en URLs firmadas de Google (fuera de alcance por ahora).
- Cambiar la estructura de la base de datos o el esquema de la API de Google.

## Decisiones Técnicas

### 1. Polling Estratégico con React Query
Se utilizará la capacidad nativa de React Query (`refetchInterval`) para realizar el sondeo.
- **Lógica**: El intervalo de refresco se activará dinámicamente.
- **Implementación**: En el hook `useDocuments`, se calculará `const hasPending = documents.some(doc => doc.status === 'STATE_PENDING')`.
- **Configuración**: `refetchInterval: hasPending ? 5000 : false`. Esto asegura que el polling solo ocurra cuando es estrictamente necesario, ahorrando recursos y cuotas de API.

### 2. Eliminación de Componentes y Hooks de Vista Previa
Se realizará una limpieza profunda:
- Borrar `src/components/FileViewer.jsx`.
- Eliminar el estado `previewDoc` y su modal asociado en `src/App.jsx`.
- Quitar el endpoint de proxy de archivos en `server/routes/files.js` y su registro en `server/index.js`.

### 3. Simplificación del Payload de la API
Aunque no es estrictamente necesario, se recomienda dejar de calcular `hasLocalPreview` en el backend para mejorar el rendimiento de la respuesta de listado de documentos.

## Riesgos / Compensaciones

- **[Riesgo] Consumo de Cuotas de API**: El polling frecuente puede consumir cuotas de la API de Google rápidamente si muchos usuarios tienen la pestaña abierta con archivos pendientes.
  - **Mitigación**: El intervalo de 5 segundos es un balance entre responsividad y consumo. Además, el polling es por store seleccionado, no global.
- **[Riesgo] Experiencia de Usuario "Saltarina"**: Al actualizarse la lista automáticamente, los elementos pueden cambiar de posición si hay ordenamientos activos.
  - **Mitigación**: Dado que solo cambia el badge de estado y no el nombre, el impacto visual debería ser mínimo y positivo.
