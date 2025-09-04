import { Item } from "../item";
import { ResourceType } from "../../../types/resource_type";
import Tile from "../../tile";
import { TextureName } from "../../../spritesheet_atlas";
import { ToolMaterial } from "./toolMaterial";
import {MaterialType} from "./toolMaterial";

type ToolType = "axe" | "pickaxe" | "shovel";

/**
 * Base class for all tools in the game
 * Tools are items that can interact with specific resource types more efficiently
 */
export abstract class Tool extends Item {
    private material: ToolMaterial;
    private strongAgainst: ResourceType[];

    /**
     * Creates a new Tool
     * @param toolType The type of the tool
     * @param material The material this tool is made of
     * @param strongAgainst List of resource types this tool is effective against
     */
    protected constructor(toolType: ToolType, material: ToolMaterial, strongAgainst: ResourceType[]) {
        const spriteName = `${material.materialType}_${toolType}` as TextureName;
        super(spriteName, 1, false);
        this.material = material;
        this.strongAgainst = strongAgainst;
    }

    public use(tile: Tile): boolean {
        return false;
    }

    /**
     * Gets the efficiency multiplier of this tool against a resource type.
     * @param resourceType The resource type to check.
     * @returns The efficiency multiplier (greater than 1 if strong against).
     */
    public efficiency(resourceType: ResourceType): number {
        return this.strongAgainst.includes(resourceType) ? this.material.coefficient : 1;
    }
}


