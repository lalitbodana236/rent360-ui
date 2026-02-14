# RENT360 - Complete Product Definition

## 1. What Is Rent360?

Rent360 is a multi-tenant, modular PropTech SaaS platform that unifies:

- Rental management
- Society/apartment management
- Facility and maintenance operations
- Property marketplace

Into a single role-driven ecosystem.

Rent360 is not a rent tracker. It is a Property Operating System.

## 2. Why Rent360 Exists (Core Problem)

Real estate operations are fragmented.

Today:

- Rent is managed in Excel
- Maintenance is tracked manually
- Complaints happen on WhatsApp
- Visitor logs are paper-based
- Parking allocation is chaotic
- Meetings are disorganized
- Property listings are on third-party platforms
- Owners, tenants, and society admins use disconnected tools

There is no unified system.

Rent360 solves fragmentation.

## 3. Who Has This Problem?

### Property Owners

- Own multiple flats/buildings
- Cannot track rent and maintenance easily
- No visibility into occupancy
- No real-time collection insights

### Society/Apartment Associations

- Manage 50-500 flats
- Manual maintenance billing
- Poor defaulter tracking
- No work order transparency
- No visitor analytics

### Tenants

- No centralized rent history
- No complaint tracking
- No maintenance visibility
- No meeting notifications

### Security Staff

- Paper visitor registers
- No pre-approval system

### Real Estate Sellers

- Dependent on third-party marketplaces
- No internal listing system

## 4. What Problems Does Rent360 Solve?

### Problem 1: Disconnected Financial Tracking

Issue:

- Rent, maintenance, and penalties are tracked separately

Solution:

- Unified financial engine
- Rent tracking
- Maintenance billing
- Late fees
- Fund tracking
- Exportable reports

Impact:

- Full financial visibility

### Problem 2: Poor Society Governance

Issue:

- No structured system for meetings, voting, notices

Solution:

- Society ERP
- Meeting scheduling
- Attendance
- Minutes upload
- Notification system

Impact:

- Transparent governance

### Problem 3: Complaint Mismanagement

Issue:

- Residents complain informally without trackable workflow

Solution:

- Work order system
- Raise ticket
- Assign vendor
- SLA tracking
- Cost tracking
- Photo evidence

Impact:

- Accountability and measurable resolution time

### Problem 4: Parking Chaos

Issue:

- No digital parking allocation

Solution:

- Parking module
- Slot mapping
- Visitor allocation
- Paid parking management

Impact:

- Structured allocation

### Problem 5: Manual Visitor Logs

Issue:

- Security maintains paper registers

Solution:

- Visitor management
- Pre-approval
- Entry logs
- QR-ready architecture
- Security dashboard

Impact:

- Improved security

### Problem 6: Marketplace Dependency

Issue:

- Owners depend on external listing portals

Solution:

- Integrated marketplace
- Internal listing
- Media upload
- Lead tracking
- Direct inquiries

Impact:

- Reduced dependency
- Monetization potential

## 5. How Rent360 Solves These Problems

### A. Modular Architecture

Each domain is independent:

- Rental
- Society
- Marketplace
- Reporting

Principles:

- Lazy-loaded
- Feature-isolated
- Role-restricted

### B. Role-Driven Design

Role-specific experiences for:

- Owner
- Tenant
- Society admin
- Security
- Vendor
- Public user

### C. Configurable Environment

Supports:

- Mock API (local dev)
- Real backend
- Feature toggles
- White-label branding

### D. Centralized Financial Engine

- Unified billing structure
- Monthly/yearly filters
- Late fee logic
- Export capability

### E. Reusable UI Governance

Shared building blocks:

- Period filters
- Data tables
- Stats cards
- Status badges
- Export dropdown

### F. Event and Notification Flow

Events trigger notifications, such as:

- Tenant check-in/check-out
- Complaint raised
- Maintenance overdue
- Meeting scheduled

## 6. Where Rent360 Creates Value

### Financial Value

- Increased rent recovery
- Reduced maintenance defaulters
- Lower administrative overhead

### Operational Value

- Real-time analytics
- SLA visibility
- Occupancy insights

### Governance Value

- Transparent meetings
- Complaint accountability
- Visitor tracking

### Growth Value

- Marketplace revenue
- Subscription SaaS model
- Multi-society scalability

## 7. How Rent360 Differentiates

Most platforms do only one of the following:

- Rental tracking
- Society management
- Marketplace

Rent360 combines all in one system, enabling:

- Network effects
- Data centralization
- Cross-module intelligence

Example: marketplace performance influencing occupancy metrics.

## 8. Why This Architecture Scales

Because of:

- Domain-driven modules
- Centralized enums
- Feature-level services
- Role-based guards
- Configurable API
- White-label readiness

This enables:

- Rapid module expansion
- Feature enable/disable by config
- Future micro-frontend adoption
- Multi-society support

## 9. Business Model Potential

Revenue streams:

- Society subscription
- Owner subscription
- Marketplace listing fee
- Premium analytics
- Vendor onboarding fee
- Visitor QR premium

## 10. What Rent360 Is Becoming

Rent360 is evolving into a Property Operating System (PropOS), not a CRUD dashboard.

## Strategic Clarity

Rent360 solves:

- Fragmentation
- Lack of transparency
- Poor financial visibility
- Governance inefficiency
- Marketplace dependency

Through:

- Modular enterprise architecture
- Role-driven UI
- Unified financial engine
- Society ERP
- Integrated marketplace

---

# RENT360 - Enterprise Master Prompt

## Role

You are a senior Angular architect building a production-grade multi-tenant SaaS platform named Rent360.

This is not just a rental app.

Rent360 is a multi-tenant PropTech + Society ERP + Facility Management + Marketplace ecosystem.

System qualities:

- Modular
- Role-driven
- Configurable
- Lazy-loaded
- Production-ready
- Scalable
- Maintainable

## Tech Stack

- Angular 14 (strict mode)
- TypeScript (strict typing)
- Tailwind CSS
- RxJS
- Lazy-loaded feature modules
- Mock API + real API switch
- jsPDF + jspdf-autotable
- xlsx (Excel export)

## Enterprise Architecture

```text
core/
  services/
  guards/
  interceptors/
  constants/
  models/
  enums/

layout/
  header/
  sidebar/
  shell/

shared/
  components/
  pipes/
  directives/
  utils/

features/
  auth/
  dashboard/
  properties/
  tenants/
  payments/
  society/
    buildings/
    flats/
    parking/
    maintenance-collection/
    meetings/
    notices/
    visitors/
    complaints/
    work-orders/
  marketplace/
    listings/
    property-detail/
    media-gallery/
    inquiries/
    favorites/
  reports/
  settings/
```

Separation rules:

- Business logic -> services
- UI logic -> components
- Feature state -> feature services
- Shared UI -> shared module
- Constants/models/enums -> centralized

## Environment Configuration

```ts
useMockApi: boolean
apiBaseUrl: string
mockApiBaseUrl: string

appName: string

appFeatures: {
  enableMarketplace: boolean,
  enableSocietyModule: boolean,
  enableVisitorManagement: boolean,
  enableParking: boolean
}
```

No hardcoded branding. White-label ready.

## Expanded Role System

Roles:

- Owner
- Tenant
- SocietyAdmin
- Security
- Vendor
- PublicUser

Guard example:

```ts
canActivate: ['Owner', 'SocietyAdmin']
```

Enforce both:

- Route-level access
- UI/action-level permissions

Create reusable `RoleDirective`.

## Capability Domains

1. Rental management
2. Society/apartment management
3. Facility and maintenance operations
4. Property marketplace

All should be lazy-loaded and independently scalable.

## Module Breakdown

### 1. Auth

Routes:

- `/login`
- `/register`
- `/forgot-password`

Features:

- Mock login
- Role mapping
- Token/session storage
- Logout
- Role-based redirect

Mock users:

- `owner@rent360.com`
- `tenant@rent360.com`
- `hybrid@rent360.com`

### 2. Dashboard

Role-specific dashboards:

Owner:

- Rental income
- Maintenance collection
- Open complaints
- Occupancy rate
- Marketplace performance

Tenant:

- Rent due
- Maintenance due
- Complaint status
- Meeting reminders

SocietyAdmin:

- Defaulters
- Work order backlog
- Visitor logs today
- Parking occupancy

Includes:

- Month/year selector
- Stats grid
- Chart placeholders
- Export integration

### 3. Properties

Entities:

- Property
- Building
- Floor
- Unit
- Owner
- Tenant
- Occupancy

Features:

- Property list
- Detail view
- Unit mapping
- Check-in/check-out
- Occupancy history
- Monthly/yearly billing
- Status synchronization

Filters:

- Property
- Unit
- Tenant
- Month
- Year

Check-in/out must update:

- Property view
- Tenant view
- Notification flow

### 4. Tenants

Features:

- Tenant list
- Tenant profile
- Tenancy history
- Payment history
- Status tracking
- Dual-role support

Filters:

- Property
- Unit
- Status
- Month
- Year

Keep state stable when filters change.

### 5. Payments

Supports:

- Rent payments
- Maintenance payments
- Late fees
- Search/filter
- Status tracking

Owner actions:

- Create
- Edit
- Delete

Tenant actions:

- Pay
- View history

Exports:

- PDF
- Excel

### 6. Society Module (ERP)

#### 6.1 Buildings and Flats

- Building CRUD
- Floor hierarchy
- Flat allocation
- Owner mapping
- Tenant mapping
- Occupancy tracking

Data flow:

`Building -> Floors -> Flats -> Owner -> Tenant -> Parking`

#### 6.2 Maintenance Collection

Not rent.

Features:

- Monthly billing
- Late fee
- Interest calculation
- Common fund tracking
- Sinking fund
- Defaulter tracking
- Collection reports

Owner:

- Create cycles
- Generate invoices
- Track defaulters

Tenant:

- View dues
- Pay maintenance

#### 6.3 Work Orders and Complaints

Workflow:

Resident raises complaint -> Admin assigns vendor -> Status and SLA tracking -> Cost and photo proof.

Support:

- Flat-level tagging
- Common-area tagging
- Notifications

#### 6.4 Meetings

- AGM/EGM scheduling
- Agenda
- Attendance
- Minutes upload
- Resident notifications

#### 6.5 Parking Management

- Slot allocation
- Visitor parking
- Paid parking
- Slot availability dashboard

Model:

`ParkingSlot -> AssignedTo -> Type`

#### 6.6 Visitor Management

- Pre-approved entry
- Security dashboard
- Entry/exit logs
- QR-ready design

Entities:

- Visitor
- VisitRequest
- Approval
- EntryLog

### 7. Marketplace

Public and owner-facing.

Public routes:

- `/marketplace`
- `/marketplace/property/:id`

Features:

- Rent/sale listings
- Filter by price/location/type/BHK/amenities
- Photo gallery
- Video upload
- Contact owner
- Inquiry tracking
- Favorites

Owner:

- Create/edit listing
- Upload media
- Track inquiries

### 8. Reports

Reports:

- Rental summary
- Maintenance summary
- Defaulter report
- Occupancy report
- Visitor report
- Parking report
- Marketplace performance

All exports must respect filters.

### 9. Settings

Manage:

- Profile
- Currency
- Branding
- Feature toggles
- Notification preferences

Currency must reflect everywhere via currency pipe.

## Required Shared Components

- `PeriodFilterComponent`
- `PropertyFilterComponent`
- `StatusBadgeComponent`
- `StatsGridComponent`
- `DataTableComponent`
- `ExportDropdownComponent`
- `ConfirmationModalComponent`
- `RoleDirective`
- `CurrencyPipe`
- `SidebarGroupComponent`

No duplicate implementations across modules.

## Theme System

- Dark/light toggle
- Tailwind class strategy
- Accessible contrast
- Centralized color tokens
- Smooth sidebar animation

## Export Service Contract

```ts
exportToPdf(data, columns, title)
exportToExcel(data, fileName)
```

Must:

- Respect filters
- Support dynamic headers
- Be reusable across modules

## Architectural Enhancements Required

- Domain-driven folder boundaries
- Centralized enums
- Feature-level state services
- Event-driven NotificationService
- Shared model normalization
- Role-guard centralization
- Reusable filter bar component

## UI Requirements

Sidebar groups:

- Dashboard
- Properties
- Tenants
- Payments
- Society
  - Buildings
  - Maintenance
  - Meetings
  - Visitors
  - Work Orders
- Marketplace
- Reports
- Settings

Layout requirements:

- Fixed header
- Independent content scroll area
- Responsive layout
- No duplicate icons

## Quality Standards

- No repeated hardcoded values
- No duplicated logic
- Strict typing
- Centralized constants
- Lazy-loaded modules
- Build must pass without errors
- README updated
- CONTRIBUTING updated

## Execution Strategy

Build module-by-module. For each requested module:

1. Explain architecture decisions
2. Show folder structure
3. Define models
4. Define services
5. Build components
6. Configure routes
7. Add guards and permissions
8. Provide verification steps

Keep everything production-ready and backend-integration friendly.

## Recommended Build Order

1. Auth
2. Layout and shell
3. Dashboard
4. Properties
5. Society (maintenance first)
6. Marketplace
7. Reports
8. Settings
