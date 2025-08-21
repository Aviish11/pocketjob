
# PocketJob — Phase 1: Data Model (Plain English)

## Entities & Key Fields

### 1) Organization
- id (uuid)
- name
- created_at
- **Notes:** Single-user org by default. Later: invite teammates.

### 2) User
- id (uuid)
- org_id (fk -> Organization)
- email (unique)
- name
- created_at
- role (owner | member) — future-ready

### 3) Application
- id (uuid)
- org_id (fk)
- listing_id (fk -> Listing)
- status (enum: in_progress | rejected | no_response)
- applied_at (timestamp)
- top_score (numeric) — optional for “top job” logic (e.g., salary)
- created_at, updated_at

### 4) Listing
- id (uuid)
- org_id (fk)
- title
- company_id (fk -> Company, nullable if unknown)
- source_site (enum/text: linkedin | indeed | ziprecruiter | other)
- post_url (unique per org)  // used for dedupe within same org
- location
- salary_text (raw string)
- job_type (full-time, part-time, contract, intern, etc., nullable)
- description (text, nullable)
- posted_at (nullable)
- created_at, updated_at

### 5) Company
- id (uuid)
- org_id (fk)
- name
- website_domain (nullable)
- created_at

### 6) EmailAccount
- id (uuid)
- org_id (fk)
- provider (gmail)
- provider_account_id (e.g., Gmail address)
- status (connected | revoked)
- created_at

### 7) EmailThread
- id (uuid)
- org_id (fk)
- provider (gmail)
- thread_external_id (provider thread id, unique with org)
- application_id (fk -> Application, nullable if unassigned)
- last_message_at
- created_at, updated_at

### 8) EmailMessage
- id (uuid)
- org_id (fk)
- thread_id (fk -> EmailThread)
- message_external_id (provider message id)
- from_address, from_display
- to_addresses (array)
- cc_addresses (array)
- subject
- snippet (short preview)
- sent_at
- rejection_score (0..1)  // heuristic used for automation
- created_at

### 9) Attachment
- id (uuid)
- org_id (fk)
- message_id (fk -> EmailMessage)
- filename
- mime_type
- size_bytes
- storage_url (if stored) or pointer-only
- created_at

### 10) Tag
- id (uuid)
- org_id (fk)
- name (unique per org)

### 11) ApplicationTag (join)
- application_id (fk)
- tag_id (fk)

### 12) Note
- id (uuid)
- org_id (fk)
- application_id (fk)
- author_user_id (fk)
- body (text)
- created_at, updated_at

### 13) ActivityLog
- id (uuid)
- org_id (fk)
- actor (system | user:{user_id})
- type (application.created, email.linked, status.updated, etc.)
- payload (jsonb)
- created_at

---

## Relationships
- Organization 1–N Users, Applications, Listings, EmailAccounts.
- Application 1–1 Listing; Application 1–N EmailThreads (via EmailThread.application_id).
- EmailThread 1–N EmailMessage; EmailMessage 1–N Attachment.
- Application N–N Tag via ApplicationTag.
- Application 1–N Note.
- ActivityLog references many events by id in payload.

---

## Indexes & Uniqueness (per org unless specified)
- Listing.post_url UNIQUE (org_id, post_url)
- EmailThread.thread_external_id UNIQUE (org_id, provider, thread_external_id)
- EmailMessage.message_external_id UNIQUE (org_id, provider, message_external_id)
- Application.status, Application.applied_at (for filters)
- Company.name (btree), Company.website_domain
- ActivityLog.created_at (time-ordered queries)

---

## Status Automation Logic

**Initial status**
- When created via extension: `in_progress` and `applied_at = now()` unless provided.

**Rejected**
- When a newly-linked EmailMessage bumps **rejection_score ≥ 0.8** based on rules:
  - Keyword sets in subject/body: “unfortunately”, “we regret”, “decided not to move forward”.
  - From domain matches company domain or common ATS domains (e.g., @greenhouse.io, @lever.co).
  - Optional: model or ruleset can tune later.
- Manual override always wins.

**No Response**
- Nightly (or hourly) job checks applications with:
  - status = `in_progress` AND `now() - applied_at ≥ 20 days` AND no incoming employer emails linked.
  - Sets status to `no_response` and logs an ActivityLog event.
- 20 days will be a user setting later.

---

## Email → Application Matching (Deterministic before heuristic)
1) If EmailThread already linked to an Application → link new messages to the same Application.
2) If message sender domain equals Company.website_domain → candidate match.
3) If subject or from_display contains Company.name (normalized) → candidate match.
4) If only one candidate → link it. If multiple → mark as **needs_review**.
5) If zero candidates → show in **Inbox** tab for manual linking.
6) Manual linking sets the thread’s application_id for future messages.

---

## Data Minimization & Privacy (Phase 1 stance)
- Store minimal email metadata + snippet; keep full body text only if required later.
- Attachments stored only when the user downloads/saves explicitly (resume variants can be large).
- All tables include org_id to support strict data isolation.
