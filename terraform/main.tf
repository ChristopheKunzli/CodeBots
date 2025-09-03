provider "azurerm" {
    features {
        resource_group {
            prevent_deletion_if_contains_resources = false
        }
    }
    subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "resource_group" {
    for_each = var.environments
    name     = "codebots-${each.key}-resource-group"
    location = "France Central"
}

resource "azurerm_service_plan" "service_plan" {
    for_each = var.environments
    name                = "codebots-${each.key}-service-plan"
    location            = azurerm_resource_group.resource_group[each.key].location
    resource_group_name = azurerm_resource_group.resource_group[each.key].name
    os_type             = "Linux"
    sku_name            = "B1"
}

resource "azurerm_cosmosdb_account" "cosmos_account" {
    for_each = var.environments
    name                = "codebots-${each.key}-cosmos-account"
    location            = azurerm_resource_group.resource_group[each.key].location
    resource_group_name = azurerm_resource_group.resource_group[each.key].name
    offer_type          = "Standard"
    kind                = "MongoDB"

    consistency_policy {
        consistency_level = "Session"
    }

    geo_location {
        location          = azurerm_resource_group.resource_group[each.key].location
        failover_priority = 0
    }
}

resource "azurerm_linux_web_app" "linux_web_app" {
    for_each = var.environments
    name                = "codebots-${each.key}-web-app"
    resource_group_name = azurerm_resource_group.resource_group[each.key].name
    location            = azurerm_service_plan.service_plan[each.key].location
    service_plan_id     = azurerm_service_plan.service_plan[each.key].id
    depends_on          = [
        azurerm_service_plan.service_plan,
        azurerm_cosmosdb_account.cosmos_account
    ]

    https_only          = true
    site_config {
        minimum_tls_version = "1.2"
        application_stack {
            node_version = "20-lts"
        }
    }

    app_settings = {
        SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
        DISABLE_SAVE = var.disable_save
        CLERK_SECRET_KEY = var.clerk_secret_key
        CLERK_PUBLISHABLE_KEY = var.clerk_publishable_key
        DB_CONNECTION_STRING = azurerm_cosmosdb_account.cosmos_account[each.key].primary_mongodb_connection_string
    }
}
