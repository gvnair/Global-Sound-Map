# SoundMap — The Audio Atlas

## Overview

A world audio map where users can share and discover audio clips from locations around the globe. Browse an interactive map, click any marker to hear recordings from that spot, upload your own sound captures, and explore featured/recent recordings.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS (dark oceanic theme)
- **Map**: react-leaflet v5 + Leaflet + OpenStreetMap tiles
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## App Pages

- `/` — Home/Map: Full-screen world map with audio recording markers. Click marker to play.
- `/explore` — Explore: Browse featured and recent recordings, see global stats
- `/upload` — Share a Signal: Upload a new audio clip with location pin

## Architecture

- `artifacts/soundmap/` — React/Vite frontend
- `artifacts/api-server/` — Express 5 API server
- `lib/db/src/schema/recordings.ts` — Recordings table schema
- `artifacts/api-server/src/routes/recordings.ts` — All recording API routes
- `lib/api-spec/openapi.yaml` — OpenAPI contract
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod validation schemas

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/recordings | List all recordings |
| POST | /api/recordings | Create new recording |
| GET | /api/recordings/:id | Get single recording |
| DELETE | /api/recordings/:id | Delete recording |
| POST | /api/recordings/:id/like | Like a recording |
| GET | /api/recordings/stats/summary | Get aggregate stats |
| GET | /api/recordings/featured | Top liked recordings |
| GET | /api/recordings/recent | Recently submitted |

## Database

PostgreSQL via Replit's built-in DB. Schema in `lib/db/src/schema/recordings.ts`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
