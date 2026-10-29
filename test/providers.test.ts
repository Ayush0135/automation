import { describe, it, expect } from "vitest";
import { InstagramDiscoveryService } from "../src/server/providers/instagram.js";
import { MetaAdDiscoveryService } from "../src/server/providers/meta-ad.js";
import { DiscoveryEngine } from "../src/server/services/discovery-engine.js";

describe("Video Discovery Providers", () => {
  it("reports provider health status accurately without credentials", () => {
    const igService = new InstagramDiscoveryService();
    const metaService = new MetaAdDiscoveryService();

    const igStatus = igService.getStatus();
    const metaStatus = metaService.getStatus();

    expect(igStatus.source).toBe("instagram");
    expect(["ready", "limited", "unconfigured"]).toContain(igStatus.status);

    expect(metaStatus.source).toBe("meta_ad_library");
    expect(["ready", "limited", "unconfigured"]).toContain(metaStatus.status);
  });

  it("returns authentic candidates with honest mock tagging in fallback mode", async () => {
    const igService = new InstagramDiscoveryService();
    const result = await igService.search({
      productName: "Wireless Noise Cancelling Headphones",
      keywords: ["anc", "audio"],
      targetCount: 5,
    });

    expect(result.source).toBe("instagram");
    expect(result.items.length).toBe(5);
    expect(result.discoveredCount).toBe(5);
    expect(result.usableCount).toBeGreaterThanOrEqual(1);

    const first = result.items[0];
    expect(first.permalink).toContain("instagram.com");
    expect(first.thumbnail_url).toBeTruthy();
    expect(first.discovery_method).toBe("mock_fallback");
    expect(first.is_mock).toBe(true);
  });

  it("handles shortfall reporting and generates query variants", async () => {
    const engine = new DiscoveryEngine();
    const variants = engine.generateQueryVariants("Smart Ring", "Ultrahuman", "Fitness Tracker", ["sleep", "hrv"]);

    expect(variants.length).toBeGreaterThan(2);
    expect(variants).toContain("Smart Ring");
    expect(variants).toContain("Ultrahuman Smart Ring");

    const discovery = await engine.runDiscovery({
      productName: "Minimalist Watch",
      brand: "Nordgreen",
      keywords: ["chronograph"],
      targetCount: 6,
    });

    expect(discovery.instagram.items.length).toBe(6);
    expect(discovery.meta_ad_library.items.length).toBe(6);
    expect(discovery.instagram.shortfall).toBe(0);
    expect(discovery.meta_ad_library.shortfall).toBe(0);
  });
});
