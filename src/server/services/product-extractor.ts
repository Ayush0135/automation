import axios from "axios";
import * as cheerio from "cheerio";

export interface ExtractedProductMetadata {
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  imageUrl: string | null;
  keywords: string[];
  visualAttributes: {
    colorHints?: string[];
    silhouette?: string;
    keywords?: string[];
  };
}

export class ProductExtractorService {
  async extractFromUrl(url: string): Promise<ExtractedProductMetadata> {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 12000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // 1. Try JSON-LD Product schema
      let jsonLdProduct: any = null;
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const content = $(el).html();
          if (!content) return;
          const parsed = JSON.parse(content);
          if (parsed["@type"] === "Product") {
            jsonLdProduct = parsed;
          } else if (Array.isArray(parsed["@graph"])) {
            const found = parsed["@graph"].find((item: any) => item["@type"] === "Product");
            if (found) jsonLdProduct = found;
          }
        } catch {}
      });

      // 2. OpenGraph & Meta tags
      const ogTitle = $('meta[property="og:title"]').attr("content") || $('meta[name="twitter:title"]').attr("content");
      const ogImage = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content");
      const ogDesc = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content");
      const pageTitle = $("title").text().trim();

      // Determine Name
      let name = jsonLdProduct?.name || ogTitle || pageTitle || "Product";
      name = name.split("|")[0].split("-")[0].trim();

      // Determine Brand
      let brand: string | null = null;
      if (typeof jsonLdProduct?.brand === "string") {
        brand = jsonLdProduct.brand;
      } else if (jsonLdProduct?.brand?.name) {
        brand = jsonLdProduct.brand.name;
      } else {
        brand = $('meta[property="product:brand"]').attr("content") || null;
      }

      // Determine Description
      const description = jsonLdProduct?.description || ogDesc || null;

      // Determine Image
      let imageUrl: string | null = null;
      if (Array.isArray(jsonLdProduct?.image)) {
        imageUrl = jsonLdProduct.image[0];
      } else if (typeof jsonLdProduct?.image === "string") {
        imageUrl = jsonLdProduct.image;
      } else if (jsonLdProduct?.image?.url) {
        imageUrl = jsonLdProduct.image.url;
      } else {
        imageUrl = ogImage || $('img[data-main-image]').attr("src") || null;
      }

      // Extract Category & Keywords
      const category = jsonLdProduct?.category || $('meta[property="product:category"]').attr("content") || null;
      const keywords = this.deriveKeywords(name, brand, category, description);

      return {
        name,
        brand,
        category,
        description: description ? description.substring(0, 300) : null,
        imageUrl,
        keywords,
        visualAttributes: {
          colorHints: this.extractColorKeywords(name + " " + (description || "")),
          silhouette: category || "general-goods",
          keywords,
        },
      };
    } catch (err: any) {
      console.warn(`[ProductExtractor] Failed to scrape URL ${url}:`, err.message);
      // Fallback: parse domain and URL path
      const parsedUrl = new URL(url);
      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
      const inferredName = (pathSegments.pop() || "Product").replace(/[-_]/g, " ");

      return {
        name: inferredName,
        brand: parsedUrl.hostname.replace("www.", "").split(".")[0],
        category: null,
        description: null,
        imageUrl: null,
        keywords: [inferredName],
        visualAttributes: {
          keywords: [inferredName],
        },
      };
    }
  }

  extractFromImageUpload(filename: string, originalName?: string): ExtractedProductMetadata {
    const cleanName = (originalName || filename)
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .trim();

    return {
      name: cleanName || "Uploaded Product",
      brand: null,
      category: "consumer-product",
      description: "Uploaded image reference for visual matching",
      imageUrl: `/uploads/${filename}`,
      keywords: cleanName ? [cleanName] : ["product"],
      visualAttributes: {
        colorHints: ["neutral"],
        silhouette: "standard",
        keywords: cleanName ? [cleanName] : [],
      },
    };
  }

  private deriveKeywords(name: string, brand: string | null, category: string | null, desc: string | null): string[] {
    const rawWords = `${name} ${brand || ""} ${category || ""}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["the", "and", "for", "with", "buy", "online", "price", "india"].includes(w));

    return Array.from(new Set(rawWords)).slice(0, 8);
  }

  private extractColorKeywords(text: string): string[] {
    const commonColors = ["black", "white", "silver", "gold", "blue", "red", "green", "pink", "purple", "matte", "grey", "gray"];
    const lower = text.toLowerCase();
    return commonColors.filter((c) => lower.includes(c));
  }
}
