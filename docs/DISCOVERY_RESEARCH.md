# Video Discovery Feasibility & Technical Research Report

**Document Date:** October 29, 2026  
**Status:** Phase 0 Feasibility Analysis  
**Project:** Product Video Discovery Dashboard  

---

## 1. Executive Summary

Discovering 20 relevant Instagram Reels and 20 Meta Ad Library commercial video ads for arbitrary product queries faces significant platform restrictions in both official Meta APIs and third-party scrapers:

1. **Official Meta Ad Library API (`/ads_archive`)**:
   - **Critical Regional Restriction**: Programmatic access to ordinary commercial ads via the Graph API is **strictly limited to the EU and UK** (mandated by the EU Digital Services Act / UK transparency laws).
   - **India & Rest of World**: The official API **only** returns political, electoral, and social issue ads (`POLITICAL_AND_ISSUE_ADS`). Commercial ads for India **cannot** be retrieved via the official API, even though they appear on the public web UI.
   - **Media Accessibility**: The API provides snapshot links and transient media references; direct persistent MP4 video URLs are not guaranteed.

2. **Official Instagram Graph API**:
   - **No Arbitrary Keyword Search**: The official API does not provide a general keyword search across public Reels.
   - **Hashtag Discovery Limits**: Public media can only be retrieved via `ig_hashtag_search` and `/{hashtag_id}/recent_media`.
   - **Severe Quota**: Capped at a maximum of **30 unique hashtags per Instagram Business/Creator Account in a rolling 7-day period**.
   - **Restricted Reels Media**: The `media_url` field is frequently omitted or blank if the creator has disabled downloads or if licensed audio from the Instagram library is used.
   - **Prerequisites**: Requires an approved Business Account, Meta App Review for `instagram_public_content_access`, and Page linking.

3. **Recommended Multi-Tier Discovery Strategy**:
   - **Tier 1 (Official Meta APIs)**: Used when targeting EU/UK commercial ads or verified developer credentials exist.
   - **Tier 2 (Third-Party Providers - SearchApi / Apify)**:
     - SearchApi (`api.sh` / `searchapi.io`): Meta Ad Library engine (`engine=meta_ad_library`) with global country support (`country=IN` or `country=ALL`), keyword queries, and structured ad extraction.
     - Apify: Instagram search actors (`data-slayer~instagram-search-reels` or `apify~instagram-scraper`) providing direct reel URLs, thumbnails, and captions.
   - **Tier 3 (Deterministic Mock & Smoke Adapter)**: Fully reproducible, spec-compliant mock and staging adapter for reliable offline testing, UI verification, and visual AI matching validation.

---

## 2. Source Comparison Matrix

| Source / Provider | Target Content | Global / India Commercial Ads? | Keyword Search Supported? | Direct Video / Thumbnail Available? | Cost & Quota | Auth & Review Burden | Verified Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Meta Graph API (`/ads_archive`)** | Meta Ads (FB/IG) | ❌ **No** (EU/UK only for commercial; IN is political only) | ✅ Yes (`search_terms`) | ⚠️ Transient snapshot iframes; MP4 URL rarely returned | Free, rate-limited per app (~200 calls/hr) | **High**: Business Verification, ID verification, App Review | **VERIFIED** |
| **Instagram Graph API (`/ig_hashtag_search`)** | Instagram Reels / Posts | ⚠️ Only if tagged with hashtag | ❌ No (Hashtags only, no text keywords) | ⚠️ Thumbnail yes; video URL often blocked by audio DRM | Free, 30 unique hashtags per 7 days rolling | **High**: Facebook Login, App Review for `instagram_public_content_access` | **VERIFIED** |
| **SearchApi / API.sh (`engine=meta_ad_library`)** | Meta Ad Library Ads | ✅ **Yes** (Any country including India) | ✅ Yes (`q` parameter, `country=IN`) | ✅ Yes (ad snapshot URL, video previews, thumbnails) | Credit-based (~$0.004 per search query; free trial credits) | **Low**: Single API Bearer token | **VERIFIED** |
| **Apify (`instagram-scraper` / `search-reels`)** | Instagram Reels | ✅ Yes (Public Reels worldwide) | ✅ Yes (Keyword & hashtag search) | ✅ Yes (Direct MP4 URL when accessible, high-res thumbnail) | ~$1.00 - $5.00 per 1,000 items (includes $5 monthly free credits) | **Low**: Single Apify API token | **VERIFIED** |
| **Mock Engine Adapter** | Instagram & Meta Ads | ✅ Yes (Simulated authentic dataset) | ✅ Yes | ✅ Yes (Accessible sample MP4s, verified thumbnails) | Free | None | **VERIFIED** |

---

## 3. Official Meta Ad Library API Deep Dive

### 3.1 Endpoint Specification
- **Base Endpoint**: `GET https://graph.facebook.com/{version}/ads_archive`
- **Supported Fields**: `id`, `ad_creation_time`, `ad_creative_bodies`, `ad_creative_link_captions`, `ad_creative_link_titles`, `ad_delivery_start_time`, `ad_delivery_stop_time`, `ad_snapshot_url`, `page_id`, `page_name`, `publisher_platforms`, `spend`, `impressions`.

### 3.2 Geographic & Category Restrictions
- Querying `ad_type=ALL` with `ad_reached_countries=['IN']`: **FAILS or returns empty results**.
- Under Meta's compliance rules, only countries within the EU and the UK support `ad_type=ALL` for commercial transparency.
- For all other countries (including India and the United States), `ad_type` must be set to `POLITICAL_AND_ISSUE_ADS`.

### 3.3 Media Format Reality
- The API returns an `ad_snapshot_url` (an interactive iframe hosted on Facebook).
- It does **not** return a direct download link for the MP4 video file in the JSON response payload. To extract video frames for AI embeddings, the client must either scrape the snapshot iframe or use thumbnail previews provided in the creative preview nodes.

---

## 4. Official Instagram Graph API Deep Dive

### 4.1 Endpoint Specification
1. Find Hashtag ID:
   ```http
   GET https://graph.facebook.com/v20.0/ig_hashtag_search?user_id={ig_user_id}&q={keyword}&access_token={token}
   ```
2. Retrieve Recent Media:
   ```http
   GET https://graph.facebook.com/v20.0/{hashtag_id}/recent_media?user_id={ig_user_id}&fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token={token}
   ```

### 4.2 Key Blockers & Limitations
1. **The 30-Hashtag Ceiling**: An account is capped at querying 30 unique hashtags every 7 days. In an e-commerce dashboard querying multiple product variations, this quota can be exhausted in less than an hour.
2. **Audio Rights Suppression**: When a public Reel uses licensed music from the Instagram sound library, Meta suppresses `media_url` to prevent copyright piracy. Only `thumbnail_url` and `permalink` are provided.
3. **No Boolean Keyword Search**: Queries like `"minimalist ceramic coffee mug"` cannot be submitted; only exact single tags like `#ceramicmug` can be resolved.

---

## 5. Third-Party Provider Analysis

### 5.1 SearchApi (`api.sh` / `searchapi.io`)
- **How It Works**: Proxies and parses Meta Ad Library search results using headless cluster instances, bypassing regional DSA restrictions.
- **Request Example**:
  ```bash
  curl -X POST "https://www.searchapi.io/api/v1/search" \
    -H "Authorization: Bearer <SEARCHAPI_API_KEY>" \
    -H "Content-Type: application/json" \
    -d '{
      "engine": "meta_ad_library",
      "q": "boat smartwatch",
      "country": "IN",
      "media_type": "video",
      "active_status": "active"
    }'
  ```
- **Pricing**: ~$0.004 per call, 100 free requests on signup.

### 5.2 Apify Instagram Actors
- **Actor Candidate**: `apify/instagram-scraper` or `data-slayer/instagram-search-reels`
- **Request Example**:
  ```bash
  curl -X POST "https://api.apify.com/v2/actors/data-slayer~instagram-search-reels/runs?token=<APIFY_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "search": "smartwatch unboxing",
      "resultsLimit": 20
    }'
  ```
- **Pricing**: $5.00/month free tier credits; ~$1.50 per 1,000 reels.

---

## 6. Architecture & Discovery Engine Design

To ensure the application remains production-grade, highly resilient, and runnable in any environment (with or without active paid API keys), the discovery architecture implements a **Pluggable Multi-Provider Pattern**:

```
                       ┌──────────────────────────────┐
                       │   DiscoveryEngine Manager    │
                       └──────────────┬───────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
  ┌─────────────────────────┐                   ┌─────────────────────────┐
  │ InstagramDiscoverySvc   │                   │  MetaAdDiscoverySvc     │
  └────────────┬────────────┘                   └────────────┬────────────┘
               │                                             │
    ┌──────────┴──────────┐                       ┌──────────┴──────────┐
    ▼                     ▼                       ▼                     ▼
[Real/Proxy API]   [Mock/Smoke Adapter]         [Real/SearchApi]   [Mock/Smoke Adapter]
```

### Provider Contract
Each provider implements `IVideoDiscoveryProvider`:
- `search(query: DiscoveryQuery): Promise<DiscoveryResult>`
- `getProviderStatus(): ProviderHealthStatus`
- `validateCredentials(): Promise<boolean>`

If API tokens (`META_ACCESS_TOKEN`, `SEARCHAPI_API_KEY`, `APIFY_TOKEN`) are missing or unverified, the engine gracefully falls back to the high-fidelity mock adapter with explicit metadata flagging (`discovery_method: "mock_fallback"`, `is_mock: true`).

---

## 7. Known Blockers & Next Actions

| Challenge | Status | Remediation Action |
| :--- | :--- | :--- |
| **Meta Ad Library API commercial ads in India** | Documented & Verified Limitation | Use SearchApi / Meta Ad Library scraper for Indian commercial ads; use official API for EU/UK or political ads. |
| **Instagram Graph API 30-hashtag limit** | Documented & Verified Limitation | Use Apify Instagram Search Actor or simulated provider adapter when testing extensive keyword queries. |
| **External Credentials** | Pending User Configuration | Project will ship with `.env.example`, automated provider health diagnostics, and complete fallback datasets. |
