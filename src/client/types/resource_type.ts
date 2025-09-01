export enum ResourceType {
    WOOD = "Wood",
    STONE = "Stone",
    IRON = "Iron",
    COPPER = "Copper",
    COAL = "Coal",
};

export const RESOURCE_TYPES = Object.values(ResourceType)
    .map(key => key.toLowerCase());
