## ADDED Requirements

### Requirement: Visualizador de imágenes
El sistema SHALL mostrar imágenes subidas directamente en un componente visual si están disponibles localmente.

#### Scenario: Abrir previsualización de imagen
- **WHEN** el usuario hace clic en "Ver Imagen" en un documento JPG/PNG/SVG
- **THEN** el sistema MUST cargar la imagen desde la URL de previsualización y mostrarla en un visor modal o sidebar

### Requirement: Visualizador de video y audio
El sistema SHALL permitir la reproducción de archivos multimedia directamente si están soportados por el navegador.

#### Scenario: Reproducir video
- **WHEN** el usuario selecciona "Ver" en un archivo MP4/WebM
- **THEN** el sistema MUST presentar un reproductor HTML5 funcional con controles básicos (play, pause, volume, progress bar)

### Requirement: Visualizador de texto y markdown
El sistema SHALL renderizar texto plano y contenido markdown.

#### Scenario: Visualizar Markdown
- **WHEN** el usuario abre un archivo .md o .txt
- **THEN** el sistema MUST descargar el contenido como texto, renderizar el markdown si corresponde, y presentarlo con una legibilidad óptima

### Requirement: Previsualización de PDF y Office
El sistema SHALL intentar previsualizar documentos PDF y documentos de Office.

#### Scenario: Abrir PDF
- **WHEN** el usuario solicita ver un archivo PDF
- **THEN** el sistema MUST intentar cargar el PDF en un iframe o usar un visor nativo del navegador integrado en la aplicación

#### Scenario: Documentos no soportados
- **WHEN** el usuario intenta ver un archivo cuyo formato no tiene un visor integrado (e.g. excels complejos, docx sin visor externo)
- **THEN** el sistema MUST ofrecer una opción clara para descargar el archivo directamente
