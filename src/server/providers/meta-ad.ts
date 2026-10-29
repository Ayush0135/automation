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

export class MetaAdDiscoveryService implements IVideoDiscoveryProvider {
  readonly source: DiscoverySource = "meta_ad_library";
  readonly name: string = "Meta Ad Library Discovery Service";

  private metaAccessToken: string | undefined;
  private searchApiKey: string | undefined;
  private googleApiKey: string | undefined;
  private googleCseId: string | undefined;

  constructor() {
    this.metaAccessToken = process.env.META_ACCESS_TOKEN;
    this.searchApiKey = process.env.SEARCHAPI_API_KEY;
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.googleCseId = process.env.GOOGLE_CSE_ID;
  }

  getStatus(): ProviderHealthStatus {
    if (this.searchApiKey) {
      return {
        source: this.source,
        providerName: "SearchApi (Meta Ad Library Engine)",
        isConfigured: true,
        status: "ready",
        message: "Configured for global commercial video ad discovery including India",
        supportedRegions: ["GLOBAL", "IN", "US", "EU", "GB"],
        requiresManualAuth: false,
      };
    }

    if (this.googleApiKey && this.googleCseId) {
      return {
        source: this.source,
        providerName: "Google Custom Search (Meta Ad Library Index)",
        isConfigured: true,
        status: "ready",
        message: "Configured for Google Programmable Search indexed Meta Ads",
        supportedRegions: ["GLOBAL", "IN"],
        requiresManualAuth: false,
      };
    }

    if (this.metaAccessToken) {
      return {
        source: this.source,
        providerName: "Official Meta Graph API (/ads_archive)",
        isConfigured: true,
        status: "limited",
        message: "Configured (Commercial ads restricted to EU/UK; India restricted to Political/Issue ads)",
        supportedRegions: ["EU", "GB", "POLITICAL_GLOBAL"],
        requiresManualAuth: true,
      };
    }

    return {
      source: this.source,
      providerName: "Simulated Meta Ad Library Mock Adapter",
      isConfigured: false,
      status: "unconfigured",
      message: "No live SearchApi, Google Search, or Meta Graph token in .env; operating in high-fidelity mock fallback mode",
      supportedRegions: ["GLOBAL", "IN"],
      requiresManualAuth: false,
    };
  }

  async search(query: DiscoveryQuery, cursor?: string): Promise<DiscoveryResult> {
    // 1. Try SearchApi if configured (Primary route for global/Indian commercial ads)
    if (this.searchApiKey) {
      try {
        return await this.searchViaSearchApi(query, cursor);
      } catch (err: any) {
        console.warn(`[MetaAd] SearchApi query failed (${err.message}). Falling back to next available provider.`);
      }
    }

    // 2. Try Google Custom Search if configured
    if (this.googleApiKey && this.googleCseId) {
      try {
        return await this.searchViaGoogleSearch(query, cursor);
      } catch (err: any) {
        console.warn(`[MetaAd] Google Custom Search query failed (${err.response?.data?.error?.message || err.message}). Falling back to next provider.`);
      }
    }

    // 3. Try Official Meta Graph API if configured
    if (this.metaAccessToken) {
      try {
        return await this.searchViaOfficialApi(query, cursor);
      } catch (err: any) {
        console.warn(`[MetaAd] Official Graph API query failed (${err.message}). Falling back to mock adapter.`);
      }
    }

    // 4. Fallback to high-fidelity mock data
    const queryStr = query.productName || query.keywords[0] || "product";
    const count = query.targetCount || 20;
    const candidates = generateRealisticCandidates("meta_ad_library", queryStr, count);

    const usable = candidates.filter((c) => c.video_url !== null || c.thumbnail_url !== null).length;

    return {
      source: this.source,
      providerName: "Mock Meta Ad Library Provider",
      items: candidates,
      discoveredCount: candidates.length,
      usableCount: usable,
      hasMore: false,
    };
  }

  private async searchViaSearchApi(query: DiscoveryQuery, cursor?: string): Promise<DiscoveryResult> {
    const endpoint = "https://www.searchapi.io/api/v1/search";
    const hasBrandAlready = query.brand && query.productName.toLowerCase().includes(query.brand.toLowerCase());
    const searchQuery = hasBrandAlready
      ? query.productName
      : `${query.brand ? query.brand + " " : ""}${query.productName}`;
    const targetCountry = query.country || "IN";

    const params: Record<string, any> = {
      engine: "meta_ad_library",
      q: searchQuery,
      media_type: "video",
      api_key: this.searchApiKey,
    };

    if (targetCountry) {
      params.country = targetCountry;
    }

    if (cursor) {
      params.next_page_token = cursor;
    }

    const response = await axios.get(endpoint, {
      params,
      timeout: 30000,
    });

    let ads = response.data?.ads || response.data?.organic_results || [];

    // If country-filtered query returned 0 ads, automatically query globally so active international product campaigns are found
    if (ads.length === 0 && params.country) {
      delete params.country;
      try {
        const globalRes = await axios.get(endpoint, { params, timeout: 30000 });
        ads = globalRes.data?.ads || globalRes.data?.organic_results || [];
      } catch (err: any) {
        console.warn(`[MetaAd] Global fallback query failed:`, err.message);
      }
    }

    const items: NormalizedDiscoveredVideo[] = ads.map((ad: any) => {
      const adId = String(ad.ad_archive_id || ad.id || ad.ad_id || `ad_${Date.now()}_${Math.random()}`);
      const videoObj = ad.snapshot?.videos?.[0] || {};
      const cardObj = ad.snapshot?.cards?.[0] || {};
      const videoUrl = videoObj.video_hd_url || videoObj.video_sd_url || cardObj.video_hd_url || cardObj.video_sd_url || ad.video_hd_url || null;
      const thumbUrl =
        videoObj.video_preview_image_url ||
        cardObj.video_preview_image_url ||
        cardObj.resized_image_url ||
        cardObj.original_image_url ||
        ad.snapshot?.images?.[0]?.original_image_url ||
        ad.video_preview_image_url ||
        ad.thumbnail_url ||
        null;

      const rawBody =
        ad.snapshot?.body ||
        cardObj.body ||
        ad.snapshot?.caption ||
        ad.body ||
        ad.text ||
        null;

      const adText =
        typeof rawBody === "string"
          ? rawBody
          : rawBody && typeof rawBody === "object"
          ? rawBody.text || rawBody.message || JSON.stringify(rawBody)
          : null;

      const rawAdv = ad.page_name || ad.snapshot?.page_name || ad.advertiser || null;
      const advertiser =
        typeof rawAdv === "string"
          ? rawAdv
          : rawAdv && typeof rawAdv === "object"
          ? rawAdv.name || null
          : null;

      return {
        source: "meta_ad_library" as const,
        source_id: adId,
        permalink: `https://www.facebook.com/ads/library/?id=${adId}`,
        advertiser_name: advertiser,
        caption_or_ad_text: adText,
        thumbnail_url: thumbUrl,
        video_url: videoUrl,
        media_type: "video" as const,
        published_at: ad.start_date || ad.creation_time || null,
        discovery_method: "searchapi" as const,
        discovered_at: new Date().toISOString(),
        metadata_json: {
          page_id: ad.page_id || ad.snapshot?.page_id,
          publisher_platform: ad.publisher_platform,
          collation_count: ad.collation_count,
          country: targetCountry,
          is_mock: false,
        },
        collection_status: (videoUrl || thumbUrl) ? "usable" : "discovered",
        is_mock: false,
      };
    });

    return {
      source: this.source,
      providerName: "SearchApi (Meta Ad Library)",
      items,
      discoveredCount: items.length,
      usableCount: items.filter((i) => i.video_url || i.thumbnail_url).length,
      hasMore: Boolean(response.data?.pagination?.next_page_token),
      nextCursor: response.data?.pagination?.next_page_token,
    };
  }

  private async searchViaOfficialApi(query: DiscoveryQuery, cursor?: string): Promise<DiscoveryResult> {
    const version = process.env.META_GRAPH_API_VERSION || "v20.0";
    const endpoint = `https://graph.facebook.com/${version}/ads_archive`;

    const targetCountry = query.country || "IN";
    // Important: Official API only supports commercial ads in EU/UK. In other countries like India,
    // ad_type must be POLITICAL_AND_ISSUE_ADS or it returns an error.
    const isEuOrUk = ["GB", "UK", "DE", "FR", "IT", "ES", "NL", "SE", "PL"].includes(targetCountry.toUpperCase());
    const adType = isEuOrUk ? "ALL" : "POLITICAL_AND_ISSUE_ADS";

    const params: Record<string, any> = {
      access_token: this.metaAccessToken,
      ad_reached_countries: `['${targetCountry}']`,
      search_terms: query.productName,
      ad_type: adType,
      ad_active_status: "ACTIVE",
      fields: "id,ad_creation_time,ad_creative_bodies,ad_snapshot_url,page_id,page_name,publisher_platforms",
      limit: query.targetCount || 20,
    };

    if (cursor) {
      params.after = cursor;
    }

    const response = await axios.get(endpoint, { params, timeout: 20000 });
    const rawAds = response.data?.data || [];

    const items: NormalizedDiscoveredVideo[] = rawAds.map((ad: any) => ({
      source: "meta_ad_library",
      source_id: ad.id,
      permalink: ad.ad_snapshot_url || `https://www.facebook.com/ads/library/?id=${ad.id}`,
      advertiser_name: ad.page_name || null,
      caption_or_ad_text: ad.ad_creative_bodies?.[0] || null,
      thumbnail_url: null, // Official API requires fetching snapshot iframe for thumbnail/video
      video_url: null,
      media_type: "video",
      published_at: ad.ad_creation_time || null,
      discovery_method: "official_api",
      discovered_at: new Date().toISOString(),
      metadata_json: {
        page_id: ad.page_id,
        platforms: ad.publisher_platforms,
        ad_type: adType,
        note: !isEuOrUk ? "Queried under POLITICAL_AND_ISSUE_ADS due to Meta API country restrictions" : undefined,
      },
      collection_status: "discovered",
    }));

    return {
      source: this.source,
      providerName: "Official Meta Graph API",
      items,
      discoveredCount: items.length,
      usableCount: items.filter((i) => i.thumbnail_url || i.video_url).length,
      hasMore: Boolean(response.data?.paging?.next),
      nextCursor: response.data?.paging?.cursors?.after,
    };
  }

  private async searchViaGoogleSearch(query: DiscoveryQuery, cursor?: string): Promise<DiscoveryResult> {
    const endpoint = "https://www.googleapis.com/customsearch/v1";
    const startIndex = cursor ? parseInt(cursor, 10) : 1;
    const searchTerm = `site:facebook.com/ads/library "${query.productName}"`;

    const response = await axios.get(endpoint, {
      params: {
        key: this.googleApiKey,
        cx: this.googleCseId,
        q: searchTerm,
        num: Math.min(query.targetCount || 10, 10),
        start: startIndex,
      },
      timeout: 15000,
    });

    const rawItems = response.data?.items || [];

    const items: NormalizedDiscoveredVideo[] = rawItems.map((item: any, idx: number) => {
      const matchId = item.link?.match(/id[=:](\d+)/i);
      const adId = matchId ? matchId[1] : `g_${Date.now()}_${idx}`;
      
      const thumb =
        item.pagemap?.cse_image?.[0]?.src ||
        item.pagemap?.cse_thumbnail?.[0]?.src ||
        item.pagemap?.metatags?.[0]?.["og:image"] ||
        null;

      return {
        source: "meta_ad_library" as const,
        source_id: adId,
        permalink: item.link || `https://www.facebook.com/ads/library/?id=${adId}`,
        advertiser_name: item.pagemap?.metatags?.[0]?.["og:site_name"] || item.title || null,
        caption_or_ad_text: item.snippet || item.pagemap?.metatags?.[0]?.["og:description"] || null,
        thumbnail_url: thumb,
        video_url: null,
        media_type: "video" as const,
        published_at: null,
        discovery_method: "searchapi" as const,
        discovered_at: new Date().toISOString(),
        metadata_json: {
          search_engine: "google_custom_search",
          displayLink: item.displayLink,
          is_mock: false,
        },
        collection_status: thumb ? "usable" : "discovered",
        is_mock: false,
      };
    });

    const nextStartIndex = response.data?.queries?.nextPage?.[0]?.startIndex;

    return {
      source: this.source,
      providerName: "Google Custom Search (Meta Ad Library Index)",
      items,
      discoveredCount: items.length,
      usableCount: items.filter((i) => i.video_url || i.thumbnail_url).length,
      hasMore: Boolean(nextStartIndex),
      nextCursor: nextStartIndex ? String(nextStartIndex) : undefined,
    };
  }
}
