## 1. Backend: Implementación de Almacenamiento Local

- [x] 1.1 Modificar la ruta `/api/stores/:storeId/upload` en `server/routes/documents.js` para persistir archivos en `server/uploads/:storeId/`.
- [x] 1.2 Asegurar que el nombre de archivo guardado sea rastreable y manejar correctamente el buffer de multer.
- [x] 1.3 Actualizar la ruta `DELETE /api/stores/:storeId/documents/:docId` para eliminar también la copia local asociada.

## 2. Backend: Servidor de Archivos de Vista Previa

- [x] 2.1 Crear el archivo de ruta `server/routes/files.js` para servir archivos estáticos con cabeceras MIME correctas.
- [x] 2.2 Registrar la ruta `/api/files` en `server/index.js`.
- [x] 2.3 Modificar el endpoint de listado de documentos para indicar si existe una previsualización local disponible.

## 3. Frontend: Componente de Visualización Core

- [x] 3.1 Instalar dependencias necesarias como `react-markdown` y `lucide-react` para iconos.
- [x] 3.2 Crear `src/components/FileViewer.jsx` con lógica de despacho (switch) basada en el `mimeType`.
- [x] 3.3 Implementar visualizadores específicos: `ImageViewer`, `VideoPlayer`, `AudioPlayer`, `MarkdownViewer` y `GenericDownloader`.

## 4. Frontend: Integración UI

- [x] 4.1 Añadir la función `getFilePreviewUrl` en `src/services/api.js`.
- [x] 4.2 Integrar la acción de "Ver" en `src/components/TreeView.jsx` junto a las opciones de eliminar.
- [x] 4.3 Implementar un estado de Modal en `src/App.jsx` para gestionar el visor de archivos abierto.

## 5. Pruebas y Ajustes Finales

- [x] 5.1 Verificar la subida y visualización de una imagen, un video y un archivo markdown.
- [x] 5.2 Probar el comportamiento con archivos PDF (iframe) y documentos no soportados (download fallback).
- [x] 5.3 Ajustar estilos para que el visualizador se integre con la estética premium del proyecto.
