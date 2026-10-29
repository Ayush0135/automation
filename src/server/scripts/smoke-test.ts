import dotenv from "dotenv";
import { DiscoveryEngine } from "../services/discovery-engine.js";
import { MatchingService } from "../services/matching-service.js";

dotenv.config();

async function runSmokeTest() {
  console.log("=================================================");
  console.log("🚀 PRODUCT VIDEO DISCOVERY — SMOKE TEST SUITE");
  console.log("=================================================");

  const engine = new DiscoveryEngine();
  const matcher = new MatchingService(0.65);

  console.log("\n1. Inspecting Provider Health & Credentials Status:");
  const statuses = engine.getProvidersStatus();
  console.log(`- Instagram: [${statuses.instagram.status.toUpperCase()}] ${statuses.instagram.message}`);
  console.log(`- Meta Ads:  [${statuses.meta_ad_library.status.toUpperCase()}] ${statuses.meta_ad_library.message}`);

  const testProduct = {
    productName: "Cosmic Byte Mechanical Keyboard",
    brand: "Cosmic Byte",
    category: "Gaming Peripherals",
    keywords: ["mechanical keyboard", "rgb", "switches"],
    targetCount: 5,
  };

  console.log(`\n2. Running Discovery Pipeline for: "${testProduct.productName}"`);
  console.time("Discovery Duration");

  const results = await engine.runDiscovery(testProduct, (progress) => {
    console.log(`  [Progress] ${progress.source} -> Found: ${progress.discoveredCount}/${progress.targetCount}`);
  });

  console.timeEnd("Discovery Duration");

  console.log("\n3. Evaluating Results & Scoring:");
  console.log(`- Instagram Discovered: ${results.instagram.items.length} items (Shortfall: ${results.instagram.shortfall})`);
  console.log(`- Meta Ads Discovered:  ${results.meta_ad_library.items.length} items (Shortfall: ${results.meta_ad_library.shortfall})`);

  const sampleCandidate = results.instagram.items[0];
  if (sampleCandidate) {
    const evalResult = matcher.evaluateCandidate(sampleCandidate, testProduct);
    console.log("\n4. Sample Candidate Evaluation:");
    console.log(`  - Source ID:    ${sampleCandidate.source_id}`);
    console.log(`  - Creator/Page: ${sampleCandidate.advertiser_name}`);
    console.log(`  - Permalnk:     ${sampleCandidate.permalink}`);
    console.log(`  - Similarity:   ${Math.round(evalResult.similarityScore * 100)}%`);
    console.log(`  - Match Status: ${evalResult.matchStatus}`);
    console.log(`  - Explanation:  ${evalResult.matchExplanation}`);
    console.log(`  - Evidence:     ${evalResult.evidenceType}`);
  }

  console.log("\n=================================================");
  console.log("✅ SMOKE TEST COMPLETED SUCCESSFULLY");
  console.log("=================================================\n");
  process.exit(0);
}

runSmokeTest().catch((err) => {
  console.error("❌ Smoke test failed:", err);
  process.exit(1);
});
