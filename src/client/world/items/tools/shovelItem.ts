import { ToolMaterial } from "./toolMaterial";
import { Tool } from "./tool";

export class ShovelItem extends Tool {
    constructor(material: ToolMaterial) {
        super("shovel", material, []);
    }
}
