
# PocketJob — Phase 1: Acceptance Checklist

Use this to confirm the Phase 1 design is complete and clear before coding.

## Flows clarity
- [ ] Onboarding covers sign up, optional Gmail connect, extension install.
- [ ] Extension flow covers detection, edit-before-save, offline queue, fallback smart copy.
- [ ] Email linking describes backfill and new-message handling.
- [ ] Application Detail page sections are clear (Listing, Emails, Notes/Tags, Timeline).
- [ ] Dashboard widgets match v1 goals (week count, top job, captured emails, status summary, follow-ups).

## Data model sufficiency
- [ ] Entities cover applications, listings, companies, users, email accounts/threads/messages, tags, notes, activity logs.
- [ ] Fields support status automation (applied_at, rejection_score, last_message_at).
- [ ] Indexes and uniqueness constraints prevent duplicates and ensure fast filters.
- [ ] Relationships allow manual re-linking of emails and future team sharing.

## Automation rules
- [ ] `in_progress` set on create; `rejected` via email rules; `no_response` after 20 days with no replies.
- [ ] Manual overrides always win and are logged.

## Privacy-first stance
- [ ] Email data minimized to metadata + snippet initially.
- [ ] org_id exists on every table for isolation.
- [ ] Clear path to user setting for the 20-day rule later.

If all checked, we are ready for **Phase 2 — Security & Privacy by Design**.
