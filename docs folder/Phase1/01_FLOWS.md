
# PocketJob — Phase 1: User Flows

## Overview
These flows describe how a beginner user interacts with PocketJob from first-time setup to daily use. No coding yet; this is our blueprint.

---

## 1) Sign up & Onboarding
**Goal:** Create account, connect Gmail (optional at first), install extension.

**Steps**
1. User visits app -> clicks **Sign up**.
2. Create account (email + password) or Google sign-in.
3. Optional: **Connect Gmail** (one button). Explains read-only access and what we store.
4. Prompt to **Install Chrome Extension** with a one-liner why it helps.
5. Land on **Dashboard** (empty state with tips).

**Success**
- Account created.
- (Optional) Gmail connected.
- Extension installed or user knows how to install later.

---

## 2) Save a job from a site (LinkedIn/Indeed/ZipRecruiter)
**Goal:** Grab listing info while user is applying and send to app automatically.

**Steps**
1. User opens a job post.
2. Clicks the **PocketJob extension icon**.
3. Extension detects site -> runs the site adapter -> fills captured fields:
   - Title, company, location, salary, job type, post URL, source site, description (when accessible), posted date.
4. User can edit any field (quick review).
5. Click **Save to PocketJob**.
6. If offline or API unreachable, extension queues locally and retries.

**Success**
- New Application created with Listing data and initial **status = “in_progress”**.
- Activity appears in app within seconds.

**Fallback**
- If site markup changed, user can select text areas (smart copy) -> extension maps them to fields and saves.

---

## 3) Automatic Email Linking
**Goal:** Show all emails related to a specific application automatically.

**Steps**
1. Onboarding suggested Gmail connect (or Settings -> Connect Gmail).
2. After connect, app performs an **initial backfill** (e.g., last 60 days) and then listens for new messages.
3. Matching logic tries to link each email to an application using (in order):
   1) **Thread or message references** if previously linked.
   2) **Exact sender/recipient domain** matching company domain.
   3) **Company keyword** in display name or subject (e.g., “Acme”).
   4) **Post URL tokens** appearing in email body/subject (rare, but supported).
4. If more than one match, email is put into **Review** tab for manual linking.
5. User can **relink** an email to the correct application; future emails in the same thread inherit the link.

**Success**
- New emails appear under the right **Application > Emails** section automatically.

---

## 4) Application Detail Page
**Goal:** See everything about a single application in one place.

**Sections**
- **Header:** Title · Company · Source site · Applied date · Current status
- **Listing card:** Job URL, salary, location, job type, description snippet (expand)
- **Emails tab:** All linked emails (latest on top) with quick actions (open in Gmail, mark as read-only).
- **Notes & Tags:** Personal notes, tags (e.g., “dream-job”, “remote”).
- **Timeline:** Activity log (saved, status changes, emails received).

**Actions**
- Change status manually.
- Add notes, tags.
- Fix email linkage.

---

## 5) Dashboard Home
**Goal:** Quick pulse on the week and important items.

**Widgets**
- **This week’s applications:** Count, list preview.
- **Top job applied:** Highest salary or seniority (configurable rule; default salary).
- **Email inbox (captured):** Latest relevant emails.
- **Status summary:** In progress / Rejected / No response.
- **Follow-up nudges:** Apps approaching **20-day no-response** threshold.

---

## 6) Status Automation
**Rules**
- **in_progress:** Default when saved via extension (or manually created).
- **rejected:** When an email matches common rejection patterns (see Email Rules below) or user sets manually.
- **no_response:** If no reply or status change **20 days** after the **applied_at** date (user-adjustable setting later).

**Email Rules (high level)**
- Subject/body regex/keywords like: “unfortunately”, “we regret to inform”, “moved forward with other candidates”, etc.
- Whitelist/blacklist: respect manual overrides.

---

## 7) Search & Filters
- Search across title/company/tags.
- Filters by status, date applied, source site, salary range.
- Sorting by most recent, salary, company A–Z.

---

## 8) Error/Edge Handling
- Extension offline -> queue and retry with exponential backoff.
- Duplicate detection: same post URL + same user -> dedupe and update timestamps.
- Email API limits -> backoff and resume gracefully.
- Manual override always wins (user trust).

