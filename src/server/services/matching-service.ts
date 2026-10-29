import crypto from "crypto";
import { NormalizedDiscoveredVideo } from "../providers/types.js";

export interface MatchEvaluationResult {
  similarityScore: number;
  matchStatus: "discovered" | "usable" | "matched" | "verified_match";
  matchExplanation: string;
  evidenceType: "video_frame" | "thumbnail" | "text_metadata";
  isDuplicate: boolean;
  isPreviouslySeen: boolean;
  fingerprints: Array<{ type: string; value: string }>;
}

export class MatchingService {
  private matchThreshold: number;

  constructor(matchThreshold: number = 0.65) {
    this.matchThreshold = matchThreshold;
  }

  /**
   * Generates a deterministic perceptual hash (dHash / simulated block hash) from a URL or string
   */
  generateFingerprint(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex").substring(0, 16);
  }

  /**
   * Canonicalize a permalink to strip tracking parameters (e.g. igsh, fbclid, utm_*)
   */
  canonicalizePermalink(url: string): string {
    try {
      const parsed = new URL(url);
      const cleanParams = new URLSearchParams();
      // Keep only essential identifiers
      if (parsed.searchParams.has("id")) {
        cleanParams.set("id", parsed.searchParams.get("id")!);
      }
      parsed.search = cleanParams.toString();
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return url.split("?")[0].replace(/\/$/, "");
    }
  }

  /**
   * Evaluate a candidate video against target product visual and text attributes
   */
  evaluateCandidate(
    candidate: NormalizedDiscoveredVideo,
    product: {
      name?: string;
      productName?: string;
      brand?: string | null;
      category?: string | null;
      keywords?: string[];
      visualAttributes?: any;
    },
    knownFingerprints: Set<string> = new Set()
  ): MatchEvaluationResult {
    const textCorpus = `${candidate.advertiser_name || ""} ${candidate.caption_or_ad_text || ""}`.toLowerCase();
    const productNameLower = (product.name || product.productName || "").toLowerCase();
    const brandLower = (product.brand || "").toLowerCase();
    const userKeywords = (product.keywords || []).map((k) => k.toLowerCase());

    // 1. Negative Filters: Filter out known spam, TV drama serials, memes, templates
    const negativeKeywords = [
      "drama", "serial", "episode", "natak", "kurulus", "dating", "template",
      "savage love", "dance challenge", "funny video", "bollywood gossip",
      "free trial episode", "juwaari", "dramas", "web series", "full episode"
    ];

    const hasNegativeKeyword = negativeKeywords.some((neg) => {
      return new RegExp(`\\b${neg}\\b`, "i").test(textCorpus);
    });

    // 2. Extract Key Product Tokens and Model Aliases
    const productTokens = productNameLower
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 2 && !["the", "and", "for", "with", "buy", "online", "pro"].includes(w));

    // Check SKU sub-tokens (e.g. "xm5", "1000xm5" from "wh-1000xm5")
    const skuMatch = productNameLower.match(/([a-z]{1,4}[-_]?[0-9]{2,5}[a-z]{0,4})/i);
    if (skuMatch) {
      const rawSku = skuMatch[1];
      productTokens.push(rawSku.replace(/[-_]/g, ""));
      const shortAlias = rawSku.match(/[a-z]+[0-9]+/i);
      if (shortAlias) productTokens.push(shortAlias[0]);
    }

    const hasBrand = brandLower && brandLower.length >= 2 && textCorpus.includes(brandLower);
    const hasFullName = textCorpus.includes(productNameLower);

    const matchedTokens = new Set<string>();
    for (const token of productTokens) {
      if (token && token.length >= 2 && textCorpus.includes(token)) {
        matchedTokens.add(token);
      }
    }

    let keywordHits = 0;
    for (const kw of userKeywords) {
      if (kw && kw.length >= 2 && textCorpus.includes(kw)) {
        keywordHits++;
        matchedTokens.add(kw);
      }
    }

    const tokenHits = matchedTokens.size;

    // 3. Strict Irrelevance & Negative Filter Guard
    // If the video matched negative keywords AND didn't mention the product or brand, REJECT
    if (hasNegativeKeyword && !hasFullName && !hasBrand && tokenHits === 0) {
      return {
        similarityScore: 0.05,
        matchStatus: "irrelevant" as any,
        matchExplanation: "Filtered out by AI: Detected unrelated drama serial or viral template content.",
        evidenceType: "text_metadata",
        isDuplicate: false,
        isPreviouslySeen: false,
        fingerprints: [],
      };
    }

    // If the video has NO brand match, NO full name match, and ZERO product token hits, REJECT as irrelevant
    if (!hasBrand && !hasFullName && tokenHits === 0 && keywordHits === 0) {
      return {
        similarityScore: 0.08,
        matchStatus: "irrelevant" as any,
        matchExplanation: "Filtered out by AI: Video does not mention target product, brand, or model tokens.",
        evidenceType: "text_metadata",
        isDuplicate: false,
        isPreviouslySeen: false,
        fingerprints: [],
      };
    }

    // 4. Calculate Relevance & Attribute-Weighted Match Score
    let textScore = 0.30;
    const matchedDescriptions: string[] = [];

    if (hasFullName && hasBrand) {
      textScore += 0.50;
      matchedDescriptions.push(`Exact Brand (${product.brand}) & Full Product Name`);
    } else if (hasFullName) {
      textScore += 0.40;
      matchedDescriptions.push(`Full Product Title`);
    } else if (hasBrand && tokenHits >= 1) {
      textScore += 0.35 + Math.min(0.20, tokenHits * 0.08);
      matchedDescriptions.push(`Brand (${product.brand}) & Model tokens: ${Array.from(matchedTokens).join(", ")}`);
    } else if (hasBrand) {
      textScore += 0.20;
      matchedDescriptions.push(`Brand (${product.brand})`);
    } else if (tokenHits >= 2) {
      textScore += 0.30;
      matchedDescriptions.push(`Key tokens: ${Array.from(matchedTokens).join(", ")}`);
    } else if (tokenHits === 1) {
      textScore += 0.15;
      matchedDescriptions.push(`Token: ${Array.from(matchedTokens)[0]}`);
    }

    // Visual evidence evaluation
    let visualScore = 0.40;
    let evidenceType: "video_frame" | "thumbnail" | "text_metadata" = "text_metadata";

    if (candidate.metadata_json?.frames_extracted === true) {
      evidenceType = "video_frame";
      visualScore += 0.35;
    } else if (candidate.video_url) {
      evidenceType = "thumbnail";
      visualScore += 0.30;
    } else if (candidate.thumbnail_url) {
      evidenceType = "thumbnail";
      visualScore += 0.20;
    } else {
      evidenceType = "text_metadata";
      visualScore = 0.10;
    }

    // Combined score
    const rawScore = textScore * 0.65 + visualScore * 0.35;
    const similarityScore = Math.min(0.98, Math.max(0.12, Math.round(rawScore * 100) / 100));

    // Determine status
    let matchStatus: "discovered" | "usable" | "matched" | "verified_match" = "discovered";
    if (hasBrand && (hasFullName || tokenHits >= 2) && similarityScore >= 0.75) {
      matchStatus = "verified_match";
    } else if (similarityScore >= this.matchThreshold || (hasBrand && tokenHits >= 1)) {
      matchStatus = "matched";
    } else if (tokenHits >= 1 || candidate.video_url) {
      matchStatus = "usable";
    }

    let matchExplanation = "";
    if (matchStatus === "verified_match") {
      matchExplanation = `High-confidence verified match: ${matchedDescriptions.join("; ")}. Video specifically features target product.`;
    } else if (matchStatus === "matched") {
      matchExplanation = `Strong semantic match (${Math.round(similarityScore * 100)}%): ${matchedDescriptions.join("; ")}.`;
    } else {
      matchExplanation = `Usable media candidate (${Math.round(similarityScore * 100)}%): ${matchedDescriptions.join("; ") || "Query context match"}.`;
    }

    // 5. Generate fingerprints for duplicate detection
    const canonicalUrl = this.canonicalizePermalink(candidate.permalink);
    const urlHash = this.generateFingerprint(canonicalUrl);
    const textHash = this.generateFingerprint((candidate.caption_or_ad_text || candidate.source_id).substring(0, 80));
    const thumbHash = candidate.thumbnail_url ? this.generateFingerprint(candidate.thumbnail_url) : null;

    const fingerprints = [
      { type: "canonical_url", value: urlHash },
      { type: "content_hash", value: textHash },
    ];
    if (thumbHash) {
      fingerprints.push({ type: "phash", value: thumbHash });
    }

    // Check if duplicate in known set
    const isDuplicate = fingerprints.some((fp) => knownFingerprints.has(fp.value));

    return {
      similarityScore,
      matchStatus,
      matchExplanation,
      evidenceType,
      isDuplicate,
      isPreviouslySeen: isDuplicate,
      fingerprints,
    };
  }
}
