## 1. Refactorización de useDocuments con React Query

- [x] 1.1 Modificar `src/hooks/useDocuments.js` para usar `useQuery` para listar documentos.
- [x] 1.2 Implementar `useMutation` para `uploadFile` en `useDocuments.js`.
- [x] 1.3 Implementar `useMutation` para `deleteDocument` en `useDocuments.js`.
- [x] 1.4 Configurar `refetchInterval` condicional basado en el estado `STATE_PENDING` de los documentos.
- [x] 1.5 Asegurar que las mutaciones invaliden la query `['documents', storeId]`.

## 2. Actualización de Componentes

- [x] 2.1 Actualizar `src/components/StorePanel.jsx` para consumir el nuevo estado y funciones de `useDocuments.js`.
- [x] 2.2 Eliminar cualquier llamada a `window.location.reload()` o estados locales redundantes para carga/error en `StorePanel`.
- [x] 2.3 Verificar que el indicador de carga (`spinner`) funcione correctamente con los estados de React Query.

## 3. Pruebas y Verificación

- [ ] 3.1 Verificar que al subir un archivo aparezca en la lista sin refrescar.
- [ ] 3.2 Verificar que el polling se active si el archivo queda en `STATE_PENDING`.
- [ ] 3.3 Verificar que al eliminar un archivo la lista se actualice automáticamente.
