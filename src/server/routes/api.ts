import { Router, Request, Response } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../db.js";
import { DiscoveryEngine } from "../services/discovery-engine.js";
import { ProductExtractorService } from "../services/product-extractor.js";
import { MatchingService } from "../services/matching-service.js";
import { aiKeywordService } from "../services/ai-keyword-service.js";

export const apiRouter = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `prod_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const discoveryEngine = new DiscoveryEngine();
const productExtractor = new ProductExtractorService();
const matchingService = new MatchingService();

// In-memory active search progress tracker for SSE & polling
const activeSearchesProgress = new Map<string, any>();

/* =========================================================================
   1. Health & Status
   ========================================================================= */
apiRouter.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      version: "1.0.0",
    });
  } catch (err: any) {
    res.status(500).json({ status: "unhealthy", error: err.message });
  }
});

apiRouter.get("/providers/status", (_req: Request, res: Response) => {
  const statuses = discoveryEngine.getProvidersStatus();
  res.json({
    timestamp: new Date().toISOString(),
    providers: statuses,
  });
});

/* =========================================================================
   2. Product Inspection (URL or Upload)
   ========================================================================= */
apiRouter.post("/products/inspect", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    const file = req.file;

    if (!url && !file) {
      res.status(400).json({ error: "Either a product URL or an uploaded image is required" });
      return;
    }

    let metadata;
    if (url) {
      metadata = await productExtractor.extractFromUrl(url);
    } else if (file) {
      metadata = productExtractor.extractFromImageUpload(file.filename, file.originalname);
    }

    res.json({ success: true, metadata });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to inspect product", message: err.message });
  }
});

/* =========================================================================
   3. Search Orchestration
   ========================================================================= */
const searchSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  brand: z.string().optional(),
  category: z.string().optional(),
  productUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  requestedCount: z.number().int().min(1).max(50).default(20),
});

apiRouter.post("/search", async (req: Request, res: Response): Promise<void> => {
  const parseResult = searchSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Validation failed", details: parseResult.error.errors });
    return;
  }

  const data = parseResult.data;

  // AI-driven product entity expansion and keyword enrichment
  const aiExpanded = aiKeywordService.expandProductSearch(data.productName, data.brand, data.category, data.keywords);
  if (!data.brand && aiExpanded.detectedBrand) {
    data.brand = aiExpanded.detectedBrand;
  }
  if (!data.category && aiExpanded.category) {
    data.category = aiExpanded.category;
  }
  data.keywords = Array.from(new Set([...data.keywords, ...aiExpanded.positiveKeywords]));

  try {
    // 1. Create or link Product in DB
    const product = await prisma.product.create({
      data: {
        name: data.productName,
        brand: data.brand || null,
        category: data.category || null,
        productUrl: data.productUrl || null,
        imageUrl: data.imageUrl || null,
        description: data.description || null,
        visualAttributes: JSON.stringify({ keywords: data.keywords }),
      },
    });

    // 2. Create Search record in DB
    const search = await prisma.search.create({
      data: {
        productId: product.id,
        status: "running",
        requestedInstagramCount: data.requestedCount,
        requestedMetaCount: data.requestedCount,
      },
    });

    // Initialize progress entry
    activeSearchesProgress.set(search.id, {
      searchId: search.id,
      status: "running",
      instagram: { discovered: 0, usable: 0, matched: 0, target: data.requestedCount, shortfall: data.requestedCount },
      meta: { discovered: 0, usable: 0, matched: 0, target: data.requestedCount, shortfall: data.requestedCount },
    });

    // Execute Discovery in Background
    executeSearchPipeline(search.id, product, data).catch((err) => {
      console.error(`[SearchPipeline] Unhandled error for search ${search.id}:`, err);
    });

    res.status(202).json({
      searchId: search.id,
      productId: product.id,
      status: "running",
      message: "Search pipeline initiated",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to initiate search", message: err.message });
  }
});

/* =========================================================================
   4. Search Progress (SSE & Polling)
   ========================================================================= */
apiRouter.get("/search/:id/progress", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // If SSE is requested via Accept header
  if (req.headers.accept?.includes("text/event-stream")) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const interval = setInterval(async () => {
      const live = activeSearchesProgress.get(id);
      if (live) {
        res.write(`data: ${JSON.stringify(live)}\n\n`);
        if (live.status === "completed" || live.status === "failed") {
          clearInterval(interval);
          res.end();
        }
      } else {
        const dbSearch = await prisma.search.findUnique({ where: { id } });
        if (dbSearch) {
          res.write(
            `data: ${JSON.stringify({
              searchId: id,
              status: dbSearch.status,
              instagram: {
                discovered: dbSearch.discoveredInstagramCount,
                usable: dbSearch.usableInstagramCount,
                matched: dbSearch.matchedCount,
              },
              meta: {
                discovered: dbSearch.discoveredMetaCount,
                usable: dbSearch.usableMetaCount,
                matched: dbSearch.matchedCount,
              },
            })}\n\n`
          );
          if (dbSearch.status !== "running") {
            clearInterval(interval);
            res.end();
          }
        }
      }
    }, 800);

    req.on("close", () => clearInterval(interval));
    return;
  }

  // Standard JSON polling
  const live = activeSearchesProgress.get(id);
  if (live) {
    res.json(live);
    return;
  }

  const search = await prisma.search.findUnique({ where: { id } });
  if (!search) {
    res.status(404).json({ error: "Search not found" });
    return;
  }

  res.json({
    searchId: search.id,
    status: search.status,
    instagram: {
      discovered: search.discoveredInstagramCount,
      usable: search.usableInstagramCount,
    },
    meta: {
      discovered: search.discoveredMetaCount,
      usable: search.usableMetaCount,
    },
    matchedCount: search.matchedCount,
    errorSummary: search.errorSummary,
  });
});

/* =========================================================================
   5. Search Results with Filtering & Pagination
   ========================================================================= */
apiRouter.get("/search/:id/results", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { source, minScore, showDuplicates, showPreviouslySeen, limit = "50", offset = "0" } = req.query;

  try {
    const search = await prisma.search.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!search) {
      res.status(404).json({ error: "Search not found" });
      return;
    }

    const whereClause: any = { searchId: id };

    if (source && (source === "instagram" || source === "meta_ad_library")) {
      whereClause.video = { source };
    }

    // Strict AI Relevance: Exclude candidates flagged as irrelevant (memes, drama serials, non-matching noise)
    whereClause.matchStatus = { not: "irrelevant" };

    if (minScore) {
      whereClause.similarityScore = { gte: parseFloat(minScore as string) };
    }

    if (showDuplicates === "false") {
      whereClause.isDuplicate = false;
    }

    if (showPreviouslySeen === "false") {
      whereClause.isPreviouslySeen = false;
    }

    const [total, results] = await Promise.all([
      prisma.searchResult.count({ where: whereClause }),
      prisma.searchResult.findMany({
        where: whereClause,
        include: { video: true },
        orderBy: { similarityScore: "desc" },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
    ]);

    const mappedResults = results.map((r) => {
      const meta = r.video.metadataJson ? JSON.parse(r.video.metadataJson) : {};
      const isMock = meta.is_mock !== undefined ? Boolean(meta.is_mock) : true;
      return {
        id: r.id,
        videoId: r.videoId,
        source: r.video.source,
        sourceId: r.video.sourceId,
        permalink: r.video.permalink,
        advertiserName: r.video.advertiserName,
        captionOrAdText: r.video.captionOrAdText,
        thumbnailUrl: r.video.thumbnailUrl,
        videoUrl: r.video.videoUrl,
        mediaType: r.video.mediaType,
        similarityScore: r.similarityScore,
        matchStatus: r.matchStatus,
        matchExplanation: r.matchExplanation,
        evidenceType: r.evidenceType,
        isDuplicate: r.isDuplicate,
        isPreviouslySeen: r.isPreviouslySeen,
        isMock,
        discoveryMethod: meta.discovery_method || (isMock ? "mock_fallback" : "live_api"),
        firstDiscoveredAt: r.video.firstDiscoveredAt,
        metadata: meta,
      };
    });

    const realIgCount = mappedResults.filter((r) => r.source === "instagram" && !r.isMock).length;
    const mockIgCount = mappedResults.filter((r) => r.source === "instagram" && r.isMock).length;
    const realMetaCount = mappedResults.filter((r) => r.source === "meta_ad_library" && !r.isMock).length;
    const mockMetaCount = mappedResults.filter((r) => r.source === "meta_ad_library" && r.isMock).length;

    res.json({
      search,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      counts: {
        realInstagram: realIgCount,
        mockInstagram: mockIgCount,
        realMeta: realMetaCount,
        mockMeta: mockMetaCount,
      },
      results: mappedResults,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve results", message: err.message });
  }
});

/* =========================================================================
   6. Search Details & History
   ========================================================================= */
apiRouter.get("/search/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const search = await prisma.search.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!search) {
    res.status(404).json({ error: "Search not found" });
    return;
  }

  res.json({ search });
});

apiRouter.get("/history", async (_req: Request, res: Response) => {
  try {
    const searches = await prisma.search.findMany({
      include: { product: true },
      orderBy: { startedAt: "desc" },
      take: 20,
    });
    res.json({ history: searches });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load history", message: err.message });
  }
});

apiRouter.get("/history/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const search = await prisma.search.findUnique({
    where: { id },
    include: { product: true, results: { include: { video: true } } },
  });

  if (!search) {
    res.status(404).json({ error: "History record not found" });
    return;
  }

  res.json({ search });
});

/* =========================================================================
   Background Discovery Pipeline Implementation
   ========================================================================= */
async function executeSearchPipeline(searchId: string, product: any, data: any) {
  try {
    // 1. Fetch existing known fingerprints from database for cross-search duplicate detection
    const existingFps = await prisma.videoFingerprint.findMany({
      select: { fingerprintValue: true },
    });
    const knownFpSet = new Set<string>(existingFps.map((fp) => fp.fingerprintValue));

    // 2. Run Discovery Engine
    const discoveryResult = await discoveryEngine.runDiscovery(
      {
        productName: data.productName,
        brand: data.brand,
        category: data.category,
        keywords: data.keywords,
        targetCount: data.requestedCount,
      },
      (progress) => {
        const current = activeSearchesProgress.get(searchId) || {};
        if (progress.source === "instagram") {
          current.instagram = {
            discovered: progress.discoveredCount,
            usable: progress.usableCount,
            target: progress.targetCount,
            shortfall: progress.shortfall,
          };
        } else {
          current.meta = {
            discovered: progress.discoveredCount,
            usable: progress.usableCount,
            target: progress.targetCount,
            shortfall: progress.shortfall,
          };
        }
        activeSearchesProgress.set(searchId, current);
      }
    );

    const allCandidates = [
      ...discoveryResult.instagram.items,
      ...discoveryResult.meta_ad_library.items,
    ];

    let matchedCount = 0;

    // 3. Process and Persist candidates
    for (const candidate of allCandidates) {
      // Upsert Video record
      const video = await prisma.video.upsert({
        where: {
          source_sourceId: {
            source: candidate.source,
            sourceId: candidate.source_id,
          },
        },
        update: {
          lastSeenAt: new Date(),
          thumbnailUrl: candidate.thumbnail_url || undefined,
          videoUrl: candidate.video_url || undefined,
        },
        create: {
          source: candidate.source,
          sourceId: String(candidate.source_id),
          permalink: candidate.permalink,
          advertiserName: candidate.advertiser_name ? String(candidate.advertiser_name) : null,
          captionOrAdText: candidate.caption_or_ad_text ? (typeof candidate.caption_or_ad_text === "string" ? candidate.caption_or_ad_text : JSON.stringify(candidate.caption_or_ad_text)) : null,
          thumbnailUrl: candidate.thumbnail_url,
          videoUrl: candidate.video_url,
          mediaType: candidate.media_type,
          metadataJson: JSON.stringify(candidate.metadata_json),
          firstDiscoveredAt: new Date(candidate.published_at || Date.now()),
        },
      });

      // AI Match Evaluation
      const evalResult = matchingService.evaluateCandidate(
        candidate,
        {
          name: product.name,
          brand: product.brand,
          category: product.category,
          keywords: data.keywords,
        },
        knownFpSet
      );

      if (evalResult.matchStatus === "matched" || evalResult.matchStatus === "verified_match") {
        matchedCount++;
      }

      // Persist SearchResult
      await prisma.searchResult.create({
        data: {
          searchId,
          videoId: video.id,
          similarityScore: evalResult.similarityScore,
          matchStatus: evalResult.matchStatus,
          matchExplanation: evalResult.matchExplanation,
          evidenceType: evalResult.evidenceType,
          isDuplicate: evalResult.isDuplicate,
          isPreviouslySeen: evalResult.isPreviouslySeen,
        },
      });

      // Persist Fingerprints & add to set
      for (const fp of evalResult.fingerprints) {
        if (!knownFpSet.has(fp.value)) {
          await prisma.videoFingerprint.create({
            data: {
              videoId: video.id,
              fingerprintType: fp.type,
              fingerprintValue: fp.value,
            },
          });
          knownFpSet.add(fp.value);
        }
      }
    }

    // 4. Update Search record
    await prisma.search.update({
      where: { id: searchId },
      data: {
        status: "completed",
        discoveredInstagramCount: discoveryResult.instagram.items.length,
        discoveredMetaCount: discoveryResult.meta_ad_library.items.length,
        usableInstagramCount: discoveryResult.instagram.items.filter((i) => i.video_url || i.thumbnail_url).length,
        usableMetaCount: discoveryResult.meta_ad_library.items.filter((i) => i.video_url || i.thumbnail_url).length,
        matchedCount,
        completedAt: new Date(),
      },
    });

    // Update in-memory progress tracker
    activeSearchesProgress.set(searchId, {
      searchId,
      status: "completed",
      instagram: {
        discovered: discoveryResult.instagram.items.length,
        usable: discoveryResult.instagram.items.filter((i) => i.video_url || i.thumbnail_url).length,
        target: data.requestedCount,
        shortfall: discoveryResult.instagram.shortfall,
      },
      meta: {
        discovered: discoveryResult.meta_ad_library.items.length,
        usable: discoveryResult.meta_ad_library.items.filter((i) => i.video_url || i.thumbnail_url).length,
        target: data.requestedCount,
        shortfall: discoveryResult.meta_ad_library.shortfall,
      },
      matchedCount,
    });
  } catch (err: any) {
    console.error(`[SearchPipeline] Pipeline failed for ${searchId}:`, err);
    await prisma.search.update({
      where: { id: searchId },
      data: {
        status: "failed",
        errorSummary: err.message,
        completedAt: new Date(),
      },
    });
    activeSearchesProgress.set(searchId, {
      searchId,
      status: "failed",
      error: err.message,
    });
  }
}
