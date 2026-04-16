## Why

Actualmente, el estado de carga de archivos requiere refrescar la página para visualizar las actualizaciones, lo cual degrada la experiencia del usuario. Al implementar React Query, podemos gestionar el estado de forma asíncrona y reactiva, permitiendo actualizaciones en tiempo real de la interfaz sin recargas manuales.

## What Changes

- Implementación de mutaciones de React Query para la carga de archivos.
- Invalidación automática de caché después de una carga exitosa para refrescar la lista de documentos.
- Eliminación de la dependencia de refrescos de página manuales (`window.location.reload()`).
- Mejora en el manejo de estados de carga (loading) y error en la UI.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `document-management`: Se modifica el requerimiento de actualización de la interfaz tras la carga de archivos para que sea automático y asíncrono.

## Impact

- `src/hooks/useDocuments.js`: Modificación de los hooks para integrar React Query.
- `src/components/StorePanel.jsx`: Actualización de la lógica de carga de archivos para usar las mutaciones de React Query.
- `src/services/api.js`: Posibles ajustes en las funciones de API para asegurar compatibilidad con React Query.
