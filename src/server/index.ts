import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { apiRouter } from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product assets
const uploadDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadDir));

// Mount API routes
app.use("/api", apiRouter);

// Serve client build in production if available
const clientDist = path.resolve(process.cwd(), "dist/client");
app.use(express.static(clientDist));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  const indexPath = path.join(clientDist, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send("Product Video Discovery Dashboard API Server is running. Frontend dev server is at http://localhost:5173");
    }
  });
});

let server: any;

if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`🚀 Video Discovery Server running on http://localhost:${PORT}`);
    console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`📊 Provider status: http://localhost:${PORT}/api/providers/status`);
  });

  process.on("SIGTERM", () => {
    server?.close(() => console.log("Server shut down gracefully"));
  });
}

export { app, server };
