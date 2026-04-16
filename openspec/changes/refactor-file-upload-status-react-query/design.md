## Context

Actualmente, la aplicación utiliza hooks personalizados basados en `useState` y `useEffect` para gestionar los documentos de un store. La carga de archivos se realiza de forma imperativa y, en algunos casos, se requiere un refresco manual de la página para ver los cambios reflejados. Aunque ya existe una lógica de "polling" básica en `useDocuments.js`, el objetivo es estandarizar esta gestión utilizando React Query para obtener una reactividad superior y eliminar cualquier necesidad de refresco manual.

## Goals / Non-Goals

**Goals:**
- Implementar `useMutation` para la carga (`uploadFile`) y eliminación (`deleteDocument`) de archivos.
- Utilizar `queryClient.invalidateQueries` para refrescar la lista de documentos automáticamente tras una mutación exitosa.
- Centralizar la lógica de estado (loading, error, data) en React Query.
- Mantener o mejorar el mecanismo de "polling" para documentos en estado `STATE_PENDING` de forma más limpia con las opciones nativas de React Query (ej. `refetchInterval`).

**Non-Goals:**
- Rediseñar visualmente la interfaz de `StorePanel`.
- Cambiar la lógica del backend para la carga de archivos.
- Migrar toda la aplicación a React Query si no es necesario (se prioriza el flujo de documentos).

## Decisions

- **Decisión 1: Reemplazar el estado local en `useDocuments` por React Query.**
  - **Razón**: React Query maneja automáticamente la caché, el estado de carga y la invalidación, reduciendo el código boilerplate y errores de sincronización.
  - **Alternativa**: Mantener `useState` y añadir más lógica de eventos, pero es menos escalable y más propenso a errores.

- **Decisión 2: Implementar Polling Condicional.**
  - **Razón**: Usaremos la propiedad `refetchInterval` de `useQuery`, configurándola dinámicamente: si hay documentos en `STATE_PENDING`, se activa el polling cada 5 segundos; de lo contrario, se desactiva (false).
  - **Alternativa**: Mantener el `setInterval` manual dentro de un `useEffect`, pero `refetchInterval` es la forma idiomática en React Query.

- **Decisión 3: Invalidación de Consultas en Mutaciones.**
  - **Razón**: Al subir o borrar un archivo, invalidar la query `['documents', storeId]` asegura que el componente reciba la lista actualizada sin intervención manual.

## Risks / Trade-offs

- **[Riesgo] Consumo excesivo de API por polling** → **Mitigación**: El polling solo se activa cuando hay archivos pendientes y se detiene automáticamente al terminar el procesamiento.
- **[Trade-off] Introducción de nueva dependencia** → Si React Query no está instalado, se debe añadir al `package.json`. Sin embargo, los beneficios en UX y mantenimiento compensan el tamaño del bundle.
