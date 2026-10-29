import axios from "axios";
import {
  IVideoDiscoveryProvider,
  DiscoverySource,
  DiscoveryQuery,
  DiscoveryResult,
  ProviderHealthStatus,
  NormalizedDiscoveredVideo,
} from "./types.js";
import { generateRealisticCandidates } from "./mock-data.js";

export class InstagramDiscoveryService implements IVideoDiscoveryProvider {
  readonly source: DiscoverySource = "instagram";
  readonly name: string = "Instagram Reels Discovery Service";

  private accessToken: string | undefined;
  private accountId: string | undefined;
  private apifyToken: string | undefined;

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.accountId = process.env.INSTAGRAM_ACCOUNT_ID;
    this.apifyToken = process.env.APIFY_TOKEN;
  }

  getStatus(): ProviderHealthStatus {
    if (this.apifyToken) {
      return {
        source: this.source,
        providerName: "Apify Instagram Reels Actor",
        isConfigured: true,
        status: "ready",
        message: "Apify token configured for public Instagram Reels search",
        supportedRegions: ["GLOBAL", "IN", "US", "EU"],
        requiresManualAuth: false,
      };
    }

    if (this.accessToken && this.accountId) {
      return {
        source: this.source,
        providerName: "Official Instagram Graph API",
        isConfigured: true,
        status: "limited",
        message: "Configured (Subject to 30-hashtag/7-day quota and media download DRM)",
        supportedRegions: ["GLOBAL"],
        requiresManualAuth: true,
      };
    }

    return {
      source: this.source,
      providerName: "Simulated Instagram Mock Adapter",
      isConfigured: false,
      status: "unconfigured",
      message: "No live Instagram/Apify credentials found in .env; operating in high-fidelity mock fallback mode",
      supportedRegions: ["GLOBAL", "IN"],
      requiresManualAuth: false,
    };
  }

  async search(query: DiscoveryQuery, cursor?: string): Promise<DiscoveryResult> {
    // 1. Try Apify if configured
    if (this.apifyToken) {
      try {
        return await this.searchViaApify(query);
      } catch (err: any) {
        console.warn(`[Instagram] Apify search failed (${err.message}). Falling back to mock adapter.`);
      }
    }

    // 2. Try Official Instagram Graph API if configured
    if (this.accessToken && this.accountId) {
      try {
        return await this.searchViaOfficialApi(query);
      } catch (err: any) {
        console.warn(`[Instagram] Official Graph API search failed (${err.message}). Falling back to mock adapter.`);
      }
    }

    // 3. Fallback to high-fidelity mock data
    const queryStr = query.productName || query.keywords[0] || "product";
    const count = query.targetCount || 20;
    const candidates = generateRealisticCandidates("instagram", queryStr, count);

    const usable = candidates.filter((c) => c.video_url !== null || c.thumbnail_url !== null).length;

    return {
      source: this.source,
      providerName: "Mock Instagram Provider",
      items: candidates,
      discoveredCount: candidates.length,
      usableCount: usable,
      hasMore: false,
    };
  }

  private async searchViaApify(query: DiscoveryQuery): Promise<DiscoveryResult> {
    const actorId = "data-slayer~instagram-search-reels";
    const endpoint = `https://api.apify.com/v2/actors/${actorId}/run-sync-get-dataset-items?token=${this.apifyToken}&timeout=45&maxItems=${query.targetCount || 20}`;

    const hasBrandAlready = query.brand && query.productName.toLowerCase().includes(query.brand.toLowerCase());
    const searchQuery = hasBrandAlready
      ? query.productName
      : `${query.brand ? query.brand + " " : ""}${query.productName}`;
    const response = await axios.post(
      endpoint,
      {
        query: searchQuery,
        search: searchQuery,
        resultsLimit: query.targetCount || 20,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 50000,
      }
    );

    const rawData = Array.isArray(response.data) ? response.data : (response.data?.items || []);

    const items: NormalizedDiscoveredVideo[] = rawData.map((raw: any) => {
      const code = raw.code || raw.shortCode;
      const permalink = code
        ? `https://www.instagram.com/reel/${code}/`
        : (raw.url || (raw.id ? `https://www.instagram.com/p/${raw.id}/` : ""));
      const author = raw.caption?.user?.username || raw.user?.username || raw.ownerUsername || null;
      const caption = typeof raw.caption === "string" ? raw.caption : (raw.caption?.text || raw.text || null);
      const thumb = raw.image_versions?.items?.[0]?.url || raw.image_versions2?.candidates?.[0]?.url || raw.displayUrl || raw.thumbnailUrl || null;
      const video = raw.video_versions?.[0]?.url || raw.videoUrl || null;
      const sourceId = String(code || raw.id || raw.pk || `ig_${Date.now()}_${Math.random()}`);

      return {
        source: "instagram",
        source_id: sourceId,
        permalink,
        advertiser_name: author,
        caption_or_ad_text: caption,
        thumbnail_url: thumb,
        video_url: video,
        media_type: "video",
        published_at: raw.caption?.created_at ? new Date(raw.caption.created_at * 1000).toISOString() : (raw.timestamp ? new Date(raw.timestamp).toISOString() : null),
        discovery_method: "apify",
        discovered_at: new Date().toISOString(),
        metadata_json: {
          likes: raw.like_count || raw.likesCount || 0,
          comments: raw.comment_count || raw.commentsCount || 0,
          views: raw.play_count || raw.ig_play_count || 0,
          code,
          raw_id: raw.id,
          is_mock: false,
          discovery_method: "apify",
        },
        collection_status: video ? "usable" : (thumb ? "usable" : "discovered"),
        is_mock: false,
      };
    });

    return {
      source: this.source,
      providerName: "Apify Instagram Reels Actor",
      items,
      discoveredCount: items.length,
      usableCount: items.filter((i) => i.video_url || i.thumbnail_url).length,
      hasMore: false,
    };
  }

  private async searchViaOfficialApi(query: DiscoveryQuery): Promise<DiscoveryResult> {
    const tag = (query.keywords[0] || query.productName).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const version = process.env.META_GRAPH_API_VERSION || "v20.0";

    // 1. Search Hashtag ID
    const tagSearchUrl = `https://graph.facebook.com/${version}/ig_hashtag_search?user_id=${this.accountId}&q=${tag}&access_token=${this.accessToken}`;
    const tagRes = await axios.get(tagSearchUrl, { timeout: 10000 });
    const hashtagId = tagRes.data?.data?.[0]?.id;

    if (!hashtagId) {
      throw new Error(`Hashtag #${tag} not found via official API`);
    }

    // 2. Fetch Recent Media
    const mediaUrl = `https://graph.facebook.com/${version}/${hashtagId}/recent_media?user_id=${this.accountId}&fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${this.accessToken}`;
    const mediaRes = await axios.get(mediaUrl, { timeout: 15000 });

    const rawItems = mediaRes.data?.data || [];
    const items: NormalizedDiscoveredVideo[] = rawItems
      .filter((m: any) => m.media_type === "VIDEO")
      .map((m: any) => ({
        source: "instagram",
        source_id: m.id,
        permalink: m.permalink,
        advertiser_name: null,
        caption_or_ad_text: m.caption || null,
        thumbnail_url: m.thumbnail_url || null,
        video_url: m.media_url || null,
        media_type: "video",
        published_at: m.timestamp || null,
        discovery_method: "official_api",
        discovered_at: new Date().toISOString(),
        metadata_json: { hashtag: tag },
        collection_status: m.media_url ? "usable" : "discovered",
      }));

    return {
      source: this.source,
      providerName: "Official Instagram Graph API",
      items,
      discoveredCount: items.length,
      usableCount: items.filter((i) => i.video_url || i.thumbnail_url).length,
      hasMore: Boolean(mediaRes.data?.paging?.next),
    };
  }
}
