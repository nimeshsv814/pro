const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

function decidePlan(riskScore) {
  if (riskScore >= 75) return { strategy: "rollback", actions: ["abort release", "rollback to stable", "open p1 incident"] };
  if (riskScore >= 45) return { strategy: "canary", actions: ["deploy 10% canary", "run health validation", "auto-promote on SLO pass"] };
  return { strategy: "full", actions: ["standard rollout", "enable health probes", "post-deploy checks"] };
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "automation-service" }));

app.post("/automate", (req, res) => {
  const riskScore = Number(req.body?.deploymentRiskScore || 0);
  const plan = decidePlan(riskScore);
  res.json({
    riskScore,
    ...plan,
    autoscaling: { enabled: true, minReplicas: 2, maxReplicas: 12, cpuTarget: 65 },
    selfHealing: { restartOnCrashLoop: true, validateReadinessBeforeTrafficShift: true }
  });
});

app.listen(process.env.PORT || 8080, () => console.log("automation-service listening"));
