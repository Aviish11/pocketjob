
# PocketJob — Phase 2: Threat Model (STRIDE)

## Components
1) Web App (frontend)  
2) API/Backend  
3) PostgreSQL (with Row-Level Security)  
4) Chrome Extension (content scripts + popup)  
5) Gmail Integration (OAuth + sync worker)  
6) Redis/Queue (for jobs)  
7) CI/CD pipeline & supply chain

## Data Flows (text)
- Extension → API `/extension/listings` (HTTPS, Extension Token)
- Web App → API (HTTPS, session cookie + CSRF)
- API ↔ PostgreSQL (private network, RLS policies)
- Sync Worker ↔ Gmail API (OAuth tokens via KMS; pulls metadata/snippets)
- API → CDN/Storage (future attachments; signed URLs)

## STRIDE Table (top risks)

| STRIDE | Example Threat | Impact | Mitigations |
|-------|-----------------|--------|-------------|
| **S**poofing | Attacker replays stolen extension token to create fake listings | Pollution, abuse | Short-lived scoped tokens, IP/UA heuristics, rate limiting, audit & anomaly alerts, token rotation |
| **T**ampering | Malicious input alters another org’s data | Data integrity loss | RLS on every table; per-request org context; API authz checks; idempotency keys |
| **R**epudiation | User claims “I didn’t link that email” | Audit gaps | Immutable AuditLog with actor, IP, user-agent, request id; time sync |
| **I**nformation Disclosure | Exposing Gmail content or tokens | Privacy breach | KMS-encrypted tokens; metadata+snippet only; strict scopes; no tokens in logs; field-level encryption |
| **D**enial of Service | High-volume extension posts or login brute-force | Outage | Per-user/IP rate limits; WAF; autoscaling; exponential backoff; circuit breakers |
| **E**levation of Privilege | Bypass org isolation to read others’ data | Catastrophic | RLS enforced; integration tests for policy; deny on missing org; RBAC; code reviews on access layers |

## Additional Scenarios
- **Supply chain compromise**: malicious NPM package → Pin deps, audit, allowlist registry, CodeQL/Semgrep, SBOM, runtime egress rules.
- **CI leaks secret**: PR exfiltration → OIDC to cloud, least-privilege, masked secrets, no secrets in PR builds, branch protections.
- **Gmail webhook abuse**: forged pushes → verify Google signed messages; if polling, respect API quotas/backoff.
- **Extension update hijack**: fake extension id → validate official extension ID server-side; monitor version; kill-switch tokens.

## Assumptions (documented)
- Users consent to connect Gmail and understand what is stored.
- We control DNS/TLS and deploy only signed images.
- Cloud provider IAM is correctly configured with least privilege.

## Residual Risks
- Heuristic email matching can mis-link occasionally → manual override and timeline log; threshold tuning.
- Website DOM changes can break scrapers → fallback smart-copy; adapter versioning; telemetry on failure rates.
