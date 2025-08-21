
# PocketJob — Phase 5: Tenancy & Data Isolation

## Model
- Every table includes `org_id UUID NOT NULL`.
- **Row-Level Security (RLS)** enforced on **all** tables.
- API resolves the **effective org** from session/extension/service token and sets it per connection.

## Postgres Setup (conceptual)
```sql
-- Example context variable
SELECT set_config('app.current_org', '<org-uuid>', true);

-- Policy example for applications
ALTER TABLE application ENABLE ROW LEVEL SECURITY;
CREATE POLICY application_isolation ON application
USING (org_id::text = current_setting('app.current_org', true));

-- Similar policies for listing, company, email_thread, email_message, note, tag, activity_log, etc.
```

## App Layer
- On each request, the server determines `org_id`:
  - **Browser session** -> user.org_id
  - **Extension token** -> token claims include org_id
  - **Service token/webhook** -> token claims include org_id or account id mapping
- The request handler sets `app.current_org` at the start and clears it at the end (finally block). If missing/ambiguous -> **deny**.

## Background Jobs
- Job record stores `org_id`. Workers set `app.current_org` before DB calls.
- No cross-org queries. Aggregations are per-org unless an admin maintenance task (separate privileged role).

## Multi-User (future)
- Roles: `owner`, `member` at the org level.
- Access checks at API layer (RBAC) + RLS at DB layer (defense in depth).

## Data Export/Deletion
- Export queries run under the org context.
- Deletion: cascade deletes constrained to matching `org_id` only.

## Tests
- Integration tests asserting:
  - User from Org A cannot read/update Org B rows.
  - RLS policies applied on all relevant tables.
  - Missing `app.current_org` -> queries fail by policy.
