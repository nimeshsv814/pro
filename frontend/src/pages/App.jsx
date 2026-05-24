import { useState } from "react";
import axios from "axios";

const samplePayload = {
  commit: { hash: "abc123", filesChanged: ["deployment.yaml", "values.yaml"] },
  kubernetes: { manifests: ["apiVersion: apps/v1"], cluster: "aks-prod" },
  helm: { chart: "ai-devops-platform", valuesDiff: "resources changed" },
  buildHistory: [{ id: 1001, status: "success" }, { id: 1002, status: "failed" }],
  deploymentLogs: ["readiness probe timeout", "pod restarted"],
  metrics: { podRestarts: 4, cpuUtilization: 68, memoryUtilization: 71 }
};

export default function App() {
  const [result, setResult] = useState(null);

  async function runAnalysis() {
    const res = await axios.post("/api/v1/deployment/analyze", samplePayload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || "dev-token"}` }
    });
    setResult(res.data);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-bold">AI Deployment Failure Prediction</h1>
        <button onClick={runAnalysis} className="rounded bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Run Pre-Deploy Analysis</button>
        <pre className="rounded border border-cyan-900 bg-slate-900 p-4 text-sm">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </main>
  );
}
