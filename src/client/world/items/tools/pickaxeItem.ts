import { ToolMaterial } from "./toolMaterial";
import { ResourceType } from "../../../types/resource_type";
import { Tool } from "./tool";

export class PickaxeItem extends Tool {
    constructor(material: ToolMaterial) {
        super("pickaxe", material, [ResourceType.STONE, ResourceType.IRON, ResourceType.COPPER, ResourceType.STONE, ResourceType.COAL]);
    }
}

