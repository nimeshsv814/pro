const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { MongoClient, ObjectId } = require("mongodb");
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

app.get("/health", (_req, res) => res.json({ ok: true, service: "ingestion-service" }));

app.post("/ingest", async (req, res) => {
  const body = req.body;
  const doc = {
    createdAt: new Date(),
    commit: body.commit,
    kubernetes: body.kubernetes,
    helm: body.helm,
    deploymentLogs: body.deploymentLogs,
    buildHistory: body.buildHistory,
    metrics: body.metrics
  };
  const result = await db.collection("deployment_inputs").insertOne(doc);
  res.json({ ingestionId: result.insertedId.toString() });
});

app.get("/history/:id", async (req, res) => {
  const doc = await db.collection("deployment_inputs").findOne({ _id: new ObjectId(req.params.id) });
  if (!doc) return res.status(404).json({ error: "not found" });
  res.json(doc);
});

init().then(() => app.listen(process.env.PORT || 8080, () => console.log("ingestion-service listening")));
