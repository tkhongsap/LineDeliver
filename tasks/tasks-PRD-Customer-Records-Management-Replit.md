# Development Tasks for LINE OA Delivery Dashboard - Customer Records Management

Based on: `docs/PRD-Customer-Records-Management-Replit.md`

## Relevant Files

- `shared/schema.ts` - Extend with customer records schema and message template types
- `server/storage.ts` - Add customer records storage interface and implementation
- `server/routes.ts` - Add customer records API endpoints and message broadcasting routes
- `client/src/components/customer-records-table.tsx` - Main customer records management component (new)
- `client/src/components/customer-record-form.tsx` - Customer record editing form component (new)
- `client/src/components/message-preview-modal.tsx` - LINE message preview and broadcasting component (new)
- `client/src/components/bulk-actions-toolbar.tsx` - Bulk selection and operations component (new)
- `client/src/components/enhanced-upload-zone.tsx` - Enhanced file upload with validation (new)
- `client/src/pages/customer-records.tsx` - Customer records management page (new)
- `client/src/hooks/use-customer-records.ts` - Custom hooks for customer records operations (new)
- `client/src/lib/validation.ts` - Data validation utilities for customer records (new)
- `client/src/lib/message-templates.ts` - LINE message template management (new)

### Notes

- Customer records will be integrated into existing dashboard navigation structure
- Maintain consistency with current ThaiBev color scheme and UI patterns
- Use existing shadcn/ui components where possible for consistency
- Implement real-time search with debounced queries for performance

## Tasks

- [ ] 1.0 Create Customer Records Data Layer
  - [ ] 1.1 Extend `shared/schema.ts` with customer records table schema including fields for customer_name, phone, line_user_id, delivery_address, notes, status, and last_modified
  - [ ] 1.2 Add customer record insert/select schemas and TypeScript types using drizzle-zod
  - [ ] 1.3 Create message template schema with fields for template_id, template_name, content, and variables
  - [ ] 1.4 Extend `IStorage` interface in `server/storage.ts` with customer records CRUD methods (getCustomerRecords, createCustomerRecord, updateCustomerRecord, deleteCustomerRecord, bulkDeleteCustomerRecords)
  - [ ] 1.5 Implement customer records methods in `MemStorage` class with sample Thai customer data
  - [ ] 1.6 Add customer records statistics methods (getCustomerRecordsStats) returning Ready/Edited/Invalid counts

- [ ] 2.0 Build Customer Records Management Interface
  - [ ] 2.1 Create `customer-records-table.tsx` with paginated table (50 records/page) displaying customer name, LINE ID, order number, delivery date, status columns
  - [ ] 2.2 Implement real-time search functionality with debounced input across all visible fields
  - [ ] 2.3 Add status filtering dropdown (All Status, Ready, Edited, Invalid) with proper state management
  - [ ] 2.4 Implement column sorting (ascending/descending) for all data fields using table headers
  - [ ] 2.5 Create pagination controls with First/Previous/Next/Last navigation and record count display
  - [ ] 2.6 Build `customer-record-form.tsx` modal component with form validation for inline editing
  - [ ] 2.7 Add bulk selection functionality with checkboxes and "Select All" capability
  - [ ] 2.8 Create `bulk-actions-toolbar.tsx` for bulk delete operations with confirmation dialogs
  - [ ] 2.9 Implement auto-save functionality for draft changes with 5-second delay and visual indicators

- [ ] 3.0 Implement Message Broadcasting System
  - [ ] 3.1 Create `message-templates.ts` with Thai LINE message templates and variable substitution logic
  - [ ] 3.2 Build `message-preview-modal.tsx` showing LINE interface mockup with realistic message formatting
  - [ ] 3.3 Implement template variable substitution for [ชื่อลูกค้า], [หมายเลขออเดอร์], [วันที่จัดส่ง], [ที่อยู่จัดส่ง]
  - [ ] 3.4 Create message broadcasting confirmation dialog with recipient count and status summary
  - [ ] 3.5 Add "Review & Send" workflow with final confirmation step before broadcasting
  - [ ] 3.6 Implement broadcast status tracking and success/failure reporting
  - [ ] 3.7 Create customer response options handling (ยืนยันการจัดส่ง, ขอเปลี่ยนวันส่ง) as shown in screenshots

- [ ] 4.0 Enhance File Upload and Data Validation
  - [ ] 4.1 Upgrade `upload-zone.tsx` to `enhanced-upload-zone.tsx` with drag-and-drop interface and visual feedback
  - [ ] 4.2 Add support for CSV, XLS, XLSX file formats with proper MIME type validation
  - [ ] 4.3 Implement 5MB file size limit with clear error messaging and progress indicators
  - [ ] 4.4 Create `validation.ts` with real-time validation for Thai/English customer names, phone numbers (+66 format), and LINE User ID format
  - [ ] 4.5 Add delivery date validation with date picker and future date restrictions
  - [ ] 4.6 Implement detailed upload results display showing validation errors, success count, and error count
  - [ ] 4.7 Add sample CSV download functionality and "Load Sample Data" button for testing
  - [ ] 4.8 Create comprehensive error handling with actionable error messages and validation hints

- [ ] 5.0 Integrate Customer Records into Dashboard Navigation
  - [ ] 5.1 Create `customer-records.tsx` page component following existing dashboard structure and ThaiBev styling
  - [ ] 5.2 Update main dashboard navigation to include "Customer Records" tab between existing tabs
  - [ ] 5.3 Extend `stats-cards.tsx` to include customer records statistics (Total Records, Ready to Send, Edited, Invalid)
  - [ ] 5.4 Add customer records section to main dashboard with summary metrics and quick access
  - [ ] 5.5 Update routing in `App.tsx` to handle customer records page navigation
  - [ ] 5.6 Create API endpoints in `server/routes.ts` for customer records operations (/api/customer-records, /api/customer-records/:id, /api/customer-records/bulk-delete)
  - [ ] 5.7 Implement `use-customer-records.ts` custom hooks for data fetching with TanStack Query integration
  - [ ] 5.8 Add "Last sync" timestamp display and auto-refresh functionality every 30 seconds