
# PocketJob — Phase 5: Rate Limits

**Headers returned on limited routes:**  
`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (seconds).

## Buckets & Defaults
- **Auth (per IP):**
  - POST /auth/login: **10/min**, burst 20
  - POST /auth/register: **5/min**, burst 10
- **Extension ingest (per user/org via EXT_TOKEN):**
  - POST /extension/listings: **30/min**, burst 60
- **Core API (per user/org):**
  - GET /applications: **600/hour**
  - GET /search: **60/min**
  - POST /applications: **60/hour**
  - PATCH /applications/{id}: **120/hour**
  - Notes/Tags endpoints: **240/hour** combined
- **Email data (per user/org):**
  - GET /email/threads, /email/messages: **300/hour**
  - POST /email/threads/{id}/link|unlink: **120/hour**
- **Webhooks (service):**
  - POST /webhooks/gmail: validated source only; internal protective limit **3000/min**

## 429 Behavior
- Response code **429 RATE_LIMITED** with JSON error envelope.
- Clients should **exponential backoff** and respect `RateLimit-Reset`.
- Server logs include user/org/token + IP for anomaly detection.

## Abuse Controls (complementary)
- WAF, IP reputation checks, bot challenges on auth endpoints.
- Idempotency keys on create/update to avoid duplicate churn.
