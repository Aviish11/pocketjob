
# PocketJob — Phase 1: Wireframes (Text)

> These are low-fidelity, text wireframes to align on layout. Real UI will be vibrant and aesthetic for a younger audience in implementation.

---

## A) Dashboard (Home)

[Header]  PocketJob | +Add | Search [________]

[Row]
(Widget) This Week
  • Applied: 7
  • In progress: 5
  • Rejected: 1
  • No response: 1

(Widget) Top Job
  • Title: Frontend Intern
  • Company: Acme
  • Salary: $80k
  • [Open Application]

(Widget) Captured Emails
  • [Yesterday] Recruiter at Acme — “Next steps”
  • [2d ago] Indeed — “Application received”
  • [3d ago] ZipRecruiter — “We’ve submitted your app”
  • [See all]

(Widget) Follow-ups
  • 3 apps close to 20 days — [View list]

[Table] Applications
| Title                 | Company | Source      | Status       | Applied        | Salary |
|-----------------------|---------|-------------|--------------|----------------|--------|
| Frontend Intern       | Acme    | LinkedIn    | in_progress  | 2025-08-02     | 80k    |
| Data Analyst          | Globex  | Indeed      | no_response  | 2025-07-25     | 75k    |
| Support Specialist    | Initech | ZipRecruiter| rejected     | 2025-08-01     | 60k    |

---

## B) Application Detail

[Breadcrumb] Dashboard > Applications > Frontend Intern @ Acme

[Header]
Title: Frontend Intern | Company: Acme
Status: [ in_progress ▼ ]   Applied: 2025-08-02   Source: LinkedIn
[Button] Open Listing   [Button] Add Note   [Button] Add Tag

[Two-column]
(Left) Listing
  - URL: https://linkedin.com/jobs/...
  - Location: Remote (US)
  - Salary: 80k–95k
  - Description (expand/collapse)

(Right) Emails
  - [Yesterday] Recruiter — “Next steps” [Open in Gmail]
  - [2d ago] Auto — “We got your application”
  - [Relink] [Mark irrelevant]

[Section] Notes & Tags
  - Notes (rich text)
  - Tags: dream-job, remote

[Section] Timeline
  - 2025-08-02 Saved from LinkedIn
  - 2025-08-03 Email linked: “Application received”

---

## C) Extension Popup

[Popup]
PocketJob
[Detected] LinkedIn Job

Title: [Frontend Intern                ]
Company:[Acme                          ]
Salary: [80k–95k                       ]
Location:[Remote                       ]
URL:    [https://linkedin.com/jobs/... ]
[Save to PocketJob]

[If detection fails]
[Smart Copy Mode]
  Select title/ company/ salary/ description on page
  [Save]
