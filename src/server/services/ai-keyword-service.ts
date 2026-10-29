export interface AiExpandedProduct {
  normalizedName: string;
  detectedBrand: string;
  category: string;
  modelAliases: string[];
  searchQueries: string[];
  positiveKeywords: string[];
  negativeKeywords: string[];
}

export class AiKeywordService {
  /**
   * Intelligently decompose and expand product input into targeted search queries,
   * model aliases, semantic keywords, and negative filters.
   */
  expandProductSearch(
    productName: string,
    brand?: string | null,
    category?: string | null,
    userKeywords: string[] = []
  ): AiExpandedProduct {
    const rawName = productName.trim();
    const rawBrand = (brand || "").trim();

    // 1. Detect Brand if present in product name
    const commonBrands = [
      "Sony", "boAt", "Apple", "Samsung", "Dyson", "Nothing", "OnePlus",
      "Bose", "JBL", "Sennheiser", "Xiaomi", "Realme", "Google", "Asus",
      "Dell", "HP", "Lenovo", "Nike", "Adidas", "Puma", "Zara", "Lego"
    ];

    let detectedBrand = rawBrand;
    if (!detectedBrand) {
      for (const b of commonBrands) {
        if (new RegExp(`\\b${b}\\b`, "i").test(rawName)) {
          detectedBrand = b;
          break;
        }
      }
    }

    // Clean product name if brand is prefixed
    let cleanProductName = rawName;
    if (detectedBrand) {
      cleanProductName = cleanProductName
        .replace(new RegExp(`^${detectedBrand}\\s*`, "i"), "")
        .trim();
      if (!cleanProductName) cleanProductName = rawName;
    }

    // 2. Identify Model Tokens & Variations
    // e.g. WH-1000XM5 -> WH1000XM5, 1000XM5, XM5
    const modelAliases = new Set<string>();
    modelAliases.add(cleanProductName);

    const skuMatch = cleanProductName.match(/([a-zA-Z]{1,4}[-_]?[0-9]{2,5}[a-zA-Z]{0,4})/i);
    if (skuMatch) {
      const sku = skuMatch[1];
      modelAliases.add(sku);
      modelAliases.add(sku.replace(/[-_]/g, "")); // e.g. WH1000XM5
      const numLetters = sku.match(/[0-9]+[a-zA-Z]+/i);
      if (numLetters) modelAliases.add(numLetters[0]); // e.g. 1000XM5
      const shortAlias = sku.match(/[a-zA-Z]+[0-9]+/i);
      if (shortAlias) modelAliases.add(shortAlias[0]); // e.g. XM5
    }

    // e.g. AirPods Pro 2 -> AirPods Pro, AirPods
    if (/airpods/i.test(cleanProductName)) {
      modelAliases.add("AirPods Pro");
      modelAliases.add("AirPods");
    }
    // e.g. Airdopes 141 ANC -> Airdopes 141, Airdopes
    if (/airdopes/i.test(cleanProductName)) {
      const num = cleanProductName.match(/\d+/);
      if (num) modelAliases.add(`Airdopes ${num[0]}`);
      modelAliases.add("Airdopes");
    }

    // 3. Auto-infer Category if empty
    let detectedCategory = category || "";
    if (!detectedCategory) {
      const text = `${cleanProductName} ${detectedBrand}`.toLowerCase();
      if (/xm5|wh-|airpods|airdopes|headphones|earbuds|anc|earphones|headset|audio|soundbar|tws/i.test(text)) {
        detectedCategory = "Audio & Headphones";
      } else if (/phone|smartphone|galaxy|iphone|pixel|mobile/i.test(text)) {
        detectedCategory = "Smartphones";
      } else if (/airwrap|dryer|styler|shaver|grooming|perfume|cologne/i.test(text)) {
        detectedCategory = "Beauty & Personal Care";
      } else if (/watch|smartwatch|band/i.test(text)) {
        detectedCategory = "Smartwatches & Wearables";
      } else if (/shoes|sneakers|jacket|hoodie|shirt/i.test(text)) {
        detectedCategory = "Apparel & Footwear";
      } else {
        detectedCategory = "Consumer Tech";
      }
    }

    // 4. Generate High-Relevance Positive Keywords
    const positiveKeywords = new Set<string>();
    if (detectedBrand) positiveKeywords.add(detectedBrand.toLowerCase());

    // Add individual model words
    cleanProductName
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 2 && !["the", "and", "for", "with", "pro"].includes(w))
      .forEach((w) => positiveKeywords.add(w));

    Array.from(modelAliases).forEach((a) => {
      a.toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 2)
        .forEach((w) => positiveKeywords.add(w));
    });

    userKeywords.forEach((k) => {
      if (k.trim().length > 1) positiveKeywords.add(k.trim().toLowerCase());
    });

    // Category feature tags
    if (detectedCategory.includes("Audio")) {
      positiveKeywords.add("sound");
      positiveKeywords.add("bass");
      positiveKeywords.add("noise cancelling");
      positiveKeywords.add("anc");
      positiveKeywords.add("earbuds");
      positiveKeywords.add("headphones");
    }

    // 5. Generate Ranked Search Queries (avoid duplicate brand words)
    const searchQueries: string[] = [];
    const brandPrefix = detectedBrand ? `${detectedBrand} ` : "";

    // Query 1: Exact Brand + Full Product Name & clean product name
    if (cleanProductName) {
      searchQueries.push(cleanProductName);
    }
    searchQueries.push(`${brandPrefix}${cleanProductName}`.trim());

    // Query 2: Exact SKU or Primary Model Alias
    const primaryAlias = Array.from(modelAliases)[1] || Array.from(modelAliases)[0];
    if (primaryAlias && primaryAlias !== cleanProductName) {
      searchQueries.push(`${brandPrefix}${primaryAlias}`.trim());
    }

    // Query 3: Intent query (unboxing / review) for authentic content
    searchQueries.push(`${brandPrefix}${cleanProductName} unboxing`.trim());
    searchQueries.push(`${brandPrefix}${cleanProductName} review`.trim());

    // Query 4: Hashtag format for Instagram
    if (detectedBrand && primaryAlias) {
      const tagClean = `${detectedBrand}${primaryAlias}`.replace(/[^a-zA-Z0-9]/g, "");
      searchQueries.push(`#${tagClean.toLowerCase()}`);
    }

    // 6. Negative Keywords to filter out spam, soap operas, memes, and irrelevant content
    const negativeKeywords = [
      "drama", "serial", "episode", "natak", "kurulus", "dating", "template",
      "savage love", "dance challenge", "funny video", "bollywood gossip",
      "free trial episode", "juwaari", "dramas", "web series", "full episode"
    ];

    return {
      normalizedName: cleanProductName,
      detectedBrand: detectedBrand || "",
      category: detectedCategory,
      modelAliases: Array.from(modelAliases),
      searchQueries: Array.from(new Set(searchQueries)),
      positiveKeywords: Array.from(positiveKeywords),
      negativeKeywords,
    };
  }
}

export const aiKeywordService = new AiKeywordService();
