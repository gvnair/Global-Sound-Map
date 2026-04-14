# 🌍 SoundMap — The Audio Atlas

> A world audio map where users share and discover sound recordings from locations across the globe.

Browse an interactive full-screen map, click any marker to hear recordings from that spot, upload your own sound captures, and explore featured or recent audio from around the world.

---

## ✨ Features

- 🗺️ **Interactive World Map** — Full-screen map powered by Leaflet + OpenStreetMap; click any marker to play a recording
- 🎙️ **Upload a Sound** — Pin an audio clip to any location on the globe with a title, description, tags, and optional photo
- 🔍 **Explore Page** — Browse featured (top-liked) and recently submitted recordings with global stats
- ❤️ **Like Recordings** — Upvote your favourite sounds from anywhere in the world
- 📊 **Global Stats** — See aggregate counts of recordings, likes, and contributors

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS (dark oceanic theme) |
| **Map** | react-leaflet v5, Leaflet, OpenStreetMap tiles |
| **API Server** | Express 5 |
| **Database** | PostgreSQL + Drizzle ORM |
| **Validation** | Zod v4, drizzle-zod |
| **API Codegen** | Orval (from OpenAPI spec) |
| **Build** | esbuild (CJS bundle) |
| **Language** | TypeScript ~5.9 |
| **Package Manager** | pnpm workspaces |
| **Runtime** | Node.js 24 |

---

## 📁 Project Structure

```
Global-Sound-Map/
├── artifacts/
│   ├── soundmap/          # React/Vite frontend
│   └── api-server/        # Express 5 API server
├── lib/
│   ├── db/                # PostgreSQL schema (Drizzle ORM)
│   ├── api-spec/          # OpenAPI contract (openapi.yaml)
│   ├── api-client-react/  # Generated React Query hooks (Orval)
│   └── api-zod/           # Generated Zod validation schemas
├── soundmap/              # Shared UI components (e.g. audio-player)
├── scripts/               # Utility scripts
├── package.json           # Root workspace config
└── pnpm-workspace.yaml    # pnpm monorepo config
```

---

## 🗄️ Database Schema

The core `recordings` table (defined in `lib/db/src/schema/recordings.ts`):

| Column | Type | Description |
|---|---|---|
| `id` | serial (PK) | Auto-incrementing ID |
| `title` | text | Recording title |
| `description` | text | Optional description |
| `audioUrl` | text | URL to the audio file |
| `latitude` | real | Geo-coordinate |
| `longitude` | real | Geo-coordinate |
| `location` | text | Human-readable place name |
| `authorName` | text | Uploader's name |
| `likes` | integer | Like count (default 0) |
| `durationSeconds` | integer | Optional audio duration |
| `photoUrl` | text | Optional photo URL |
| `tags` | text[] | Array of tags |
| `createdAt` | timestamptz | Creation timestamp |

---

## 🔌 API Endpoints

Base path: `/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/recordings` | List all recordings |
| `POST` | `/recordings` | Create a new recording |
| `GET` | `/recordings/:id` | Get a single recording |
| `DELETE` | `/recordings/:id` | Delete a recording |
| `POST` | `/recordings/:id/like` | Like a recording |
| `GET` | `/recordings/stats/summary` | Get aggregate stats |
| `GET` | `/recordings/featured` | Top liked recordings |
| `GET` | `/recordings/recent` | Recently submitted recordings |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 24+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A running PostgreSQL instance

### Installation

```bash
# Clone the repository
git clone https://github.com/gvnair/Global-Sound-Map.git
cd Global-Sound-Map

# Install all dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the root (see `.env` for reference) and set:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/soundmap
```

> ⚠️ **Never commit your `.env` file.** Ensure it is listed in `.gitignore`.

### Running Locally

```bash
# Start both frontend and API server
sh start-local.sh
```

Or run them individually from their respective `artifacts/` packages.

### Database Setup

```bash
# Push schema to your PostgreSQL database (dev only)
pnpm --filter @workspace/db run push
```

---

## 🧪 Development Commands

```bash
# Full typecheck across all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Regenerate API hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

---

## 📄 License

This project is licensed under the **MIT License**.
