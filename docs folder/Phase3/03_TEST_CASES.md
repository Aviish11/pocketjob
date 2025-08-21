
# PocketJob — Phase 3: Extension Manual Test Cases

> Run these by hand on real sites before coding the backend. Keep screenshots in the repo under `qa/`.

## Common Pre-Reqs
- You are signed into PocketJob web app and have generated an **Extension Token** (Settings -> Connect Extension).
- Extension is installed from local build or dev store.
- Network reachable; capture console logs if issues.

---

## 1) LinkedIn Job Post
**Steps**
1. Open a job post on `linkedin.com/jobs`.
2. Click the PocketJob icon.
3. Verify fields: title, company, location, salary (if present), URL auto-filled.
4. Edit the title (append “(test)”) and Save.
5. Disconnect network; try Save again -> verify item queued; reconnect -> verify auto-flush.

**Expected**
- Payload contains correct fields; app shows new Application with status `in_progress`.
- Idempotency: Saving the same post twice shows “Already saved” flow.

---

## 2) Indeed Job Post
**Steps**
1. Open an Indeed job post.
2. Try both detected mode and **Smart Copy** mode (force by clicking “Use Smart Copy”).
3. Select fields visually and Save.

**Expected**
- Extracted fields are correct in either mode; description trimmed if very long.
- Confidence indicator visible when detection is unsure.

---

## 3) ZipRecruiter Job Post
**Steps**
1. Open ZipRecruiter job.
2. Verify salary_text and description captured.
3. Save; then immediately save again to test idempotency.

**Expected**
- Second save deduped using Idempotency-Key.

---

## 4) ATS (Greenhouse/Lever/Workday/SmartRecruiters)
**Steps**
1. Open one post from each ATS.
2. Verify JSON-LD parsing (if present) fills fields accurately.
3. Break selector (simulate DOM change via DevTools) -> ensure Smart Copy path works.

**Expected**
- Robust extraction or graceful Smart Copy fallback.

---

## 5) Token Expiration
**Steps**
1. Invalidate Extension Token in the app (Settings -> Revoke).
2. Try saving again from extension.

**Expected**
- Extension shows “Reconnect Extension” and blocks posting until renewed.

---

## 6) Offline Queue & Alarm Retry
**Steps**
1. Go offline; save 3 different posts.
2. Return online; wait for background alarm or click “Retry Now”.

**Expected**
- All entries flush in order; successes removed from queue; failures remain with error badge.

---

## 7) Privacy & Logs
**Steps**
1. Check extension’s console logs.
2. Verify no PII (email addresses, tokens) is logged.
3. Verify telemetry only sends counts and site keys if opt-in is enabled.

**Expected**
- Clean logs; privacy preserved.

---

## 8) Accessibility
**Steps**
1. Navigate popup via keyboard only (Tab/Shift+Tab/Enter/Escape).
2. Screen reader labels present for fields and buttons.

**Expected**
- Fully operable without mouse; labels read correctly.

---

## 9) Visual QA
- Icons render crisp.
- Vibrant but readable color palette.
- Error states legible; success toast disappears after 3–5s.
