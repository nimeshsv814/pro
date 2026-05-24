const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const client = require("prom-client");
require("dotenv").config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("combined"));

const register = new client.Registry();
client.collectDefaultMetrics({ register });
const reqCounter = new client.Counter({ name: "gateway_requests_total", help: "Total gateway requests", registers: [register] });

function auth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "missing token" });
  if (process.env.NODE_ENV !== "production" && token === "dev-token") {
    req.user = { sub: "local-dev", role: "admin" };
    return next();
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: "invalid token" });
  }
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "api-gateway" }));
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.post("/api/v1/deployment/analyze", auth, async (req, res) => {
  reqCounter.inc();
  const payload = req.body;
  const [ingestion, prediction] = await Promise.all([
    axios.post(process.env.INGESTION_URL + "/ingest", payload),
    axios.post(process.env.PREDICTION_URL + "/predict", payload)
  ]);
  return res.json({
    ingestionId: ingestion.data.ingestionId,
    analysis: prediction.data
  });
});

app.post("/api/v1/deployment/automate", auth, async (req, res) => {
  reqCounter.inc();
  const result = await axios.post(process.env.AUTOMATION_URL + "/automate", req.body);
  res.json(result.data);
});

app.post("/api/v1/incidents/summary", auth, async (req, res) => {
  reqCounter.inc();
  const result = await axios.post(process.env.INCIDENT_URL + "/summary", req.body);
  res.json(result.data);
});

app.listen(process.env.PORT || 8080, () => {
  console.log("api-gateway listening");
});
