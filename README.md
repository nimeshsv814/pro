# AI Deployment Failure Prediction Platform

Enterprise-grade cloud-native DevOps intelligence platform on Azure + AKS.

## Services
- `api-gateway`: unified API, RBAC, service orchestration
- `ingestion-service`: collects CI/CD, git, k8s, metrics, logs metadata
- `prediction-service`: Azure OpenAI risk and failure prediction engine
- `automation-service`: canary, rollback, validation, self-healing controls
- `incident-service`: incident summaries and optimization reports
- `frontend`: React + Tailwind operations dashboard

## Stack
Node.js/Express, MongoDB, Docker, AKS, Helm, Terraform, Prometheus, Grafana, Azure Monitor, Azure OpenAI.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
