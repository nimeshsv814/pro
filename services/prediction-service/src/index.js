const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "3mb" }));
app.use(morgan("combined"));

let db;
async function init() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.MONGO_DB || "devops_ai");
}

function heuristicScore(payload) {
  const restarts = payload?.metrics?.podRestarts || 0;
  const cpu = payload?.metrics?.cpuUtilization || 0;
  const mem = payload?.metrics?.memoryUtilization || 0;
  const priorFailures = payload?.buildHistory?.filter((x) => x.status === "failed").length || 0;
  return Math.min(100, Math.round(restarts * 5 + cpu * 0.3 + mem * 0.3 + priorFailures * 8));
}

async function openAIAnalysis(payload, score) {
  const prompt = `You are a DevOps SRE analyst. Return JSON with: rootCausePrediction, scalingRecommendations, rollbackSuggestions, riskNarrative. Input score=${score}, data=${JSON.stringify(payload).slice(0, 12000)}`;
  const resp = await axios.post(
    `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`,
    {
      messages: [{ role: "system", content: "Respond only in JSON." }, { role: "user", content: prompt }],
      temperature: 0.2
    },
    { headers: { "api-key": process.env.AZURE_OPENAI_API_KEY } }
  );
  return JSON.parse(resp.data.choices[0].message.content);
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "prediction-service" }));

app.post("/predict", async (req, res) => {
  const payload = req.body;
  const score = heuristicScore(payload);
  let ai = {
    rootCausePrediction: "insufficient data",
    scalingRecommendations: ["Enable HPA with CPU and memory targets"],
    rollbackSuggestions: ["Use progressive canary with automated abort at 5xx threshold"],
    riskNarrative: "Heuristic fallback response"
  };
  try {
    ai = await openAIAnalysis(payload, score);
  } catch (_e) {}
  const output = {
    deploymentRiskScore: score,
    failureProbability: Math.min(0.98, score / 100 + 0.05),
    ...ai,
    createdAt: new Date()
  };
  await db.collection("predictions").insertOne(output);
  res.json(output);
});

init().then(() => app.listen(process.env.PORT || 8080, () => console.log("prediction-service listening")));
