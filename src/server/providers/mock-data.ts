import { NormalizedDiscoveredVideo } from "./types.js";

// Sample verified public creative assets for realistic testing
const REALISTIC_SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
];

const REALISTIC_THUMBNAILS = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&auto=format&fit=crop&q=80",
];

const CREATORS = [
  "tech_unboxed_daily",
  "lifestyle_gadgets_in",
  "urban_reviews",
  "daily_essentials_hub",
  "gear_patrol_studio",
  "gadget_byte_official",
  "the_minimal_desk",
  "fit_tech_india",
  "unbox_therapy_fan",
  "everyday_carry_in",
];

const BRANDS = [
  "boAt Lifestyle",
  "Noise Tech",
  "Nothing Tech",
  "OnePlus Store",
  "Sony Electronics",
  "Fire-Boltt Official",
  "Boult Audio",
  "Titan Smart",
];

export function generateRealisticCandidates(
  source: "instagram" | "meta_ad_library",
  query: string,
  count: number = 20
): NormalizedDiscoveredVideo[] {
  const items: NormalizedDiscoveredVideo[] = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const creator = CREATORS[(i - 1) % CREATORS.length];
    const brand = BRANDS[(i - 1) % BRANDS.length];
    const thumb = REALISTIC_THUMBNAILS[(i - 1) % REALISTIC_THUMBNAILS.length];
    const video = i % 4 === 0 ? null : REALISTIC_SAMPLE_VIDEOS[(i - 1) % REALISTIC_SAMPLE_VIDEOS.length]; // 25% simulate restricted video DRM
    const dateOffset = (i * 12) + (i % 3);
    const pubDate = new Date(now.getTime() - dateOffset * 3600 * 1000).toISOString();

    const isAd = source === "meta_ad_library";
    const sourceId = isAd ? `ad_${100000000000 + i}` : `reel_C${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const permalink = isAd
      ? `https://www.facebook.com/ads/library/?id=${sourceId}`
      : `https://www.instagram.com/reel/${sourceId.replace("reel_", "")}/`;

    const caption = isAd
      ? `⚡ Special Offer: Get the all-new ${query} with 40% OFF today! Premium design, all-day battery life, and crystal-clear clarity. Tap Shop Now. #Sale #${query.replace(/\s+/g, "")} #TrendingAd`
      : `Just unboxed the ${query}! 🔥 Here is my honest 48-hour hands-on review. Is it worth the hype? Watch till the end! #${query.replace(/\s+/g, "")} #TechReels #HonestReview #DailyCarry`;

    items.push({
      source,
      source_id: sourceId,
      permalink,
      advertiser_name: isAd ? brand : creator,
      caption_or_ad_text: caption,
      thumbnail_url: thumb,
      video_url: video,
      media_type: "video",
      published_at: pubDate,
      discovery_method: "mock_fallback",
      discovered_at: new Date().toISOString(),
      metadata_json: {
        is_mock: true,
        source_engine: isAd ? "meta_ad_library_simulated" : "instagram_reel_simulated",
        likes: Math.floor(Math.random() * 50000) + 120,
        views: Math.floor(Math.random() * 250000) + 500,
        currency: "INR",
        country_targeted: "IN",
      },
      collection_status: video ? "usable" : "discovered",
      is_mock: true,
    });
  }

  return items;
}
