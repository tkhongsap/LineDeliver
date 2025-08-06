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

This is a comprehensive **ThaiBev Customer Service Portal** featuring both LINE OA delivery management and customer records management - a full-stack TypeScript application with React frontend and Express backend.

### Frontend (`/client`)
- **React 18 + TypeScript** with Vite build system
- **Routing**: Wouter with dedicated routes (`/` dashboard, `/customers` records management)
- **State**: TanStack Query for server state management and caching
- **UI**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom ThaiBev branding (emerald/gold theme)
- **Main entry**: `client/src/main.tsx` → `App.tsx` with router switching between Dashboard and CustomerRecords pages

### Backend (`/server`)
- **Express.js + TypeScript** REST API
- **Storage**: Interface-based abstraction (`IStorage` in `server/storage.ts`) with comprehensive in-memory implementation, ready for PostgreSQL migration
- **File Processing**: Multer for CSV/XLS/XLSX uploads (5MB limit)
- **Entry point**: `server/index.ts` → routes in `server/routes.ts` + modular `server/routes/customers.ts`

### Shared (`/shared`)
- **Type definitions**: `schema.ts` (delivery data) + `customer-schema.ts` (customer records and message templates)
- **Database ready**: PostgreSQL schemas defined with Drizzle ORM
- **Validation**: Zod schemas for customer data with Thai language support

### Key API Endpoints
- `/api/deliveries` - CRUD operations for delivery records
- `/api/customer-records` - Complete customer records management with pagination, search, filtering
- `/api/upload` - File upload processing
- `/api/stats` - Dashboard statistics
- `/api/performance` - Daily performance metrics
- `/api/export` - CSV export functionality

### Customer Records API Capabilities
- **CRUD Operations**: Full create, read, update, delete with optimistic updates
- **Advanced Querying**: Pagination (50/page), search across all fields, status filtering, column sorting
- **Bulk Operations**: Multi-select delete operations
- **Statistics**: Real-time customer record metrics (ready, edited, invalid counts)
- **Thai Language**: Native support for Thai customer names and addresses

## Important Patterns

### TypeScript Path Aliases
Configured in `tsconfig.json`:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### Component Architecture
- **UI Foundation**: `client/src/components/ui/` (shadcn/ui library)
- **Business Components**: `client/src/components/` (delivery-table, upload-zone, stats-cards)
- **Customer Management**: `client/src/components/customers/` (dedicated customer record components)
- **Page Components**: `client/src/pages/` (Dashboard, CustomerRecords with full CRUD interface)

### Data Flow Patterns
1. **TanStack Query**: All server state via query hooks with automatic caching/invalidation
2. **Express Routes**: Main routes in `server/routes.ts`, customer routes modularized in `server/routes/customers.ts`
3. **Storage Interface**: `IStorage` abstraction allows seamless migration from in-memory to PostgreSQL
4. **Form Management**: React Hook Form + Zod validation for customer data entry

### Status Management
- **Delivery Status**: `pending`, `confirmed`, `rescheduled`, `no-response`
- **Customer Record Status**: `ready`, `edited`, `invalid`
- **Message Templates**: Active/inactive with variable substitution support

## Customer Records Management System

### Core Features Implemented
- **Comprehensive Table Interface**: 50 records/page with search, filtering, sorting
- **Inline & Modal Editing**: Click-to-edit rows + detailed modal forms
- **Bulk Operations**: Multi-select with bulk delete capabilities
- **Real-time Validation**: Thai names, phone numbers (+66-XX-XXX-XXXX), LINE User IDs
- **Message Preview System**: Template variable substitution with LINE interface mockup
- **Statistics Dashboard**: Real-time counts of ready/edited/invalid records

### Thai Language Support
- **Customer Names**: Thai/English character validation with proper Unicode ranges
- **Phone Numbers**: Thai mobile format validation (+66-XX-XXX-XXXX)
- **LINE Templates**: Thai message templates with variable substitution
- **Address Fields**: Full Thai address support with proper text handling

### Data Validation Patterns
- **Client-Side**: Real-time validation with visual feedback using React Hook Form + Zod
- **Server-Side**: Consistent validation using same Zod schemas via middleware
- **LINE User ID**: Regex validation for proper U + 32 character format
- **Delivery Dates**: Future date restrictions with date picker integration

## Development Notes

### Environment & Performance
- Runs on port 5000 by default (Replit optimized)
- Memory usage optimized for <500MB (Replit constraints)
- Debounced search (300ms) and pagination for performance
- Auto-refresh statistics every 30 seconds

### Thai Language Development
- UTF-8 encoding with BOM support for CSV uploads  
- Thai character validation in customer names and addresses
- Proper Thai date/time formatting throughout interface
- Message templates support Thai language with variable substitution

### Key Implementation Details
- **Pagination**: Server-side with 50 records per page default
- **Search**: Cross-field search with debounced input (customer name, LINE ID, order number, phone)
- **Sorting**: Multi-column sorting with ascending/descending support
- **Optimistic Updates**: UI updates immediately, rolls back on API failure
- **Error Boundaries**: Graceful failure handling throughout customer interface

### AI Workflow Integration
- **Task Management**: Comprehensive task tracking in `/tasks/` directory
- **Workflow Templates**: Both general (`ai-workflows/`) and Replit-specific (`ai-dev-workflow/`) templates
- **Implementation Tracking**: Task completion status maintained for development progress