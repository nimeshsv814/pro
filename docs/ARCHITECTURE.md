# Architecture

```mermaid
flowchart LR
  A[Developer Commit] --> B[Azure DevOps Pipeline]
  B --> C[Build & Push to ACR]
  B --> D[AI Risk Gate Script]
  D --> E[API Gateway]
  E --> F[Ingestion Service]
  E --> G[Prediction Service + Azure OpenAI]
  E --> H[Automation Service]
  E --> I[Incident Service + Azure OpenAI]
  G --> J[(MongoDB)]
  F --> J
  B -->|If pass| K[Helm Deploy to AKS]
  K --> L[Microservices + Frontend]
  L --> M[Prometheus]
  M --> N[Grafana]
  L --> O[Azure Monitor + Log Analytics]
```

## Microservices
- API Gateway: auth, request routing, orchestration.
- Ingestion Service: collects deployment context and historical data.
- Prediction Service: risk score, failure probability, root-cause forecasting.
- Automation Service: canary/rollback/autoscaling/self-healing decisions.
- Incident Service: AI-generated incident summaries and optimization reports.
