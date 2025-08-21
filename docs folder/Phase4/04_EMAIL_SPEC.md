
# PocketJob — Phase 4: Email Integration Spec (Gmail, V1)

## Goal
Automatically capture **job-related emails** and display them under the correct **Application** without storing full email bodies by default.

---

## 1) Provider & Scope (V1)
- **Provider:** Gmail only (Outlook later).
- **OAuth scopes:** `https://www.googleapis.com/auth/gmail.readonly` (read-only).
- **Consent:** Clear, plain-English description of what we read/store.
- **Revocation:** User can disconnect anytime (Settings).

---

## 2) Connection Flow (User Experience)
1. User opens **Settings → Email** and clicks **Connect Gmail**.
2. We redirect to Google OAuth screen; user consents.
3. On success, we store provider tokens (encrypted) and start **initial backfill** (last 60 days).
4. After backfill, the **sync worker** listens for new messages (push via Gmail watch if feasible; otherwise polite polling).

**Status UI:**
- Connection status: Connected / Revoked / Error.
- Last sync time; messages processed; errors (if any).
- Button: Disconnect; Button: Re-run backfill (advanced).

---

## 3) Sync Strategy
### Option A: Watch (preferred)
- Use Gmail **Watch** API (requires Pub/Sub or webhook relay).
- On notification, fetch thread(s) delta.

### Option B: Poll (fallback/simple dev)
- Cron job every 3–5 minutes per connected account.
- Respect Gmail rate limits; exponential backoff on errors.

**Backfill Window (V1):** last **60 days** of messages (configurable later).

**Idempotency:** Use Gmail `message.id` and `thread.id` unique per org + provider to avoid duplicates.

---

## 4) Message Selection (What to fetch)
- Fetch **Inbox + Sent** labels only (ignore Spam/Trash).
- Lightweight search filter for relevance to job applications:
  - Subjects containing: “application”, “applied”, “position”, “interview”, “candidate”, “assessment”, “ATS” (lever, greenhouse, workday), “thank you for applying”
  - From domains containing known ATS/recruiting domains (lever.co, greenhouse.io, smartrecruiters.com, workday.com, myworkdayjobs.com, icims.com, workablemail.com), plus company domain if we have it.
  - If no filter match: still ingest but mark **low_relevance**; user can hide later.

> We always allow manual relinking and we keep a light footprint: metadata + snippet only.

---

## 5) Data We Store (V1)
- **EmailThread**: provider (gmail), `thread_external_id`, `application_id` (nullable), `last_message_at`.
- **EmailMessage**: `message_external_id`, `from_address`, `from_display`, `to_addresses[]`, `cc_addresses[]`, `subject`, `snippet`, `sent_at`, `headers_light` (e.g., `Message-ID`, `References`, `In-Reply-To`), `rejection_score` (0..1).
- **Attachment** (only metadata): name, mime, size. (No content save in V1).
- **No full body stored by default**. Future toggle may allow body storage.

All rows include `org_id` for isolation.

---

## 6) Linking Logic (Thread-First Approach)
**Deterministic before heuristic:**

1) If `EmailThread.application_id` already set → link all new messages in this thread to that Application.

2) Determine candidate Application(s) by:
- **Company domain** matches sender domain (e.g., `@acme.com` → Application with Company.website_domain = acme.com).
- **Company name** (normalized) appears in `from_display` or `subject`.
- **Listing post URL tokens** show up in body/subject (rare but if present).
- **User-initiated linking**: if user links this thread once, future messages follow automatically.

3) Results:
- If one candidate → link thread to that Application (and future messages).
- If multiple candidates → mark **needs_review**.
- If none → show in **Inbox** tab (unassigned) for manual linking.

**Manual Override Always Wins.**

---

## 7) Status Automation (from Email Signals)
- **rejected** when a new incoming message’s `rejection_score ≥ 0.8` based on keyword rules:
  - Subject/body keywords: “unfortunately”, “regret to inform”, “decided not to move forward”, “another candidate”, “won’t be moving forward”.
  - Sender domain from ATS or company domain.
  - Optional negative keywords to avoid false positives (e.g., “reject” in context of unrelated content).
- **no_response** when `now - applied_at ≥ 20 days` and no incoming messages from company in the thread.
- UI shows **why** the status changed (email date+subject).

---

## 8) Gmail API Calls (Minimal)
- `users.messages.list` with search query window and/or label filters.
- `users.messages.get` (format=metadata or minimal) to retrieve headers and snippet.
- `users.threads.get` for thread grouping and `historyId` when using Watch.
- Rate-limit and cache thread lookups to minimize API calls.

**Search Query (example V1):**
```
label:inbox OR label:sent
-newer_than:60d
(subject:application OR subject:applied OR subject:position OR subject:interview OR subject:candidate OR subject:assessment OR subject:thank-you OR subject:thank-you-for-applying)
OR from:(@lever.co OR @greenhouse.io OR @smartrecruiters.com OR @workday.com OR @myworkdayjobs.com OR @icims.com OR @workablemail.com)
```
(_Exact filters will be iterated during testing._)

---

## 9) Privacy & Permissions
- We request **read-only** scope.
- We store **metadata + snippet** (no full body).
- We do **not** share or sell data.
- Clear UI to **Disconnect** and **Delete** synced email data.
- We’ll pass Google OAuth verification prior to public release.

---

## 10) Error Handling
- **Token expired/invalid** → mark EmailAccount status=revoked; show reconnect CTA in UI.
- **Rate limited** → exponential backoff with jitter.
- **Partial failures** → per-message retries; never block the whole account.
- **Thread missing** (rare) → fetch by message id and create thread.

---

## 11) Observability & Audit
- Log sync begins/ends, messages processed, errors counts (no PII).
- Audit when a thread is linked/unlinked, status auto-changed, user manual overrides.
- Metrics: link rate %, rejection auto-detect accuracy, backfill completion time.

---

## 12) Future (Outlook & Bodies)
- Outlook/Microsoft Graph support with similar read-only scope.
- Optional setting to store **full bodies** (with clear consent).
- Basic NLP model to improve rejection/next-step detection.
