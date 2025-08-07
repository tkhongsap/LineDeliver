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

ThaiBev Customer Service Portal - Full-stack TypeScript application with React frontend and Express backend for LINE OA delivery management and customer records.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM (schemas ready, currently using in-memory storage)
- **State Management**: TanStack Query
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: Wouter
- **Validation**: Zod schemas shared between client and server

### Project Structure
```
/client/src/
├── pages/           # Route components (Dashboard, CustomerRecords)
├── components/      # Business components (delivery-table, upload-zone, stats-cards)
│   ├── customers/   # Customer record management components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
└── lib/             # API client, utilities, validation

/server/
├── index.ts         # Express server entry point
├── routes.ts        # Main API routes
├── routes/          # Modular route handlers
│   └── customers.ts # Customer records endpoints
└── storage.ts       # IStorage interface + in-memory implementation

/shared/
├── schema.ts        # Delivery data models + Drizzle schemas
└── customer-schema.ts # Customer records + message templates
```

### Key API Endpoints

#### Delivery Management
- `GET/POST /api/deliveries` - CRUD operations
- `PUT/DELETE /api/deliveries/:id` - Update/delete specific delivery
- `POST /api/upload` - CSV/Excel file processing
- `GET /api/export` - Export data as CSV
- `GET /api/stats` - Dashboard statistics
- `GET /api/performance` - Daily performance metrics

#### Customer Records
- `GET /api/customer-records` - Paginated list with search/filter/sort
- `POST /api/customer-records` - Create new record
- `PUT /api/customer-records/:id` - Update record
- `DELETE /api/customer-records` - Bulk delete (IDs in body)
- `GET /api/customer-records/stats` - Record statistics
- `GET /api/customer-records/templates` - Message templates

### Core Patterns

#### TypeScript Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

#### Data Flow
1. **Client**: React components → TanStack Query hooks → API client (`lib/api.ts`)
2. **Server**: Express routes → Storage interface → In-memory/PostgreSQL
3. **Validation**: Shared Zod schemas ensure consistency across stack

#### Storage Abstraction
`IStorage` interface in `server/storage.ts` provides database-agnostic methods:
- `getDeliveries()`, `createDelivery()`, `updateDelivery()`, `deleteDelivery()`
- `getCustomerRecords()`, `createCustomerRecord()`, `updateCustomerRecord()`, `deleteCustomerRecords()`
- Easy migration path from in-memory to PostgreSQL

### Thai Language Support
- Customer name validation: Thai/English characters with proper Unicode ranges
- Phone format: `+66-XX-XXX-XXXX` validation
- LINE User ID: `U` + 32 hexadecimal characters
- Order number format: `ORD-YYYY-XXX`
- UTF-8 with BOM support for CSV uploads

### Development Constraints
- **Port**: 5000 (Replit optimized)
- **Memory**: < 500MB usage target
- **Performance**: Debounced search (300ms), server-side pagination (50 records/page)
- **File uploads**: 5MB limit via Multer

### Testing & Validation Patterns
- Client-side: React Hook Form + Zod for real-time validation
- Server-side: Same Zod schemas via middleware
- Optimistic updates with rollback on API failure
- Error boundaries for graceful failure handling