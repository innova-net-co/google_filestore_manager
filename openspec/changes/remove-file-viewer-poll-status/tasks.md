## 1. Limpieza del Visualizador de Archivos (Backend)

- [ ] 1.1 Eliminar el archivo de rutas `server/routes/files.js`.
- [ ] 1.2 Quitar el registro de la ruta `/api/files` en `server/index.js`.
- [ ] 1.3 Modificar `server/routes/documents.js` para dejar de calcular y devolver los campos `hasLocalPreview` y `previewUrl`.

## 2. Limpieza del Visualizador de Archivos (Frontend)

- [ ] 2.1 Eliminar el archivo del componente `src/components/FileViewer.jsx`.
- [ ] 2.2 Eliminar el estado `previewDoc`, el componente `FileViewer` y la lógica de apertura en `src/App.jsx`.
- [ ] 2.3 Eliminar el botón/acción de "Ver" en `src/components/TreeView.jsx`.
- [ ] 2.4 Eliminar el botón/acción de "Ver" en `src/components/StorePanel.jsx`.

## 3. Implementación de Polling con React Query

- [ ] 3.1 Modificar `src/hooks/useDocuments.js` para identificar si existen documentos en estado `STATE_PENDING` en la lista actual.
- [ ] 3.2 Implementar un `refetchInterval` dinámico en `useQuery` que sea de 5000ms si hay pendientes, o `false` en caso contrario.
- [ ] 3.3 Asegurar que la UI refleje el cambio de estado (badge de color) sin necesidad de recarga manual.

## 4. Verificación

- [ ] 4.1 Validar que al subir un nuevo archivo, el badge amarillo cambie a verde (o rojo) automáticamente tras unos segundos.
- [ ] 4.2 Confirmar que no queden referencias o errores de consola relacionados con el antiguo `FileViewer`.
