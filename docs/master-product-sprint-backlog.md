# Rent360 Master Product Backlog - Sprint-by-Sprint (Frontend + Backend)

## 1. Vision
Build Rent360 into a full Property Operating System with production-grade quality across:
- Auth and access control
- Role-based dashboard and insights
- Property and tenancy lifecycle
- Payments and collection
- Society ERP operations
- Marketplace and inquiry pipeline
- Communications and notifications
- Reports, exports, and governance
- Settings, feature toggles, and tenant-level configuration

## 2. Planning Model
- Sprint duration: 2 weeks
- Planning horizon: 12 sprints (24 weeks)
- Delivery mode: vertical slices (usable value every sprint)
- Release strategy: feature flags + canary rollout

## 3. Customer-Critical Use Case Map
1. Owner tracks occupancy, dues, defaulters, and communication outcomes in one place.
2. Society admin handles billing, complaints, meetings, visitors, and notices from one workflow.
3. Tenant views dues/history, receives reminders, raises complaints, and sees resolution updates.
4. Security logs/pre-approvals are digitally tracked (no paper register).
5. Marketplace users post listings and track inquiries without third-party dependency.
6. Finance/export users produce audit-safe summaries quickly.

---

## 4. Epic Catalog
- EPIC-CORE-01: Platform Foundation and Architecture
- EPIC-AUTH-02: Auth, Role, and Authorization
- EPIC-DASH-03: Dashboard and Cross-Module Insights
- EPIC-PROP-04: Properties and Units Lifecycle
- EPIC-TEN-05: Tenants and Tenancy History
- EPIC-PAY-06: Payments and Collection Intelligence
- EPIC-SOC-07: Society ERP (Buildings, Maintenance, Meetings, Visitors, Parking, Complaints)
- EPIC-MKT-08: Marketplace and Lead Funnel
- EPIC-COMM-09: Communications and Event Notifications
- EPIC-REP-10: Reports and Exports
- EPIC-SET-11: Settings, Preferences, Branding
- EPIC-OPS-12: Reliability, Observability, Security, Compliance

---

## 5. Sprint-by-Sprint Plan

## Sprint 1 - Core Foundation and Environment Standardization
### Sprint Goal
Stabilize architecture, environment contracts, and shared primitives for scalable development.

### Stories
#### CORE-101
As a developer, I want consistent environment and API config so that all modules work in mock and real backend modes.

Acceptance Criteria
1. Mock/real API switch is centralized.
2. Feature flags are typed and validated.
3. API base URLs are environment-driven.

Frontend tasks (per file)
1. Harden environment contracts.
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
2. Centralize endpoints.
- `src/app/core/constants/api-endpoints.ts`
3. Add config guard checks.
- `src/app/core/services/api-client.service.ts`

Backend tasks (per file)
1. Config module and validation.
- `backend/src/config/app.config.ts`
- `backend/src/config/validation.ts`
2. Environment templates.
- `backend/.env.example`

#### CORE-102
As a team, we want backlog templates and DoD in-repo so that execution remains consistent.

Frontend tasks
1. Add planning docs.
- `docs/master-product-sprint-backlog.md`
- `docs/jira-ticket-templates.md`

Backend tasks
1. Add API standards doc.
- `backend/docs/api-standards.md`

---

## Sprint 2 - Auth and Authorization Hardening
### Sprint Goal
Complete production-grade auth flow with role/permission enforcement in UI and APIs.

### Stories
#### AUTH-201
As a user, I want secure login/session flow so that access is reliable and safe.

Acceptance Criteria
1. Login, logout, token refresh flows implemented.
2. Role-based redirect works.
3. Unauthorized routes redirect safely.

Frontend tasks
1. Auth service contracts and storage hardening.
- `src/app/core/services/auth.service.ts`
2. Guard improvements.
- `src/app/core/guards/auth.guard.ts`
3. Login UX with error recovery.
- `src/app/features/auth/login.component.ts`

Backend tasks
1. Auth endpoints.
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.service.ts`
2. Token middleware/strategy.
- `backend/src/modules/auth/jwt.strategy.ts`

#### AUTH-202
As an admin, I want fine-grained permission control so that module actions are least-privilege.

Frontend tasks
1. Expand permission map.
- `src/app/core/constants/permissions.ts`
2. Update authorization templates.
- `src/app/core/authorization/authorization-config.ts`
3. Enforce action-level permission checks.
- `src/app/core/services/authorization.service.ts`

Backend tasks
1. Permission policy engine.
- `backend/src/modules/authorization/policy.service.ts`
2. Role-permission seed migration.
- `backend/db/seeds/role_permissions.sql`

---

## Sprint 3 - Dashboard 2.0 (Role-specific + Actionable)
### Sprint Goal
Deliver role-specific dashboards with real KPIs from backend aggregates.

### Stories
#### DASH-301
As an owner/society admin/tenant/vendor, I want contextual KPI dashboards so I can act quickly.

Acceptance Criteria
1. Role-specific widgets render from API.
2. Month/year filters apply to all cards.
3. KPI drill-down routes are available.

Frontend tasks
1. Dashboard VM integration.
- `src/app/features/dashboard/dashboard.component.ts`
- `src/app/features/dashboard/dashboard.component.html`
2. Data service refactor.
- `src/app/core/services/dashboard-data.service.ts`

Backend tasks
1. Dashboard aggregate endpoint.
- `backend/src/modules/dashboard/dashboard.controller.ts`
- `backend/src/modules/dashboard/dashboard.service.ts`
2. Aggregation queries.
- `backend/src/modules/dashboard/repositories/dashboard.repository.ts`

---

## Sprint 4 - Properties and Units Lifecycle
### Sprint Goal
Complete property CRUD + unit management with occupancy history and state sync.

### Stories
#### PROP-401
As an owner/admin, I want property and unit lifecycle management so records stay accurate.

Acceptance Criteria
1. Property/unit create/update works.
2. Occupancy status transitions recorded.
3. Property filters and search are stable.

Frontend tasks
1. Property forms and validation.
- `src/app/features/properties/properties.component.ts`
- `src/app/features/properties/properties.component.html`
2. Service integration.
- `src/app/features/properties/properties-data.service.ts`

Backend tasks
1. Property/unit CRUD.
- `backend/src/modules/properties/properties.controller.ts`
- `backend/src/modules/properties/properties.service.ts`
2. Occupancy history table.
- `backend/db/migrations/010_property_occupancy_history.sql`

---

## Sprint 5 - Tenants and Tenancy Intelligence
### Sprint Goal
Provide complete tenant profile, dues context, tenancy history, and role-scoped visibility.

### Stories
#### TEN-501
As an owner/admin, I want searchable tenant profiles with tenancy history so I can manage risk and renewals.

Acceptance Criteria
1. Tenant list with role/property filters.
2. Tenancy history and current status visible.
3. Tenant view is role-scoped securely.

Frontend tasks
1. Tenant list/profile enhancements.
- `src/app/features/tenants/tenants.component.ts`
- `src/app/features/tenants/tenants.component.html`

Backend tasks
1. Tenant profile endpoints.
- `backend/src/modules/tenants/tenants.controller.ts`
- `backend/src/modules/tenants/tenants.service.ts`
2. Tenancy history model.
- `backend/src/modules/tenants/entities/tenancy-history.entity.ts`

---

## Sprint 6 - Payments, Dues, and Collections Engine
### Sprint Goal
Implement robust payment lifecycle with dues, status tracking, and actionable collections.

### Stories
#### PAY-601
As an owner/admin, I want end-to-end payment management so that collections improve and errors reduce.

Acceptance Criteria
1. Payment create/update/status transitions.
2. Late fee support.
3. Tenant payment history and outstanding view.

Frontend tasks
1. Payments list/create flows.
- `src/app/features/payments/payments-list.component.ts`
- `src/app/features/payments/create-payment.component.ts`
2. Export and filter consistency.
- `src/app/features/payments/payments-list.component.html`

Backend tasks
1. Payments API.
- `backend/src/modules/payments/payments.controller.ts`
- `backend/src/modules/payments/payments.service.ts`
2. Billing/late-fee engine.
- `backend/src/modules/payments/services/late-fee.service.ts`

---

## Sprint 7 - Society ERP I (Buildings, Flats, Maintenance)
### Sprint Goal
Stand up Society operational core with building hierarchy and maintenance billing cycles.

### Stories
#### SOC-701
As a society admin, I want building-flat hierarchy and maintenance cycles so I can run operations digitally.

Acceptance Criteria
1. Buildings/flats CRUD with ownership mapping.
2. Maintenance cycle generation.
3. Defaulter list and collection status.

Frontend tasks
1. Society submodule scaffolds.
- `src/app/features/society/society.module.ts`
- `src/app/features/society/*.placeholder.ts`
2. Maintenance UI with cycle filters.
- `src/app/features/society/maintenance-collection/*`

Backend tasks
1. Society domain APIs.
- `backend/src/modules/society/buildings.controller.ts`
- `backend/src/modules/society/maintenance.controller.ts`
2. Maintenance cycle tables.
- `backend/db/migrations/020_society_maintenance.sql`

---

## Sprint 8 - Society ERP II (Complaints, Work Orders, Meetings)
### Sprint Goal
Deliver complaint-to-resolution workflow and governance meetings module.

### Stories
#### SOC-801
As a resident, I want to raise and track complaints so that issues are resolved transparently.

Acceptance Criteria
1. Complaint create/assign/status/SLA.
2. Vendor assignment and resolution notes.
3. Timeline visible to resident and admin.

Frontend tasks
1. Complaints/work order screens.
- `src/app/features/society/complaints/*`
- `src/app/features/society/work-orders/*`

Backend tasks
1. Complaint/work order APIs.
- `backend/src/modules/work-orders/work-orders.controller.ts`
- `backend/src/modules/work-orders/work-orders.service.ts`
2. SLA engine.
- `backend/src/modules/work-orders/services/sla.service.ts`

#### SOC-802
As a society admin, I want meeting agenda/minutes flow so governance is transparent.

Frontend tasks
1. Meetings UI.
- `src/app/features/society/meetings/*`

Backend tasks
1. Meetings API.
- `backend/src/modules/meetings/meetings.controller.ts`
- `backend/src/modules/meetings/meetings.service.ts`

---

## Sprint 9 - Society ERP III (Visitors and Parking)
### Sprint Goal
Deliver secure visitor flow and parking allocation operations.

### Stories
#### SOC-901
As security staff, I want pre-approved visitor logs so entry/exit is controlled and traceable.

Acceptance Criteria
1. Visit request, approval, entry, exit tracked.
2. Daily visitor dashboard.
3. Search by unit/visitor/date.

Frontend tasks
1. Visitors module UI.
- `src/app/features/society/visitors/*`

Backend tasks
1. Visitor APIs.
- `backend/src/modules/visitors/visitors.controller.ts`
- `backend/src/modules/visitors/visitors.service.ts`

#### SOC-902
As admin, I want parking slot allocation and availability so conflicts are avoided.

Frontend tasks
1. Parking module UI.
- `src/app/features/society/parking/*`

Backend tasks
1. Parking APIs.
- `backend/src/modules/parking/parking.controller.ts`
- `backend/src/modules/parking/parking.service.ts`

---

## Sprint 10 - Marketplace and Lead Funnel
### Sprint Goal
Enable listing lifecycle, media handling, and inquiry conversion tracking.

### Stories
#### MKT-1001
As owner/public user, I want searchable listings and inquiries so rental/sale conversion improves.

Acceptance Criteria
1. Listing CRUD + media links.
2. Public browse filters.
3. Inquiry capture and status pipeline.

Frontend tasks
1. Marketplace routes and views.
- `src/app/features/marketplace/marketplace.component.ts`
- `src/app/features/marketplace/*`
2. Marketplace data integration.
- `src/app/core/services/marketplace-data.service.ts`

Backend tasks
1. Listings API.
- `backend/src/modules/marketplace/listings.controller.ts`
- `backend/src/modules/marketplace/listings.service.ts`
2. Inquiry API.
- `backend/src/modules/marketplace/inquiries.controller.ts`

---

## Sprint 11 - Reports, Exports, and Communications Integration
### Sprint Goal
Unify reporting and exports across financial, society, and marketplace domains, including communication outcomes.

### Stories
#### REP-1101
As finance/admin, I want filter-respecting reports and exports so decisions and audits are faster.

Acceptance Criteria
1. Reports data from backend, not static scene only.
2. Export PDF/Excel respects filters.
3. Report endpoints paginated and performant.

Frontend tasks
1. Reports integration.
- `src/app/features/reports/reports.component.ts`
2. Export components reuse.
- `src/app/shared/components/export-dropdown/export-dropdown.component.ts`

Backend tasks
1. Reporting APIs.
- `backend/src/modules/reports/reports.controller.ts`
- `backend/src/modules/reports/reports.service.ts`
2. Export service.
- `backend/src/modules/reports/services/export.service.ts`

#### COMM-1102
As operations/admin, I want event-driven notifications integrated with modules so users get timely actions.

Frontend tasks
1. Use communications module backlog in `docs/communications-sprint-backlog.md`.

Backend tasks
1. Event bus integration for overdue, complaints, meetings.
- `backend/src/modules/events/*`

---

## Sprint 12 - Settings, Reliability, and Production Readiness
### Sprint Goal
Finalize customer readiness: preferences, observability, performance, security, and rollout controls.

### Stories
#### SET-1201
As an admin/user, I want profile, branding, currency, and notification settings so app adapts to tenant needs.

Acceptance Criteria
1. Settings persistence works per user/tenant.
2. Currency reflects globally.
3. Feature toggles are live-configurable.

Frontend tasks
1. Settings pages.
- `src/app/features/settings/settings.component.ts`
- `src/app/features/settings/settings-user.component.ts`
- `src/app/features/settings/settings-roles.component.ts`
- `src/app/features/settings/settings-permissions.component.ts`
2. Settings services.
- `src/app/core/services/user-settings.service.ts`
- `src/app/core/services/feature-flags.service.ts`

Backend tasks
1. Settings APIs.
- `backend/src/modules/settings/settings.controller.ts`
- `backend/src/modules/settings/settings.service.ts`

#### OPS-1202
As engineering/SRE, I want observability and hardening so production incidents are reduced.

Acceptance Criteria
1. Structured logs, metrics, and tracing enabled.
2. Rate limiting and input validation enforced.
3. CI quality gates and test thresholds in place.

Backend tasks
1. Observability and health.
- `backend/src/common/observability/*`
- `backend/src/health/health.controller.ts`
2. Security middleware.
- `backend/src/common/security/*`

Frontend tasks
1. Performance baseline and regression checks.
- `scripts/perf-checklist.md`

---

## 6. Cross-Sprint Non-Functional Requirements
1. P95 API latency under target (define per endpoint group).
2. UI interaction responsiveness under 100ms for critical actions.
3. Accessibility baseline WCAG AA for all primary screens.
4. Full audit logs for sensitive actions.
5. Backward-compatible API versioning strategy.

---

## 7. Master Jira Ticket Naming Convention
- `CORE-###`, `AUTH-###`, `DASH-###`, `PROP-###`, `TEN-###`, `PAY-###`, `SOC-###`, `MKT-###`, `COMM-###`, `REP-###`, `SET-###`, `OPS-###`

Ticket template
- Title: `[MODULE-###] <summary>`
- Description:
  - As a `<role>`
  - I want `<capability>`
  - So that `<business value>`
- Acceptance Criteria: numbered list
- FE Subtasks: file-level tasks
- BE Subtasks: file-level tasks
- QA Subtasks: test scenarios + automation
- Dependencies
- Story points

---

## 8. Git Execution Strategy
1. Branch per sprint: `feature/sprint-01-core`, `feature/sprint-02-auth`, etc.
2. Feature flag all major module rollouts.
3. Mandatory PR checklist: tests, performance notes, migration notes.
4. Tag releases by sprint end: `v0.sprint-01` ... `v0.sprint-12`.

---

## 9. What to Build First This Week
1. Start Sprint 1 + Sprint 2 in parallel (foundation + auth hardening).
2. Freeze FE-BE contracts for Dashboard/Properties/Payments before Sprint 3.
3. Keep Communications execution aligned with `docs/communications-sprint-backlog.md`.
