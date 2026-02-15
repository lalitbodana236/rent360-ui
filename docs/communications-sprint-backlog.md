# Communications Module - Sprint-by-Sprint Jira Backlog

## 1. Project Overview

### Objective
Build a production-ready Communications domain for Rent360 with:
- In-app messaging
- Campaign send/schedule
- Audience targeting
- Delivery/read tracking
- Event-triggered automation
- Template management
- Audit logs and exports

### Duration and Cadence
- Sprint length: 2 weeks
- Total initial roadmap: 8 sprints (16 weeks)

### Team Assumption
- Frontend: 2 Angular developers
- Backend: 2 API developers
- QA: 1 automation + 1 manual
- DevOps: part-time

---

## 2. High-Value Use Cases

1. Society admin sends maintenance overdue reminder to defaulters in Building A.
2. Owner broadcasts move-in policy notice to all current tenants in one property.
3. System auto-sends communication when complaint is created.
4. User opens inbox and sees unread/read communications by priority.
5. Admin audits whether a critical message was delivered/read by recipients.
6. Admin schedules communication for future date and cancels before dispatch.
7. Admin exports communication logs for legal/governance review.

---

## 3. Epic Breakdown

- EPIC-COMM-01: Authorization and Feature Access
- EPIC-COMM-02: Domain Models and API Contracts
- EPIC-COMM-03: Inbox and Message Consumption
- EPIC-COMM-04: Compose, Campaigns, Scheduling
- EPIC-COMM-05: Template Management
- EPIC-COMM-06: Event-Driven Notifications
- EPIC-COMM-07: Delivery Reliability and Observability
- EPIC-COMM-08: Audit, Compliance, and Export

---

## 4. Sprint Plan

## Sprint 1 - Foundation and Access Control

### Sprint Goal
Establish permissions, base data contracts, routes, and module scaffold for Communications.

### Jira Stories

#### COMM-101 (EPIC-COMM-01)
**Story**: As an admin, I want role-based access for communications read/write so that only authorized users can send messages.

**Acceptance Criteria**
1. `communications.view` and `communications.write` exist.
2. Route guard blocks unauthorized users.
3. Sidebar visibility respects permission.
4. Existing roles mapped with least-privilege defaults.

**Frontend Tasks (per file)**
1. Update permissions constants.
- File: `src/app/core/constants/permissions.ts`
2. Update authorization config and role templates.
- File: `src/app/core/authorization/authorization-config.ts`
3. Add sidebar entry for new communications module route.
- File: `src/app/layout/sidebar/sidebar.component.ts`
4. Add communications lazy route.
- File: `src/app/app-routing.module.ts`

**Backend Tasks (new service/repo)**
1. Add permission seeds/migration.
- File: `backend/db/migrations/001_permissions.sql`
2. Add role-permission mapping seed.
- File: `backend/db/seeds/role_permissions.sql`

---

#### COMM-102 (EPIC-COMM-02)
**Story**: As a developer, I want canonical DTO/model contracts for communications so that FE and BE stay aligned.

**Acceptance Criteria**
1. Message, recipient, campaign, template DTOs published.
2. Validation constraints defined.
3. API response envelope standardized.

**Frontend Tasks (per file)**
1. Create communication models.
- File: `src/app/core/models/communication/message.model.ts`
- File: `src/app/core/models/communication/campaign.model.ts`
- File: `src/app/core/models/communication/template.model.ts`
- File: `src/app/core/models/communication/recipient.model.ts`

**Backend Tasks (per file)**
1. Create API schema types.
- File: `backend/src/modules/communications/dto/create-campaign.dto.ts`
- File: `backend/src/modules/communications/dto/message-response.dto.ts`
- File: `backend/src/modules/communications/dto/template.dto.ts`

---

#### COMM-103 (EPIC-COMM-02)
**Story**: As a user, I want an empty but working communications module entry screen so that navigation is stable.

**Acceptance Criteria**
1. `/communications` route loads.
2. Module has placeholder sections: Inbox, Campaigns, Templates.
3. No console errors.

**Frontend Tasks (per file)**
1. Create feature module.
- File: `src/app/features/communications/communications.module.ts`
- File: `src/app/features/communications/communications-routing.module.ts`
2. Create shell component.
- File: `src/app/features/communications/communications-shell.component.ts`
- File: `src/app/features/communications/communications-shell.component.html`

---

## Sprint 2 - Inbox (Read Path MVP)

### Sprint Goal
Deliver in-app inbox with filters, unread tracking, and mark-read flow.

### Jira Stories

#### COMM-201 (EPIC-COMM-03)
**Story**: As a tenant/owner/admin, I want to view my communications inbox so that I can track notices and alerts.

**Acceptance Criteria**
1. Inbox list supports pagination.
2. Filters: date, type, priority, read status.
3. Unread count shown.
4. Message details panel opens on click.

**Frontend Tasks (per file)**
1. Create inbox page and list component.
- File: `src/app/features/communications/inbox/inbox.component.ts`
- File: `src/app/features/communications/inbox/inbox.component.html`
2. Add data table columns.
- File: `src/app/features/communications/inbox/inbox-table.config.ts`
3. Create `CommunicationService` read APIs.
- File: `src/app/core/services/communication.service.ts`
4. Add unread badge in header from service.
- File: `src/app/layout/header/header.component.ts`
- File: `src/app/layout/header/header.component.html`

**Backend Tasks (per file)**
1. Implement list endpoint.
- File: `backend/src/modules/communications/communications.controller.ts` (`GET /communications/inbox`)
2. Query service for recipient-scoped messages.
- File: `backend/src/modules/communications/communications.service.ts`
3. DB tables.
- File: `backend/db/migrations/002_communications_core.sql`

---

#### COMM-202 (EPIC-COMM-03)
**Story**: As a user, I want to mark message as read so that unread counts are accurate.

**Acceptance Criteria**
1. Open message marks read.
2. Manual mark unread/read supported.
3. Header unread count updates instantly.

**Frontend Tasks (per file)**
1. Add read-status actions.
- File: `src/app/features/communications/inbox/inbox.component.ts`
2. Add state stream for unread.
- File: `src/app/core/services/communication.service.ts`

**Backend Tasks (per file)**
1. Update recipient status endpoint.
- File: `backend/src/modules/communications/communications.controller.ts` (`PATCH /communications/:id/read`)
2. Persist read timestamp.
- File: `backend/src/modules/communications/repositories/recipient.repository.ts`

---

## Sprint 3 - Compose and Send Now

### Sprint Goal
Enable authorized roles to compose and send in-app communications.

### Jira Stories

#### COMM-301 (EPIC-COMM-04)
**Story**: As an admin/society admin/owner, I want to compose and send communication now so that operational messaging is immediate.

**Acceptance Criteria**
1. Compose form fields: subject, body, type, priority, audience.
2. Audience supports role + property filters.
3. Send creates campaign and recipient records.
4. Validation and error states handled.

**Frontend Tasks (per file)**
1. Compose form component.
- File: `src/app/features/communications/compose/compose.component.ts`
- File: `src/app/features/communications/compose/compose.component.html`
2. Audience selector component.
- File: `src/app/features/communications/compose/audience-selector.component.ts`
3. Create API methods.
- File: `src/app/core/services/communication.service.ts`

**Backend Tasks (per file)**
1. Send-now endpoint.
- File: `backend/src/modules/communications/communications.controller.ts` (`POST /communications/campaigns/send`)
2. Recipient expansion engine.
- File: `backend/src/modules/communications/services/audience-resolver.service.ts`
3. Domain entities.
- File: `backend/src/modules/communications/entities/campaign.entity.ts`
- File: `backend/src/modules/communications/entities/recipient.entity.ts`

---

#### COMM-302 (EPIC-COMM-04)
**Story**: As a sender, I want preview before send so that I can validate communication quality.

**Acceptance Criteria**
1. Preview modal shows resolved audience count.
2. Final confirmation required for urgent messages.

**Frontend Tasks (per file)**
1. Preview modal.
- File: `src/app/features/communications/compose/compose-preview-modal.component.ts`

**Backend Tasks (per file)**
1. Preflight API for audience count.
- File: `backend/src/modules/communications/communications.controller.ts` (`POST /communications/campaigns/preflight`)

---

## Sprint 4 - Scheduling and Campaign Lifecycle

### Sprint Goal
Enable schedule/cancel/resume campaign workflows with status timeline.

### Jira Stories

#### COMM-401 (EPIC-COMM-04)
**Story**: As a sender, I want to schedule campaign for later so that messages are sent at suitable times.

**Acceptance Criteria**
1. Schedule datetime (timezone aware).
2. Campaign status transitions from `draft -> queued -> sent`.
3. Cancel before dispatch is allowed.

**Frontend Tasks (per file)**
1. Schedule controls in compose.
- File: `src/app/features/communications/compose/compose.component.ts`
2. Campaign list and status chips.
- File: `src/app/features/communications/campaigns/campaigns.component.ts`

**Backend Tasks (per file)**
1. Campaign scheduler worker.
- File: `backend/src/workers/campaign-dispatch.worker.ts`
2. Lifecycle endpoints.
- File: `backend/src/modules/communications/communications.controller.ts`
3. Status transition service.
- File: `backend/src/modules/communications/services/campaign-lifecycle.service.ts`

---

#### COMM-402 (EPIC-COMM-07)
**Story**: As an operator, I want failed campaigns retried so that delivery success improves.

**Acceptance Criteria**
1. Retry policy configurable.
2. Failed recipients retried with backoff.
3. Dead-letter state captured.

**Backend Tasks (per file)**
1. Retry queue logic.
- File: `backend/src/modules/communications/services/retry-policy.service.ts`
2. Failure attempt table.
- File: `backend/db/migrations/003_delivery_attempts.sql`

---

## Sprint 5 - Template Management

### Sprint Goal
Manage reusable templates with placeholders and safe rendering.

### Jira Stories

#### COMM-501 (EPIC-COMM-05)
**Story**: As an admin, I want template CRUD with variables so that repetitive communications are standardized.

**Acceptance Criteria**
1. Template list/create/edit/archive available.
2. Variables validated (`{{tenantName}}`, `{{dueAmount}}`, etc.).
3. Compose can load template and preview merged content.

**Frontend Tasks (per file)**
1. Templates module page.
- File: `src/app/features/communications/templates/templates.component.ts`
2. Template editor form.
- File: `src/app/features/communications/templates/template-editor.component.ts`
3. Template service.
- File: `src/app/core/services/communication-template.service.ts`

**Backend Tasks (per file)**
1. Template CRUD endpoints.
- File: `backend/src/modules/communications/templates.controller.ts`
2. Merge/compile service.
- File: `backend/src/modules/communications/services/template-renderer.service.ts`

---

## Sprint 6 - Event-Driven Automations

### Sprint Goal
Connect business events to automatic communications.

### Jira Stories

#### COMM-601 (EPIC-COMM-06)
**Story**: As a society admin, I want automated reminders on payment overdue so that collections improve without manual effort.

**Acceptance Criteria**
1. Event rules configurable (`event -> template -> audience -> channel`).
2. Triggered sends are idempotent.
3. Rule execution logs are visible.

**Frontend Tasks (per file)**
1. Automation rules UI.
- File: `src/app/features/communications/automations/automations.component.ts`
2. Rule editor form.
- File: `src/app/features/communications/automations/rule-editor.component.ts`

**Backend Tasks (per file)**
1. Rule engine service.
- File: `backend/src/modules/communications/services/event-rule-engine.service.ts`
2. Event consumer handlers.
- File: `backend/src/modules/events/handlers/payment-overdue.handler.ts`
- File: `backend/src/modules/events/handlers/complaint-created.handler.ts`
3. Idempotency key store.
- File: `backend/src/modules/communications/repositories/idempotency.repository.ts`

---

## Sprint 7 - Audit, Compliance, Export

### Sprint Goal
Support governance-grade history and exports.

### Jira Stories

#### COMM-701 (EPIC-COMM-08)
**Story**: As an auditor/admin, I want complete communication logs with filters and export so that compliance and disputes can be handled.

**Acceptance Criteria**
1. Log view supports sender, date, status, audience filters.
2. Export CSV/PDF available.
3. Recipient-level delivery/read timestamps included.

**Frontend Tasks (per file)**
1. Logs page.
- File: `src/app/features/communications/logs/logs.component.ts`
2. Export integration.
- File: `src/app/core/services/export.service.ts`

**Backend Tasks (per file)**
1. Log query endpoint.
- File: `backend/src/modules/communications/communications.controller.ts` (`GET /communications/logs`)
2. Export endpoint.
- File: `backend/src/modules/communications/communications.controller.ts` (`GET /communications/logs/export`)

---

#### COMM-702 (EPIC-COMM-08)
**Story**: As a user, I want channel preferences and quiet hours so that communication remains relevant and non-intrusive.

**Acceptance Criteria**
1. User can set preferences by channel/type.
2. Quiet hours are enforced for non-critical communications.

**Frontend Tasks (per file)**
1. Preferences page.
- File: `src/app/features/communications/preferences/preferences.component.ts`
2. Preferences service.
- File: `src/app/core/services/communication-preferences.service.ts`

**Backend Tasks (per file)**
1. Preferences endpoint.
- File: `backend/src/modules/communications/preferences.controller.ts`
2. Enforcement service in dispatch flow.
- File: `backend/src/modules/communications/services/dispatch-policy.service.ts`

---

## Sprint 8 - Hardening, Performance, and Go-Live

### Sprint Goal
Stabilize system for production with observability, scaling, and QA sign-off.

### Jira Stories

#### COMM-801 (EPIC-COMM-07)
**Story**: As an SRE, I want metrics and alerts for delivery health so that issues are identified early.

**Acceptance Criteria**
1. Metrics: queued, sent, failed, retry count, latency.
2. Alerts on failure threshold breach.
3. Dashboard visible to ops/admin.

**Backend Tasks (per file)**
1. Metrics instrumentation.
- File: `backend/src/modules/communications/services/metrics.service.ts`
2. Health endpoint.
- File: `backend/src/modules/communications/communications.controller.ts` (`GET /communications/health`)

---

#### COMM-802 (Cross-epic)
**Story**: As QA, I want complete test coverage for critical communication flows so that releases are safe.

**Acceptance Criteria**
1. Unit, integration, and E2E suites pass in CI.
2. Test coverage threshold met.

**Frontend Test Tasks (per file)**
1. Inbox tests.
- File: `src/app/features/communications/inbox/inbox.component.spec.ts`
2. Compose tests.
- File: `src/app/features/communications/compose/compose.component.spec.ts`

**Backend Test Tasks (per file)**
1. Controller integration tests.
- File: `backend/test/communications.controller.spec.ts`
2. Rule engine tests.
- File: `backend/test/event-rule-engine.spec.ts`

---

## 5. API Contract (Initial)

### Campaigns
1. `POST /api/communications/campaigns/preflight`
2. `POST /api/communications/campaigns/send`
3. `POST /api/communications/campaigns/schedule`
4. `POST /api/communications/campaigns/{id}/cancel`
5. `POST /api/communications/campaigns/{id}/retry-failed`
6. `GET /api/communications/campaigns`
7. `GET /api/communications/campaigns/{id}`

### Inbox
1. `GET /api/communications/inbox`
2. `GET /api/communications/inbox/{messageId}`
3. `PATCH /api/communications/inbox/{messageId}/read`
4. `PATCH /api/communications/inbox/{messageId}/unread`

### Templates
1. `GET /api/communications/templates`
2. `POST /api/communications/templates`
3. `PUT /api/communications/templates/{id}`
4. `DELETE /api/communications/templates/{id}`

### Automations
1. `GET /api/communications/automations`
2. `POST /api/communications/automations`
3. `PUT /api/communications/automations/{id}`
4. `DELETE /api/communications/automations/{id}`

### Logs/Exports
1. `GET /api/communications/logs`
2. `GET /api/communications/logs/export?format=csv|pdf`

---

## 6. Data Model (Minimum)

1. `communication_templates`
2. `communication_campaigns`
3. `communication_messages`
4. `communication_recipients`
5. `communication_delivery_attempts`
6. `communication_automation_rules`
7. `communication_user_preferences`
8. `communication_audit_logs`

---

## 7. Definition of Done per Sprint

1. Story acceptance criteria met.
2. FE + BE code merged with tests.
3. API docs updated.
4. Role and permission checks validated.
5. Observability hooks added for new flows.
6. Demo scenario executed and recorded.

---

## 8. Jira Ticket Template

### Story Template
- Title: `[COMM-XXX] <short story title>`
- Type: Story
- Epic Link: `EPIC-COMM-0X`
- Description:
  - As a `<role>`
  - I want `<capability>`
  - So that `<business value>`
- Acceptance Criteria:
  1. ...
  2. ...
- Dependencies:
  - ...
- FE Tasks (subtasks):
  1. File + change
- BE Tasks (subtasks):
  1. File + change
- QA Tasks:
  1. Test cases + automation
- Story Points: `<3/5/8/13>`

### Bug Template
- Title: `[COMM-BUG] <issue>`
- Environment: dev/stage/prod
- Steps to Reproduce
- Actual Result
- Expected Result
- Logs/Screenshots
- Impact
- Priority

---

## 9. Suggested Delivery Order in Git

1. Create branch per sprint: `feature/comm-sprint-1`, `feature/comm-sprint-2`, etc.
2. Create folder placeholders before implementation.
3. Merge behind feature flag: `enableCommunicationsV2`.
4. Release gradually with canary rollout.

---

## 10. Immediate Next Actions

1. Create Sprint 1 board with COMM-101, COMM-102, COMM-103.
2. Approve final permission matrix for roles.
3. Freeze API DTO schema for FE-BE contract.
4. Start Communications module scaffold and backend migration setup.
