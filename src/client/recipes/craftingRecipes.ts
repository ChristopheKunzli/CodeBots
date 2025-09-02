import { Recipe } from "../types/recipe";
import { WoodLogItem } from "../world/items/rawRessources/wood_log_item";
import { CraftingTableItem } from "../world/items/stations/crafting_table_item";
import { StoneItem } from "../world/items/rawRessources/stone_item";
import { FurnaceItem } from "../world/items/stations/furnace_item";
import { PickaxeItem } from "../world/items/tools/pickaxeItem";
import { WoodMaterial } from "../world/items/tools/woodMaterial";
import { StoneMaterial } from "../world/items/tools/stoneMaterial";
import { CopperMaterial } from "../world/items/tools/copperMaterial";
import { IronMaterial } from "../world/items/tools/ironMaterial";
import { AxeItem } from "../world/items/tools/axeItem";
import { WoodPlankItem } from "../world/items/craft_ingredients/wood_plank_item";
import { NailItem } from "../world/items/craft_ingredients/nail_item";
import { IronIngotItem } from "../world/items/craft_ingredients/iron_ingot_item";
import { IronPlateItem } from "../world/items/craft_ingredients/iron_plate_item";
import { IronRodItem } from "../world/items/craft_ingredients/iron_rod_item";
import { ReinforcedIronPlateItem } from "../world/items/craft_ingredients/reinforced_iron_plate_item";
import { CopperIngotItem } from "../world/items/craft_ingredients/copper_ingot_item";
import { IronFrameItem } from "../world/items/craft_ingredients/iron_frame_item";
import { CodeBotItem } from "../world/items/CodeBotItem";

export const craftingRecipes: Recipe[] = [
    // Crafting Stations
    {inputs: [new WoodPlankItem(32)], output: new CraftingTableItem(1)},
    {inputs: [new StoneItem(32)], output: new FurnaceItem(1)},

    // Crafting ingredients
    {inputs: [new WoodLogItem(1)], output: new WoodPlankItem(2)},
    {inputs: [new IronIngotItem(1)], output: new NailItem(8)},
    {inputs: [new IronIngotItem(2)], output: new IronRodItem(1)},
    {inputs: [new IronIngotItem(4), new NailItem(8)], output: new IronPlateItem(1)},
    {inputs: [new IronRodItem(4), new NailItem(16)], output: new IronFrameItem(1)},
    {inputs: [new IronPlateItem(2), new IronFrameItem(4), new NailItem(32)], output: new ReinforcedIronPlateItem(1)},

    // Tools
    {inputs: [new WoodPlankItem(16)], output: new PickaxeItem(new WoodMaterial())},
    {inputs: [new WoodPlankItem(8), new StoneItem(4)], output: new PickaxeItem(new StoneMaterial())},
    {inputs: [new WoodPlankItem(8), new CopperIngotItem(4)], output: new PickaxeItem(new CopperMaterial())},
    {inputs: [new WoodPlankItem(8), new IronIngotItem(4)], output: new PickaxeItem(new IronMaterial())},

    {inputs: [new WoodPlankItem(16)], output: new AxeItem(new WoodMaterial())},
    {inputs: [new WoodPlankItem(8), new StoneItem(4)], output: new AxeItem(new StoneMaterial())},
    {inputs: [new WoodPlankItem(8), new CopperIngotItem(4)], output: new AxeItem(new CopperMaterial())},
    {inputs: [new WoodPlankItem(8), new IronIngotItem(4)], output: new AxeItem(new IronMaterial())},

    // Removing shovel for now
    //{inputs: [new WoodPlankItem(16)], output: new ShovelItem(new WoodMaterial())},
    //{inputs: [new WoodPlankItem(8), new StoneItem(4)], output: new ShovelItem(new StoneMaterial())},
    //{inputs: [new WoodPlankItem(8), new CopperIngotItem(4)], output: new ShovelItem(new CopperMaterial())},
    //{inputs: [new WoodPlankItem(8), new IronIngotItem(4)], output: new ShovelItem(new IronMaterial())},

    // CodeBots
    {
        inputs: [
            new ReinforcedIronPlateItem(2),
            new IronPlateItem(4),
            new IronFrameItem(8),
            new IronRodItem(16),
            new NailItem(64)
        ],
        output: new CodeBotItem(1)
    }
];

