
# PocketJob — Phase 6: UX Copy (V1)

Tone: friendly, short, helpful. Avoid jargon. Encourage, don’t shame. Target: younger audience (vibrant, playful but clear).

---

## Global
- App name: **PocketJob**
- Primary actions: **Save**, **Connect**, **Open**, **Try again**
- Secondary: **Cancel**, **Dismiss**
- Status labels: **in progress**, **rejected**, **no response**
- Date style: `YYYY-MM-DD`

Toast durations: success 3s, info 4s, error sticky until dismissed.  
Shortcut hints (tooltips) use `⌘` on Mac, `Ctrl` on Windows.

---

## Navigation
- **Dashboard**
- **Applications**
- **Emails**
- **Search**
- **Settings**

Empty state subtitle style: short single sentence. CTA button follows.

---

## Onboarding
- Title: **Welcome to PocketJob**
- Subtitle: *Save jobs in one click. Let us link your emails automatically.*
- Step 1 card: **Install the Chrome extension**  
  Body: *Capture listings from LinkedIn, Indeed, ZipRecruiter and more.*  
  Button: **Get the extension**
- Step 2 card: **Connect Gmail (optional)**  
  Body: *We read subject, sender and a short snippet—no full bodies in V1.*  
  Button: **Connect Gmail**
- Later link: **Skip for now**

---

## Dashboard
- Header empty state (no apps yet):  
  Title: **Let’s save your first job**  
  Body: *Open a job post and hit the PocketJob icon.*  
  Button: **Get the extension**
- Widget titles: **This week**, **Top job**, **Captured emails**, **Follow‑ups**
- Follow‑ups hint: *These are close to 20 days with no reply.*

---

## Applications
- Table empty: **No applications yet** — *Use the extension or add one manually.*
- Manual add dialog:
  - Title: **Add application**
  - Fields: Title, Company, Source site, URL, Location, Salary (text), Applied date
  - Buttons: **Save**, **Cancel**
- Detail page:
  - Listing card heading: **Listing**
  - Emails tab heading: **Emails**
  - Notes & Tags heading: **Notes & tags**
  - Timeline heading: **Timeline**
- Status pill tooltips:
  - in progress: *We’re tracking this one.*
  - rejected: *Marked from an email or by you.*
  - no response: *20 days passed with no replies.*
- Relink thread dialog:
  - Title: **Link this email thread**
  - Body: *Choose the correct application. Future emails in this thread will follow.*
  - Buttons: **Link**, **Cancel**

---

## Emails
- Inbox (unassigned) empty: **No unassigned emails** — *New emails will show up here.*
- Needs review list: *We found more than one possible match. Pick one to finish linking.*
- Message row actions: **Open in Gmail**, **Link**, **Ignore**
- Safety note banner: *We store subject, sender and a short snippet—no full bodies.*

---

## Extension (popup)
- Title: **PocketJob**
- Detected state:
  - Subtitle: *We found this job on {site}.*
  - Fields: Title, Company, Location, Salary, URL, Description (short)
  - Buttons: **Save to PocketJob**, **Smart Copy**
- Smart Copy guide:
  - Step 1: *Click the job title on the page.*
  - Step 2: *Click the company name.*
  - Step 3: *Select salary and a short description.*
  - Button: **Save**
- Saved state: **Saved!** — *Open in PocketJob →*
- Queue state (offline): **Saved to queue** — *We’ll send it when you’re online.*

---

## Settings
- Section: **Email**
  - Card title: **Gmail connection**
  - Body: *Read‑only access. We store metadata + snippet only.*
  - Buttons: **Connect Gmail**, **Disconnect**
  - Status text: **Connected**, **Revoked**, **Sync error**
- Section: **Extension**
  - Card title: **Chrome extension**
  - Body: *Use a short‑lived token to send listings securely.*
  - Button: **Create token**
- Section: **Privacy**
  - Export: **Download my data**
  - Delete: **Delete my account**
  - Region note: *Data hosted in North America.*

---

## Errors (friendly messages mapped to error codes)
- `UNAUTHORIZED`: **Please sign in to continue.**
- `FORBIDDEN`: **You don’t have access to that.**
- `NOT_FOUND`: **We couldn’t find that.** — *It may have been moved or removed.*
- `CONFLICT`: **Looks like this job is already saved.**
- `PRECONDITION_FAILED`: **Missing info.** — *Try again from the extension.*
- `VALIDATION_FAILED`: **Check the highlighted fields.**
- `RATE_LIMITED`: **Too many tries.** — *Please wait a moment and try again.*
- `TOKEN_EXPIRED`: **Your connection expired.** — *Reconnect to keep going.*
- `GMAIL_QUOTA_EXCEEDED`: **Gmail is rate‑limiting us.** — *We’ll retry soon.*
- Unknown: **Something went wrong.** — *We’re on it.*

---

## Confirmations
- Delete application: **Delete this application?** — *You can’t undo this.*
- Unlink thread: **Unlink email thread?** — *You can relink later.*

---

## Accessibility copy
- Labels match visible text.  
- Descriptive alt text: *Company logo for {company}*.
- Keyboard hints in tooltips: *Press Enter to save, Esc to cancel.*
