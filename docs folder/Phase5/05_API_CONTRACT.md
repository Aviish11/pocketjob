
# PocketJob — Phase 5: Backend/API Contract (V1, No Code)

**Style:** RESTful JSON, secure by default, beginner-friendly.  
**Base URL (prod, placeholder):** `https://api.pocketjob.app/v1`  
**Auth:** 
- **Browser app:** HttpOnly session cookie (CSRF protected). 
- **Chrome extension:** `Authorization: Bearer <EXT_TOKEN>` (scoped, 30 min). 
- **Webhooks/Workers:** `Authorization: Bearer <SERVICE_TOKEN>` (server-to-server).

**Response envelope (success):**
```json
{
  "data": { "...": "..." },
  "meta": { "request_id": "abc-123", "next_cursor": null }
}
```
**Response envelope (error):**
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "title is required",
    "details": {"field": "title"},
    "request_id": "abc-123"
  }
}
```

**Headers:**
- `Idempotency-Key`: for POST/PATCH that create/update.
- `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`: returned on rate-limited routes.
- `X-Request-Id`: client may send; server also generates.

**Pagination:** cursor-based preferred (`?cursor=...&limit=50`). Fallback: `?offset=0&limit=50`.  
**Sorting:** `?sort=applied_at:desc` (comma-separated supported).  
**Filtering:** `?status=in_progress,rejected&source_site=linkedin&min_salary=60000`

---

## Auth
### POST /auth/register
Create account and org.
```jsonc
// req
{"email":"you@example.com","password":"strongPW123","name":"Veevek"}
// res 201
{"data":{"user_id":"uuid","org_id":"uuid"}}
```
### POST /auth/login
Creates session cookie.
```jsonc
{"email":"you@example.com","password":"strongPW123"}
{"data":{"user_id":"uuid","org_id":"uuid"}}
```
### POST /auth/logout
Clears server session. `204 No Content`.

### GET /auth/session
Who am I?
```json
{"data":{"user":{"id":"uuid","email":"you@example.com","name":"Veevek"},"org":{"id":"uuid","name":"PocketJob"}}}
```

---

## Org & Settings
### GET /org
Current org profile.
### PATCH /org
Update org name/preferences (e.g., `no_response_days` default 20).

### POST /org/extension-token
Mint short-lived Extension Token (scope `extension:save_listing`).  
Response:
```json
{"data":{"ext_token":"eyJ...","expires_in":1800}}
```

---

## Applications
### GET /applications
List applications (filters supported).
**Query params:** 
- `status` (`in_progress,rejected,no_response`), 
- `q` (search title/company/tags), 
- `source_site`, 
- `applied_from`, `applied_to` (ISO dates),
- `min_salary`, `max_salary` (parse from salary_text heuristically if present).

**Response (200):**
```json
{"data":[
  {"id":"uuid","listing_id":"uuid","status":"in_progress","applied_at":"2025-08-02T12:00:00Z",
   "listing":{"title":"Frontend Intern","company_name":"Acme","source_site":"linkedin","post_url":"https://...","salary_text":"80k-95k","location":"Remote"}}],
 "meta":{"next_cursor":null}}
```

### POST /applications
Create application manually.
```jsonc
{"listing":{"title":"Support Specialist","company_name":"Initech","source_site":"other","post_url":"https://...","location":"Toronto","salary_text":"60k"},"applied_at":"2025-08-01T10:00:00Z"}
```
`201 Created` with application object. Use `Idempotency-Key` to avoid duplicates.

### GET /applications/{id}
Full detail incl. listing, tags, notes summary.
### PATCH /applications/{id}
Update fields: `status`, `applied_at`, etc. Manual changes override automation.

### DELETE /applications/{id}
Soft-delete (archived) in V1.

---

## Listings
> Usually created via the extension endpoint. Read-only otherwise.

### GET /listings/{id}
Returns listing details (title/company/location/salary/description/post_url).

---

## Companies
### GET /companies
List companies (for filters/autocomplete).
### GET /companies/{id}
Company details.

---

## Notes & Tags
### POST /applications/{id}/notes
```json
{"body":"Used referral from Jane."}
```
`201 Created` returns note.

### DELETE /notes/{note_id}`
`204 No Content`.

### POST /tags
Create tag (unique per org). `{ "name": "remote" }`

### POST /applications/{id}/tags
`{ "tag_id": "uuid" }` OR `{ "name": "dream-job" }` (creates if not exists).

### DELETE /applications/{id}/tags/{tag_id}`
`204 No Content`.

---

## Email (Gmail) — Connect & Data
### POST /email/gmail/connect
Returns Google OAuth URL (server will handle callback).
```json
{"data":{"auth_url":"https://accounts.google.com/o/oauth2/v2/auth?..."}}
```

### GET /email/threads
Filter by `application_id`, `q`, `cursor`, `limit`.
```json
{"data":[{"id":"uuid","provider":"gmail","thread_external_id":"t_123","application_id":"uuid",
"last_message_at":"2025-08-05T14:00:00Z","messages_count":3}]}
```

### GET /email/messages
Filter by `thread_id`.
```json
{"data":[{"id":"uuid","from_address":"recruiter@acme.com","subject":"Next steps","snippet":"We'd like to...","sent_at":"2025-08-05T14:00:00Z"}]}
```

### POST /email/threads/{thread_id}/link
Link thread to application.
```json
{"application_id":"uuid"}
```
Returns updated thread.  
### POST /email/threads/{thread_id}/unlink
Unassign thread. Returns `200` with thread (now `application_id=null`).

---

## Extension Ingest
### POST /extension/listings
Create/update Application+Listing from the extension.
- **Auth:** `Bearer <EXT_TOKEN>`
- **Body:** `SaveListingPayload` (Phase 3).
- **Headers:** `Idempotency-Key: <hash(site+post_url)>`
- **Response:** `201` (created) or `200` (duplicate) with application payload.
- **Rate limit:** see Phase 5 rate limits doc.

Example request:
```json
{
  "extension_version":"0.1.0",
  "site":"linkedin",
  "post_url":"https://www.linkedin.com/jobs/view/123",
  "title":"Frontend Intern",
  "company":"Acme",
  "location":"Remote",
  "salary_text":"80k-95k",
  "description":"...",
  "captured_at_iso":"2025-08-05T12:34:56Z",
  "dedupe_key":"sha256(site+url)"
}
```

---

## Search
### GET /search
Unified search across applications/companies (and threads optionally).
**Params:** `q`, `type=applications|companies|emails`, `limit`, `cursor`.

Response:
```json
{"data":{"applications":[{"id":"uuid","listing":{"title":"Frontend Intern","company_name":"Acme"}}]}}
```

---

## Webhooks
### POST /webhooks/gmail
Receiver for Gmail push notifications (if using Watch).  
- **Auth:** `Bearer <SERVICE_TOKEN>` + signature verification.  
- Respond `204` quickly; worker picks up.

---

## Health & Admin
### GET /health/live  -> 200 if service alive
### GET /health/ready -> 200 if deps reachable

---

## Security Headers & CORS
- `Content-Security-Policy`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- CORS: allow `https://app.pocketjob.app` + Chrome extension origin for `POST /extension/listings`.
