# API Reference — Product Video Discovery Dashboard

Base URL: `http://localhost:5000/api`

---

## 1. System Endpoints

### `GET /api/health`
Checks server and database connectivity.
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-29T14:30:00.000Z",
    "database": "connected",
    "version": "1.0.0"
  }
  ```

### `GET /api/providers/status`
Reports live status, configured credentials, active provider engines, and regional restrictions.
- **Response `200 OK`**:
  ```json
  {
    "timestamp": "2026-10-29T14:30:00.000Z",
    "providers": {
      "instagram": {
        "source": "instagram",
        "providerName": "Simulated Instagram Mock Adapter",
        "isConfigured": false,
        "status": "unconfigured",
        "message": "No live credentials; operating in high-fidelity mock fallback mode",
        "supportedRegions": ["GLOBAL", "IN"]
      },
      "meta_ad_library": {
        "source": "meta_ad_library",
        "providerName": "Simulated Meta Ad Library Mock Adapter",
        "isConfigured": false,
        "status": "unconfigured",
        "message": "No live credentials; operating in high-fidelity mock fallback mode",
        "supportedRegions": ["GLOBAL", "IN"]
      }
    }
  }
  ```

---

## 2. Product Inspection

### `POST /api/products/inspect`
Extracts product title, brand, category, description, and keywords from a product webpage URL or uploaded image file.
- **Form Data / JSON**:
  - `url`: (string, optional) Product page URL
  - `image`: (file, optional) Multipart file upload
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "metadata": {
      "name": "Airdopes 141 ANC",
      "brand": "boAt",
      "category": "Wireless Earbuds",
      "imageUrl": "https://...",
      "description": "Active Noise Cancellation up to 32dB...",
      "keywords": ["airdopes", "boat earbuds", "noise cancellation"]
    }
  }
  ```

---

## 3. Search Pipeline

### `POST /api/search`
Launches the dual-source discovery pipeline.
- **Payload**:
  ```json
  {
    "productName": "Airdopes 141 ANC",
    "brand": "boAt",
    "category": "Wireless Earbuds",
    "productUrl": "https://...",
    "imageUrl": "https://...",
    "keywords": ["airdopes", "boat", "noise cancellation"],
    "requestedCount": 20
  }
  ```
- **Response `202 Accepted`**:
  ```json
  {
    "searchId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "productId": "8a1eeb4c-1b7a-4c2d-8bdd-1b0d7b3dcb6a",
    "status": "running",
    "message": "Search pipeline initiated"
  }
  ```

### `GET /api/search/:id/progress`
Returns live collection progress. Supports standard JSON polling or Server-Sent Events (`Accept: text/event-stream`).
- **Response `200 OK`**:
  ```json
  {
    "searchId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "status": "completed",
    "instagram": { "discovered": 20, "usable": 15, "target": 20, "shortfall": 0 },
    "meta": { "discovered": 20, "usable": 18, "target": 20, "shortfall": 0 },
    "matchedCount": 32
  }
  ```

### `GET /api/search/:id/results`
Returns scored, categorized candidate video cards with pagination and filtering.
- **Query Parameters**:
  - `source`: `"instagram" | "meta_ad_library"`
  - `minScore`: float (e.g. `0.65`)
  - `showDuplicates`: boolean (`"true" | "false"`)
  - `showPreviouslySeen`: boolean (`"true" | "false"`)
  - `limit`: integer (default `50`)
  - `offset`: integer (default `0`)
- **Response `200 OK`**:
  ```json
  {
    "total": 40,
    "limit": 50,
    "offset": 0,
    "results": [
      {
        "id": "result_uuid",
        "source": "instagram",
        "sourceId": "reel_C123456",
        "permalink": "https://www.instagram.com/reel/C123456/",
        "advertiserName": "tech_unboxed_daily",
        "captionOrAdText": "Unboxing the all-new boAt Airdopes 141 ANC!...",
        "thumbnailUrl": "https://images.unsplash.com/...",
        "videoUrl": "https://commondatastorage.googleapis.com/...",
        "similarityScore": 0.88,
        "matchStatus": "verified_match",
        "matchExplanation": "High-confidence verified match: Brand (boAt) and full product name matched.",
        "evidenceType": "video_frame",
        "isDuplicate": false,
        "isPreviouslySeen": false
      }
    ]
  }
  ```

---

## 4. History

### `GET /api/history`
Returns recent search sessions.

### `GET /api/history/:id`
Returns a specific search session and its saved result items.
