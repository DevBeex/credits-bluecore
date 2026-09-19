# Solicitudes de crédito

Aplicación full-stack para que un operador autentique, cree solicitudes de crédito, las liste con filtro/paginación y las apruebe o rechace con comentario. El solicitante se identifica por cédula; no tiene cuenta.

- **Backend:** NestJS 12 + TypeORM 0.3 contra Amazon Aurora PostgreSQL
- **Frontend:** Angular 22 + Ionic 9 (standalone)
- **Workspace:** pnpm 12, Node 24 LTS

## Arranque con Docker

Hace falta [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose) en ejecución.

### 1. Crear el `.env`

El repositorio no incluye secretos de base de datos. Copia el esqueleto y completa las credenciales que Bluecore envió por correo:

```powershell
copy .env.example .env
```

En macOS/Linux:

```bash
cp .env.example .env
```

Rellena al menos:

| Variable | Origen |
| --- | --- |
| `DB_HOST` | correo de Bluecore |
| `DB_USERNAME` | correo de Bluecore |
| `DB_PASSWORD` | correo de Bluecore |

`DB_PORT`, `DB_DATABASE` y `DB_SCHEMA` ya vienen con los valores del entorno de la prueba (`5432`, `demo`, `esquema_b`). `JWT_SECRET`, `DEMO_USER_EMAIL` y `DEMO_USER_PASSWORD` pueden quedarse como están en el example.

No subas `.env` a Git.

### 2. Levantar los contenedores

```powershell
docker compose up --build
```

Compose primero levanta el servicio `tests` (backend y frontend) y deja el resultado en esta misma terminal. Si fallan, la API y la SPA no arrancan. Si pasan, el backend corre las migraciones, si hace falta crea el usuario demo, y recién ahí sube la API y el frontend.

| Servicio | URL |
| --- | --- |
| Frontend | http://localhost:4200 |
| API | http://localhost:3000/api/v1 |

La SPA llama a `http://localhost:3000` desde el navegador (el host, no la red interna de Docker).

### Usuario demo

| Campo | Valor |
| --- | --- |
| Email | `operator@bluecore.local` |
| Password | `Bluecore123` |


## API

Prefijo versionado: `/api/v1`. Las rutas salvo login exigen `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/auth/login` | `{ email, password }` → JWT |
| `GET` | `/auth/me` | Operador autenticado |
| `POST` | `/credit-requests` | `{ applicantDocument, amount, termMonths }` |
| `GET` | `/credit-requests` | Query: `status`, `page`, `limit` |
| `PATCH` | `/credit-requests/:id/status` | `{ status: APPROVED \| REJECTED, comment }` |

Errores en JSON: `{ statusCode, error, message, details? }`.

Montos: 500–50 000. Plazo: 6–60 meses.