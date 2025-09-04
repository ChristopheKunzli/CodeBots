export enum InteractableType {
    CHEST = "Chest",
    FURNACE = "Furnace",
    CRAFTING_TABLE = "Crafting_table",
    CORE = "Core",
    CODEBOT = "Codebot",
}

export const INTERACTABLE_TYPES = Object.values(InteractableType)
    .map(key => key.toLowerCase());
