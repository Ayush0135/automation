import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app, server } from "../src/server/index.js";
import { prisma } from "../src/server/db.js";

describe("API Endpoints Integration", () => {
  afterAll(async () => {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  });

  it("GET /api/health returns healthy and database connected", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.database).toBe("connected");
  });

  it("GET /api/providers/status reports both Instagram and Meta statuses", async () => {
    const res = await request(app).get("/api/providers/status");
    expect(res.status).toBe(200);
    expect(res.body.providers.instagram).toBeDefined();
    expect(res.body.providers.meta_ad_library).toBeDefined();
  });

  it("POST /api/search rejects empty payload and validates schema", async () => {
    const res = await request(app).post("/api/search").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("POST /api/search creates a search and retrieves results", async () => {
    const createRes = await request(app)
      .post("/api/search")
      .send({
        productName: "AirPods Pro 2",
        brand: "Apple",
        keywords: ["earbuds", "spatial audio"],
        requestedCount: 4,
      });

    expect(createRes.status).toBe(202);
    expect(createRes.body.searchId).toBeDefined();

    const searchId = createRes.body.searchId;

    // Wait slightly for background pipeline execution
    await new Promise((resolve) => setTimeout(resolve, 800));

    const progressRes = await request(app).get(`/api/search/${searchId}/progress`);
    expect(progressRes.status).toBe(200);
    expect(progressRes.body.searchId).toBe(searchId);

    const resultsRes = await request(app).get(`/api/search/${searchId}/results`);
    expect(resultsRes.status).toBe(200);
    expect(Array.isArray(resultsRes.body.results)).toBe(true);
  });
});
