variable "prefix" {}
variable "location" {}
resource "azurerm_resource_group" "rg" { name = "${var.prefix}-rg" location = var.location }
resource "azurerm_virtual_network" "vnet" {
  name = "${var.prefix}-vnet"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space = ["10.20.0.0/16"]
}
resource "azurerm_subnet" "aks" {
  name = "aks-subnet"
  resource_group_name = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes = ["10.20.1.0/24"]
}
output "rg_name" { value = azurerm_resource_group.rg.name }
output "aks_subnet_id" { value = azurerm_subnet.aks.id }
