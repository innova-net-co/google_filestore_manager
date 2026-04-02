## Context

El sistema gestiona almacenes de búsqueda de archivos (File Search Stores) de Google Gemini. Debido a que la API de Gemini no permite la descarga de documentos una vez indexados, la previsualización requiere una estrategia de persistencia alternativa para los archivos fuente.

## Goals / Non-Goals

**Goals:**
- Implementar una previsualización integrada para los tipos de archivos más comunes (Imágenes, Video, Audio, Texto, Markdown, PDF).
- Automatizar el espejado (mirroring) local de archivos durante la subida a Gemini.
- Mantener la arquitectura de proxy existente, añadiendo capacidades de servidor de archivos estáticos.

**Non-Goals:**
- Sincronizar archivos subidos previamente a través de otras herramientas (fuera de este admin).
- Implementar edición de documentos (modo de solo lectura).
- Renderizar formatos complejos de Office (se limitará a descarga o previsualización vía iframe si es posible).

## Decisions

- **Local Mirroring**: Se utilizará una carpeta `server/uploads/` para guardar copias permanentes de los archivos. El servidor utilizará el `storeId` y el nombre del archivo (o docId) para organizar la estructura de directorios.
- **File Serving API**: Se expondrá una nueva ruta `express.static` o un controlador específico en `/api/files` que mapee las solicitudes del frontend a la carpeta de uploads local, asegurando el envío de cabeceras MIME correctas.
- **Componente FileViewer Adaptativo**: En el frontend, se implementará un componente `FileViewer` que use un motor de renderizado basado en el `mimeType` del documento:
    - Img: Etiqueta `<img>` estándar.
    - Media: Etiqueta `<video>` y `<audio>` de HTML5.
    - Texto/MD: Fetch de contenido y renderizado con `react-markdown` o bloque `<pre>`.
    - Documentos: Etiqueta `<iframe>` para PDFs y visor nativo.
- **Identificación de Disponibilidad**: El backend informará si un archivo tiene respaldo local devolviendo una propiedad `hasLocalCopy: true` en el listado de documentos.

## Risks / Trade-offs

- **[Riesgo] Consumo de Almacenamiento**: Almacenar copias locales duplica el espacio necesario en el servidor.
    - → *Mitigación*: Para el caso de uso administrativo actual, el volumen se considera manejable. Se recomienda monitorear la cuota de disco.
- **[Riesgo] Desincronización**: Si se elimina un documento de Gemini manualmente mediante otra herramienta, la copia local persistirá.
    - → *Mitigación*: Se implementará lógica en la ruta `DELETE` del proxy para eliminar la copia local asociada al borrar del store.
- **[Riesgo] Archivos Antiguos**: Los archivos subidos antes de este cambio no se podrán previsualizar.
    - → *Mitigación*: El UI mostrará un estado "No disponible para vista previa" y sugerirá re-subir el archivo si es necesario visualizarlo.
