## ADDED Requirements

### Requirement: Almacenamiento de API Keys
El sistema SHALL permitir al usuario guardar múltiples API Keys de Google en el `localStorage` del navegador. Cada entrada debe contener un nombre descriptivo y la clave alfanumérica.

#### Scenario: Guardar una nueva API Key
- **WHEN** el usuario ingresa un nombre y una clave en el formulario de configuración y hace clic en "Guardar"
- **THEN** el sistema MUST añadir la nueva clave al arreglo de claves en `localStorage` y actualizar la lista visual

### Requirement: Selección de API Key activa
El sistema SHALL permitir al usuario seleccionar una de las claves registradas como "Activa". Solo puede haber una clave activa a la vez.

#### Scenario: Cambiar la clave activa
- **WHEN** el usuario selecciona una clave diferente del selector
- **THEN** el sistema MUST marcar esa clave como activa en el estado global y persistirlo en `localStorage`

### Requirement: Modal de bienvenida/configuración
El sistema SHALL mostrar un modal de bienvenida si no detecta ninguna API Key configurada en el navegador al iniciar la aplicación.

#### Scenario: Inicio sin configuración
- **WHEN** la aplicación carga y no hay claves en `localStorage`
- **THEN** el sistema MUST mostrar un modal bloqueante que solicite al menos una API Key para continuar
