# Overview

This is a comprehensive ThaiBev customer service portal featuring both LINE OA (Official Account) delivery management and customer records management. The application manages delivery confirmations and reschedules through LINE messaging integration, while providing advanced customer records management with Thai language support, inline editing, and bulk messaging capabilities. The system features real-time status tracking, automated messaging capabilities, analytics reporting, and a modern customer records interface with search, filtering, and CRUD operations, all designed with a ThaiBev-inspired emerald green and gold color scheme.

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

The dashboard features a tabbed interface with four main sections: Upload, Dashboard, Reports, and a statistics overview, plus a dedicated Customer Records management system. Components are organized in a modular structure with reusable UI components and custom business logic components. The customer records system includes comprehensive CRUD operations, Thai language validation, real-time search and filtering, and integration with LINE messaging for bulk communications.

## Backend Architecture
The server follows a RESTful API design pattern using Express.js:
- **Framework**: Express.js with TypeScript
- **Database Layer**: In-memory storage implementation (MemStorage) that can be easily replaced with database persistence
- **File Upload**: Multer middleware for handling CSV/XLS/XLSX file uploads with validation
- **API Structure**: RESTful endpoints for deliveries, upload sessions, statistics, export functionality, and comprehensive customer records management
- **Customer Records API**: Full CRUD operations with pagination, search, filtering, bulk operations, and statistics endpoints
- **Development Setup**: Vite integration for seamless development experience

The backend uses an interface-based storage pattern (IStorage) allowing for easy migration from in-memory storage to database persistence without changing business logic. Customer records are managed through dedicated API routes with comprehensive validation and error handling.

## Data Storage Solutions
Currently implements in-memory storage with a well-defined interface for easy migration:
- **Schema Definition**: Drizzle ORM schemas for PostgreSQL (configured but not yet implemented)
- **Data Models**: Deliveries, upload sessions, customer records, and message templates with proper TypeScript typing
- **Migration Ready**: Drizzle configuration points to PostgreSQL with migration support
- **Clean Data State**: Removed all mockup/sample data for production readiness - application starts with empty data stores

The schema includes delivery tracking (order ID, customer info, status, response times), upload session management (file processing, success/error counts), customer records management (Thai names, LINE user IDs, delivery addresses, phone numbers), and message template storage for LINE OA integration.

## Recent Changes

### Customer Records Table Restructure (August 7, 2025)
- **Column Structure Updated**: Streamlined customer records table to display exactly 6 columns:
  1. Customer (renamed from Customer Name)
  2. LINE ID (renamed from LINE User ID)
  3. Order No (renamed from Order Number)
  4. Delivery Date
  5. Status
  6. Actions
- **Actions Column Implementation**: Added comprehensive action buttons for each record:
  - **Preview** (Eye icon): View LINE message preview for specific customer
  - **Edit** (Edit icon): Modify customer record details
  - **Delete** (Trash icon): Remove customer record from system
- **UI Consistency**: Updated loading skeletons and empty states to match new 6-column structure
- **Functional Integration**: All action buttons properly integrated with existing functionality (preview dialog, edit forms, delete operations)

### Upload Zone Improvements (August 7, 2025)
- **Button Alignment**: Moved "Load Sample Data" and "Download Sample CSV" buttons to left-aligned layout
- **Helper Text**: Updated helper text alignment to match button positioning
- **Development Features**: Maintained sample data loading functionality for testing and training purposes

### Data Management (January 6, 2025)
- **Mockup Data Cleanup**: Eliminated all hardcoded sample data initialization from MemStorage
  - Removed `initializeSampleData()` - 4 Thai delivery records
  - Removed `initializeCustomerSampleData()` - 3 customer records with Thai addresses
  - Removed `initializeMessageTemplates()` - empty sample method
- **Cleaned File Processing**: Updated `processFileAsync()` to remove hardcoded simulation values
- **Preserved Essential Features**: Kept `initializeDefaultMessageTemplate()` and sample data API endpoint
- **Production Ready**: Application starts with clean data stores but maintains testing capabilities

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