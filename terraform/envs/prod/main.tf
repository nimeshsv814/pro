module "network" {
  source = "../../modules/network"
  prefix = var.prefix
  location = var.location
}

module "security" {
  source = "../../modules/security"
  prefix = var.prefix
  location = var.location
}

module "monitoring" {
  source = "../../modules/monitoring"
  prefix = var.prefix
  location = var.location
}

module "aks" {
  source = "../../modules/aks"
  prefix = var.prefix
  location = var.location
  kubernetes_version = var.kubernetes_version
  subnet_id = module.network.aks_subnet_id
  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id
  key_vault_id = module.security.key_vault_id
}
