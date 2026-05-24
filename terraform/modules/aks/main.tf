variable "prefix" {}
variable "location" {}
variable "kubernetes_version" {}
variable "subnet_id" {}
variable "log_analytics_workspace_id" {}
variable "key_vault_id" {}

resource "azurerm_container_registry" "acr" {
  name = replace("${var.prefix}acr", "-", "")
  resource_group_name = "${var.prefix}-rg"
  location = var.location
  sku = "Premium"
  admin_enabled = false
}

resource "azurerm_kubernetes_cluster" "aks" {
  name = "${var.prefix}-aks"
  location = var.location
  resource_group_name = "${var.prefix}-rg"
  dns_prefix = "${var.prefix}-dns"
  kubernetes_version = var.kubernetes_version
  default_node_pool {
    name = "system"
    node_count = 3
    vm_size = "Standard_D4s_v5"
    vnet_subnet_id = var.subnet_id
  }
  identity { type = "SystemAssigned" }
  oms_agent { log_analytics_workspace_id = var.log_analytics_workspace_id }
  azure_policy_enabled = true
}

resource "azurerm_role_assignment" "aks_acr" {
  scope = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
}

output "cluster_name" { value = azurerm_kubernetes_cluster.aks.name }
output "acr_login_server" { value = azurerm_container_registry.acr.login_server }
