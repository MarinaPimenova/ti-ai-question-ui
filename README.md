# ti-ai-question-ui

The **AI Question Generator** micro-frontend of the TI Knowledge Platform. It lets a user upload a
document (or point at a URL), pick how many interview questions to generate from it, and review the
generated question/answer/tag table. It is one of several React micro-frontends served behind
`ti-gateway-api` (alongside `ti-knowledge-ui` and `ti-ai-chatbot-ui`).

## Overview

The app is a single-page "Dashboard" (`src/dashboard`) with four sections, matching the product
wireframe:

1. **Upload** — upload a document file, or load one from a URL.
2. **Generate** — pick a previously uploaded document, a question count (10/20/30), and an optional
   free-text prompt, then request generation.
3. **Results** — a loading state while generation runs, then a paginated table of the generated
   `#`, `Interview Question`, `Short Answer`, and `Tag` columns.
4. **Save** — a "SAVE" button that is intentionally disabled (tooltipped "This functionality is under
   construction") since persisting generated questions back into the Knowledge Platform is not
   implemented yet.

The UI itself is **unauthenticated** — it has no Okta/SSO integration, no login screen, and no
protected routes. Authentication (if any) happens at `ti-gateway-api`, which is the only thing users
are expected to hit directly.

## Tech Stack & Key Technologies

- **React 19** + **TypeScript**, bootstrapped with **Vite 8** (`@vitejs/plugin-react`)
- **react-router-dom v7** (`createBrowserRouter`/`RouterProvider`, `basename: /document`)
- **react-error-boundary** for a top-level error boundary/fallback UI
- **antd v6** + **@ant-design/icons** for all UI components (Upload, Table, Radio, Input, Button,
  Result, Spin, Tag, Tooltip, notification)
- **axios** for HTTP, with a shared response interceptor (`src/services/axios.config.ts`) that shows
  antd notifications on backend errors and redirects to `/error` or `/relogin` on network failures /
  401/403 responses
- **zustand** for small global stores (`notify.store.ts`, `network.store.ts`)
- **sass** for component styles, **vite-plugin-svgr** for importing `.svg` files as React components
- **lodash** for a couple of utility helpers (`isEqual`, `isString`, `isPlainObject`)

## Prerequisites

- Node.js 18+ and npm
- To actually exercise the feature end-to-end (not just render the page), you need the backend
  services this UI talks to — see [Run locally](#run-locally) and
  [Run as a standalone microservice](#run-as-a-standalone-microservice) below.

## Installation

```bash
npm install
```

## Available Scripts

| Script            | Description                                              |
|-------------------|-----------------------------------------------------------|
| `npm run dev`     | Start the Vite dev server on `http://localhost:4000/document` |
| `npm run build`   | Type-check (`tsc -b`) and build a production bundle into `dist/` |
| `npm run preview` | Preview the production build locally                     |
| `npm run lint`    | Run ESLint over the project                               |

## Detailed Flow

1. On mount, the Dashboard calls `GET /rest/v1/document-agent/documents` to list previously uploaded
   documents (`src/services/rest.service.ts` → `getUploadedResourcesList`).
2. **Upload a document**: choosing a file calls `POST /rest/v1/document/documents` (multipart) —
   `uploadDocument`. Loading from a URL instead calls `POST /rest/v1/document/load-url` with
   `{ url }` — `loadDocumentFromUrl`. Either one, on success, refreshes the document list and shows a
   success notification.
3. **Generate questions**: selecting one of the listed documents, a question count (10/20/30), and
   optionally typing a short prompt, then clicking "GENERATE QUESTIONS" calls
   `POST /rest/v1/document-agent/documents/{id}/question-generation` with
   `{ userMessage, requestedQuestionCount }` — `generateQuestions`. While the request is in flight the
   results section shows "Questions generation is in progress ...".
4. **Review results**: the response (an array of `{ question, answer, level, tags, resources }`) is
   rendered as a paginated antd `Table` — one row per question, tags rendered as chips.
5. **Save** is a disabled placeholder — there is no backend endpoint yet for persisting generated
   questions back into the Knowledge Platform.

Any backend error (4xx/5xx, or the backend being unreachable) is surfaced via the global axios
interceptor: unrecoverable network errors and 401/403 redirect to `/error` or `/relogin`, and other API
errors show an antd notification with the backend's error message.

## How this UI talks to the backend

`publicApi`'s `baseURL` (`src/services/axios.config.ts`) is **not** a build-time constant — it is read
at runtime from a cookie named `ORIGINAL`:

```ts
const apiServerUrl = getServerUrl('ORIGINAL'); // reads document.cookie
```

That cookie is set by `ti-gateway-api` (`RedirectionService`) to its own `APPLICATION_URL`
(e.g. `http://localhost:8080`) whenever the gateway redirects a browser into one of its micro-frontends.
In other words: **this UI is designed to always be reached through the gateway**, and once it's loaded
that way, every API call in `rest.service.ts` (e.g. `/rest/v1/document-agent/documents`) is actually
sent to the gateway, which strips the leading `document`/`document-agent` segment and forwards the rest
of the path to `ti-document-worker` (`:8086`) or `ti-document-agent` (`:8087`) respectively.

If you open this UI directly (e.g. via `npm run dev` without going through the gateway first), the
`ORIGINAL` cookie will not be set, `baseURL` resolves to an empty string, and API calls will be sent
relative to `http://localhost:4000` itself — which has no backend, so every request will fail. See
below for how to work around this locally.

## Run locally

### Option A — through the full stack (recommended, closest to production)

1. Start the full docker-compose stack from `ti-gateway-api/docker` (infra + all services, including
   the gateway itself):
   ```bash
   cd ../ti-gateway-api/docker
   cp env.example env   # fill in OKTA_*, OPEN_AI_*, ADMINS, etc.
   docker compose -f docker-compose-full.yml --env-file env up -d
   ```
2. Run this UI's dev server instead of its containerized build, so you get hot reload:
   ```bash
   docker compose -f docker-compose-full.yml --env-file env stop ti-ai-question-ui
   npm run dev
   ```
3. Open `http://localhost:8080` (the gateway) and navigate to the AI Question Generator — the gateway
   will redirect you to `http://localhost:4000/document` and set the `ORIGINAL` cookie for you.

### Option B — dev server only, cookie set by hand

If you don't want to run the gateway at all, you can point `npm run dev` straight at
`ti-document-worker`/`ti-document-agent` (running standalone — see next section) by manually setting
the `ORIGINAL` cookie from the browser console once the app is open:

```js
document.cookie = 'ORIGINAL=http://localhost:8086'; // or 8087 for the agent, or a gateway/proxy URL
```

Because `publicApi` uses a single `baseURL` for every call, and the four endpoints this UI needs are
split across two services with two different external prefixes (`/document/...` and
`/document-agent/...`) that only exist on the gateway, Option B only works cleanly if you put something
in front of both services that understands those prefixes (e.g. the gateway itself, run standalone —
see below). For quick backend verification without the UI, use the [`.http` files](#manual-api-testing-http-files)
instead.

## Run as a standalone microservice

To exercise this UI's API calls without running the *entire* `ti-2026` platform, bring up just the
gateway plus the two services it talks to, plus their infra dependencies.

### 1. Infra dependencies

From `ti-gateway-api/docker`, start Postgres (pgvector) for documents, Postgres for the assistant DB,
and RabbitMQ:

```bash
cd ../ti-gateway-api/docker
docker compose -f docker-compose-infra.yml up -d ti-document-db ti-assistant-db rabbitmq
```

This exposes:
- `ti-document-db` (pgvector) on `localhost:5433`
- `ti-assistant-db` on `localhost:5434`
- RabbitMQ on `localhost:5672` (management UI on `15672`)

### 2. Environment variables

Copy `ti-gateway-api/docker/env.example` to `env` and fill in at least:

```
OPEN_AI_API_KEY=...
OPEN_AI_ENDPOINT=...
OPEN_AI_COMPLETIONS_PATH=...
CHAT_MODEL=gpt-4.1-mini-2025-04-14
# only if document ingestion needs OCR:
MISTRAL_AI_API_KEY=...
```

The DB/RabbitMQ connection variables (`DOCUMENT_DB_URL`, `ASSISTANT_DB_URL`, `RABBITMQ_HOST`, etc.)
already default to the ports above in `docker-compose-full.yml`, so they don't need overriding unless
you changed the infra compose file.

### 3. Run the two backend services + the gateway

Either run them via `docker-compose-full.yml` (build/pull their images) or run
`ti-document-worker` and `ti-document-agent` from source (`./gradlew bootRun` / your IDE) with:

```
SERVER_PORT=8086        # ti-document-worker
SERVER_PORT=8087        # ti-document-agent
DOCUMENT_DB_URL=jdbc:postgresql://localhost:5433/document_db
DOCUMENT_USER=postgres
DOCUMENT_PASSWORD=postgres
ASSISTANT_DB_URL=jdbc:postgresql://localhost:5434/assistant_db
ASSISTANT_USER=assistant_user
ASSISTANT_PASSWORD=qwerty
RABBITMQ_HOST=localhost
RABBITMQ_USER=admin
RABBITMQ_PASS=admin
```

Then run `ti-gateway-api` itself (`SERVER_PORT=8080`), pointed at both:

```
DOCUMENT_SERVICE=localhost
DOCUMENT_SERVICE_PORT=8086
DOCUMENT_AGENT=localhost
DOCUMENT_AGENT_PORT=8087
AI_QUESTION_BASE_URL=http://localhost:4000
SESSION_CACHE_HOST=localhost   # if you also started the redis container
```

### 4. Run this UI and use it through the gateway

```bash
npm run dev
```

Open `http://localhost:8080`, let it redirect you into the AI Question Generator — from here on the
flow is identical to [Run locally](#run-locally).

### Manual API testing (`.http` files)

The [`http/`](./http) folder contains ready-to-run requests (IntelliJ HTTP Client / VS Code REST
Client) for all four endpoints, both **through the gateway** (`:8080`, the prefixed paths this UI
actually calls) and **directly against each service** (`:8086`/`:8087`, for isolated backend
debugging):

- `http/gateway.http` — via `ti-gateway-api`
- `http/document-worker.http` — direct to `ti-document-worker`
- `http/document-agent.http` — direct to `ti-document-agent`

These let you verify the backend contract (upload → list → generate) without needing a browser or the
`ORIGINAL` cookie dance at all.
