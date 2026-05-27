# UIX Unisabana LLM

Arquitectura base cliente-servidor para una plataforma web multiusuario de chat con LLM, con soporte de proveedores OpenAI-compatible y Ollama, persistencia en MongoDB y cache/cola en Redis.

> Estado actual: andamiaje (scaffolding). La mayoría de endpoints de negocio responden `501 Scaffolding endpoint` como contrato base para que el equipo implemente la lógica en iteraciones.

## 1) Arquitectura general

### Flujo cliente-servidor

`Frontend (React)` -> `Backend API (Express)` -> `Proveedor LLM (Ollama/OpenAI-compatible)`

Este README corresponde al repositorio frontend. El backend puede ejecutarse en otro repositorio y ambos se unen por la red Docker `uix-shared`.

### Responsabilidades por capa

- **Frontend (`frontend/`)**
  - Renderiza interfaz y estados de usuario.
  - Consume API REST y SSE del backend.
  - No accede directamente a credenciales ni a proveedores LLM.

- **Backend (`backend/`)**
  - Exposición de endpoints REST/SSE.
  - Validación de payloads y flujo de negocio.
  - Integración con MongoDB (Mongoose), Redis y proveedores LLM.
  - Aislamiento de seguridad (tokens, claves, reglas de acceso).

- **Infraestructura (Docker Compose)**
  - Orquesta frontend, backend, mongodb, redis y herramientas opcionales.
  - Permite hot reload en desarrollo con volúmenes.

## 2) Estructura de carpetas y archivos

En esta sección, cada archivo indica **qué debe resolver** dentro de la arquitectura.

## Raíz del proyecto (frontend)

- `.env.example`
  - Variables de entorno base para desarrollo.
  - Define puertos, MongoDB, Redis, LLM, SSE y herramientas opcionales.
  - Debe resolver la configuración mínima reproducible del entorno local.

- `docker-compose.yml`
  - Orquestación de servicios:
    - `frontend`
    - red compartida `uix-shared`
  - Debe resolver la orquestación completa de servicios y redes para desarrollo.

- `.gitignore`
  - Exclusión de artefactos sensibles/locales (`.env`, `node_modules`, etc).
  - Debe resolver la higiene del repositorio evitando subir secretos/artefactos.

## Backend (`backend/`)

- `backend/Dockerfile`
  - Imagen del servicio backend para desarrollo.

- `backend/package.json`
  - Scripts y dependencias del backend.
  - Scripts esperados:
    - `dev`
    - `start`
    - `seed`
    - `db:reset`
    - `migrate` (mensaje de compatibilidad Mongo)

- `backend/src/server.js`
  - Punto de entrada.
  - Arranca servidor HTTP.
  - Conecta/cierra base de datos en bootstrap y shutdown.
  - Debe resolver el ciclo de vida de la aplicación (start/stop).

- `backend/src/app.js`
  - Configuración global de Express:
    - middlewares
    - rutas
    - manejo de errores
  - Debe resolver el ensamblaje HTTP global del backend.

### Configuración

- `backend/src/config/env.js`
  - Centraliza `process.env`.
  - Expone `env` con defaults de desarrollo.
  - Incluye `env.mongoUri`, Redis, LLM, puertos y flags de app.
  - Debe resolver una única fuente de verdad para configuración.

- `backend/src/config/database.js`
  - Healthcheck de MongoDB (`ping`).
  - Debe resolver la verificación técnica de disponibilidad de base de datos.

- `backend/src/config/redis.js`
  - Cliente Redis y función de conexión segura/reutilizable.
  - Debe resolver conexión y reutilización de Redis en módulos.

### Base de datos

- `backend/src/database/connection.js`
  - Conexión Mongoose centralizada.
  - Exporta:
    - `connectDatabase()`
    - `closeDatabaseConnection()`
    - `mongoose`
  - Debe resolver conexión centralizada, errores y cierre limpio de MongoDB.

- `backend/src/database/models/User.js`
  - Modelo de usuario:
    - `name`
    - `email` único
    - `passwordHash`
    - `role` ref `Role`
    - `isActive`
    - `lastLoginAt`
    - `deletedAt`
    - timestamps

- `backend/src/database/models/Role.js`
  - Modelo de rol:
    - `name`
    - `slug` único
    - `description`
    - `permissions` refs `Permission`
    - `deletedAt`
    - timestamps

- `backend/src/database/models/Permission.js`
  - Modelo de permiso:
    - `name`
    - `slug` único
    - `description`
    - timestamps

- `backend/src/database/models/Conversation.js`
  - Conversaciones por usuario:
    - `user` ref `User`
    - `title`
    - `model` ref `LlmModel`
    - `deletedAt`
    - timestamps

- `backend/src/database/models/Message.js`
  - Mensajes por conversación:
    - `conversation` ref `Conversation`
    - `role` enum `system|user|assistant|tool`
    - `content`
    - `metadata`
    - `deletedAt`
    - timestamps

- `backend/src/database/models/LlmProvider.js`
  - Proveedores LLM:
    - `name`
    - `slug` único
    - `baseUrl`
    - `apiKeyEnvName`
    - `isLocal`
    - `isActive`
    - timestamps

- `backend/src/database/models/LlmModel.js`
  - Modelos disponibles:
    - `provider` ref `LlmProvider`
    - `name`
    - `displayName`
    - `contextWindow`
    - `supportsStreaming`
    - `isActive`
    - `isDefault`
    - timestamps

- `backend/src/database/models/AppSetting.js`
  - Configuración global:
    - `key` único
    - `value`
    - `type`
    - `description`
    - timestamps

- `backend/src/database/seeders/seed.js`
  - Seed idempotente:
    - roles (`admin`, `user`)
    - permisos base
    - asociación permisos admin
    - proveedor Ollama
    - modelo inicial
    - usuario admin inicial
  - Debe resolver el estado inicial idempotente de datos para desarrollo.

- `backend/src/database/reset.js`
  - Limpieza de colecciones en desarrollo y re-seed.
  - Debe resolver el reinicio controlado de datos en entorno local.

- `backend/src/database/migrations/migrate.js`
  - Script de compatibilidad que informa que en Mongo no se usan migraciones SQL.
  - Debe resolver compatibilidad operativa con scripts heredados.

### Módulos de dominio (`backend/src/modules`)

Cada módulo sigue patrón:
`routes -> controller -> service -> repository -> model`

Responsabilidad por capa:

- **`*.routes.js`**: debe resolver contrato HTTP (paths, métodos, middlewares).
- **`*.controller.js`**: debe resolver traducción request/response y códigos HTTP.
- **`*.service.js`**: debe resolver reglas de negocio del módulo.
- **`*.repository.js`**: debe resolver acceso y persistencia de datos.
- **`*.validation.js`**: debe resolver validación de entrada por endpoint.

#### Auth

- `auth.routes.js`: rutas de autenticación.
- `auth.controller.js`: capa HTTP de auth.
- `auth.service.js`: login/registro/logout/me.
- `auth.validation.js`: validaciones de auth.

#### Users

- `users.routes.js`: endpoints CRUD de usuarios.
- `users.controller.js`: capa HTTP.
- `users.service.js`: reglas de usuario.
- `users.repository.js`: consultas Mongoose sobre `User`.
- `users.validation.js`: validaciones.

#### Roles

- `roles.routes.js`
- `roles.controller.js`
- `roles.service.js`
- `roles.repository.js`
- `roles.validation.js`

#### Chat

- `chat.routes.js`: chat normal y streaming.
- `chat.controller.js`: HTTP + SSE.
- `chat.service.js`: orquestación de proveedor y persistencia.
- `chat.repository.js`: persistencia de intercambio en conversación/mensajes.
- `chat.validation.js`: validación de payload de chat.

#### Conversations

- `conversations.routes.js`
- `conversations.controller.js`
- `conversations.service.js`
- `conversations.repository.js`
- `conversations.validation.js`

#### Messages

- `messages.routes.js`
- `messages.controller.js`
- `messages.service.js`
- `messages.repository.js`
- `messages.validation.js`

#### Models

- `models.routes.js`
- `models.controller.js`
- `models.service.js`
- `models.repository.js`
- `models.validation.js`

#### Health

- `health.routes.js`
- `health.controller.js`

### Rutas, servicios y utilidades compartidas

- `backend/src/routes/index.js`
  - Registro central de rutas `/api`.
  - Debe resolver el mapa único de módulos expuestos por API.

- `backend/src/services/ollama.service.js`
  - Integración con Ollama (normal + stream por chunks).
  - Debe resolver comunicación low-level con Ollama.

- `backend/src/services/openai-compatible.service.js`
  - Integración OpenAI-compatible.
  - Debe resolver comunicación low-level con proveedores OpenAI-compatible.

- `backend/src/middlewares/auth.middleware.js`
  - Base para autenticación/autorización.
  - Debe resolver control de acceso transversal.

- `backend/src/middlewares/validate.middleware.js`
  - Valida payloads con `zod`.
  - Debe resolver integridad de datos de entrada.

- `backend/src/middlewares/error.middleware.js`
  - Manejo de 404 y errores globales.
  - Debe resolver propagación uniforme de errores.

- `backend/src/utils/async-handler.js`
  - Wrapper para controladores async.

- `backend/src/utils/api-response.js`
  - Formato homogéneo de respuestas.

- `backend/src/utils/logger.js`
  - Logger simple por niveles.

- `backend/src/utils/normalize-id.js`
  - Normaliza documentos Mongoose:
    - `_id` -> `id`
    - elimina `__v`
    - normaliza ObjectId/Date/arrays
  - Debe resolver consistencia de respuesta para frontend (`id` en vez de `_id`).

- `backend/src/utils/db.js`
  - Helper de transacciones Mongoose.

## Frontend (`frontend/`)

- `frontend/Dockerfile`
  - Imagen frontend en modo desarrollo.

- `frontend/package.json`
  - Scripts Vite (`dev`, `build`, `preview`).

- `frontend/index.html`
  - Entry point HTML.

- `frontend/vite.config.js`
  - Configuración de Vite.

- `frontend/src/main.jsx`
  - Montaje de React.

- `frontend/src/App.jsx`
  - Router principal, navegación y guards de acceso.
  - Debe resolver la composición de vistas y navegación de la SPA.

- `frontend/src/styles.css`
  - Estilos institucionales base (paleta Unisabana).

- `frontend/src/services/chat-api.js`
  - Cliente HTTP/SSE hacia backend:
    - `sendChatMessage()`
    - `streamChatMessage()`
  - Debe resolver contrato de consumo de endpoints de chat.

- `frontend/src/services/auth-api.js`
  - Cliente de endpoints de autenticación.
  - Debe resolver contrato de consumo de autenticación.

- `frontend/src/services/users-api.js`
  - Cliente CRUD de usuarios para panel admin.
  - Debe resolver contrato de consumo de administración de usuarios.

- `frontend/src/services/roles-api.js`
  - Cliente base de roles para panel admin.
  - Debe resolver contrato de consumo de administración de roles.

- `frontend/src/context/AuthContext.jsx`
  - Estado de sesión en cliente (user/token) para scaffolding.
  - Debe resolver estado global de autenticación en frontend.

- `frontend/src/guards/RequireAuth.jsx`
  - Guard de rutas privadas.
  - Debe resolver restricción de navegación para usuarios autenticados.

- `frontend/src/guards/RequireAdmin.jsx`
  - Guard de rutas administrativas.
  - Debe resolver restricción de navegación para rol admin.

- `frontend/src/pages/LoginPage.jsx`
  - Pantalla de login.
  - Debe resolver captura/validación inicial de credenciales en UI.

- `frontend/src/pages/ChatPage.jsx`
  - Pantalla principal de chat.
  - Debe resolver la experiencia principal de conversación.

- `frontend/src/pages/ProfilePage.jsx`
  - Pantalla base para edición de perfil.
  - Debe resolver gestión básica de cuenta del usuario.

- `frontend/src/pages/admin/AdminUsersPage.jsx`
  - Scaffold de administración de usuarios.
  - Debe resolver operación administrativa de usuarios.

- `frontend/src/pages/admin/AdminRolesPage.jsx`
  - Scaffold de administración de roles.
  - Debe resolver operación administrativa de roles y permisos base.

### Matriz de referencia (archivo -> responsabilidad -> estado)

| Archivo | Responsabilidad principal | Estado |
|---|---|---|
| `.env.example` | Definir configuración base por entorno | Scaffold |
| `docker-compose.yml` | Orquestar servicios y red local | Implementado |
| `backend/src/server.js` | Ciclo de vida del backend (start/shutdown) | Implementado |
| `backend/src/app.js` | Ensamblaje HTTP global (middlewares/rutas/errores) | Implementado |
| `backend/src/config/env.js` | Fuente única de variables de entorno | Implementado |
| `backend/src/database/connection.js` | Conexión centralizada MongoDB | Implementado |
| `backend/src/database/models/*.js` | Contratos de persistencia por entidad | Implementado |
| `backend/src/database/seeders/seed.js` | Datos iniciales idempotentes | Implementado |
| `backend/src/database/reset.js` | Reset local de colecciones + seed | Implementado |
| `backend/src/modules/*/*.routes.js` | Contrato de endpoints y middlewares | Implementado |
| `backend/src/modules/*/*.validation.js` | Validación de payloads (zod) | Implementado |
| `backend/src/modules/*/*.controller.js` | Capa HTTP de módulos | Scaffold (501) |
| `backend/src/modules/*/*.service.js` | Reglas de negocio | Scaffold (not implemented) |
| `backend/src/modules/*/*.repository.js` | Acceso a datos | Scaffold (not implemented) |
| `backend/src/services/ollama.service.js` | Integración low-level con Ollama | Scaffold/Parcial |
| `backend/src/services/openai-compatible.service.js` | Integración low-level OpenAI-compatible | Scaffold/Parcial |
| `backend/src/middlewares/auth.middleware.js` | Auth/authz transversal | Scaffold |
| `backend/src/middlewares/validate.middleware.js` | Validación transversal por esquema | Implementado |
| `backend/src/middlewares/error.middleware.js` | Manejo global de errores | Implementado |
| `backend/src/utils/normalize-id.js` | Normalizar `_id` a `id` en respuestas | Implementado |
| `backend/src/utils/scaffold-response.js` | Respuesta estándar de endpoints scaffold | Implementado |
| `backend/src/utils/not-implemented.js` | Marcador de métodos pendientes | Implementado |
| `frontend/src/main.jsx` | Bootstrap React (router/contexto) | Implementado |
| `frontend/src/App.jsx` | Router principal y navegación | Implementado |
| `frontend/src/services/chat-api.js` | Contrato cliente para chat | Scaffold |
| `frontend/src/services/auth-api.js` | Contrato cliente para auth | Scaffold |
| `frontend/src/services/users-api.js` | Contrato cliente para users admin | Scaffold |
| `frontend/src/services/roles-api.js` | Contrato cliente para roles admin | Scaffold |
| `frontend/src/context/AuthContext.jsx` | Estado global de sesión en UI | Scaffold |
| `frontend/src/guards/RequireAuth.jsx` | Guard de rutas privadas | Implementado |
| `frontend/src/guards/RequireAdmin.jsx` | Guard de rutas admin | Implementado |
| `frontend/src/pages/LoginPage.jsx` | Pantalla de login | Scaffold UI |
| `frontend/src/pages/ChatPage.jsx` | Pantalla principal de chat | Scaffold UI |
| `frontend/src/pages/ProfilePage.jsx` | Pantalla de perfil | Scaffold UI |
| `frontend/src/pages/admin/AdminUsersPage.jsx` | Pantalla admin usuarios | Scaffold UI |
| `frontend/src/pages/admin/AdminRolesPage.jsx` | Pantalla admin roles | Scaffold UI |
| `frontend/src/ui/*.jsx` | Componentes visuales reutilizables | Scaffold UI |
| `frontend/src/styles.css` | Estilo institucional base | Implementado |

- `frontend/src/ui/AppHeader.jsx`
  - Encabezado institucional.

- `frontend/src/ui/ConversationSidebar.jsx`
  - Sidebar de conversaciones (estructura base).

- `frontend/src/ui/ProviderModelBar.jsx`
  - Selector base proveedor/modelo por conversación.

- `frontend/src/ui/ChatThread.jsx`
  - Render base de mensajes usuario/asistente.

- `frontend/src/ui/ChatComposer.jsx`
  - Input de mensaje + toggle streaming.

## 3) Endpoints API

Base URL backend: `http://localhost:4000`

### Sistema

- `GET /`
- `GET /health`
- `GET /api`
- `GET /api/health`

### Auth (`/api/auth`)

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Frontend routes

- `/login`
- `/`
- `/profile`
- `/admin/users` (admin)
- `/admin/roles` (admin)

### Users (`/api/users`)

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### Roles (`/api/roles`)

- `GET /api/roles`
- `POST /api/roles`

### Chat (`/api/chat`)

- `POST /api/chat`
- `POST /api/chat/stream` (SSE)

### Conversations (`/api/conversations`)

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id`
- `PATCH /api/conversations/:id`
- `DELETE /api/conversations/:id`

### Messages (`/api/messages`)

- `GET /api/messages`
- `POST /api/messages`

### Models (`/api/models`)

- `GET /api/models`
- `PATCH /api/models/default-provider`

## 4) Instalación paso a paso

Requisitos previos:

- Docker
- Docker Compose v2
- (Opcional) Ollama local para pruebas con modelos locales

### Linux

1. Clonar proyecto.
2. Crear variables:
   ```bash
   cp .env.example .env
   ```
3. Levantar frontend stack:
   ```bash
   docker compose up -d --build
   ```
4. Ver logs:
   ```bash
   docker compose logs -f frontend
   ```

### macOS

1. Clonar proyecto.
2. Crear variables:
   ```bash
   cp .env.example .env
   ```
3. Levantar frontend stack:
   ```bash
   docker compose up -d --build
   ```
4. Ver logs:
   ```bash
   docker compose logs -f frontend
   ```

### Windows (PowerShell)

1. Clonar proyecto.
2. Crear variables:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Levantar frontend stack:
   ```powershell
   docker compose up -d --build
   ```
4. Ver logs:
   ```powershell
   docker compose logs -f frontend
   ```

## 5) Comandos operativos útiles

- Parar servicios:
  ```bash
  docker compose down
  ```

- Reconstruir:
  ```bash
  docker compose up -d --build
  ```

- Reset de base de datos (desarrollo, destructivo):
  - No aplica en este repositorio frontend.
  - Ejecutar en el repositorio backend.

- Modo tools (Mongo Express + Mailpit):
  - No aplica en este repositorio frontend.
  - Ejecutar en el repositorio backend.

## 6) Verificación rápida post-instalación

- Salud backend:
  ```bash
  curl http://localhost:4000/health
  ```

- Login admin inicial:
  ```bash
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"Admin123456!"}'
  ```

- Chat normal:
  ```bash
  curl -X POST http://localhost:4000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Hola"}'
  ```

- Chat streaming:
  ```bash
  curl -N -X POST http://localhost:4000/api/chat/stream \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Hola streaming"}'
  ```

## 7) Integración con Ollama local

- Variable principal backend:
  - `OLLAMA_BASE_URL=http://host.docker.internal:11434`

- Probar Ollama en host:
  ```bash
  curl http://localhost:11434/api/tags
  ```

- Probar desde contenedor backend:
  ```bash
  docker compose exec backend sh
  wget -qO- http://host.docker.internal:11434/api/tags
  ```

Si obtienes `model not found`, descarga modelo en host:

```bash
ollama pull llama3.1
```

## 8) Usuario admin inicial

- Email: `admin@example.com`
- Password: `Admin123456!`

Solo para desarrollo local. Cambiar credenciales al primer uso y no reutilizar en producción.
