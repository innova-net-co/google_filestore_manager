## ADDED Requirements

### Requirement: Sincronización automática de estado (Polling)
El sistema SHALL realizar un sondeo automático de los documentos que se encuentren en un estado transitorio (como `STATE_PENDING`).

#### Scenario: Documento en estado pendiente
- **WHEN** el árbol de documentos carga un nodo con `STATE_PENDING`
- **THEN** el sistema MUST iniciar un temporizador de refresco (polling) de 5 segundos para ese store en específico

#### Scenario: Finalización del procesamiento
- **WHEN** una consulta de refresco retorna que todos los documentos de un store han salido del estado `STATE_PENDING`
- **THEN** el sistema MUST detener el polling para ese store y actualizar el badge visual del documento (a verde o rojo)

#### Scenario: Error de red durante el polling
- **WHEN** una petición de polling falla
- **THEN** el sistema MUST reintentar la petición con una estrategia de retroceso exponencial (exponential backoff) antes de mostrar un error crítico
