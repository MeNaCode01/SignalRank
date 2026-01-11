import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { startEnrichment } from "./services/fullEnrich.js";
import { verificationResults } from "./store/results.js";
import { classifyRole } from "./logic/classifyRole.js";

dotenv.config();

const app = express();

// ---------- PATH SETUP ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- MIDDLEWARE ----------
app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------- SERVE FRONTEND ----------
app.use(express.static(path.join(__dirname, "dist")));

// ---------- API ROUTES ----------
app.post("/verify", async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const entry = verificationResults.get(email);

  if (entry?.status === "COMPLETED") {
    return res.json({ status: "COMPLETED", result: entry.result });
  }

  if (entry?.status === "IN_PROGRESS") {
    return res.json({ status: "IN_PROGRESS" });
  }

  const enrichmentId = await startEnrichment(email);

  verificationResults.set(email, {
    status: "IN_PROGRESS",
    enrichmentId,
  });

  console.log("Started enrichment:", enrichmentId);

  res.json({
    status: "IN_PROGRESS",
    message: "Verification started",
  });
});

app.get("/status", (req, res) => {
  const email = req.query?.email?.trim().toLowerCase();
  const entry = verificationResults.get(email);

  if (!entry) return res.json({ status: "NOT_STARTED" });

  if (entry.status === "COMPLETED") {
    return res.json({ status: "COMPLETED", result: entry.result });
  }

  res.json({ status: "IN_PROGRESS" });
});

// ---------- WEBHOOK ----------
app.post("/api/enrich/webhook", (req, res) => {
  console.log("🔥 WEBHOOK RECEIVED 🔥");
  console.log("Status:", req.body.status);

  const enriched = req.body?.datas?.[0];

  for (const [email, entry] of verificationResults.entries()) {
    if (entry.status === "IN_PROGRESS") {
      const classification = classifyRole(enriched);

      verificationResults.set(email, {
        status: "COMPLETED",
        result: classification,
      });

      console.log("Marked COMPLETED for:", email);
      break;
    }
  }

  res.status(200).send("OK");
});

// ---------- SPA FALLBACK (MUST BE LAST) ----------
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook URL: ${process.env.BASE_URL}/api/enrich/webhook`);
});
