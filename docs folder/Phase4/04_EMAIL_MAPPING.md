
# PocketJob — Phase 4: Gmail Field Mapping

## Gmail → PocketJob

| Gmail Field | PocketJob Field | Notes |
|------------|------------------|-------|
| `thread.id` | EmailThread.thread_external_id | Unique per provider+org |
| `message.id` | EmailMessage.message_external_id | Unique per provider+org |
| `payload.headers["From"]` | EmailMessage.from_address / from_display | Parse display + address |
| `payload.headers["To"]` | EmailMessage.to_addresses[] | Array of addresses |
| `payload.headers["Cc"]` | EmailMessage.cc_addresses[] | Array |
| `payload.headers["Subject"]` | EmailMessage.subject | String |
| `snippet` | EmailMessage.snippet | Short preview from Gmail |
| `internalDate` | EmailMessage.sent_at | Convert to timestamp |
| `payload.headers["Message-ID"]` | EmailMessage.headers_light.message_id | For threading hints |
| `payload.headers["References"]` | EmailMessage.headers_light.references | Optional |
| `payload.headers["In-Reply-To"]` | EmailMessage.headers_light.in_reply_to | Optional |
| `payload.parts[].filename` | Attachment.filename | Only metadata in V1 |
| `payload.parts[].mimeType` | Attachment.mime_type | Only metadata |
| `payload.parts[].body.size` | Attachment.size_bytes | Only metadata |

**Derived/Computed**
- `EmailThread.application_id` set via linking logic (see spec).
- `EmailMessage.rejection_score` computed from rules/keywords.

**Normalization**
- Lowercase domains, trim whitespace.
- Decode MIME-encoded subjects (e.g., `=?UTF-8?...?=`).

**PII Minimize**
- Do not store full bodies in V1; only snippet + selected headers.
