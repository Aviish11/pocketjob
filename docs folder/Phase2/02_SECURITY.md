
# PocketJob — Phase 2: Security & Privacy by Design (No Code)

> Goal: lock-in decisions that keep data safe from day 1. This is written for beginners, but precise enough for engineers to implement exactly.

---

## 0) Scope & Assumptions
- Single-tenant-per-org model (you for now). Multi-user later.
- Web app + API + Chrome extension + Gmail integration (read-only).
- Data hosted in **North America** by default (Canada/US region) with encryption at rest & in transit.
- Threat model baseline: internet adversaries, malicious extension impersonation, leaked tokens, supply chain attacks, misconfigurations, and abuse/spam.

---

## 1) Authentication & Sessions
### App sign-in
- Email/password (hashed with **Argon2id**), optional Google Sign-In.
- **MFA-ready** (TOTP later). Password reset via signed one-time link (15 min TTL).
- Device/session management page (see active sessions, revoke).

### Sessions
- **Server-side sessions** (backed by Redis/DB), referenced by **HttpOnly, Secure, SameSite=Lax** cookie.
- **Short session TTL** (8h of inactivity), refresh via sliding window (<=30d), manual sign-out invalidates server session.
- **CSRF**: SameSite cookie + CSRF token for form/unsafe methods.
- **JWTs** only for service-to-service if needed; do not expose long-lived JWTs to browser.

### Extension authentication
- Extension never stores your main session. Instead it uses a **scoped, short-lived “Extension Token”**:
  - Minted by backend when user is logged-in (Settings → “Connect Extension”).
  - **TTL 30 minutes**, auto-rotated; scope = `extension:save_listing` only.
  - Stored in `chrome.storage.local` and sent as `Authorization: Bearer <token>` to `POST /api/extension/listings`.
  - Rotations/invalidations logged; rate-limited (see §7).
  - Token format: PASETO or signed opaque token; ties to user+org+extension id+IP prefix (optional) to reduce theft value.
- Backend **validates Chrome Extension ID** via `Origin`/`Sec-Fetch-Site` and a per-release **public key pin** for update feed (defense in depth).

---

## 2) Authorization (Who can do what)
- Role-based now (`owner`, later `member`); **Attribute-based** rules where needed (e.g., org_id scoping).
- **Row-Level Security (RLS)** in PostgreSQL: All tables include `org_id`; server sets `SET app.current_org = $org_id`; policies ensure queries only see that org’s rows.
- Every request must resolve to **effective org context**; deny if ambiguous/missing.

---

## 3) Input Validation & Output Encoding
- **Validate everything** at API boundary (Zod/DTOs) and enforce types end-to-end.
- **HTML sanitization** for user-entered notes/descriptions (DOMPurify on server). Store both raw and sanitized or just sanitized.
- **File uploads** (later): inspect MIME, size limits; virus scan (ClamAV/Cloud service).

---

## 4) Cryptography & Secrets
- **TLS 1.2+** everywhere; **HSTS (6 months, includeSubDomains, preload)**; secure cookies only.
- **At-rest encryption**: cloud-managed disk encryption; sensitive columns (OAuth refresh tokens) are **field-level encrypted**:
  - Envelope encryption with **KMS** (e.g., AWS KMS / GCP KMS). Keys rotated every 90 days.
- Password hashing: **Argon2id** with memory-hard params (e.g., m=64MB, t=2, p=1 minimum; tune per host).
- Token signing: **Ed25519** (for PASETO v2.local/v2.public) or platform default.
- Secrets: stored only in **managed secret store** (e.g., 1Password, AWS Secrets Manager). Never in repo/CI logs.

---

## 5) Gmail Integration (Read-only, least privilege)
- Scopes: **Gmail read-only** (e.g., `https://www.googleapis.com/auth/gmail.readonly`), user consent clearly explains purpose.
- Store **metadata + snippet** by default. Full body optional later (opt-in).
- **Token handling**: store refresh tokens encrypted (KMS). Revoke on user disconnect.
- **Sync pattern**: initial backfill (~60 days), then push notifications (Gmail watch with Pub/Sub) or respectful polling fallback.
- **Linking logic**: deterministic (thread id → application) before heuristics. All decisions **audited** (see §8).
- **Google OAuth verification**: plan to pass **OAuth consent screen verification** before public launch; follow the Google API Services User Data Policy.

---

## 6) Chrome Extension Security
- **Manifest V3**; minimal permissions; restrict content scripts to **allowlisted host patterns** (job sites only).
- Network: extension sends data **only** to `api.pocketjob.app` over HTTPS; **no third-party beacons**.
- Content script isolation: do not expose globals; message-passing only.
- **Fallback smart-copy** grants temporary selection access; no full-page scraping unless user initiates.
- **Abuse prevention**: per-site rate limits; dedupe by post URL; user-visible queue & resend.
- Updates are signed by Chrome Web Store; monitor extension ID / version in backend logs.

---

## 7) Abuse, Rate Limiting, Bot/Spam Controls
- **Global** and **per-user** rate limits (token bucket):
  - `POST /api/extension/listings`: 30/min/user, burst 60.
  - Auth endpoints: tighter (e.g., 10/min/IP) + exponential backoff.
- Brute-force: **IP + account lockout** after N failed attempts (temporary), email notice on unusual activity.
- **WAF** (Cloudflare) + bot fight mode; block obvious scanners.
- **Idempotency keys** for create/update to prevent duplicates on retries.

---

## 8) Audit Logging & Observability
- **AuditLog** table (immutable): who/what/when/where; includes: sign-ins, token mint/revoke, email link/unlink, status changes, admin actions.
- **App logs** are structured JSON with request IDs; **PII minimized** (no raw tokens, no full email bodies).
- **Sentry** for errors; **OpenTelemetry** traces for request paths.
- **Alerting**: on auth errors spike, 5xx spike, token mint anomalies, extension misuse, Gmail sync failures.

---

## 9) Supply Chain & CI/CD
- **Pin dependencies** (`package-lock.json`/`pnpm-lock.yaml`). Use **npm’s vetted registry** only.
- **Dependency scanning**: Dependabot + **Grype**; block builds on high-severity CVEs.
- **SAST**: Semgrep + **CodeQL** on PR.
- **DAST**: OWASP ZAP weekly against staging.
- **SBOM**: syft; publish with each release.
- **Container images**: built in CI, signed with **cosign**, scanned before deploy.
- GitHub Actions **OIDC** to cloud; least-privilege deploy role; branch protection; required reviews.

---

## 10) Data Retention, Backups & DR
- **Backups**: automated daily DB snapshots (7–30 day retention), **restore test monthly**.
- **Retention**: email metadata retained while account connected; delete within **30 days** after disconnect or account deletion unless legally required.
- **Right to erasure**: delete org’s data within **7 days** of request, including backups on next cycle where feasible.
- **RPO/RTO**: target RPO ≤ 1 hour, RTO ≤ 4 hours initially.

---

## 11) Privacy by Default (see 02_PRIVACY.md for details)
- Data minimization: store only what’s needed (metadata+snippet). Full bodies/attachments require explicit user action.
- Clear settings for: data export, delete account, disconnect Gmail, and region selection (future).
- Analytics: **privacy-preserving** (self-hosted or cookieless), no cross-site tracking.

---

## 12) Legal/Compliance Notes (Non-legal summary)
- **PIPEDA** (Canada) & **GDPR-ready**: consent, access/export, delete, breach notice.
- **Google API Services User Data Policy**: strict use limits; no secondary use of Gmail data; user-facing privacy policy must reflect this.
- Respect job sites’ **Terms of Service**; the extension only captures **user-visible** data while they are applying.

---

## 13) Security Testing & Go-Live Gate
- Unit/integration tests for auth, RLS, and email matching.
- **Property-based tests** for parsers/matching; basic fuzzing.
- Pre-launch **checklist**: no high vulns in scans, SBOM attached, CSP headers verified, rate-limit verified, backup/restore tested, OAuth verification filed, incident runbook ready.
