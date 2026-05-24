variable "prefix" {}
variable "location" {}
resource "azurerm_user_assigned_identity" "identity" {
  name = "${var.prefix}-uami"
  location = var.location
  resource_group_name = "${var.prefix}-rg"
}
resource "azurerm_key_vault" "kv" {
  name = replace("${var.prefix}kv", "-", "")
  location = var.location
  resource_group_name = "${var.prefix}-rg"
  tenant_id = data.azurerm_client_config.current.tenant_id
  sku_name = "standard"
  purge_protection_enabled = true
}
data "azurerm_client_config" "current" {}
output "key_vault_id" { value = azurerm_key_vault.kv.id }
output "key_vault_name" { value = azurerm_key_vault.kv.name }
