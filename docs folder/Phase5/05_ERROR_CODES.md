
# PocketJob — Phase 5: Error Codes & Conventions

**Error envelope:**
```json
{"error":{"code":"ERROR_CODE","message":"Human-friendly message","details":{},"request_id":"uuid"}}
```

## Standard Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Not logged in / invalid token |
| `FORBIDDEN` | 403 | Authenticated but not allowed (org mismatch, role) |
| `NOT_FOUND` | 404 | Resource missing or not in your org |
| `METHOD_NOT_ALLOWED` | 405 | Wrong HTTP verb |
| `CONFLICT` | 409 | Duplicate (e.g., listing post_url already exists) |
| `PRECONDITION_FAILED` | 412 | Missing header (e.g., Idempotency-Key required) |
| `VALIDATION_FAILED` | 422 | Bad input (fields, formats) |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Unexpected exception |
| `SERVICE_UNAVAILABLE` | 503 | Downstream (DB/API) issues |

## Auth/Gmail Specific
| Code | HTTP | Meaning |
|------|------|---------|
| `OAUTH_CONSENT_REQUIRED` | 400 | User must reconnect Gmail |
| `TOKEN_EXPIRED` | 401 | Gmail or extension token expired |
| `GMAIL_QUOTA_EXCEEDED` | 429 | Backoff and retry later |
| `THREAD_LINK_CONFLICT` | 409 | Thread already linked to another application (manual override required) |

## Error Handling Rules
- Never leak internal stack traces to clients (log with request_id internally).
- Include a **stable** `code` for programmatic handling and a **friendly** `message` for users.
- For idempotent retries: return the same response body when `Idempotency-Key` repeats within 24h.
