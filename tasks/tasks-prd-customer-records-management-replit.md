## Relevant Files

- `client/src/components/customers/customer-records-table.tsx` - Main customer records table component with pagination, search, and filtering
- `client/src/components/customers/customer-records-table.test.tsx` - Unit tests for customer records table
- `client/src/components/customers/customer-edit-dialog.tsx` - Modal dialog for detailed customer record editing
- `client/src/components/customers/customer-edit-dialog.test.tsx` - Unit tests for edit dialog
- `client/src/components/customers/customer-row.tsx` - Individual table row component with inline editing capabilities
- `client/src/components/customers/customer-row.test.tsx` - Unit tests for customer row
- `client/src/components/customers/message-preview-dialog.tsx` - LINE message preview with template substitution
- `client/src/components/customers/message-preview-dialog.test.tsx` - Unit tests for message preview
- `client/src/components/customers/bulk-actions-toolbar.tsx` - Bulk selection and operations toolbar
- `client/src/components/customers/bulk-actions-toolbar.test.tsx` - Unit tests for bulk actions
- `client/src/components/ui/pagination.tsx` - Reusable pagination controls component
- `client/src/components/ui/pagination.test.tsx` - Unit tests for pagination
- `client/src/components/enhanced-stats-cards.tsx` - Enhanced statistics cards with customer record metrics
- `client/src/components/enhanced-stats-cards.test.tsx` - Unit tests for enhanced stats
- `client/src/hooks/use-customer-records.ts` - Custom hook for customer records data management
- `client/src/hooks/use-customer-records.test.ts` - Unit tests for customer records hook
- `client/src/hooks/use-validation.ts` - Custom hook for real-time form validation
- `client/src/hooks/use-validation.test.ts` - Unit tests for validation hook
- `client/src/lib/validation.ts` - Customer data validation utilities and schemas
- `client/src/lib/validation.test.ts` - Unit tests for validation utilities
- `client/src/lib/message-templates.ts` - LINE message template generation utilities
- `client/src/lib/message-templates.test.ts` - Unit tests for message templates
- `shared/customer-schema.ts` - Customer record TypeScript interfaces and Drizzle schemas
- `shared/customer-schema.test.ts` - Unit tests for customer schemas
- `server/routes/customers.ts` - Customer CRUD API routes with pagination and filtering
- `server/routes/customers.test.ts` - Unit tests for customer API routes
- `server/services/customer-service.ts` - Business logic for customer operations
- `server/services/customer-service.test.ts` - Unit tests for customer service
- `server/middleware/validation.ts` - Server-side validation middleware
- `server/middleware/validation.test.ts` - Unit tests for validation middleware
- `server/storage.ts` - Updated storage interface with customer methods
- `client/src/pages/dashboard.tsx` - Updated dashboard with new customer records tab

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Leverage existing shadcn/ui components (Table, Dialog, Button, Input, Select) for consistency
- Use TanStack Query for all data fetching and state management
- Follow existing Tailwind + ThaiBev color scheme (emerald green #059669, gold #f59e0b)

## Tasks

- [x] 1.0 Enhanced Dashboard Statistics & Real-time Updates
  - [x] 1.1 Extend existing StatsCards component to include customer record metrics (Total Records, Ready to Send, Edited, Invalid)
  - [x] 1.2 Implement auto-refresh mechanism with 30-second intervals for real-time updates
  - [x] 1.3 Add "Last sync" timestamp display with formatted time showing data freshness
  - [x] 1.4 Update color-coded visual indicators using ThaiBev brand colors for different statuses
  - [x] 1.5 Create enhanced-stats-cards component with customer-specific metrics integration
  - [x] 1.6 Add loading states and error handling for statistics API calls

- [x] 2.0 Customer Records Management Table with Search & Pagination
  - [x] 2.1 Create customer-records-table component with shadcn/ui Table components
  - [x] 2.2 Implement pagination controls showing 50 records per page with First/Previous/Next/Last navigation
  - [x] 2.3 Add real-time search functionality with debounced input across all customer fields
  - [x] 2.4 Implement status filtering dropdown (All Status, Ready, Edited, Invalid) with record counts
  - [x] 2.5 Add column sorting capabilities (ascending/descending) for all data columns
  - [x] 2.6 Display record count information (e.g., "Showing 1-50 of 127 records")
  - [x] 2.7 Create customer API routes with pagination, filtering, and search parameters
  - [x] 2.8 Implement TanStack Query integration for efficient data fetching and caching
  - [x] 2.9 Add loading skeletons and empty states for better user experience

- [ ] 3.0 Record Editing System with Inline & Modal Capabilities
  - [x] 3.1 Create customer-row component with inline editing functionality (click-to-edit)
  - [x] 3.2 Implement customer-edit-dialog modal with comprehensive form fields
  - [x] 3.3 Add bulk selection system using checkboxes with "Select All" functionality
  - [x] 3.4 Create bulk-actions-toolbar with delete operations and confirmation dialogs
  - [x] 3.5 Implement auto-save functionality with 5-second delay for draft changes
  - [x] 3.6 Add undo functionality for recent changes (last 5 operations) with toast notifications
  - [x] 3.7 Integrate React Hook Form for form state management and validation
  - [x] 3.8 Create customer service layer with CRUD operations and optimistic updates
  - [x] 3.9 Add edit conflict detection for concurrent user scenarios

- [x] 4.0 Data Validation & Quality Management
  - [x] 4.1 Create validation utilities for customer names (Thai/English character sets)
  - [x] 4.2 Implement phone number validation with Thai mobile format (+66-xxx-xxx-xxxx)
  - [x] 4.3 Add LINE User ID format validation with regex pattern matching
  - [x] 4.4 Create delivery date validation with date picker and future date restrictions
  - [x] 4.5 Implement real-time validation feedback with visual indicators and error messages
  - [x] 4.6 Add format hints and validation examples for each editable field
  - [x] 4.7 Create validation middleware for server-side data integrity checks
  - [x] 4.8 Implement Zod schemas for consistent validation across frontend and backend
  - [x] 4.9 Add validation error reporting with specific field-level feedback

- [x] 5.0 Message Broadcasting System with Template Preview
  - [x] 5.1 Create message-preview-dialog component with LINE interface mockup
  - [x] 5.2 Implement template variable substitution system ([ชื่อลูกค้า], [หมายเลขออเดอร์], [วันที่จัดส่ง], [ที่อยู่จัดส่ง])
  - [x] 5.3 Add realistic LINE message formatting with Thai language support
  - [x] 5.4 Create bulk message broadcast functionality with recipient selection
  - [x] 5.5 Implement "Review & Send" workflow with confirmation dialogs and recipient counts
  - [x] 5.6 Add broadcast status tracking and success/failure reporting
  - [x] 5.7 Create message template utilities with variable parsing and replacement
  - [x] 5.8 Add message preview for individual customers with personalized content
  - [x] 5.9 Implement batch processing capabilities for large recipient lists (1000+ records)