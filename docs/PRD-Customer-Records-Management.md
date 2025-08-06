# Customer Records Management Feature - Product Requirements Document (PRD)

**Version:** 2.0  
**Author:** Development Team  
**Date:** January 2025  
**Project:** LINE OA Delivery Dashboard - ThaiBev  
**Feature Branch:** `feature/customer-records-management`

---

## 1. Executive Summary

### 1.1 Overview
The Customer Records Management feature introduces a critical intermediate step between file upload and LINE message sending. This feature enables call center staff to review, validate, and edit customer delivery data before initiating LINE OA messaging, ensuring data accuracy and preventing customer communication errors.

### 1.2 Business Value
- **Error Prevention**: Reduce delivery failures by 80% through pre-send validation
- **Data Quality**: Ensure 100% of messages contain accurate customer information
- **Operational Efficiency**: Save 2-3 hours daily on error correction and reprocessing
- **Customer Satisfaction**: Eliminate complaints from incorrect delivery information

---

## 2. User Journey & Flow

### 2.1 High-Level User Flow

```
Upload CSV/Excel → File Processing → Review Records → Data Valid? 
                                                         ↓ No → Edit/Fix Records
                                                         ↓ Yes
                                     Preview Messages → Send to LINE → Track Status
```

### 2.2 Detailed User Journey

#### Step 1: File Upload
**Current State** ✅ (Already Implemented)
- User uploads CSV/Excel file via drag-drop interface
- System processes file and extracts delivery data
- Upload status shown with success/error counts

#### Step 2: Review Records (NEW)
**Entry Point**: After successful upload or via new "Review Records" tab
- System displays all uploaded records in paginated table
- User sees validation status for each record
- Statistics show ready/invalid/edited counts

#### Step 3: Data Validation (NEW)
**Automatic Process**:
- LINE ID format validation (U + 32 chars)
- Phone number validation (10 digits, starts with 0)
- Delivery date validation (future dates only)
- Required fields check

#### Step 4: Edit Records (NEW)
**User Actions**:
- Click edit button on any record
- Modal opens with editable form
- Real-time validation on field changes
- Save updates immediately

#### Step 5: Bulk Operations (NEW)
**User Actions**:
- Select multiple records via checkboxes
- Delete invalid/duplicate records
- Bulk selection controls

#### Step 6: Message Preview (NEW)
**User Actions**:
- Click preview button on any record
- View exact LINE Flex message format
- See customer data in context
- Verify Thai language content

#### Step 7: Send to LINE (NEW)
**Final Step**:
- Click "Send Messages" button
- System processes validated records
- Creates delivery entries
- Initiates LINE messaging

#### Step 8: Track Status
**Current State** ✅ (Already Implemented)
- View delivery confirmations
- Track customer responses
- Monitor delivery metrics

---

## 3. User Stories & Acceptance Criteria

### 3.1 Epic: Customer Records Review

```
As a call center staff member
I want to review all uploaded customer records before sending
So that I can ensure data accuracy and prevent messaging errors
```

### 3.2 Detailed User Stories

| Story ID | User Story | Acceptance Criteria | Priority |
|----------|------------|-------------------|----------|
| CRM-001 | As a user, I want to see all uploaded records in a table | • Table displays customer name, LINE ID, order, date<br>• Records are paginated (50 per page)<br>• Page navigation works correctly | P0 |
| CRM-002 | As a user, I want to edit individual records | • Edit button opens modal<br>• All fields are editable<br>• Changes save immediately<br>• Validation shows errors | P0 |
| CRM-003 | As a user, I want to delete invalid records | • Delete button with confirmation<br>• Record removed from list<br>• Statistics update | P0 |
| CRM-004 | As a user, I want to search for specific records | • Search by name, order, LINE ID<br>• Results update in real-time<br>• Clear search button | P1 |
| CRM-005 | As a user, I want to filter by validation status | • Filter: All, Valid, Invalid, Edited<br>• Count badges on filters<br>• Pagination resets on filter | P1 |
| CRM-006 | As a user, I want to preview LINE messages | • Preview shows Flex message<br>• Thai content displays correctly<br>• Quick reply buttons visible | P0 |
| CRM-007 | As a user, I want to select multiple records | • Checkbox per record<br>• Select all checkbox<br>• Bulk delete option | P1 |
| CRM-008 | As a user, I want to see validation errors clearly | • Invalid fields highlighted red<br>• Error message explains issue<br>• Icon indicates invalid records | P0 |
| CRM-009 | As a user, I want to send validated records to LINE | • Send button enabled when all valid<br>• Progress indicator during send<br>• Success/failure notification | P0 |
| CRM-010 | As a user, I want to see statistics | • Total, Valid, Invalid, Edited counts<br>• Real-time updates<br>• Visual indicators | P1 |

---

## 4. Functional Specifications

### 4.1 Data Model

```typescript
// New table: customers (staging area)
interface Customer {
  id: string                      // UUID
  uploadSessionId: string         // Link to upload session
  orderId: string                 // Order number
  userId: string                  // LINE User ID
  customerName: string            // Thai/English name
  phone?: string                  // Thai phone number
  address?: string                // Delivery address
  deliveryDate: string            // YYYY-MM-DD format
  notes?: string                  // Special instructions
  validationStatus: 'valid' | 'invalid' | 'edited'
  validationErrors?: string[]     // List of validation errors
  createdAt: Date
  updatedAt: Date
}

// Extend existing UploadSession
interface UploadSession {
  // ... existing fields ...
  recordsReviewed: boolean        // Track if user reviewed records
  recordsSent: boolean            // Track if records sent to LINE
}
```

### 4.2 API Endpoints

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/api/customers` | Get paginated customers | `?page=1&limit=50&search=&status=` | `{data: Customer[], total: number, page: number}` |
| GET | `/api/customers/:id` | Get single customer | - | `Customer` |
| PUT | `/api/customers/:id` | Update customer | `Partial<Customer>` | `Customer` |
| DELETE | `/api/customers/:id` | Delete customer | - | `204 No Content` |
| POST | `/api/customers/bulk-delete` | Delete multiple | `{ids: string[]}` | `{deleted: number}` |
| POST | `/api/customers/validate-all` | Validate all records | - | `{valid: number, invalid: number}` |
| POST | `/api/customers/send-to-line` | Process and send | `{sessionId: string}` | `{sent: number, failed: number}` |
| GET | `/api/customers/preview/:id` | Get message preview | - | `{flexMessage: object, customer: Customer}` |

### 4.3 Validation Rules

| Field | Validation | Error Message |
|-------|------------|---------------|
| userId | Starts with 'U', 33 chars total | "Invalid LINE ID format" |
| phone | 10 digits, starts with 0 | "Invalid Thai phone number" |
| deliveryDate | YYYY-MM-DD, >= today | "Date must be today or future" |
| customerName | Required, 1-100 chars | "Customer name is required" |
| orderId | Required, unique | "Order ID is required and must be unique" |

---

## 5. UI/UX Specifications

### 5.1 Page Layout

```
┌─────────────────────────────────────────────────┐
│  Review Customer Records          [Send to LINE] │
├─────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ Total│ │Valid │ │Invalid│ │Edited│          │
│  │  245 │ │  230 │ │   10  │ │   5  │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
├─────────────────────────────────────────────────┤
│  [🔍 Search...] [Status ▼] [Bulk Delete]        │
├─────────────────────────────────────────────────┤
│  ☐ | Name | LINE ID | Order | Date | Status |🔧│
│  ☐ | สมชาย | U123... | ORD01 | 2024-01-20 | ✓ │
│  ☐ | มาลี  | U456... | ORD02 | 2024-01-21 | ⚠ │
├─────────────────────────────────────────────────┤
│  < 1 2 3 4 5 > Showing 1-50 of 245             │
└─────────────────────────────────────────────────┘
```

### 5.2 Component Specifications

#### Statistics Cards
- **Design**: Consistent with existing stats cards
- **Colors**: 
  - Total: Gray
  - Valid: Emerald green
  - Invalid: Red
  - Edited: Amber
- **Updates**: Real-time on any change

#### Customer Table
- **Columns**: Checkbox, Name, LINE ID, Order, Date, Status, Actions
- **Row Height**: 48px for touch-friendly interaction
- **Hover State**: Light emerald background
- **Selection**: Checkbox + row highlight

#### Edit Dialog
- **Width**: 600px max
- **Fields**: All customer fields in form layout
- **Validation**: Real-time with error messages below fields
- **Actions**: Cancel, Save buttons

#### Message Preview Dialog
- **Width**: 400px (LINE message width)
- **Content**: Exact Flex message rendering
- **Language**: Thai with proper fonts
- **Actions**: Close button

#### Pagination Controls
- **Style**: Number buttons with prev/next arrows
- **Current Page**: Emerald background
- **Disabled State**: Gray out unavailable pages

### 5.3 Interaction Patterns

| Action | Trigger | Response |
|--------|---------|----------|
| Edit record | Click edit icon | Open modal with form |
| Delete record | Click delete icon | Confirmation dialog → Remove |
| Select record | Click checkbox | Highlight row, update count |
| Search | Type in search box | Filter results after 300ms debounce |
| Filter | Select status | Update table, reset to page 1 |
| Preview | Click preview icon | Open message preview modal |
| Bulk delete | Select records → Click delete | Confirmation → Remove all |
| Send to LINE | Click send button | Validate all → Process → Navigate to status |

---

## 6. Technical Implementation

### 6.1 Frontend Architecture

```typescript
// Component Structure
client/src/components/
├── customers/
│   ├── customer-records-table.tsx    // Main table component
│   ├── customer-edit-dialog.tsx      // Edit modal
│   ├── customer-row.tsx              // Table row component
│   ├── message-preview-dialog.tsx    // Preview modal
│   ├── bulk-actions-toolbar.tsx      // Bulk operations
│   └── customer-stats-cards.tsx      // Statistics display
├── ui/
│   └── pagination.tsx                // Reusable pagination
```

### 6.2 State Management

```typescript
// TanStack Query Keys
const queryKeys = {
  customers: (page: number, filters: FilterParams) => 
    ['customers', page, filters],
  customerStats: ['customer-stats'],
  messagePreview: (id: string) => ['message-preview', id]
}

// Mutations
const mutations = {
  updateCustomer: useMutation(),
  deleteCustomer: useMutation(),
  bulkDelete: useMutation(),
  sendToLine: useMutation()
}
```

### 6.3 Backend Architecture

```typescript
// Storage Interface Extension
interface IStorage {
  // ... existing methods ...
  
  // Customer methods
  getCustomers(params: PaginationParams): Promise<PaginatedResult<Customer>>
  getCustomer(id: string): Promise<Customer | undefined>
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>
  deleteCustomer(id: string): Promise<boolean>
  bulkDeleteCustomers(ids: string[]): Promise<number>
  validateCustomers(sessionId: string): Promise<ValidationResult>
  processCustomersToDeliveries(sessionId: string): Promise<ProcessResult>
}
```

---

## 7. Integration Points

### 7.1 Upload Flow Integration
- After upload completes, show "Review Records" button
- Auto-navigate to Review Records tab
- Load customer records for the upload session
- Display validation results

### 7.2 LINE Messaging Integration
- Validate all records before enabling send
- Convert validated customers to deliveries
- Queue messages for LINE API
- Track sending progress
- Navigate to delivery status on completion

---

## 8. Development Plan

### 8.1 Branch Strategy

```bash
main
  └── feature/customer-records-management
       ├── feat/crm-backend-schema
       ├── feat/crm-api-endpoints
       ├── feat/crm-table-component
       ├── feat/crm-edit-dialog
       ├── feat/crm-validation
       ├── feat/crm-bulk-operations
       ├── feat/crm-message-preview
       └── feat/crm-line-integration
```

### 8.2 Development Phases

| Phase | Duration | Tasks | Deliverable |
|-------|----------|-------|-------------|
| **Phase 1: Backend** | 2 days | • Create customers table<br>• Implement storage methods<br>• Build API endpoints<br>• Add validation logic | Working API with test data |
| **Phase 2: Core UI** | 3 days | • Customer table component<br>• Pagination controls<br>• Search and filter<br>• Statistics cards | Basic review interface |
| **Phase 3: CRUD Operations** | 2 days | • Edit dialog<br>• Delete functionality<br>• Form validation<br>• Real-time updates | Full CRUD functionality |
| **Phase 4: Advanced Features** | 2 days | • Bulk operations<br>• Message preview<br>• Advanced validation<br>• Error handling | Complete feature set |
| **Phase 5: Integration** | 1 day | • Upload flow connection<br>• LINE send functionality<br>• Navigation updates | Integrated system |
| **Phase 6: Testing & Polish** | 2 days | • End-to-end testing<br>• Performance optimization<br>• UI polish<br>• Bug fixes | Production-ready feature |

**Total Duration**: 12 days (2.5 weeks)

---

## 9. Testing Strategy

### 9.1 Test Scenarios

| Category | Test Cases |
|----------|------------|
| **Data Loading** | • Load 0, 50, 100, 1000+ records<br>• Pagination navigation<br>• Page boundary conditions |
| **Search** | • Search each field type<br>• Special characters<br>• No results handling |
| **Validation** | • Each validation rule<br>• Multiple errors per record<br>• Edge cases |
| **CRUD** | • Create, Read, Update, Delete<br>• Concurrent operations<br>• Error recovery |
| **Bulk Operations** | • Select all/none<br>• Delete 1, 10, 100 records<br>• Performance at scale |
| **Integration** | • Upload → Review flow<br>• Review → Send flow<br>• Error scenarios |

### 9.2 Performance Targets

| Metric | Target | Max |
|--------|--------|-----|
| Initial page load | < 1s | 2s |
| Pagination navigation | < 200ms | 500ms |
| Search response | < 300ms | 500ms |
| Edit dialog open | < 100ms | 300ms |
| Save operation | < 500ms | 1s |
| Bulk delete (100 records) | < 2s | 5s |

---

## 10. Success Metrics

### 10.1 Technical Metrics
- Page load time < 2 seconds for 1000 records
- Zero data loss during operations
- 100% validation accuracy

### 10.2 Business Metrics
- 80% reduction in delivery errors
- 100% staff adoption within 1 week
- 50% reduction in customer complaints

### 10.3 User Experience Metrics
- Task completion time < 10 minutes for 100 records
- Error rate < 1% during operations
- User satisfaction score > 4.5/5

---

## 11. Rollout Plan

### 11.1 Deployment Strategy
1. **Development Environment**: Complete feature development
2. **Staging Environment**: UAT with sample data
3. **Production Pilot**: 10% of users for 3 days
4. **Full Rollout**: 100% deployment

### 11.2 Training Plan
- Create user guide documentation
- Record video walkthrough
- Conduct live training session
- Provide quick reference card

---

## 12. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large dataset performance | High | Implement virtual scrolling, optimize queries |
| Data loss during editing | High | Auto-save, confirmation dialogs |
| User adoption resistance | Medium | Clear benefits communication, training |
| LINE API rate limits | Medium | Batch processing, queue management |

---

## 13. Dependencies

### 13.1 Technical Dependencies
- Existing upload functionality must be working
- Database must support new customers table
- LINE API credentials and templates must be configured

### 13.2 Business Dependencies
- Approval of validation rules from operations team
- LINE message templates approved by marketing
- Training materials prepared for staff

---

## 14. Open Questions

1. Should we allow editing of Order ID after upload?
2. What is the maximum number of records we expect in a single upload?
3. Should we implement an undo feature for bulk deletions?
4. Do we need audit logging for all edits?
5. Should invalid records block sending or just show warnings?

---

## 15. Appendix

### A. Database Schema

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_session_id UUID REFERENCES upload_sessions(id),
  order_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(33) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(10),
  address TEXT,
  delivery_date DATE NOT NULL,
  notes TEXT,
  validation_status VARCHAR(20) DEFAULT 'valid',
  validation_errors JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_session ON customers(upload_session_id);
CREATE INDEX idx_customers_status ON customers(validation_status);
CREATE INDEX idx_customers_search ON customers(customer_name, order_id, user_id);
```

### B. Sample API Responses

```json
// GET /api/customers?page=1&limit=50
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "uploadSessionId": "session-123",
      "orderId": "ORD-2024-001",
      "userId": "U1234567890abcdefghijklmnopqrstu",
      "customerName": "สมชาย ใจดี",
      "phone": "0812345678",
      "address": "123 ถ.สุขุมวิท กทม 10110",
      "deliveryDate": "2024-01-25",
      "notes": "โทรก่อนส่ง",
      "validationStatus": "valid",
      "validationErrors": [],
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 245,
  "page": 1,
  "totalPages": 5
}
```

### C. LINE Flex Message Template

```json
{
  "type": "flex",
  "altText": "ยืนยันการจัดส่ง",
  "contents": {
    "type": "bubble",
    "header": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "ยืนยันการจัดส่ง",
          "size": "xl",
          "weight": "bold"
        }
      ]
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "คุณ {customerName}"
        },
        {
          "type": "text",
          "text": "Order: {orderId}"
        },
        {
          "type": "text",
          "text": "วันจัดส่ง: {deliveryDate}"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "horizontal",
      "contents": [
        {
          "type": "button",
          "action": {
            "type": "postback",
            "label": "ยืนยัน",
            "data": "action=confirm&orderId={orderId}"
          }
        },
        {
          "type": "button",
          "action": {
            "type": "postback",
            "label": "เลื่อน",
            "data": "action=reschedule&orderId={orderId}"
          }
        }
      ]
    }
  }
}
```

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-06 | Product Team | Initial PRD |
| 2.0 | 2025-01-06 | Development Team | Adapted for Replit implementation |

---

**Approval Status**: Pending

**Next Steps**:
1. Review and approve PRD
2. Create feature branch
3. Begin Phase 1 development