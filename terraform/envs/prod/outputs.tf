output "aks_name" { value = module.aks.cluster_name }
output "acr_login_server" { value = module.aks.acr_login_server }
output "key_vault_name" { value = module.security.key_vault_name }
