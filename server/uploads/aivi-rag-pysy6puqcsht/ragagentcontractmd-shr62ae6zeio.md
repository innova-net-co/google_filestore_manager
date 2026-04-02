# Contrato RAG — Agente n8n ↔ Backend AIVI ↔ Frontend

> **Versión:** 1.2.1
> **Fecha:** 2026-03-28
> **Propósito:** Documento de conocimiento para el sistema RAG externo. El agente n8n lee este documento para saber cómo interpretar el contexto que le envía el Backend AIVI y cómo construir el `ActionResponse` que el frontend ejecutará. Este documento NO es procesado directamente por el frontend ni por el backend; es la base de conocimiento que guía el razonamiento del agente n8n.

---

## Índice

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Contrato de Esquemas — Request y Response](#2-contrato-de-esquemas--request-y-response)
3. [Taxonomía de Acciones Ejecutables](#3-taxonomía-de-acciones-ejecutables)
4. [Reglas de Interpretación de Contexto](#4-reglas-de-interpretación-de-contexto)
5. [Guía de Construcción de Respuestas](#5-guía-de-construcción-de-respuestas)
6. [Ejemplo Completo: Análisis de Perfil de Instagram](#6-ejemplo-completo-análisis-de-perfil-de-instagram)
7. [Casos Borde y Reglas de Validación](#7-casos-borde-y-reglas-de-validación)
8. [Herramientas Disponibles y sus Flujos](#8-herramientas-disponibles-y-sus-flujos)
9. [Versionado y Extensibilidad](#9-versionado-y-extensibilidad)

---

## 1. Visión General del Sistema

### 1.1 Contexto de la Plataforma

AIVI es una plataforma de Inteligencia Artificial para creadores de contenido. El frontend está construido en **React 18 + TypeScript + Vite**, siguiendo principios de **Clean Architecture** con las capas: Domain → Application → Infrastructure → Presentation.

El **Asistente de AIVI** (`AssistantPage`) es el punto de entrada principal donde el usuario interactúa con el agente IA. El agente interpreta las intenciones del usuario, selecciona la herramienta adecuada y devuelve instrucciones estructuradas que el frontend ejecuta como acciones concretas en la UI.

### 1.2 Arquitectura de Comunicación

El sistema opera con **tres capas independientes** que se comunican en secuencia:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA 1: FRONTEND                          │
│  AssistantPage (React)                                           │
│  • Captura el input del usuario (mensaje + archivo + contexto)   │
│  • Envía todo al backend vía POST /chat                          │
│  • Recibe ActionResponse del backend                             │
│  • Ejecuta el array `actions` en orden                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ POST /chat
                         │ { message, session_context, uploaded_content }
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA 2: BACKEND AIVI                          │
│  Endpoint POST /chat                                             │
│  • Recibe el payload del frontend                                │
│  • Enriquece el contexto (adjunta user_id, ADN, sesión)          │
│  • Reenvía el payload al agente n8n                              │
│  • Recibe ActionResponse del agente n8n                          │
│  • Retorna ActionResponse directamente al frontend               │
└────────────────────────┬────────────────────────────────────────┘
                         │ webhook/API call
                         │ { message, context_enriched }
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA 3: AGENTE n8n + RAG                      │
│  Workflow n8n                                                     │
│  • Recibe el payload enriquecido del backend AIVI                │
│  • Consulta el RAG (este documento) para obtener instrucciones   │
│  • Interpreta la intención del usuario                           │
│  • Construye el ActionResponse siguiendo las reglas del RAG      │
│  • Retorna ActionResponse al backend AIVI                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Rol de Este Documento en el RAG

**Este documento ES la fuente de conocimiento que el agente n8n consulta.** Cuando el agente n8n recibe un mensaje del backend AIVI, realiza una búsqueda semántica en el RAG con preguntas como:

- *"¿Qué acciones debe devolver el agente cuando la herramienta activa es 'analizador'?"*
- *"¿Cuál es el formato del ActionResponse para trigger_analysis?"*
- *"¿Qué hacer cuando el usuario no provee un username de Instagram?"*

El agente recupera los fragmentos relevantes de este documento y los usa para construir una respuesta válida.

### 1.4 Principio Fundamental

**El agente n8n NO ejecuta acciones directamente.** Construye un objeto `ActionResponse` con una lista ordenada de acciones. El frontend es el único ejecutor; el agente n8n es el planificador. El backend AIVI es el intermediario que conecta ambos sin transformar la respuesta.

---

## 2. Contrato de Esquemas — Request y Response

### 2.1 Esquema del Request del Frontend → Agente

El frontend envía al endpoint `/chat` un payload con la siguiente estructura:

```typescript
// Tipo TypeScript canónico del Request
interface AgentRequest {
  // ─── Campos Obligatorios ───────────────────────────────────────
  message: string;                    // Texto libre del usuario o instrucción de herramienta

  // ─── Campos de Contexto de Sesión (opcionales pero preferidos) ─
  session_context?: {
    user_id: string;                  // UUID del usuario autenticado
    active_tool: string;              // Clave de la herramienta activa (ver §8)
    previous_actions?: string[];      // Claves de acciones ejecutadas previamente en esta sesión
    adn_available: boolean;           // true si el usuario ya tiene ADN generado
  };

  // ─── Archivo Adjunto (opcional) ───────────────────────────────
  uploaded_content?: {
    type: 'image' | 'audio' | 'video' | 'pdf';
    url: string;                      // URL temporal del objeto en memoria/storage
    filename: string;                 // Nombre original del archivo
    size_bytes: number;               // Tamaño en bytes
    mime_type: string;                // MIME type (ej: "image/jpeg")
  };
}
```

**Ejemplo de request real (herramienta analizador seleccionada):**

```json
{
  "message": "Analiza el perfil de Instagram @natgeo",
  "session_context": {
    "user_id": "usr_a1b2c3d4",
    "active_tool": "analizador",
    "previous_actions": [],
    "adn_available": true
  }
}
```

---

### 2.2 Esquema del Response del Agente → Frontend

El agente **SIEMPRE** devuelve un objeto `ActionResponse` con la siguiente estructura tipada:

```typescript
// Tipo TypeScript canónico del Response
interface ActionResponse {
  // ─── Metadatos de la Respuesta ────────────────────────────────
  success: boolean;                   // true = respuesta procesada correctamente
  status: number;                     // Código HTTP semántico (200, 400, 422, 500)
  message: string;                    // Mensaje en lenguaje natural para mostrar al usuario
  agent_version: string;              // Versión del agente que generó la respuesta (ej: "1.0.0")

  // ─── Plan de Acción ───────────────────────────────────────────
  suggested_action: string | null;    // Clave canónica de la acción principal (ver §3)
  reasoning: string;                  // Explicación interna del agente (no visible al usuario)
  actions: FrontendAction[];          // Lista ordenada de acciones a ejecutar

  // ─── Datos de Soporte (opcionales) ───────────────────────────
  data?: Record<string, unknown>;     // Datos adicionales específicos de la herramienta
}

// Unión discriminada de todas las acciones posibles
type FrontendAction =
  | RenderComponentAction
  | PopulateFieldAction
  | TriggerAnalysisAction
  | ShowNotificationAction
  | NavigateToAction
  | UpdateStateAction
  | RequestAdditionalInputAction
  | ShowLoadingAction
  | HideLoadingAction
  | OpenSidebarFolderAction;
```

**Ejemplo de response exitoso:**

```json
{
  "success": true,
  "status": 200,
  "message": "Iniciando análisis del perfil @natgeo. Esto puede tomar unos segundos.",
  "agent_version": "1.2.1",
  "suggested_action": "ANALYZER",
  "reasoning": "El usuario solicitó explícitamente analizar un perfil de Instagram. La herramienta 'analizador' está activa y el username fue identificado en el mensaje.",
  "actions": [
    {
      "type": "show_notification",
      "payload": {
        "variant": "info",
        "title": "Analizando perfil",
        "description": "Extrayendo métricas de @natgeo..."
      }
    },
    {
      "type": "show_loading",
      "payload": {
        "component_id": "analyzer_chat_card",
        "message": "Etapa 1 de 3: Descargando perfil..."
      }
    },
    {
      "type": "trigger_analysis",
      "payload": {
        "tool": "analizador",
        "endpoint": "/analyzer/analyze",
        "method": "POST",
        "body": { "username": "natgeo" },
        "on_success": "render_component:analyzer_chat_card",
        "on_error": "show_notification:error"
      }
    }
  ],
  "data": {
    "extracted_username": "natgeo",
    "tool_confirmed": "analizador"
  }
}
```

---

## 3. Taxonomía de Acciones Ejecutables

Cada acción tiene un campo `type` (clave canónica) y un `payload` específico. El frontend ejecuta las acciones en el **orden exacto** del array `actions`.

### 3.1 `render_component`

Renderiza un componente React en el área de chat.

```typescript
interface RenderComponentAction {
  type: 'render_component';
  payload: {
    component_id: string;           // ID canónico del componente (ver lista §3.9)
    position: 'append' | 'replace'; // append = añadir al chat; replace = sustituir el último
    props?: Record<string, unknown>; // Props iniciales para el componente
  };
}
```

```json
{
  "type": "render_component",
  "payload": {
    "component_id": "analyzer_chat_card",
    "position": "append",
    "props": { "profileId": "prof_123", "username": "natgeo" }
  }
}
```

---

### 3.2 `populate_field`

Rellena un campo de entrada de la UI con un valor.

```typescript
interface PopulateFieldAction {
  type: 'populate_field';
  payload: {
    field_id: string;               // ID del campo (input, textarea, select)
    value: string | number | boolean;
    trigger_validation?: boolean;   // Si debe disparar validación Zod inmediatamente
  };
}
```

```json
{
  "type": "populate_field",
  "payload": {
    "field_id": "analyzer_username_input",
    "value": "natgeo",
    "trigger_validation": true
  }
}
```

---

### 3.3 `trigger_analysis`

Inicia una llamada a la API del backend para ejecutar un proceso de análisis.

```typescript
interface TriggerAnalysisAction {
  type: 'trigger_analysis';
  payload: {
    tool: string;                   // Clave de la herramienta (ej: "analizador")
    endpoint: string;               // Ruta relativa del endpoint (ej: "/analyzer/analyze")
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: Record<string, unknown>; // Cuerpo de la petición
    params?: Record<string, string>; // Query params
    on_success: string;             // Acción a ejecutar en éxito ("render_component:analyzer_chat_card")
    on_error: string;               // Acción a ejecutar en error ("show_notification:error")
  };
}
```

---

### 3.4 `show_notification`

Muestra una notificación toast al usuario (usa Sonner en el frontend).

```typescript
interface ShowNotificationAction {
  type: 'show_notification';
  payload: {
    variant: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration_ms?: number;           // Default: 4000ms
    action_label?: string;          // Botón de acción en la notificación
    action_callback?: string;       // Clave de acción si el usuario hace clic
  };
}
```

```json
{
  "type": "show_notification",
  "payload": {
    "variant": "error",
    "title": "Perfil no encontrado",
    "description": "El perfil @usuario123 es privado o no existe en Instagram.",
    "duration_ms": 5000
  }
}
```

---

### 3.5 `navigate_to`

Navega a una ruta interna de la aplicación.

```typescript
interface NavigateToAction {
  type: 'navigate_to';
  payload: {
    path: string;                   // Ruta React Router (ej: "/dashboard", "/adn")
    replace?: boolean;              // Si debe reemplazar el historial (default: false)
    state?: Record<string, unknown>; // Estado de navegación pasado a la nueva ruta
  };
}
```

---

### 3.6 `update_state`

Actualiza el estado interno del componente `AssistantPage` o de un contexto global.

```typescript
interface UpdateStateAction {
  type: 'update_state';
  payload: {
    state_key: string;              // Clave del estado (ej: "activeTool", "activeFolder")
    value: unknown;                 // Nuevo valor
    scope: 'assistant_page' | 'global_context';
  };
}
```

```json
{
  "type": "update_state",
  "payload": {
    "state_key": "activeTool",
    "value": "analizador",
    "scope": "assistant_page"
  }
}
```

---

### 3.7 `request_additional_input`

Le pide al usuario información adicional antes de continuar.

```typescript
interface RequestAdditionalInputAction {
  type: 'request_additional_input';
  payload: {
    field_type: 'text' | 'file' | 'select' | 'confirmation';
    prompt: string;                 // Pregunta visible al usuario
    options?: string[];             // Para field_type = 'select'
    required: boolean;
    on_submit: string;              // Acción a disparar cuando el usuario envíe el valor
    validation_rules?: {
      min_length?: number;
      max_length?: number;
      pattern?: string;             // Regex como string
    };
  };
}
```

---

### 3.8 `show_loading` y `hide_loading`

Controlan el indicador de carga de un componente específico.

```typescript
interface ShowLoadingAction {
  type: 'show_loading';
  payload: {
    component_id: string;
    message?: string;               // Mensaje de carga contextual
    stage?: number;                 // Etapa actual (para loaders por etapas)
    total_stages?: number;          // Total de etapas
  };
}

interface HideLoadingAction {
  type: 'hide_loading';
  payload: {
    component_id: string;
  };
}
```

---

### 3.9 `open_sidebar_folder`

Abre y activa una carpeta/herramienta en el panel lateral de herramientas.

```typescript
interface OpenSidebarFolderAction {
  type: 'open_sidebar_folder';
  payload: {
    folder_key: string;             // Clave de la herramienta (ver §8)
    inject_card?: boolean;          // Si debe inyectar la tarjeta correspondiente en el chat
  };
}
```

---

### 3.9 Componentes Registrados en el Frontend

| `component_id` | Componente React | Descripción |
|---|---|---|
| `adn_response_card` | `ADNResponseCard` | Tarjeta con el ADN del creador |
| `analyzer_chat_card` | `AnalyzerChatCard` | Tarjeta de análisis de perfil de Instagram |
| `referent_chat_card` | `ReferentChatCard` | Tarjeta de un referente de contenido |
| `adn_recommendations_card` | `ADNRecommendationsCard` | Tarjeta con tips para grabación de audio ADN |
| `text_message` | Bubble de chat | Mensaje de texto plano en el chat |
| `file_preview` | `FilePreview` | Vista previa de archivo adjunto |

---

## 4. Reglas de Interpretación de Contexto

El agente DEBE leer el payload de entrada siguiendo estas reglas en orden de prioridad.

### 4.1 Lectura del `session_context`

| Campo | Tipo | Regla de Interpretación |
|---|---|---|
| `user_id` | `string` | REQUERIDO para cualquier acción que persista datos. Si ausente, el agente debe devolver `request_additional_input` con `field_type: "confirmation"` para re-autenticación. |
| `active_tool` | `string` | La herramienta que el usuario tiene seleccionada en la UI. El agente DEBE priorizar esta herramienta al construir las acciones. |
| `previous_actions` | `string[]` | Lista de acciones ya ejecutadas. Si contiene `"trigger_analysis:analizador"`, el agente sabe que ya hay un análisis en curso y no debe duplicarlo. |
| `adn_available` | `boolean` | Si es `false`, el agente puede sugerir completar el ADN Creator antes de algunas herramientas que lo requieren. |

### 4.2 Lectura del `uploaded_content`

| `type` del archivo | Herramientas Compatibles | Acción Inicial Recomendada |
|---|---|---|
| `image` | `analizador`, `adn` | Mostrar `file_preview` + solicitar confirmación de uso |
| `audio` | `adn`, `transcriptor` | Disparar `trigger_analysis` hacia el endpoint de audio del ADN |
| `video` | `transcriptor`, `guiones` | Disparar `trigger_analysis` hacia el endpoint de transcripción |
| `pdf` | `adn`, `guiones` | Preguntar si es material de referencia o contenido para procesar |

### 4.3 Extracción de Entidades del `message`

El agente DEBE extraer las siguientes entidades del texto libre:

```
ENTIDAD: instagram_username
  PATRÓN: @[a-zA-Z0-9_.]{1,30} O "perfil de (nombre)"
  ACCIÓN: poblar campo "analyzer_username_input"

ENTIDAD: tool_intent
  SEÑALES: palabras clave asociadas a cada herramienta (ver §8.1)
  ACCIÓN: activar la herramienta correspondiente con "update_state"

ENTIDAD: explicit_command
  PATRÓN: verbos imperativos ("analiza", "transcribe", "crea", "busca", "muéstrame")
  ACCIÓN: mapear al tipo de acción correspondiente (trigger_analysis, render_component, etc.)
```

### 4.4 Prioridad de Señales

El agente resuelve la intención del usuario siguiendo este orden de prioridad:

```
1. Herramienta activa en el frontend (active_tool) — MAYOR PRIORIDAD
2. Contenido adjunto (uploaded_content.type)
3. Verbos explícitos en el mensaje
4. Entidades extraídas (usernames, URLs, etc.)
5. Contexto de acciones previas (previous_actions)
6. ADN disponible del usuario (adn_available)  — MENOR PRIORIDAD
```

---

## 5. Guía de Construcción de Respuestas

El agente DEBE seguir estos pasos para construir cada `ActionResponse`.

### 5.0 Regla de Oro: Visualización Directa

**SIEMPRE** que una herramienta tenga un componente de visualización registrado (ver §3.9) y la intención del usuario sea "ver", "mostrar" o "consultar" información existente, el agente **DEBE** incluir la acción `render_component` en el array `actions`.

- **PROHIBIDO:** Limitarse a dar instrucciones textuales sobre cómo navegar por la interfaz si existe un componente que puede mostrar la información en el chat.
- **PROHIBIDO:** Usar `suggested_action: "NONE"` si el usuario pidió ver algo que tiene un componente asociado.

### Paso 1: Validar el Request

```
SI session_context.user_id está vacío:
  → Devolver ErrorResponse (status: 401, message: "Sesión no identificada")
  
SI message está vacío Y uploaded_content está vacío:
  → Devolver ErrorResponse (status: 400, message: "No se recibió entrada del usuario")
```

### Paso 2: Identificar la Herramienta

```
herramienta = session_context.active_tool
              ?? inferir_de_message(message)
              ?? inferir_de_archivo(uploaded_content.type)
              ?? null

SI herramienta es null:
  → Construir acción request_additional_input con opciones de herramientas disponibles
```

### Paso 3: Construir el Array de Acciones

Para cada herramienta, el agente sigue la secuencia estándar:

```
1. show_notification (informativa — "Iniciando...")
2. update_state (activar herramienta en sidebar si no está activa)
3. open_sidebar_folder (abrir carpeta en panel lateral)
4. populate_field (rellenar inputs con datos extraídos)
5. show_loading (activar indicador de carga)
6. trigger_analysis (llamar al endpoint del backend)
   → on_success: hide_loading + render_component
   → on_error: hide_loading + show_notification:error
```

### Paso 4: Rellenar Metadatos de la Respuesta

```typescript
{
  success: true,
  status: 200,
  message: "<mensaje amigable en español para el usuario>",
  agent_version: "1.2.1",
  suggested_action: "<CLAVE_EN_MAYÚSCULAS>",  // ej: "ANALYZER", "ADN_CREATOR"
  reasoning: "<explicación interna de por qué se eligió esta ruta>",
  actions: [ /* array construido en paso 3 */ ]
}
```

### Paso 5: Respuesta de Error (cuando falla la validación)

```json
{
  "success": false,
  "status": 422,
  "message": "No pude identificar un perfil de Instagram en tu mensaje. ¿Puedes escribir el nombre de usuario?",
  "agent_version": "1.2.1",
  "suggested_action": null,
  "reasoning": "El mensaje no contenía un patrón de username (@handle) ni un nombre reconocible.",
  "actions": [
    {
      "type": "request_additional_input",
      "payload": {
        "field_type": "text",
        "prompt": "¿Cuál es el nombre de usuario de Instagram que quieres analizar?",
        "required": true,
        "on_submit": "trigger_analysis:analizador",
        "validation_rules": {
          "min_length": 1,
          "max_length": 30,
          "pattern": "^[a-zA-Z0-9_.]+$"
        }
      }
    }
  ]
}
```

---

## 6. Ejemplo Completo: Análisis de Perfil de Instagram

Este ejemplo muestra el flujo completo de extremo a extremo para el **Escenario 1** descrito en los requisitos del sistema.

### 6.1 Contexto Inicial

El usuario está en la página `AssistantPage`. Ha seleccionado la herramienta **Analizador** en el sidebar y escribe el mensaje: *"Analiza el perfil de @natgeo y dime cómo está su engagement"*.

### 6.2 Payload Enviado por el Frontend

```json
{
  "message": "Analiza el perfil de @natgeo y dime cómo está su engagement",
  "session_context": {
    "user_id": "usr_a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "active_tool": "analizador",
    "previous_actions": [],
    "adn_available": true
  }
}
```

### 6.3 Consulta RAG Formulada por el Agente

El agente genera internamente la siguiente consulta semántica para recuperar conocimiento del RAG:

```
CONSULTA RAG:
  "¿Qué pasos debe seguir el frontend cuando la herramienta 'analizador' está activa
   y el usuario proporciona un username de Instagram en su mensaje?"

FRAGMENTOS RECUPERADOS:
  [1] §3.3 trigger_analysis → endpoint: "/analyzer/analyze", method: POST, body: {username}
  [2] §3.9 component_id: "analyzer_chat_card" → renderizar tras análisis exitoso
  [3] §4.3 Extracción de entidades → patrón @[a-zA-Z0-9_.] → username = "natgeo"
  [4] §5 Secuencia estándar → show_notification → show_loading → trigger_analysis → render_component
```

### 6.4 Respuesta Estructurada del Agente

```json
{
  "success": true,
  "status": 200,
  "message": "Perfecto, voy a analizar el perfil @natgeo ahora mismo. El proceso puede tomar entre 30 y 60 segundos mientras recopilo sus métricas de Instagram.",
  "agent_version": "1.2.1",
  "suggested_action": "ANALYZER",
  "reasoning": "El usuario tiene la herramienta 'analizador' activa y el mensaje contiene un username de Instagram válido (@natgeo). Se extractó 'natgeo' con el patrón @handle. Se activa el flujo estándar de análisis de perfil.",
  "actions": [
    {
      "type": "show_notification",
      "payload": {
        "variant": "info",
        "title": "Iniciando análisis",
        "description": "Analizando @natgeo en Instagram...",
        "duration_ms": 3000
      }
    },
    {
      "type": "update_state",
      "payload": {
        "state_key": "activeFolder",
        "value": "analizador",
        "scope": "assistant_page"
      }
    },
    {
      "type": "show_loading",
      "payload": {
        "component_id": "analyzer_chat_card",
        "message": "Etapa 1 de 3: Descargando perfil público...",
        "stage": 1,
        "total_stages": 3
      }
    },
    {
      "type": "trigger_analysis",
      "payload": {
        "tool": "analizador",
        "endpoint": "/analyzer/analyze",
        "method": "POST",
        "body": {
          "username": "natgeo"
        },
        "on_success": "render_component:analyzer_chat_card",
        "on_error": "show_notification:error"
      }
    }
  ],
  "data": {
    "extracted_username": "natgeo",
    "tool_confirmed": "analizador",
    "user_original_intent": "análisis de engagement"
  }
}
```

### 6.5 Secuencia de Ejecución en el Frontend

```
t=0ms   Frontend recibe ActionResponse
t=1ms   Ejecuta actions[0]: show_notification → Toast "Iniciando análisis" aparece
t=5ms   Ejecuta actions[1]: update_state → activeFolder = "analizador"
t=10ms  Ejecuta actions[2]: show_loading → Spinner con "Etapa 1 de 3" visible en chat
t=15ms  Ejecuta actions[3]: trigger_analysis
          → POST /analyzer/analyze { username: "natgeo" }
          → (el backend tarda ~45s en procesar)
t=60s   La API devuelve ProfileAnalysis { id: "prof_abc123", username: "natgeo", ... }
t=60s   on_success: hide_loading + render_component:analyzer_chat_card
          → AnalyzerChatCard se renderiza en el chat con profileId="prof_abc123"
```

### 6.6 Estructura del `ProfileAnalysis` Renderizado

Cuando `AnalyzerChatCard` se monta, hace internamente `GET /analyzer/profiles/{id}` y muestra:

```typescript
// Campos clave mostrados en la tarjeta (basado en ProfileAnalysis)
{
  username: "natgeo",
  full_name: "National Geographic",
  followers_count: 283000000,
  engagement_rate: 1.24,
  avg_likes: 52000,
  avg_comments: 800,
  posts_per_week: 4.2,
  analysis_result: {
    score_general: { valor: 87, etiqueta: "Excelente", resumen: "..." },
    fortalezas: ["Consistencia visual", "CTAs efectivos"],
    oportunidades: ["Mayor uso de Reels", "Horarios optimizados"],
    plan_4_semanas: [...]
  }
}
```

---

## 7. Casos Borde y Reglas de Validación

### 7.1 Username No Detectado

**Situación:** El usuario dice "analiza ese perfil" sin especificar username, con herramienta `analizador` activa.

```json
{
  "success": false,
  "status": 422,
  "message": "No encontré un nombre de usuario en tu mensaje. ¿Puedes escribir el @usuario que quieres analizar?",
  "suggested_action": null,
  "reasoning": "No se detectó patrón @handle ni nombre de usuario reconocible en el mensaje.",
  "actions": [
    {
      "type": "request_additional_input",
      "payload": {
        "field_type": "text",
        "prompt": "Escribe el nombre de usuario de Instagram (sin @):",
        "required": true,
        "on_submit": "trigger_analysis:analizador",
        "validation_rules": {
          "min_length": 1,
          "max_length": 30,
          "pattern": "^[a-zA-Z0-9_.]+$"
        }
      }
    }
  ]
}
```

---

### 7.2 Herramienta Ambigua

**Situación:** El usuario dice "quiero crear contenido" sin herramienta activa. El mensaje aplica a múltiples herramientas (`guiones`, `carruseles`, `adn`).

```json
{
  "success": false,
  "status": 422,
  "message": "Puedo ayudarte a crear contenido de varias formas. ¿Qué tipo de contenido quieres crear?",
  "suggested_action": null,
  "reasoning": "El mensaje es ambiguo entre guiones, carruseles y ADN. Se solicita especificación al usuario.",
  "actions": [
    {
      "type": "request_additional_input",
      "payload": {
        "field_type": "select",
        "prompt": "¿Qué tipo de contenido quieres crear?",
        "options": [
          "Guión para video (Guiones)",
          "Carrusel para Instagram (Carruseles)",
          "Estrategia de marca completa (ADN Creator)"
        ],
        "required": true,
        "on_submit": "update_state:activeTool"
      }
    }
  ]
}
```

---

### 7.3 Archivo Adjunto Sin Herramienta Compatible

**Situación:** El usuario adjunta un PDF con la herramienta `referentes` activa (no compatible con PDF).

```json
{
  "success": false,
  "status": 422,
  "message": "El archivo PDF no es compatible con la herramienta Referentes. Puedo usarlo con ADN Creator o Guiones.",
  "suggested_action": null,
  "reasoning": "uploaded_content.type='pdf' no es compatible con active_tool='referentes'. Herramientas compatibles: 'adn', 'guiones'.",
  "actions": [
    {
      "type": "show_notification",
      "payload": {
        "variant": "warning",
        "title": "Archivo no compatible",
        "description": "Este PDF puede usarse con ADN Creator o Guiones.",
        "duration_ms": 6000
      }
    },
    {
      "type": "request_additional_input",
      "payload": {
        "field_type": "select",
        "prompt": "¿Con qué herramienta quieres usar este PDF?",
        "options": ["ADN Creator", "Guiones"],
        "required": true,
        "on_submit": "update_state:activeTool"
      }
    }
  ]
}
```

---

### 7.4 Análisis Duplicado en Progreso

**Situación:** `previous_actions` ya contiene `"trigger_analysis:analizador"` y el usuario vuelve a pedir analizar el mismo perfil.

```json
{
  "success": false,
  "status": 409,
  "message": "Ya hay un análisis en progreso. Por favor espera a que termine antes de iniciar uno nuevo.",
  "suggested_action": null,
  "reasoning": "previous_actions contiene 'trigger_analysis:analizador'. Se previene duplicación.",
  "actions": [
    {
      "type": "show_notification",
      "payload": {
        "variant": "warning",
        "title": "Análisis en progreso",
        "description": "Espera a que el análisis actual termine.",
        "duration_ms": 4000
      }
    }
  ]
}
```

---

### 7.5 Usuario Sin Sesión

**Situación:** `session_context.user_id` está vacío o es inválido.

```json
{
  "success": false,
  "status": 401,
  "message": "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
  "suggested_action": null,
  "reasoning": "user_id ausente o inválido en session_context.",
  "actions": [
    {
      "type": "show_notification",
      "payload": {
        "variant": "error",
        "title": "Sesión expirada",
        "description": "Serás redirigido al inicio de sesión.",
        "duration_ms": 3000
      }
    },
    {
      "type": "navigate_to",
      "payload": {
        "path": "/login",
        "replace": true
      }
    }
  ]
}
```

---

### 7.6 Error del Backend en el Análisis

**Situación:** El endpoint `/analyzer/analyze` devuelve un error 404 (perfil no encontrado o privado).

El frontend detecta el error en `trigger_analysis.on_error` y el agente responde:

```json
{
  "success": false,
  "status": 404,
  "message": "No encontré el perfil @usuario_inexistente. Puede ser que sea privado, esté suspendido o el nombre de usuario sea incorrecto.",
  "suggested_action": null,
  "reasoning": "El endpoint /analyzer/analyze devolvió 404. El perfil no es accesible públicamente.",
  "actions": [
    {
      "type": "hide_loading",
      "payload": { "component_id": "analyzer_chat_card" }
    },
    {
      "type": "show_notification",
      "payload": {
        "variant": "error",
        "title": "Perfil no encontrado",
        "description": "Verifica que el usuario sea correcto y que su cuenta sea pública.",
        "duration_ms": 6000
      }
    },
    {
      "type": "request_additional_input",
      "payload": {
        "field_type": "text",
        "prompt": "¿Quieres intentar con otro nombre de usuario?",
        "required": false,
        "on_submit": "trigger_analysis:analizador"
      }
    }
  ]
}
```

---

### 7.7 Tabla de Códigos de Error del Agente

| Código | Significado | Acción de Fallback del Frontend |
|---|---|---|
| `400` | Request malformado | `show_notification:error` + log interno |
| `401` | Sesión inválida | `navigate_to:/login` |
| `404` | Recurso no encontrado | `show_notification:error` + `request_additional_input` |
| `409` | Conflicto (duplicado) | `show_notification:warning` |
| `422` | Input insuficiente / ambiguo | `request_additional_input` |
| `429` | Límite de uso alcanzado | `show_notification:warning` con info de plan |
| `500` | Error interno del agente | `show_notification:error` con mensaje genérico |

---

## 8. Herramientas Disponibles y sus Flujos

### 8.1 Palabras Clave por Herramienta

El agente usa estas señales textuales para inferir `tool_intent`:

| Clave (`key`) | Nombre | Señales en el mensaje |
|---|---|---|
| `adn` | ADN Creator | "ver adn", "mi marca", "estrategia", "identidad", "crear adn", "regenerar adn", "actualizar adn", "adn" |
| `transcriptor` | Transcriptor | "transcribe", "video", "convierte", "texto del video", "audio a texto" |
| `guiones` | Guiones | "guión", "script", "escena", "narrativa", "gancho", "hook" |
| `referentes` | Referentes | "referente", "inspiración", "competencia", "similar", "creador exitoso", "ejemplos", "modelos", "otros creadores", "quién lo hace bien" |
| `simulador` | Simulador | "simula", "vender", "ventas", "pitch", "presentación" |
| `carruseles` | Carruseles | "carrusel", "diapositivas", "slides", "post de carrusel" |
| `noticias` | Noticias | "noticias", "tendencias", "novedades", "actualidad" |
| `analizador` | Analizador | "analiza", "@usuario", "perfil", "instagram", "métricas", "engagement" |

---

### 8.2 Flujos por Herramienta

#### `adn` — ADN Creator

Esta herramienta tiene dos sub-flujos dependiendo de la intención del usuario.

**Sub-flujo A: Ver ADN existente**
*   **Propósito:** Mostrar la tarjeta con la información de marca al usuario directamente en el chat.
*   **Señales:** "ver mi adn", "muéstrame mi adn", "mi marca", "cómo está mi identidad", "quiero ver mi estrategia"
*   **Condición:** `adn_available === true`
*   **Acción Obligatoria:** `render_component:adn_response_card` con `position: "append"`.
*   **Razonamiento:** "El usuario solicita ver su información de ADN y el contexto confirma que está disponible. Se renderiza el componente directamente para visualización inmediata."

**Sub-flujo B: Generar/Regenerar ADN**
*   **Señales:** "crear adn", "regenerar mi adn", "actualizar marca", "nuevo adn", "generar de nuevo"
*   **Secuencia:**
    1.  `update_state: activeTool = "adn"`
    2.  `render_component:adn_recommendations_card`
    3.  `request_additional_input: audio_record` (prompt: "Graba o sube un audio...") -> `on_submit: confirm_adn_processing`
    4.  *(Tras grabación/subida)* -> `request_additional_input: confirmation` (prompt: "¿Deseas procesar este audio?") -> `on_submit: process_adn_final`
    5.  *(Tras confirmación)* -> `trigger_analysis: POST /adn/audio` -> `adn_processing_card`
    6.  *(Tras procesado en Card)* -> El usuario pulsa "Ver mi ADN" -> `render_component:adn_response_card`

**Caso Borde: Procesamiento en curso**
Si el agente detecta que ya hay un procesamiento activo (vía `previous_actions` o contexto), debe mostrar directamente la tarjeta de carga:
`render_component:adn_processing_card` (con el `queueId` correspondiente).

```
Entrada requerida: audio (preferido) | texto | pdf
Endpoint: POST /adn/audio
Componente resultado: adn_response_card
Campos clave del resultado: business_summary, keywords, content_pillars, pains, pillars
```

**Ejemplo ActionResponse — Sub-flujo A (Ver ADN):**
```json
{
  "success": true,
  "status": 200,
  "message": "Aquí tienes tu ADN de marca actual.",
  "agent_version": "1.2.1",
  "suggested_action": "ADN_VIEW",
  "reasoning": "El usuario solicitó ver su ADN y el contexto indica que ya existe uno generado.",
  "actions": [
    {
      "type": "render_component",
      "payload": {
        "component_id": "adn_response_card",
        "position": "append"
      }
    }
  ]
}
```

**Ejemplo ActionResponse — Sub-flujo B (Inicio de Generación):**
```json
{
  "success": true,
  "status": 200,
  "message": "¡Excelente decisión! Vamos a crear tu ADN de marca. Primero, te comparto unos tips para tu grabación.",
  "agent_version": "1.2.1",
  "suggested_action": "ADN_GENERATE_START",
  "reasoning": "El usuario desea generar un nuevo ADN. Se inicia el flujo interactivo mostrando recomendaciones y solicitando el audio.",
  "actions": [
    {
      "type": "update_state",
      "payload": { "state_key": "activeTool", "value": "adn", "scope": "assistant_page" }
    },
    {
      "type": "render_component",
      "payload": { "component_id": "adn_recommendations_card", "position": "append" }
    },
    {
      "type": "request_additional_input",
      "payload": {
        "field_type": "audio_record",
        "prompt": "Graba un audio (máx 2 min) contándome sobre tu negocio o sube un archivo siguiendo los tips de arriba:",
        "required": true,
        "on_submit": "confirm_adn_processing"
      }
    }
  ]
}
```

#### `analizador` — Analizador de Perfil Instagram

```
Entrada requerida: username de Instagram
Endpoint: POST /analyzer/analyze { username: string }
Componente resultado: analyzer_chat_card
Campos clave del resultado: followers_count, engagement_rate, analysis_result.score_general
Secuencia: show_loading(3 etapas) → trigger_analysis → render_component:analyzer_chat_card
```

#### `transcriptor` — Transcriptor Pro

```
Entrada requerida: archivo de video o URL de video
Endpoint: POST /transcriptions
Componente resultado: text_message (transcripción renderizada)
Secuencia: show_loading → trigger_analysis → render_component:text_message
```

#### `guiones` — Generador de Guiones

```
Entrada requerida: tema o transcripción previa
Endpoint: POST /scripts/generate
Componente resultado: text_message (guión formateado)
Secuencia: populate_field → trigger_analysis → render_component:text_message
```

#### `referentes` — Búsqueda de Referentes

Esta herramienta permite buscar referentes de contenido basados en nichos, categorías o perfiles específicos.

**Flujo de Búsqueda Avanzada**
*   **Propósito:** Encontrar creadores o canales que sirvan de inspiración o referencia.
*   **Señales:** "busca referentes", "dame ejemplos de canales de fitness", "quién hace buen contenido de marketing", "referentes en youtube"
*   **Mapeo de Campos:** El agente debe extraer términos y mapearlos a los campos soportados: `title`, `channelName`, `nombre`, `username`, `categoria`, `tipo_cuenta`.
*   **Endpoint:** `/referentes`
*   **Query Params:**
    *   `search` (opcional): Término de búsqueda.
    *   `searchFields` (opcional): Arreglo de campos donde buscar (ej: `["title", "channelName", "username", "tipo_cuenta", "nombre", "categoria"]`).
    *   `page` / `limit` (opcional): Paginación (default: 1 / 10).
    *   `saved` (opcional): Filtrar por estado de guardado (`true`/`false`).
*   **Secuencia:**
    1.  `show_notification` (informativa: "Buscando referentes...")
    2.  `trigger_analysis` -> `GET /api/v1/referentes`
    3.  `on_success`: El agente debe procesar los resultados y devolver múltiples acciones `render_component:referent_chat_card` (una por cada resultado relevante).

**Componente Resultado:** `referent_chat_card`
*   **Props esperadas:** Estructura completa del referente devuelta por la API (id, name, username, bio, metrics, etc.).
*   **Acciones en Tarjeta:** La tarjeta incluye un botón para "Guardar Referente" que apunta a `POST /api/v1/referentes`.

```
Entrada requerida: nicho o término de búsqueda
Endpoint: /referentes
Componente resultado: referent_chat_card (múltiples instancias)
Campos de búsqueda: search, searchFields (title, channelName, nombre, username, categoria, tipo_cuenta), saved
```

#### `simulador` — Simulador de Ventas

```
Entrada requerida: descripción del producto/servicio
Endpoint: POST /simulator/start
Componente resultado: text_message (conversación interactiva)
Secuencia: trigger_analysis → render_component:text_message
```

#### `carruseles` — Generador de Carruseles

```
Entrada requerida: tema o brief del carrusel
Endpoint: POST /carousels/generate
Componente resultado: render_component con preview del carrusel
Secuencia: populate_field → trigger_analysis → render_component:carousel_preview
```

#### `noticias` — Agregador de Noticias

```
Entrada requerida: ninguna (se carga automáticamente) o término de búsqueda
Endpoint: GET /news?search=...
Componente resultado: lista de tarjetas de noticias
Secuencia: open_sidebar_folder:noticias → trigger_analysis
```

---

## 9. Versionado y Extensibilidad

### 9.1 Esquema de Versiones

El campo `agent_version` en cada `ActionResponse` sigue **Semver** (`MAJOR.MINOR.PATCH`):

| Tipo de cambio | Incrementa | Ejemplo |
|---|---|---|
| Nueva herramienta añadida | `MINOR` | `1.0.0` → `1.1.0` |
| Nuevo tipo de acción añadido | `MINOR` | `1.1.0` → `1.2.0` |
| Cambio en campos del payload | `MAJOR` | `1.2.0` → `2.0.0` |
| Corrección de regla de interpretación | `PATCH` | `1.2.0` → `1.2.1` |

### 9.2 Cómo Añadir una Nueva Herramienta

1. **Añadir la clave** en [`TOOLS`](src/presentation/components/AssistantPage/tools.tsx) con su `key`, `label` e `icon`.
2. **Añadir el tipo de mensaje** en [`ChatMessage`](src/presentation/components/AssistantPage/types.ts) si requiere una tarjeta dedicada.
3. **Crear el componente** de tarjeta en `src/presentation/components/AssistantPage/components/`.
4. **Registrar** el nuevo `component_id` en la tabla §3.9 de este documento.
5. **Documentar** las palabras clave en la tabla §8.1.
6. **Documentar** el flujo completo en la sección §8.2.
7. **Incrementar** `agent_version` (MINOR bump).
8. **Actualizar** este archivo RAG con los nuevos esquemas y ejemplos.

### 9.3 Cómo Añadir un Nuevo Tipo de Acción

1. **Definir** la interfaz TypeScript en `types.ts` con campos `type` y `payload`.
2. **Añadir** el discriminante al tipo unión `FrontendAction` en §2.2.
3. **Implementar** el handler en el componente `AssistantPage` (switch case en el array `actions`).
4. **Documentar** la nueva acción en la sección §3 con su schema y ejemplo JSON.
5. **Incrementar** `agent_version` (MINOR bump).

### 9.4 Campo `agent_version` en el Frontend

El frontend DEBE validar compatibilidad de versiones al recibir una `ActionResponse`:

```typescript
// Lógica de compatibilidad en AssistantPage
const SUPPORTED_MAJOR_VERSION = 1;

function isCompatible(agentVersion: string): boolean {
  const [major] = agentVersion.split('.').map(Number);
  return major === SUPPORTED_MAJOR_VERSION;
}

// Si !isCompatible → show_notification:warning con mensaje de actualización
```

### 9.5 Registro de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| `1.0.0` | 2026-03-25 | Versión inicial. 8 herramientas, 9 tipos de acción. Flujo completo de análisis Instagram documentado. |
| `1.1.0` | 2026-03-27 | Mejoras en el manejo de archivos adjuntos. |
| `1.2.0` | 2026-03-28 | Flujo interactivo de ADN Creator con sub-flujos por intención, componente de recomendaciones y confirmación paso a paso. |
| `1.2.1` | 2026-03-29 | Refuerzo de reglas de visualización directa para evitar respuestas textuales genéricas cuando hay componentes disponibles. |
| `1.3.0` | 2026-03-30 | Soporte para `audio_record` en el chat. Integración de grabación en vivo y polling mejorado con React Query. |
| `1.3.1` | 2026-03-31 | Actualización del flujo de Analizador para usar POST `/analyzer/analyze` y mapeo de props de `AnalyzerChatCard` con fallback para `profileId`. |

---

## Apéndice A: Glosario

| Término | Definición |
|---|---|
| **Agente IA** | Sistema de inteligencia artificial que procesa el lenguaje natural del usuario y genera `ActionResponse` |
| **RAG** | Retrieval-Augmented Generation. El agente consulta esta documentación como base de conocimiento para construir respuestas |
| **ActionResponse** | Objeto JSON estructurado que el agente devuelve al frontend con un plan de acciones a ejecutar |
| **FrontendAction** | Una acción atómica dentro del array `actions` de un `ActionResponse` |
| **session_context** | Metadatos de la sesión actual que el frontend adjunta a cada request del usuario |
| **component_id** | Identificador único de un componente React que el agente puede ordenar renderizar |
| **tool_intent** | La herramienta que el agente infiere que el usuario desea usar, basándose en señales del mensaje |
| **active_tool** | La herramienta que el usuario tiene seleccionada actualmente en el sidebar del frontend |
| **on_success / on_error** | Acciones de callback que el frontend ejecuta después de que `trigger_analysis` resuelve |

---

## Apéndice B: Diagrama de Flujo del Análisis de Instagram

```
┌─────────────────────────────────────────────────────────────┐
│                   USUARIO SELECCIONA ANALIZADOR              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
             ┌────────────────────────┐
             │ Frontend envía request  │
             │ POST /chat              │
             │ { message, context }    │
             └────────────┬───────────┘
                          │
                          ▼
             ┌────────────────────────┐
             │  Agente consulta RAG   │
             │  Extrae @username       │
             └────────────┬───────────┘
                          │
               ┌──────────┴──────────┐
               │                     │
         ¿username             ¿no username
         detectado?             detectado?
               │                     │
               ▼                     ▼
    ┌──────────────────┐   ┌─────────────────────┐
    │ ActionResponse   │   │ ActionResponse       │
    │ status: 200      │   │ status: 422          │
    │ actions: [       │   │ actions: [           │
    │  show_loading,   │   │  request_additional_ │
    │  trigger_analysis│   │  input ]             │
    │ ]                │   └─────────────────────┘
    └────────┬─────────┘
             │
    ┌────────┴─────────┐
    │ POST /analyzer/  │
    │ analyze          │
    └────────┬─────────┘
             │
    ┌────────┴────────┐
    │                 │
   200              4xx/5xx
    │                 │
    ▼                 ▼
┌──────────┐    ┌──────────────────┐
│ render_  │    │ hide_loading +   │
│ component│    │ show_notification│
│ analyzer_│    │ :error           │
│ chat_card│    └──────────────────┘
└──────────┘
```

---

*Este documento es la fuente de verdad para el comportamiento del agente IA en AIVI. Cualquier modificación al protocolo debe reflejarse aquí antes de ser implementada en el backend o el frontend.*
