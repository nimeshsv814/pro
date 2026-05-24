const fs = require("fs");
const axios = require("axios");

async function main() {
  const payload = {
    commit: { hash: process.env.BUILD_SOURCEVERSION || "local", changes: fs.readdirSync(".") },
    kubernetes: { helmChart: "helm/ai-devops-platform" },
    deploymentLogs: ["pre-deployment validation"],
    buildHistory: [{ id: process.env.BUILD_BUILDID || 0, status: "running" }],
    metrics: { podRestarts: 2, cpuUtilization: 55, memoryUtilization: 60 }
  };

  const resp = await axios.post(process.env.RISK_API_URL, payload, {
    headers: { Authorization: `Bearer ${process.env.RISK_API_TOKEN}` }
  });

  const score = resp.data.analysis?.deploymentRiskScore || 0;
  console.log(`Risk score: ${score}`);
  if (score >= 75) {
    console.error("Risk gate failed. Blocking deployment.");
    process.exit(1);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
