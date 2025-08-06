# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with hot reload on port 5000
- `npm run build` - Build production bundle (Vite for client, esbuild for server)
- `npm start` - Run production server

### Code Quality
- `npm run check` - Run TypeScript type checking

### Database
- `npm run db:push` - Push Drizzle schema changes to PostgreSQL (when configured)

## Architecture Overview

This is a **LINE OA Delivery Dashboard** for ThaiBev's customer service operations - a full-stack TypeScript application with React frontend and Express backend.

### Frontend (`/client`)
- **React 18 + TypeScript** with Vite build system
- **Routing**: Wouter (lightweight alternative to React Router)
- **State**: TanStack Query for server state management
- **UI**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom ThaiBev branding (emerald/gold theme)
- **Main entry**: `client/src/main.tsx` → `App.tsx` with tabbed interface

### Backend (`/server`)
- **Express.js + TypeScript** REST API
- **Storage**: Interface-based abstraction (`IStorage` in `server/storage.ts`) currently using in-memory implementation, ready for database migration
- **File Processing**: Multer for CSV/XLS/XLSX uploads (5MB limit)
- **Entry point**: `server/index.ts` → routes defined in `server/routes.ts`

### Shared (`/shared`)
- **Type definitions**: `schema.ts` contains Drizzle ORM schemas and TypeScript types
- **Database ready**: PostgreSQL schemas defined but using in-memory storage

### Key API Endpoints
- `/api/deliveries` - CRUD operations for delivery records
- `/api/upload` - File upload processing
- `/api/stats` - Dashboard statistics
- `/api/performance` - Daily performance metrics
- `/api/export` - CSV export functionality

## Important Patterns

### TypeScript Path Aliases
Configured in `tsconfig.json`:
- `@db/*` → `shared/*`
- `@/*` → `client/src/*`

### Component Structure
- UI components in `client/src/components/ui/` (shadcn/ui library)
- Business components in `client/src/components/` (delivery-table, upload-zone, etc.)
- API client in `client/src/lib/api.ts`

### Data Flow
1. Frontend makes requests via TanStack Query hooks
2. Express routes handle requests in `server/routes.ts`
3. Storage layer (`server/storage.ts`) manages data operations
4. Currently in-memory, easily switchable to PostgreSQL via Drizzle

### Status Types
Delivery statuses: `pending`, `confirmed`, `rescheduled`, `no-response`

## Development Notes

- The app runs on port 5000 by default
- Vite provides hot module replacement in development
- TypeScript strict mode is enabled - ensure proper typing
- ThaiBev branding uses CSS variables defined in `client/src/index.css`
- File uploads support Thai language content
- Response timestamps track customer interaction timing