
# PocketJob — Phase 6: Metrics & Analytics (Privacy‑Preserving)

## North Star
**NSM:** % of applications with at least one correctly linked email within 48 hours of creation.  
Why: reflects real value (centralization + automation).

## Core KPIs
- **Activation**
  - Time to First Save (TTFS): median minutes from signup -> first saved listing
  - % users who install extension within 24h
  - % users who connect Gmail within 24h
- **Engagement**
  - Weekly Active Users (WAU)
  - Weekly Applications Saved (WAS)
  - % applications created via extension (vs manual)
- **Quality**
  - Email link rate (%) and precision/recall on labeled samples
  - Auto‑status accuracy (% of correct `rejected`/`no response`)
  - Dedupe rate (% duplicate attempts correctly handled)
- **Reliability**
  - Extension queue success rate
  - Gmail sync latency p50/p95 (new email -> visible)
  - Error budgets (5xx rate, webhook failures)
- **Retention**
  - D7, D30 retention
  - % users with recurring weekly saves

## Activation Funnel (targets v1)
1) signup_started -> 2) signup_completed (90%) ->  
3) extension_token_minted (60%) -> 4) first_listing_saved (55%) ->  
5) gmail_connected (35%) -> 6) first_email_linked (30%) ->  
7) first_status_auto_changed (20%)

## Event Taxonomy (no PII, hashed identifiers where needed)
- `signup_completed` { user_id, org_id }
- `extension_token_minted` { org_id, token_id_hash }
- `listing_saved` { org_id, site, post_url_hash, via:"extension|manual" }
- `application_created` { org_id, application_id }
- `email_thread_linked` { org_id, application_id, provider:"gmail" }
- `status_auto_changed` { org_id, application_id, from_status, to_status, reason:"rejection|no_response" }
- `status_manual_changed` { org_id, application_id, from_status, to_status }
- `queue_saved_offline` { org_id }
- `queue_flushed` { org_id, count }
- `sync_gmail_started` { org_id }
- `sync_gmail_completed` { org_id, messages, duration_ms }
- `error_occurred` { org_id, code }  // from 05_ERROR_CODES.md
- `dashboard_viewed`, `application_viewed`, `search_performed` { org_id }

**Property rules**
- Always include `org_id` and a `ts` timestamp.
- Hash sensitive strings (e.g., `post_url_hash`).
- No email addresses, message subjects, or bodies in analytics events.

## Dashboards
- **Activation:** funnel + TTFS
- **Engagement:** WAU, WAS, extension share
- **Quality:** link rate, auto‑status accuracy, dedupe rate
- **Reliability:** sync latency, queue success, 5xx rate
- **Retention:** D7/D30, weekly cohort curves

## Alerts (examples)
- Link rate < 70% for 2 hours
- Gmail sync latency p95 > 10 min
- Error rate > 2% over 10 min
- Extension 4xx spikes on `/extension/listings`

## Data Governance
- Storage: region NA; 13‑month retention for aggregate analytics.
- Opt‑out: user toggle in Settings → Privacy.
- Access: least privilege; analytics data separate from prod DB where possible.
- Sampling: allow 10–50% sample for high‑volume events.

## Implementation Notes
- Client sends events via batch (5–10 events) on unload/interval.
- Server sanitizes and drops disallowed properties.
- Consider self‑hosted analytics (privacy‑friendly). Disable third‑party ads/tracking.
