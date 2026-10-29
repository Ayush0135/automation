---
name: api-discovery-and-verification
description: Procedures for researching, prototyping, verifying, and integrating Instagram and Meta Ad Library video discovery APIs and third-party data providers.
---

# API Discovery & Verification: Instagram & Meta Video Sourcing

Apply this skill when researching, validating, testing, and integrating APIs or third-party providers for Instagram Reels and Meta Ad Library video discovery.

## 1. Documentation & Capability Verification

- **Primary Source First**: Read the current official API documentation (Meta Graph API, Meta Ad Library API, Instagram Basic Display / Graph API, or third-party providers like Apify, RapidAPI, ScrapingBee) prior to implementing client code.
- **Feasibility Checklist**: Prior to writing integration code, verify:
  - Required API permissions and app review requirements.
  - Geographic/country restrictions (e.g., EU political ad limits, regional availability).
  - Search query parameters supported (keywords, page IDs, hashtags, advertiser country).
  - Pagination limits, cursors, and rate-limiting quotas (requests/hour, concurrent calls).
  - Media accessibility: direct MP4 video URLs vs. embedded iframes vs. CDN token expiration times.

## 2. Third-Party Provider Evaluation

- **Commercial & Policy Due Diligence**: When evaluating non-official or scraper providers:
  - Check documented API pricing, per-request/credit costs, and concurrency limits.
  - Review provider terms of service regarding data storage and redistribution.
  - Assess uptime and maintenance track record.
- **Isolated Proof of Concept (PoC)**:
  - Build a minimal, single-file proof-of-concept script for each provider before adding it to dashboard backend pipelines.
  - Validate response payload structure, video link validity, and latency.

## 3. Credential Security & Environment Management

- **Zero-Exposure Policy**: All API keys, tokens, client secrets, and access cookies must reside in environment variables (e.g. `.env.local`).
- **Client Sanitization**: Never expose secret keys in client-facing bundles, network requests initiated from the browser, or public git commits.
- **Redacted Logging**: Scrub tokens, auth headers, and session credentials from stdout, console logs, and error traces.

## 4. Truth in Data & Result Classification

- **Explicit Result Stages**: Accurately categorize discovery records into one of four distinct stages:
  1. *Raw Discovery*: Post or ad URL identified matching search terms.
  2. *Accessible Media*: Video stream or thumbnail URL successfully fetched and verified accessible.
  3. *AI-Matched*: Computer vision or embedding similarity score calculated against the target product.
  4. *Verified Product Match*: Confirmed match validated by brand handle, barcode, SKU, or human confirmation.
- **No Hallucinated Data**: Never fabricate mock IDs, synthetic URLs, fake thumbnails, or fake match counts in real runs.
- **Segregated Mocks**: If test mocks are required for UI development or automated testing, clearly prefix them (`mock_reel_123`, `is_mock: true`) and isolate them from production datasets.

## 5. Resilience & Rate Limiting

- **Defensive Networking**:
  - Configure explicit connection and read timeouts on all outbound requests (e.g., 10-15s).
  - Implement exponential backoff with jitter on HTTP `429 Too Many Requests` or `5xx Server Error`.
  - Enforce token bucket or sliding-window rate limiters to avoid provider bans.
- **Strict Validation**: Validate API responses against expected schemas (e.g., Zod, Pydantic, or typed interfaces) before propagating data downstream.
- **Descriptive Error Handling**: Transform raw network failures into categorized application errors (e.g., `RATE_LIMITED`, `TOKEN_EXPIRED`, `GEO_RESTRICTED`, `PARSE_ERROR`).

## 6. Blocker Escalation Protocol

- When progress is impeded by missing API tokens, pending account approvals, credit exhaustion, or 2FA/CAPTCHA challenges:
  - Document the exact blocker with the provider name, endpoint URL, HTTP response code, and required user resolution action.
  - Immediately continue independent tasks (UI polish, mock workflows, schema design, state handling) while awaiting resolution.

## 7. Attribution & Compliance

- Preserve original author handles, post links, advertiser names, and ad IDs in results.
- Comply with platform branding rules and avoid caching media beyond the provider's permitted caching window.
