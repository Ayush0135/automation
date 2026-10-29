# System Architecture — Product Video Discovery Dashboard

## 1. High-Level Architecture Overview

The Product Video Discovery Dashboard is an enterprise-grade full-stack system designed to discover, evaluate, deduplicate, and surface video creative assets from Instagram Reels and Meta Ad Library for target e-commerce products.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       React 18 + Vite Frontend Dashboard                     │
│    (Product Inspector, Dual-Source Progress, Scannable Grid, History Drawer)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST / SSE
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Express + Node.js Backend                         │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ Routes                   │ /api/products/inspect, /api/search, /api/history │
│ Product Extractor        │ Cheerio, JSON-LD, OpenGraph, Multer              │
│ Discovery Engine Manager │ Query generation, multi-provider dispatch        │
│ AI Matching Service      │ Visual & semantic scoring, pHash, dHash dedupe   │
└────────────┬─────────────┴────────────────────────┬─────────────────────────┘
             │                                      │
             ▼                                      ▼
┌─────────────────────────┐            ┌─────────────────────────┐
│ InstagramDiscoverySvc   │            │   MetaAdDiscoverySvc    │
├─────────────────────────┤            ├─────────────────────────┤
│ • Official Graph API    │            │ • SearchApi Engine      │
│ • Apify Reels Actor     │            │ • Official /ads_archive │
│ • High-Fidelity Mock    │            │ • High-Fidelity Mock    │
└─────────────────────────┘            └─────────────────────────┘
             │                                      │
             └──────────────────┬───────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SQLite (via Prisma ORM)                           │
│  Tables: products, searches, videos, search_results, video_fingerprints     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design

### 2.1 Provider Abstraction Layer (`src/server/providers/`)
All discovery sources implement `IVideoDiscoveryProvider` interface:
- `source`: `"instagram" | "meta_ad_library"`
- `getStatus()`: Returns health status, active provider name, and regional limitations.
- `search(query, cursor)`: Returns normalized items, discovered counts, and pagination cursor.

When real API tokens (`META_ACCESS_TOKEN`, `SEARCHAPI_API_KEY`, `APIFY_TOKEN`) are not set, the provider automatically falls back to an authentic, high-fidelity mock adapter with explicit metadata flagging (`discovery_method: "mock_fallback"`, `is_mock: true`).

### 2.2 Discovery Engine (`src/server/services/discovery-engine.ts`)
- Generates query permutations: brand + title, category + brand, keyword tokens.
- Runs parallel collection across Instagram and Meta.
- Enforces strict deduplication across source IDs and permalinks.
- Calculates honest shortfall counts (Target 20 minus unique collected).

### 2.3 AI Matching & Deduplication Pipeline (`src/server/services/matching-service.ts`)
- **Semantic Overlap**: Weighted score combining exact brand match, product name match, and keyword token density.
- **Visual Confidence**: Evaluates presence of motion video streams vs. static thumbnails vs. metadata-only references.
- **Categorization**:
  - `verified_match`: Brand + full name match + >= 80% score.
  - `matched`: >= 65% calibrated similarity score.
  - `usable`: Candidate has playable media or high-res thumbnail.
  - `discovered`: Discovered via search query, awaiting media.
- **Perceptual Hashing & Fingerprints**:
  - `canonical_url`: Normalized URL stripping tracking parameters (`fbclid`, `utm_*`, `igsh`).
  - `content_hash`: SHA-256 fingerprint of creative text.
  - `phash`: Visual block hash of accessible media.

---

## 3. Database Schema

- **`products`**: Target product metadata (name, brand, category, URL, image, extracted visual attributes).
- **`searches`**: Search executions, requested target counts (20 Reels, 20 Ads), discovered counts, and completion timestamps.
- **`videos`**: Normalized media entities with unique constraint on `(source, source_id)`.
- **`search_results`**: Links search runs to videos with similarity scores, match explanations, duplicate flags, and evidence types.
- **`video_fingerprints`**: Persistent cryptographic and perceptual hashes for cross-search duplicate detection.
