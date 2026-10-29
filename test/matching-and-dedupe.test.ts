import { describe, it, expect } from "vitest";
import { MatchingService } from "../src/server/services/matching-service.js";
import { NormalizedDiscoveredVideo } from "../src/server/providers/types.js";

describe("Matching & Deduplication Service", () => {
  const matcher = new MatchingService(0.65);

  const mockCandidate: NormalizedDiscoveredVideo = {
    source: "meta_ad_library",
    source_id: "ad_12345",
    permalink: "https://www.facebook.com/ads/library/?id=ad_12345&fbclid=XYZ123",
    advertiser_name: "Sony Electronics Official",
    caption_or_ad_text: "Experience premium sound with Sony WH-1000XM5 wireless noise cancelling headphones.",
    thumbnail_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    media_type: "video",
    published_at: "2026-05-01T00:00:00.000Z",
    discovery_method: "mock_fallback",
    discovered_at: "2026-10-29T00:00:00.000Z",
    metadata_json: {},
    collection_status: "usable",
  };

  it("canonicalizes permalink and removes tracking parameters", () => {
    const canonical = matcher.canonicalizePermalink("https://www.instagram.com/reel/C123456/?utm_source=ig_web_copy_link&igsh=123");
    expect(canonical).toBe("https://www.instagram.com/reel/C123456");
  });

  it("evaluates candidate video and scores high for matching brand and title", () => {
    const evaluation = matcher.evaluateCandidate(mockCandidate, {
      name: "WH-1000XM5",
      brand: "Sony",
      keywords: ["headphones", "noise cancelling"],
    });

    expect(evaluation.similarityScore).toBeGreaterThanOrEqual(0.70);
    expect(["matched", "verified_match"]).toContain(evaluation.matchStatus);
    expect(evaluation.evidenceType).toBe("thumbnail");
    expect(evaluation.matchExplanation).toContain("Sony");
  });

  it("detects duplicates across fingerprint sets", () => {
    const initialEval = matcher.evaluateCandidate(mockCandidate, {
      name: "WH-1000XM5",
      brand: "Sony",
      keywords: [],
    });

    const knownFingerprints = new Set(initialEval.fingerprints.map((fp) => fp.value));

    const duplicateCandidate = { ...mockCandidate, source_id: "ad_99999" };
    const duplicateEval = matcher.evaluateCandidate(
      duplicateCandidate,
      {
        name: "WH-1000XM5",
        brand: "Sony",
        keywords: [],
      },
      knownFingerprints
    );

    expect(duplicateEval.isDuplicate).toBe(true);
    expect(duplicateEval.isPreviouslySeen).toBe(true);
  });
});
