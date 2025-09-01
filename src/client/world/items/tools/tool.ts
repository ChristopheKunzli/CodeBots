import { Item } from "../item";
import { ResourceType } from "../../../types/resource_type";
import Tile from "../../tile";
import { TextureName } from "../../../spritesheet_atlas";
import { ToolMaterial } from "./toolMaterial";


export abstract class Tool extends Item {
    private material: ToolMaterial;
    private strongAgainst: ResourceType[];

    protected constructor(spriteName: TextureName, material: ToolMaterial, strongAgainst: ResourceType[]) {
        super(spriteName, 1);
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


