# Overview

This is a LINE OA (Official Account) Delivery Dashboard for ThaiBev's customer service operations. The application manages delivery confirmations and reschedules through LINE messaging integration, providing a comprehensive dashboard for tracking delivery statuses, uploading delivery data, and generating reports. The system features real-time status tracking, automated messaging capabilities, and analytics reporting with a ThaiBev-inspired design using emerald green and gold color schemes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses a modern React stack with TypeScript, built around a single-page application (SPA) architecture:
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom ThaiBev color scheme variables
- **Build Tool**: Vite for fast development and optimized production builds

The dashboard features a tabbed interface with four main sections: Upload, Dashboard, Reports, and a statistics overview. Components are organized in a modular structure with reusable UI components and custom business logic components.

## Backend Architecture
The server follows a RESTful API design pattern using Express.js:
- **Framework**: Express.js with TypeScript
- **Database Layer**: In-memory storage implementation (MemStorage) that can be easily replaced with database persistence
- **File Upload**: Multer middleware for handling CSV/XLS/XLSX file uploads with validation
- **API Structure**: RESTful endpoints for deliveries, upload sessions, statistics, and export functionality
- **Development Setup**: Vite integration for seamless development experience

The backend uses an interface-based storage pattern (IStorage) allowing for easy migration from in-memory storage to database persistence without changing business logic.

## Data Storage Solutions
Currently implements in-memory storage with a well-defined interface for easy migration:
- **Schema Definition**: Drizzle ORM schemas for PostgreSQL (configured but not yet implemented)
- **Data Models**: Deliveries and upload sessions with proper TypeScript typing
- **Migration Ready**: Drizzle configuration points to PostgreSQL with migration support
- **Sample Data**: Pre-populated with demonstration data for immediate functionality

The schema includes delivery tracking (order ID, customer info, status, response times) and upload session management (file processing, success/error counts).

## Authentication and Authorization
Currently no authentication is implemented - the application operates as an internal tool. The architecture supports adding authentication layers without significant refactoring.

## External Dependencies

### Core Technology Stack
- **@neondatabase/serverless**: Configured for PostgreSQL database connectivity
- **drizzle-orm**: Database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Comprehensive UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code
- **@replit/vite-plugin-***: Replit-specific development enhancements

### File Processing
- **multer**: Multipart/form-data handling for file uploads
- **Support**: CSV, XLS, and XLSX file formats with 5MB size limit

### UI and Styling
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class composition
- **date-fns**: Date manipulation and formatting
- **lucide-react**: Icon library

### Form Management
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Schema validation (via drizzle-zod)

The application is designed to integrate with LINE Bot API for automated messaging, though the LINE integration endpoints are prepared but not yet fully implemented. The system supports scheduled messaging, webhook handling, and batch processing for LINE's API rate limits.