# Aplikasi Rukun Monorepo

A monorepo for "Aplikasi Rukun" using Supabase as the backend and Expo/React Native for mobile.

## Project Structure

```
/
├── apps/
│   └── mobile/          # Expo mobile app
├── packages/
│   ├── shared/          # Shared types & constants
│   └── supabase/        # Database migrations & schema
```

## Prerequisites

- Node.js 18+
- npm (comes with Node.js)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase project URL and anon key

3. **Create Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Run migrations from `packages/supabase/migrations/`

4. **Run the mobile app:**
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

- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Mobile:** React Native (Expo), Expo Router
- **State Management:** Zustand
- **Monorepo:** npm workspaces, Turborepo
