import express from "express";
import dotenv from "dotenv";
import { startEnrichment } from "./services/fullEnrich.js";
import { verificationResults } from "./store/results.js";
import { classifyRole } from "./logic/classifyRole.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.static("public")); // serves index.html

// ---------- VERIFY ----------
app.post("/verify", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email required" });
  }

  const entry = verificationResults.get(email);

  // ✅ Already completed → do NOT start again
  if (entry?.status === "COMPLETED") {
    return res.json({
      status: "COMPLETED",
      result: entry.result,
    });
  }

  // ⏳ Already in progress → do NOT start again
  if (entry?.status === "IN_PROGRESS") {
    return res.json({
      status: "IN_PROGRESS",
      message: "Verification already in progress",
    });
  }

  // 🚀 Start enrichment ONCE
  const enrichmentId = await startEnrichment(email);

  verificationResults.set(email, {
    status: "IN_PROGRESS",
    enrichmentId,
  });

  console.log("Started enrichment:", enrichmentId);

  res.json({
    status: "IN_PROGRESS",
    message: "Verification started. Please wait 30–90 seconds.",
  });
});

app.get("/status", (req, res) => {
  const { email } = req.query;
  const entry = verificationResults.get(email);

  console.log("STATUS CHECK:", email, entry);

  if (!entry) {
    return res.json({ status: "NOT_STARTED" });
  }

  if (entry.status === "COMPLETED") {
    return res.json({
      status: "COMPLETED",
      result: entry.result,
    });
  }

  return res.json({ status: "IN_PROGRESS" });
});

// ---------- WEBHOOK (MATCH DOCS) ----------
app.post("/api/enrich/webhook", (req, res) => {
  console.log("🔥 WEBHOOK RECEIVED 🔥");
  console.log("Status:", req.body.status);

  const enriched = req.body?.datas?.[0];

  // Find the in-progress entry
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Webhook URL: ${process.env.BASE_URL}/webhook`);
});
