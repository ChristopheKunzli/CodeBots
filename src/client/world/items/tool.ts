import Tile from "../tile";
import { Item } from "./item";
import { ResourceType } from "../../types/resource_type";
import { TextureName } from "../../spritesheet_atlas";

type MaterialType = "wood" | "stone" | "copper" | "iron";

class ToolMaterial {
    materialType: MaterialType;
    coefficient: number;

    constructor(materialType: MaterialType, coefficient: number) {
        this.materialType = materialType;
        this.coefficient = coefficient;
    }
}

abstract class Tool extends Item {
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

class AxeItem extends Tool {
    constructor(material: ToolMaterial) {
        super("axe", material, [ResourceType.WOOD]);
    }
}

class PickaxeItem extends Tool {
    constructor(material: ToolMaterial) {
        super("pickaxe", material, [ResourceType.STONE, ResourceType.IRON, ResourceType.COPPER, ResourceType.STONE, ResourceType.COAL]);
    }
}

class ShovelItem extends Tool {
    constructor(material: ToolMaterial) {
        super("shovel", material, []);
    }
}

class WoodMaterial extends ToolMaterial {
    constructor() {
        super("wood", 5);
    }
}

class StoneMaterial extends ToolMaterial {
    constructor() {
        super("stone", 10);
    }
}

class CopperMaterial extends ToolMaterial {
    constructor() {
        super("copper", 20);
    }
}

class IronMaterial extends ToolMaterial {
    constructor() {
        super("iron", 40);
    }
}

export {
    Tool,
    AxeItem,
    PickaxeItem,
    ShovelItem,
    WoodMaterial,
    StoneMaterial,
    CopperMaterial,
    IronMaterial
};

