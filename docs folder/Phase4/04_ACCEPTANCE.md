
# PocketJob — Phase 4: Acceptance Criteria

Use this checklist to confirm Gmail integration is specification-complete for V1 before coding.

## Connection & Sync
- [ ] Gmail connect/disconnect works with clear UI and read-only scope.
- [ ] Initial backfill 60 days completes; progress visible.
- [ ] Ongoing sync via Watch or Polling receives new emails within a few minutes.

## Data & Mapping
- [ ] Stored only metadata + snippet; no full body by default.
- [ ] Thread and message IDs unique per org+provider.
- [ ] Attachments stored as metadata only.
- [ ] Field mapping matches `04_EMAIL_MAPPING.md`.

## Linking & Status
- [ ] Deterministic linking by thread id or company domain when possible.
- [ ] Heuristics kick in when needed; ambiguous → needs_review; unassigned → Inbox tab.
- [ ] Status auto-changes to `rejected` or `no_response` as per rules.
- [ ] Manual overrides persist and are audited.

## Privacy & Security
- [ ] Tokens encrypted with KMS; revocation works.
- [ ] Rate limits and backoff implemented to respect Gmail quotas.
- [ ] Audit logs for link/unlink and status automation.
- [ ] No PII in logs; only counts and IDs.

If all boxes are checked, we’re ready to move to **Phase 5 — Backend/API & Tenancy Spec**.
