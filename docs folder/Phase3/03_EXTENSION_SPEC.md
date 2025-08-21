# PocketJob — Phase 3: Chrome Extension Specification (Manifest V3, No Code)

## 0) Goal

Capture job listing info from major job sites and send it securely to the PocketJob API with minimal permissions, great UX, and offline resilience.

---

## 1) Extension Overview

- **Manifest:** v3
- **Name:** PocketJob – Job Saver
- **Surfaces:** Browser action popup, content script, background service worker
- **Data flow:** Content script extracts fields -> Popup lets user review/edit -> Background posts to API with short-lived **Extension Token** -> App creates/updates Application + Listing.

---

## 2) Permissions (least privilege)

- `"host_permissions"` (allowlist):
  - `https://*.linkedin.com/jobs/*`
  - `https://*.indeed.com/*`
  - `https://*.ziprecruiter.com/*`
  - `https://*.glassdoor.com/*`
  - `https://*.lever.co/*`
  - `https://*.greenhouse.io/*`
  - `https://*.workdayjobs.com/*`
  - `https://*.smartrecruiters.com/*`
  - (Future: editable in app settings and pushed via remote config)
- `"permissions"`:
  - `"storage"` (save user prefs, small offline queue)
  - `"activeTab"` (user-initiated access for smart-copy fallback)
  - `"scripting"` (inject content script on demand if needed)
  - `"alarms"` (retry queued submissions)
- **No** broad `<all_urls>`; keep host list short and clear.

---

## 3) Manifest Skeleton

```json
{
  "manifest_version": 3,
  "name": "PocketJob – Job Saver",
  "version": "0.1.0",
  "action": { "default_popup": "popup.html" },
  "background": { "service_worker": "bg.js", "type": "module" },
  "permissions": ["storage", "activeTab", "scripting", "alarms"],
  "host_permissions": [
    "https://*.linkedin.com/jobs/*",
    "https://*.indeed.com/*",
    "https://*.ziprecruiter.com/*",
    "https://*.glassdoor.com/*",
    "https://*.lever.co/*",
    "https://*.greenhouse.io/*",
    "https://*.workdayjobs.com/*",
    "https://*.smartrecruiters.com/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "https://*.linkedin.com/jobs/*",
        "https://*.indeed.com/*",
        "https://*.ziprecruiter.com/*",
        "https://*.glassdoor.com/*",
        "https://*.lever.co/*",
        "https://*.greenhouse.io/*",
        "https://*.workdayjobs.com/*",
        "https://*.smartrecruiters.com/*"
      ],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/16.png",
    "48": "icons/48.png",
    "128": "icons/128.png"
  }
}
```

---

## 4) Data Model (extension-side payload)

Field names match backend contract (see Phase 5 plan).

```ts
type SaveListingPayload = {
  extension_version: string;
  site:
    | "linkedin"
    | "indeed"
    | "ziprecruiter"
    | "glassdoor"
    | "lever"
    | "greenhouse"
    | "workday"
    | "smartrecruiters"
    | "other";
  post_url: string;
  title?: string;
  company?: string;
  location?: string;
  salary_text?: string;
  job_type?: string; // full-time/part-time/contract/intern
  description?: string; // short text, trimmed
  posted_at_iso?: string; // if available
  captured_at_iso: string; // now()
  user_notes?: string; // optional quick note from popup
  dedupe_key?: string; // hash of site+post_url
};
```

---

## 5) Site Adapters (DOM extraction)

Each supported site has a small adapter module implementing:

```ts
interface Adapter {
  matches(url: URL): boolean;
  extract(doc: Document, url: URL): Partial<SaveListingPayload>;
  confidence: number; // 0..1 heuristic score
  version: string; // bump when DOM selectors change
}
```

- `content.js` imports an **adapter registry** and picks the best `matches()`.
- Extraction uses **stable selectors** when possible; fallback to semantic cues (e.g., `itemprop`, meta tags, OpenGraph).
- If low `confidence < 0.6`, popup shows **Smart Copy** suggestion.

**Example fields by site (indicative):**

- **LinkedIn**: `[data-test-id="job-details"]`, OG tags for title/company, salary chips.
- **Indeed**: `#jobDescriptionText`, `.jobsearch-JobInfoHeader-title-container`.
- **ZipRecruiter**: `[data-testid="job_description"]`, company/title headers.
- **ATS (Lever/Greenhouse/Workday/SmartRecruiters)**: use structured JSON in `<script type="application/ld+json">` if present.

---

## 6) Popup UX (beginner-friendly)

**States:**

1. **Detected**: Pre-filled fields -> user can edit -> **Save** button.
2. **Smart Copy**: User clicks “Smart Copy” -> guided selection:
   - User clicks title -> highlighted -> mapped to Title.
   - Repeats for company, salary, description.
   - Shows preview -> **Save**.
3. **Saved**: Success toast + “Open in PocketJob” link.

**Validation:**

- Require `post_url` & `title` minimally; warn if `company` missing.
- Trim long description (>10k chars) and note “trimmed” in payload meta.

**Accessibility:**

- Keyboard focus order, ARIA roles, readable defaults.

---

## 7) Background/Network

- Endpoint: `POST https://api.pocketjob.app/v1/extension/listings`
- Auth: `Authorization: Bearer <EXT_TOKEN>` (scoped, 30 min TTL). Rotated by the web app when you click “Connect Extension”.
- **Retry logic**: exponential backoff (e.g., 2s, 5s, 10s, 30s; max 5 attempts).
- **Offline queue**: stored in `chrome.storage.local` as FIFO with size cap (e.g., 100 items). Background alarm flushes when online.
- **Idempotency**: `Idempotency-Key` header with `dedupe_key`. Backend returns 200 or 201; repeated keys return cached result.

---

## 8) Security Controls (extension)

- No secrets baked in code; the **Extension Token** is user-specific and short-lived.
- Validate **official extension ID** on server; reject unknown origins.
- Enforce **Content Security Policy** in extension pages (no `unsafe-inline`).
- Remove PII from logs; only high-level telemetry (counts/success/failure, site and adapter version) if user opts in.

---

## 9) Privacy & Compliance Notes

- Extension extracts only **user-visible** listing data from the current page the user is on.
- No background scraping of unrelated pages.
- User can see and edit data before sending.
- Telemetry is **opt-in** and anonymous.

---

## 10) Error Handling & Messaging

- If extraction fails -> show Smart Copy with 3-step guide.
- If network fails -> “Saved to queue, will retry automatically” + View Queue button.
- If token expired -> show “Reconnect Extension” CTA linking to app Settings.
- Dedupe collision -> show “Already saved on <date> — Open Application”.

---

## 11) Remote Config (optional, future)

- App hosts a JSON with adapter overrides, new host patterns, and blocked versions (kill switch) fetched daily by background worker.
- Signed with backend to prevent tampering.

---

## 12) Deliverables from this Spec (when we move to coding)

- `manifest.json`, `content.js`, `popup.html/js/css`, `bg.js`, `adapters/*`, `icons/*`
- E2E tests using Playwright + Chrome in CI (headless mode) later.
