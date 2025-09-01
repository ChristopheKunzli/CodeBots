import { Item } from "../item";
import { ResourceType } from "../../../types/resource_type";
import Tile from "../../tile";
import { TextureName } from "../../../spritesheet_atlas";
import { ToolMaterial } from "./toolMaterial";
import {MaterialType} from "./toolMaterial";

type ToolType = "axe" | "pickaxe" | "shovel";

export abstract class Tool extends Item {
    private material: ToolMaterial;
    private strongAgainst: ResourceType[];

    protected constructor(toolType: ToolType, material: ToolMaterial, strongAgainst: ResourceType[]) {
        const spriteName = `${material.materialType}_${toolType}` as TextureName;
        super(spriteName, 1, false);
        this.material = material;
        this.strongAgainst = strongAgainst;
    }

    public use(tile: Tile): boolean {
        return false;
    }

    public efficiency(resourceType: ResourceType): number {
        return this.strongAgainst.includes(resourceType) ? this.material.coefficient : 1;
    }
}


