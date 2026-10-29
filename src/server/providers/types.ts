export type DiscoverySource = "instagram" | "meta_ad_library";

export type CollectionStatus = "discovered" | "usable" | "matched" | "verified_match";

export interface NormalizedDiscoveredVideo {
  source: DiscoverySource;
  source_id: string;
  permalink: string;
  advertiser_name: string | null;
  caption_or_ad_text: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  media_type: string;
  published_at: string | null;
  discovery_method: string; // e.g. "official_api" | "searchapi" | "apify" | "mock_adapter"
  discovered_at: string;
  metadata_json: Record<string, any>;
  collection_status: CollectionStatus;
  is_mock?: boolean;
}

export interface DiscoveryQuery {
  productName: string;
  brand?: string;
  category?: string;
  keywords: string[];
  targetCount: number;
  country?: string; // e.g. "IN" | "US" | "GB"
}

export interface ProviderHealthStatus {
  source: DiscoverySource;
  providerName: string;
  isConfigured: boolean;
  status: "ready" | "limited" | "unconfigured" | "error";
  message: string;
  supportedRegions: string[];
  requiresManualAuth: boolean;
}

export interface DiscoveryResult {
  source: DiscoverySource;
  providerName: string;
  items: NormalizedDiscoveredVideo[];
  discoveredCount: number;
  usableCount: number;
  hasMore: boolean;
  nextCursor?: string;
  error?: string;
}

export interface IVideoDiscoveryProvider {
  readonly source: DiscoverySource;
  readonly name: string;
  getStatus(): ProviderHealthStatus;
  search(query: DiscoveryQuery, cursor?: string): Promise<DiscoveryResult>;
}
