const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "3mb" }));
app.use(morgan("combined"));

async function summarizeIncident(payload) {
  const prompt = `Generate JSON: incidentSummary, rootCauseAnalysis, optimizationReport, infrastructureRecommendations. Data=${JSON.stringify(payload).slice(0, 12000)}`;
  const resp = await axios.post(
    `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`,
    { messages: [{ role: "system", content: "Return strict JSON." }, { role: "user", content: prompt }], temperature: 0.1 },
    { headers: { "api-key": process.env.AZURE_OPENAI_API_KEY } }
  );
  return JSON.parse(resp.data.choices[0].message.content);
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'incident-service' }));

app.post('/summary', async (req, res) => {
  try {
    const summary = await summarizeIncident(req.body);
    res.json(summary);
  } catch {
    res.json({
      incidentSummary: 'Fallback summary: deployment anomaly detected.',
      rootCauseAnalysis: 'Probable config and runtime saturation factors.',
      optimizationReport: 'Tune resource requests/limits and rollout strategy.',
      infrastructureRecommendations: ['enable zonal node pools', 'tighten HPA and probe thresholds']
    });
  }
});

app.listen(process.env.PORT || 8080, () => console.log('incident-service listening'));
