# Aplikasi Rukun Monorepo

A monorepo for "Aplikasi Rukun" using Supabase for database/auth/storage, Expo for mobile, and Express.js as API layer.

## Project Structure

```text
/
|-- apps/
|   |-- mobile/           # Expo mobile app
|   `-- backend/          # Express.js API
`-- packages/
    |-- shared/           # Shared types & constants
    `-- supabase/         # Database migrations & schema
```

## Prerequisites

- Node.js 18+
- npm

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill Supabase URL, anon key, service role key, and `EXPO_PUBLIC_API_BASE_URL`
   - For Android emulator use `http://10.0.2.2:3001/api`, for iOS simulator use `http://localhost:3001/api`
   - For physical device, set `EXPO_PUBLIC_API_BASE_URL=http://<IP-LAN-PC>:3001/api`
   - Put mobile `EXPO_PUBLIC_*` vars in `apps/mobile/.env` (see `apps/mobile/.env.example`)
3. Create Supabase project:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Run migrations from `packages/supabase/migrations/`
4. Run backend API:
   ```bash
   cd apps/backend
   npm run dev
   ```
5. Run mobile app:
   ```bash
   cd apps/mobile
   npm start
   ```

## Available Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all packages
- `npm run type-check` - Type check all packages

## Tech Stack

- Backend data platform: Supabase (PostgreSQL, Auth, Storage, RLS)
- API layer: Express.js (TypeScript)
- Mobile: React Native (Expo), Expo Router
- State management: Zustand
- Monorepo: npm workspaces, Turborepo
