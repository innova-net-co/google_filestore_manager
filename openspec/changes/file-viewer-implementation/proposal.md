## Por qué (Why)

Los usuarios necesitan previsualizar y verificar el contenido de los documentos subidos al Almacén de Búsqueda de Archivos (File Search Store) para asegurar que se está indexando el contexto correcto para Gemini. Actualmente, el sistema solo muestra metadatos del documento (nombre, tipo, estado), lo que dificulta a los administradores confirmar el contenido sin tener el archivo original a mano.

## Qué Cambia (What Changes)

- **Persistencia en el Backend**: El proceso de subida se extenderá para guardar una copia local del archivo en un directorio `uploads/` en el servidor.
- **API de Servicio de Archivos**: Se creará un nuevo endpoint `/api/files/:storeId/:docId` para servir el contenido de los archivos espejados localmente.
- **UI del Visualizador**: Un nuevo componente `FileViewer` en el frontend para manejar diversos formatos:
    - **Visual**: Soporte para imágenes (JPG, PNG, GIF, SVG).
    - **Multimedia**: Soporte para video (MP4, WebM) y audio (MP3, WAV).
    - **Documentos**: Soporte para PDF (renderizado en el navegador), Texto/Markdown (vista de código) y archivos de Office (enlace para descargar).
- **Integración**: Añadir una acción de "Ver Archivo" en el `TreeView` o `StorePanel` para cada nodo de documento.

## Capacidades (Capabilities)

### Nuevas Capacidades
- `file-visualization`: Infraestructura y componentes de UI para renderizar e interactuar con el contenido del archivo directamente en el navegador.
- `file-serving`: Capacidad del backend para servir archivos almacenados con los encabezados y controles de seguridad adecuados.

### Capacidades Modificadas
- `document-management`: El requerimiento "Subir archivo a un store" se modifica para incluir persistencia local, y el requerimiento "Listar documentos" se extiende para incluir una referencia al archivo local si está disponible.

## Impacto (Impact)

- **Backend**: `server/index.js` (registrar nueva ruta), `server/routes/documents.js` (actualizar lógica de subida), `server/routes/files.js` (nuevo).
- **Frontend**: `src/components/FileViewer.jsx` (nuevo), `src/components/TreeView.jsx` (añadir acción de ver), `src/services/api.js` (añadir ayudante de URL de archivo).
- **Almacenamiento**: Se gestionará una carpeta dinámia `uploads/` en el lado del servidor.
