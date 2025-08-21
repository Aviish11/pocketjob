
# PocketJob — Phase 2: Privacy Design

> Beginner-friendly summary of what personal data we collect, why, where it lives, and how users stay in control.

## 1) What We Collect (V1)
- **Account**: name, email, hashed password (or Google ID).
- **Applications & Listings**: job title, company, URL, salary text, description, applied date, status, notes, tags.
- **Email (Gmail)**: message **metadata** (from/to/cc, subject, sent_at, snippet, thread id). **No full body** by default in v1. Attachments not stored unless user explicitly saves.
- **Technical**: IP, user-agent, extension version (for security/audit).

## 2) Why We Collect It (Purpose)
- Show your applications and related emails in one place.
- Automate status changes (rejected/no-response) to save time.
- Keep the service secure (audit, fraud/abuse prevention).

## 3) Where Data Lives
- Hosted in **North America** (Canada/US). Encrypted at rest (DB, backups) and in transit (TLS).
- OAuth tokens encrypted with KMS; access tightly restricted.

## 4) Data Minimization
- Store **least** needed by default (email metadata + snippet only). Full bodies/attachments require an explicit user action or future opt-in.
- Logs exclude tokens and email bodies.

## 5) How Long We Keep It (Retention)
- While your account is active. If you disconnect Gmail, we remove Gmail metadata within **30 days**.
- Account deletion removes org data within **7 days** (backups on next cycle where feasible).

## 6) Your Controls (User Rights)
- **Export**: download your applications + linked email metadata.
- **Delete**: delete application(s) or whole account.
- **Disconnect**: revoke Gmail access at any time (and in Google account settings). We schedule deletion of synced data.
- **Region**: default NA; future control to choose region.

## 7) Third Parties (Processors)
- Cloud hosting (compute, DB, storage, KMS).
- Email provider API (Google). We do **not** sell data or share with advertisers.
- Analytics (if enabled) must be privacy-preserving and first-party only.

## 8) Legal Basis & Compliance (Plain English)
- Consent for Gmail access. Contract/legitimate interest for running the service.
- GDPR-ready processes (access/export/delete; DPO email later).
- PIPEDA principles respected (Canada). Breach notification according to local law.

## 9) Children
- Not for children under 16. We do not knowingly collect their data.

## 10) Security Highlights (See 02_SECURITY.md)
- Argon2id passwords, MFA-ready.
- RLS for org isolation.
- Short-lived tokens for the extension.
- KMS-encrypted OAuth tokens.
- WAF + rate limits + audit logs.

## 11) Transparency
- Clear in-product notices explaining exactly what Gmail scope means and what we store.
- Change log for this document; versioned in repo.

## 12) Data Subject Requests (DSR)
- Request email: `privacy@pocketjob.app` (placeholder).
- SLA targets: access/export ≤ 30 days; deletion ≤ 7 days operational + backup cycle.
