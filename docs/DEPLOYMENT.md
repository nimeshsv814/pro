# Deployment Guide

## 1. Provision Infrastructure
- Configure Terraform backend and credentials.
- Run from `terraform/envs/prod`:
  - `terraform init`
  - `terraform plan -out tfplan`
  - `terraform apply tfplan`

## 2. Build and Push Containers
- Configure Azure DevOps service connections for ACR and AKS.
- Run `.azuredevops/azure-pipelines.yml`.

## 3. Deploy Platform to AKS
- `helm upgrade --install ai-devops helm/ai-devops-platform -n ai-devops --create-namespace`

## 4. Enable Monitoring
- Deploy Prometheus/Grafana manifests under `k8s/monitoring`.
- Import `k8s/monitoring/grafana-dashboard.json` into Grafana.
- Connect Azure Monitor Container Insights to AKS.

## 5. Configure Secrets
- Set `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` in Key Vault.
- Sync secrets to Kubernetes (CSI Secret Store or External Secrets).

## 6. Pre-Deployment AI Risk Gate
- Pipeline stage `AIGate` runs `scripts/predeploy-risk-gate.js`.
- Deployment is blocked if risk score >= 75.

## 7. Production Hardening
- Add mTLS (service mesh), OPA policy controls, and private endpoints.
- Enable WAF on Application Gateway ingress.
- Add backup/restore strategy for MongoDB and disaster recovery runbooks.
