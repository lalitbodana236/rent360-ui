# Rent360 Detailed Product Backlog (Execution-Ready)

## 1. Purpose
This document is the detailed implementation backlog for all Rent360 features.
It is written so Engineering, QA, Product, and DevOps can execute with minimal ambiguity.

Primary goals:
1. Cover every module and core service.
2. Provide detailed user stories with explicit acceptance criteria.
3. Include backend + frontend implementation targets.
4. Include QA scenarios so stories are testable end-to-end.

Companion docs:
- `docs/master-product-sprint-backlog.md`
- `docs/communications-sprint-backlog.md`
- `docs/service-backlogs/*.md`

---

## 2. Scope Coverage Checklist

### Core Platform
1. Environment and configuration
2. API client and error handling
3. Auth and authorization
4. Feature flags
5. User settings and theme
6. Data refresh/event bus

### Business Modules
1. Dashboard
2. Properties and Units
3. Tenants
4. Payments
5. Society ERP
- Buildings
- Flats
- Maintenance Collection
- Meetings
- Notices
- Visitors
- Complaints
- Work Orders
- Parking
6. Marketplace
7. Communications
8. Reports
9. Settings

### Operational Excellence
1. Audit logs
2. Exports (PDF/Excel/CSV)
3. Observability and alerting
4. Security and compliance
5. Performance and scale

---

## 3. Story Writing Standard (Mandatory)
Each story must include:
1. Role
2. Intent
3. Business value
4. Preconditions
5. Acceptance criteria (Given/When/Then)
6. FE tasks with files
7. BE tasks with files
8. QA test scenarios
9. NFR expectations
10. Out of scope

---

## 4. Detailed Backlog by Module

## EPIC-AUTH - Authentication and Authorization

### AUTH-001 Login and Session Lifecycle
Story
- As a user, I want secure login and session continuity so that I can use the platform without repeated sign-ins.

Preconditions
1. User account exists.
2. Auth provider is reachable.

Acceptance Criteria
1. Given valid credentials, when login is submitted, then token/session is created and user is redirected by role.
2. Given invalid credentials, when login fails, then an actionable error is shown and no session is stored.
3. Given active session, when app reloads, then user context is restored.
4. Given expired token, when protected API is called, then refresh flow triggers or user is redirected to login.

FE tasks (files)
1. `src/app/features/auth/login.component.ts`
2. `src/app/core/services/auth.service.ts`
3. `src/app/core/guards/auth.guard.ts`

BE tasks (files)
1. `backend/src/modules/auth/auth.controller.ts`
2. `backend/src/modules/auth/auth.service.ts`
3. `backend/src/modules/auth/jwt.strategy.ts`

QA scenarios
1. Valid login by each role.
2. Invalid credentials.
3. Expired session recovery.
4. Multi-tab logout consistency.

NFR
1. Login API P95 < 500ms in staging baseline.
2. No token leakage in logs.

Out of scope
1. SSO and social login.

---

### AUTH-002 Permission-Based UI and API Access
Story
- As an admin, I want permission-governed access so that sensitive actions are restricted.

Acceptance Criteria
1. Given missing permission, when user accesses route, then guard redirects safely.
2. Given read-only permission, when write action is visible, then action is hidden or disabled.
3. Given permission override, when admin updates overrides, then effect is visible immediately.

FE tasks
1. `src/app/core/services/authorization.service.ts`
2. `src/app/core/authorization/authorization-config.ts`
3. `src/app/layout/sidebar/sidebar.component.ts`

BE tasks
1. `backend/src/modules/authorization/policy.service.ts`
2. `backend/db/seeds/role_permissions.sql`

QA scenarios
1. Route-level access matrix test.
2. Action-level access matrix test.
3. Override persistence test.

---

## EPIC-DASH - Dashboard and Insights

### DASH-001 Role-Specific Dashboard Widgets
Story
- As a role-based user, I want contextual dashboard data so I can act on relevant KPIs quickly.

Acceptance Criteria
1. Owner sees occupancy, collections, defaulters, marketplace indicators.
2. Tenant sees due status, reminders, complaint status.
3. SocietyAdmin sees defaulters, work-order load, visitor volume.
4. Vendor sees assigned tasks and payout-related indicators.

FE tasks
1. `src/app/features/dashboard/dashboard.component.ts`
2. `src/app/features/dashboard/dashboard.component.html`
3. `src/app/core/services/dashboard-data.service.ts`

BE tasks
1. `backend/src/modules/dashboard/dashboard.controller.ts`
2. `backend/src/modules/dashboard/dashboard.service.ts`

QA scenarios
1. Persona switch accuracy.
2. Month/year filter consistency.
3. No stale values after refresh.

---

## EPIC-PROP - Properties and Units

### PROP-001 Property and Unit CRUD
Story
- As an owner/admin, I want to create and update properties/units so inventory remains accurate.

Acceptance Criteria
1. Create/edit property fields are validated.
2. Unit forms validate rent, utilities, occupancy.
3. Search/filter returns deterministic results.
4. Saved changes are visible immediately in list/details.

FE tasks
1. `src/app/features/properties/properties.component.ts`
2. `src/app/features/properties/properties.component.html`
3. `src/app/features/properties/properties-data.service.ts`

BE tasks
1. `backend/src/modules/properties/properties.controller.ts`
2. `backend/src/modules/properties/properties.service.ts`
3. `backend/db/migrations/010_properties_units.sql`

QA scenarios
1. Valid and invalid create/edit.
2. Filter combinations.
3. Concurrency update conflict behavior.

---

### PROP-002 Occupancy History and Check-in/out
Story
- As an operations user, I want occupancy transitions tracked so tenancy timelines are auditable.

Acceptance Criteria
1. Check-in/out creates historical records.
2. Current occupancy reflects latest transition.
3. Related modules (tenants/payments/notifications) receive refresh event.

FE tasks
1. `src/app/features/properties/properties.component.ts`
2. `src/app/core/services/data-refresh.service.ts`

BE tasks
1. `backend/src/modules/properties/services/occupancy.service.ts`
2. `backend/db/migrations/011_occupancy_history.sql`

QA scenarios
1. Check-in and checkout flow.
2. History integrity after multiple transitions.
3. Cross-module sync validation.

---

## EPIC-TEN - Tenants

### TEN-001 Tenant Directory and Profile
Story
- As an owner/admin, I want tenant list and profiles so I can manage tenant lifecycle and dues.

Acceptance Criteria
1. Tenant list supports property, status, and search filters.
2. Profile shows tenancy, payment trend, and lease dates.
3. Access is role-scoped.

FE tasks
1. `src/app/features/tenants/tenants.component.ts`
2. `src/app/features/tenants/tenants.component.html`

BE tasks
1. `backend/src/modules/tenants/tenants.controller.ts`
2. `backend/src/modules/tenants/tenants.service.ts`

QA scenarios
1. Filter and pagination.
2. Role-based visibility.
3. Profile data correctness.

---

## EPIC-PAY - Payments

### PAY-001 Payment Lifecycle Management
Story
- As an owner/admin, I want complete payment lifecycle controls so collection operations are reliable.

Acceptance Criteria
1. Payment create/edit/status transitions work.
2. Due and paid aggregates are accurate.
3. Tenant view exposes only own records.

FE tasks
1. `src/app/features/payments/payments-list.component.ts`
2. `src/app/features/payments/create-payment.component.ts`

BE tasks
1. `backend/src/modules/payments/payments.controller.ts`
2. `backend/src/modules/payments/payments.service.ts`

QA scenarios
1. Role-based record scoping.
2. Status transitions and totals.
3. Edge cases for invalid amounts/dates.

---

### PAY-002 Late Fee and Defaulter Intelligence
Story
- As finance/admin, I want automated late fee and defaulter status so follow-up actions are timely.

Acceptance Criteria
1. Late fee policies configurable.
2. Defaulter flag updates based on due date and grace rules.
3. Dashboard/report reflects latest status.

FE tasks
1. `src/app/features/payments/payments-list.component.ts`
2. `src/app/features/dashboard/dashboard.component.ts`

BE tasks
1. `backend/src/modules/payments/services/late-fee.service.ts`
2. `backend/src/modules/payments/services/defaulter.service.ts`

QA scenarios
1. Boundary dates for grace period.
2. Partial payments.
3. Policy change impact.

---

## EPIC-SOC - Society ERP

### SOC-001 Buildings and Flats Management
Story
- As society admin, I want building-floor-flat hierarchy so operational mapping is accurate.

Acceptance Criteria
1. Hierarchy CRUD works.
2. Owner/tenant mapping attached to flats.
3. Occupancy status available by flat.

FE tasks
1. `src/app/features/society/society.module.ts`
2. `src/app/features/society/buildings/*`
3. `src/app/features/society/flats/*`

BE tasks
1. `backend/src/modules/society/buildings.controller.ts`
2. `backend/src/modules/society/flats.controller.ts`

QA scenarios
1. Hierarchy creation and update.
2. Mapping consistency.

---

### SOC-002 Maintenance Collection
Story
- As society admin, I want maintenance cycles and defaulter tracking so collections are transparent.

Acceptance Criteria
1. Monthly cycles can be generated.
2. Late interest applies per policy.
3. Defaulter list generated with export.

FE tasks
1. `src/app/features/society/maintenance-collection/*`

BE tasks
1. `backend/src/modules/maintenance/maintenance.controller.ts`
2. `backend/src/modules/maintenance/services/cycle.service.ts`

QA scenarios
1. Cycle generation.
2. Interest calculations.
3. Defaulter export validation.

---

### SOC-003 Complaints and Work Orders
Story
- As resident/admin/vendor, I want ticket workflow with SLA so resolution is traceable.

Acceptance Criteria
1. Complaint raised with category and evidence.
2. Assignment to vendor and SLA timer starts.
3. Status timeline visible to reporter and admin.

FE tasks
1. `src/app/features/society/complaints/*`
2. `src/app/features/society/work-orders/*`

BE tasks
1. `backend/src/modules/work-orders/work-orders.controller.ts`
2. `backend/src/modules/work-orders/services/sla.service.ts`

QA scenarios
1. End-to-end complaint lifecycle.
2. SLA breach behavior.
3. Attachment handling.

---

### SOC-004 Meetings and Notices
Story
- As society admin, I want agenda, attendance, and minutes with notifications so governance is transparent.

Acceptance Criteria
1. Meetings can be scheduled with agenda.
2. Attendance captured.
3. Minutes uploaded and linked to meeting.
4. Notice published to intended audience.

FE tasks
1. `src/app/features/society/meetings/*`
2. `src/app/features/society/notices/*`

BE tasks
1. `backend/src/modules/meetings/meetings.controller.ts`
2. `backend/src/modules/notices/notices.controller.ts`

QA scenarios
1. Schedule and notify.
2. Attendance edge cases.
3. Minutes document retrieval.

---

### SOC-005 Visitors and Parking
Story
- As security/admin, I want digital visitor logs and parking allocation so operations are controlled.

Acceptance Criteria
1. Visitor pre-approval and entry/exit log.
2. Parking slot assign/release.
3. Daily occupancy and exceptions dashboard.

FE tasks
1. `src/app/features/society/visitors/*`
2. `src/app/features/society/parking/*`

BE tasks
1. `backend/src/modules/visitors/visitors.controller.ts`
2. `backend/src/modules/parking/parking.controller.ts`

QA scenarios
1. Entry without approval handling.
2. Slot conflicts.
3. End-of-day summaries.

---

## EPIC-MKT - Marketplace

### MKT-001 Listing and Inquiry Lifecycle
Story
- As owner/public user, I want listing/inquiry workflows so property discovery and conversion improve.

Acceptance Criteria
1. Listings support filters (price/location/type/BHK).
2. Inquiry can be created and tracked.
3. Owner can update listing and see inquiry status.

FE tasks
1. `src/app/features/marketplace/*`
2. `src/app/core/services/marketplace-data.service.ts`

BE tasks
1. `backend/src/modules/marketplace/listings.controller.ts`
2. `backend/src/modules/marketplace/inquiries.controller.ts`

QA scenarios
1. Search/filter combinations.
2. Inquiry lifecycle and notification linkage.

---

## EPIC-COMM - Communications
Use detailed plan in `docs/communications-sprint-backlog.md`.
Mandatory additions for this epic:
1. `communications.write` permission.
2. Recipient-level delivery status.
3. Retry and idempotency.
4. Audit logs and export.

---

## EPIC-REP - Reports and Exports

### REP-001 Unified Reports with Filter Integrity
Story
- As admin/finance, I want reports that honor filters so decisions are trustworthy.

Acceptance Criteria
1. Reports render from backend aggregates.
2. Filters apply consistently across modules.
3. Export output matches on-screen data.

FE tasks
1. `src/app/features/reports/reports.component.ts`
2. `src/app/shared/components/export-dropdown/export-dropdown.component.ts`

BE tasks
1. `backend/src/modules/reports/reports.controller.ts`
2. `backend/src/modules/reports/services/export.service.ts`

QA scenarios
1. Filter equivalence (UI vs export).
2. Large dataset export.

---

## EPIC-SET - Settings

### SET-001 User and Tenant Preferences
Story
- As user/admin, I want profile and preferences management so app behavior matches operational needs.

Acceptance Criteria
1. Profile, locale, currency save and persist.
2. Feature toggles visible based on role.
3. Preferences apply globally where expected.

FE tasks
1. `src/app/features/settings/settings.component.ts`
2. `src/app/features/settings/settings-user.component.ts`
3. `src/app/core/services/user-settings.service.ts`

BE tasks
1. `backend/src/modules/settings/settings.controller.ts`
2. `backend/src/modules/settings/settings.service.ts`

QA scenarios
1. Preference persistence.
2. Currency formatting consistency.

---

## EPIC-OPS - Reliability and Security

### OPS-001 Observability and Production Readiness
Story
- As SRE/engineering, I want metrics, logs, health checks, and alerts so issues are detectable and recoverable.

Acceptance Criteria
1. Service metrics exposed for key modules.
2. Health endpoints for readiness/liveness.
3. Alert thresholds for delivery/payment failures.

FE tasks
1. `scripts/perf-checklist.md`

BE tasks
1. `backend/src/common/observability/*`
2. `backend/src/health/health.controller.ts`

QA scenarios
1. Failure injection and alert verification.
2. Health endpoint reliability tests.

---

## 5. QA Master Test Matrix (Minimum)
1. Access Matrix: each role x each route x each action.
2. Data Integrity: create/edit/delete effects across linked modules.
3. Sync Matrix: property changes reflected in tenants, payments, dashboard, communications.
4. Export Matrix: filter parity and file correctness.
5. Performance Matrix: list screens, dashboard load, report generation.
6. Security Matrix: authorization bypass, invalid token, injection validation.

---

## 6. Non-Functional Requirements
1. Performance
- Initial dashboard load under agreed SLO.
- No long animation/transition causing UI lag.
2. Reliability
- Critical workflows retriable and idempotent.
3. Security
- RBAC enforced at UI and API.
4. Auditability
- Sensitive actions logged with actor and timestamp.
5. Maintainability
- Strict typing, module boundaries, and reusable components.

---

## 7. Release and Rollout Guidance
1. Use feature flags for new modules and risky flows.
2. Rollout sequence: internal -> pilot tenant -> general availability.
3. Keep rollback plan per sprint release tag.

---

## 8. Immediate Execution Steps
1. Validate this doc with Product + Engineering + QA in one backlog review.
2. Convert each story into Jira tickets using module prefixes.
3. Assign owners and estimates for Sprint 1 and Sprint 2.
4. Freeze API contracts for first 3 sprints before implementation.
