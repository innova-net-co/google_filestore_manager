## Por qué

Actualmente, el sistema intenta previsualizar archivos que residen en Google Filestore, pero debido a restricciones técnicas, estos archivos no se pueden descargar ni visualizar directamente desde la aplicación de administración. Esto resulta en una mala experiencia de usuario con visualizadores vacíos o errores. Además, el proceso de subida de archivos deja los documentos en estado "PENDIENTE" (PENDING), y el usuario debe recargar manualmente la página para verificar si el procesamiento ha terminado.

## Qué Cambia

- **Eliminación del Visualizador**: Se retirará por completo el componente `FileViewer` y cualquier acción de "Ver" o "Previsualizar" de la interfaz de usuario.
- **Polling de Estado con React Query**: Se implementará una estrategia de sondeo automático en el frontend. Si un documento se encuentra en estado `STATE_PENDING`, React Query realizará consultas periódicas al backend hasta que el estado cambie a `STATE_ACTIVE` o `STATE_FAILED`, actualizando la UI en tiempo real sin intervención del usuario.

## Capacidades

### Nuevas Capacidades
- `status-polling`: Implementación de lógica de refresco automático para entidades en estados transitorios.

### Capacidades Modificadas
- `document-management`: Se elimina la necesidad de gestionar URLs de previsualización y se añade el requerimiento de sincronización de estado asíncrona.
- `tree-view-ui`: Se eliminan los puntos de entrada para la visualización de archivos (botones, acciones de menú).

## Impacto

- **Frontend**: 
    - Eliminación de `src/components/FileViewer.jsx`.
    - Limpieza de estados y modales en `src/App.jsx`.
    - Actualización de `src/hooks/useDocuments.js` para usar React Query con `refetchInterval` condicional.
    - Eliminación de acciones de visualización en `src/components/TreeView.jsx` y `src/components/StorePanel.jsx`.
- **Backend**: (Opcional) El endpoint de listado de documentos ya no necesita calcular o devolver `hasLocalPreview` o `previewUrl`.
