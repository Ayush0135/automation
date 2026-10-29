import { InstagramDiscoveryService } from "../providers/instagram.js";
import { MetaAdDiscoveryService } from "../providers/meta-ad.js";
import { aiKeywordService } from "./ai-keyword-service.js";
import {
  DiscoveryQuery,
  NormalizedDiscoveredVideo,
  DiscoverySource,
  ProviderHealthStatus,
} from "../providers/types.js";

export interface EngineSearchProgress {
  searchId: string;
  source: DiscoverySource;
  status: "idle" | "running" | "completed" | "error";
  currentQuery: string;
  discoveredCount: number;
  uniqueCount: number;
  usableCount: number;
  matchedCount: number;
  targetCount: number;
  shortfall: number;
  message?: string;
  isMock: boolean;
}

export class DiscoveryEngine {
  private instagramService: InstagramDiscoveryService;
  private metaAdService: MetaAdDiscoveryService;

  constructor() {
    this.instagramService = new InstagramDiscoveryService();
    this.metaAdService = new MetaAdDiscoveryService();
  }

  getProvidersStatus(): Record<DiscoverySource, ProviderHealthStatus> {
    return {
      instagram: this.instagramService.getStatus(),
      meta_ad_library: this.metaAdService.getStatus(),
    };
  }

  generateQueryVariants(productName: string, brand?: string, category?: string, keywords: string[] = []): string[] {
    const aiExpanded = aiKeywordService.expandProductSearch(productName, brand, category, keywords);
    return aiExpanded.searchQueries;
  }

  async runDiscovery(
    query: DiscoveryQuery,
    onProgress?: (progress: EngineSearchProgress) => void
  ): Promise<{
    instagram: { items: NormalizedDiscoveredVideo[]; shortfall: number; isMock: boolean };
    meta_ad_library: { items: NormalizedDiscoveredVideo[]; shortfall: number; isMock: boolean };
  }> {
    const target = query.targetCount || 20;

    // Run parallel source collection
    const [igResult, metaResult] = await Promise.all([
      this.collectFromSource("instagram", query, target, onProgress),
      this.collectFromSource("meta_ad_library", query, target, onProgress),
    ]);

    return {
      instagram: igResult,
      meta_ad_library: metaResult,
    };
  }

  private async collectFromSource(
    source: DiscoverySource,
    query: DiscoveryQuery,
    targetCount: number,
    onProgress?: (progress: EngineSearchProgress) => void
  ): Promise<{ items: NormalizedDiscoveredVideo[]; shortfall: number; isMock: boolean }> {
    const provider = source === "instagram" ? this.instagramService : this.metaAdService;
    const itemsMap = new Map<string, NormalizedDiscoveredVideo>();
    const queryVariants = this.generateQueryVariants(query.productName, query.brand, query.category, query.keywords);

    let isMock = false;

    for (const qStr of queryVariants) {
      if (itemsMap.size >= targetCount) break;

      if (onProgress) {
        onProgress({
          searchId: "active",
          source,
          status: "running",
          currentQuery: qStr,
          discoveredCount: itemsMap.size,
          uniqueCount: itemsMap.size,
          usableCount: Array.from(itemsMap.values()).filter((i) => i.video_url || i.thumbnail_url).length,
          matchedCount: 0,
          targetCount,
          shortfall: Math.max(0, targetCount - itemsMap.size),
          isMock,
        });
      }

      try {
        const remainingNeeded = targetCount - itemsMap.size;
        const result = await provider.search({
          ...query,
          productName: qStr,
          targetCount: remainingNeeded,
        });

        if (result.items.some((i) => i.is_mock)) {
          isMock = true;
        }

        for (const item of result.items) {
          // Strict deduplication by source + source_id AND permalink
          const dedupeKey = `${item.source}:${item.source_id}`;
          if (!itemsMap.has(dedupeKey)) {
            itemsMap.set(dedupeKey, item);
          }
          if (itemsMap.size >= targetCount) break;
        }
      } catch (err: any) {
        console.error(`[DiscoveryEngine] Error fetching ${source} for query "${qStr}":`, err.message);
      }
    }

    const collectedItems = Array.from(itemsMap.values());
    const shortfall = Math.max(0, targetCount - collectedItems.length);

    if (onProgress) {
      onProgress({
        searchId: "active",
        source,
        status: "completed",
        currentQuery: "Completed collection",
        discoveredCount: collectedItems.length,
        uniqueCount: collectedItems.length,
        usableCount: collectedItems.filter((i) => i.video_url || i.thumbnail_url).length,
        matchedCount: 0,
        targetCount,
        shortfall,
        isMock,
      });
    }

    return {
      items: collectedItems,
      shortfall,
      isMock,
    };
  }
}
