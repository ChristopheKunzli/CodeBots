import { ToolMaterial } from "./toolMaterial";
import { ResourceType } from "../../../types/resource_type";
import { Tool } from "./tool";

export class AxeItem extends Tool {
    constructor(material: ToolMaterial) {
        super("axe", material, [ResourceType.WOOD]);
    }
}

