variable "subscription_id" {
    type    = string
    default = ""
}

variable "disable_save" {
    type    = string
    default = ""
}

variable "clerk_secret_key" {
    type    = string
    default = ""
    sensitive = true
}

variable "clerk_publishable_key" {
    type    = string
    default = ""
}

variable "environments" {
    type    = set(string)
    default = ["dev", "stable"]
}
