variable "prefix" {}
variable "location" {}
resource "azurerm_log_analytics_workspace" "law" {
  name = "${var.prefix}-law"
  location = var.location
  resource_group_name = "${var.prefix}-rg"
  sku = "PerGB2018"
}
resource "azurerm_monitor_data_collection_endpoint" "dce" {
  name = "${var.prefix}-dce"
  location = var.location
  resource_group_name = "${var.prefix}-rg"
}
output "log_analytics_workspace_id" { value = azurerm_log_analytics_workspace.law.id }
