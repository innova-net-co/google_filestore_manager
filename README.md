# Google File Search Manager

Un sistema de administración completo para gestionar **Google File Search Stores** y **Documentos** de la API de Google Generative Language (Gemini).

## 🚀 Características Principales

*   **Gestión Multi-Clave (API Keys)**: Administra diferentes entornos y cuentas usando múltiples claves API directamente desde la interfaz.
*   **Gestión de Stores**: Crea, visualiza y elimina `FileSearchStores` organizados en un panel lateral interactivo (Tree View).
*   **Gestión de Documentos**: Sube archivos y elimínalos dentro de cada Store de forma fluida.
*   **Búsqueda RAG Integrada**: Prueba tus documentos y extrae información interactuando con modelos de Google Gemini utilizando el contexto del Store activo.
*   **Proxy Seguro Integrado**: Cuenta con un backend en Express que gestiona las peticiones a la API de Google de manera estructurada, evitando bloqueos por CORS en los navegadores y sirviendo como adaptador.

---

## 🏗️ Cómo Funciona el Sistema

La aplicación está construida utilizando una arquitectura moderna que integra de forma inteligente tanto frontend como backend:

1.  **Frontend (React + Vite)**: 
    *   Provee la interfaz gráfica de usuario donde se configuran las claves de la API de Google en el navegador.
    *   Gestiona el estado global (vía React Hooks) y las interacciones de la UI (Stores y Documentos).
    *   Envía un encabezado HTTP dinámico (`X-Goog-Api-Key`) en cada petición al backend proxy para autenticación descentralizada.
2.  **Backend Proxy (Express.js)**:
    *   Recibe las peticiones del frontend en los endpoints montados en `/api`.
    *   Extrae la API Key y hace de intermediario entre tu cliente y `generativelanguage.googleapis.com` (especialmente formateando de forma correcta `multipart/form-data` en la subida de archivos pesados).
    *   **En Desarrollo**: El servidor Express se ejecuta como un Middleware directamente dentro del entorno Vite.
    *   **En Producción**: El servidor Express maneja la API e incluye un controlador estático para servir la SPA de React previamente compilada.

---

## 🛠️ Instalación y Uso

### Requisitos Previos
*   [Node.js](https://nodejs.org/) (v18 o superior recomendado)
*   Una clave de API de [Google AI Studio](https://aistudio.google.com/)

### Pasos de Instalación

1.  **Clonar el repositorio y entrar al directorio:**
    ```bash
    git clone https://github.com/innova-net-co/google_filestore_manager.git
    cd google_filestore_manager
    ```

2.  **Instalar las dependencias:**
    ```bash
    npm install
    ```

3.  **Configuración (Opcional):**
    Puedes generar el archivo `.env` a partir del ejemplo para configurar variables de entorno (como puertos o modelos específicos):
    ```bash
    cp .env.example .env
    ```

### Ejecutar en Desarrollo

Para trabajar en el proyecto con recarga en caliente (HMR), puedes levantar el entorno de Vite. El backend será enrutado y administrado automáticamente.

```bash
npm run dev
```

*   La aplicación estará disponible en: [http://localhost:5173](http://localhost:5173)

### Construcción y Ejecución en Producción

Para compilar el proyecto y ejecutar el servidor unificado para un ambiente real:

1.  **Compilar el Frontend:**
    ```bash
    npm run build
    ```
2.  **Iniciar el Servidor de Producción:**
    ```bash
    npm start
    ```

*   La aplicación optimizada y la API de proxy estarán disponibles en el puerto especificado (por defecto `3001`): [http://localhost:3001](http://localhost:3001)
