import { CoreStep } from "../types/item";
import { WoodLogItem } from "../world/items/rawRessources/wood_log_item";
import { StoneItem } from "../world/items/rawRessources/stone_item";
import { CoalItem } from "../world/items/rawRessources/coal_item";
import { IronIngotItem } from "../world/items/craft_ingredients/iron_ingot_item";
import { CopperIngotItem } from "../world/items/craft_ingredients/copper_ingot_item";
import { IronRodItem } from "../world/items/craft_ingredients/iron_rod_item";
import { IronFrameItem } from "../world/items/craft_ingredients/iron_frame_item";
import { IronPlateItem } from "../world/items/craft_ingredients/iron_plate_item";
import { ReinforcedIronPlateItem } from "../world/items/craft_ingredients/reinforced_iron_plate_item";
import { NailItem } from "../world/items/craft_ingredients/nail_item";
import { CodeBotItem } from "../world/items/CodeBotItem";

export const coreStepsRecipes: CoreStep[] = [
    {
        name: "Âge de Pierre",
        items: [
            {item: new WoodLogItem(2500), currentGathered: 0},
            {item: new StoneItem(5000), currentGathered: 0},
        ],
    },

    {
        name: "Âge de Cuivre",
        items: [
            {item: new WoodLogItem(3000), currentGathered: 0},
            {item: new CopperIngotItem(3000), currentGathered: 0},
            {item: new CoalItem(6000), currentGathered: 0},
        ],
    },

    {
        name: "Âge de Fer",
        items: [
            {item: new WoodLogItem(4000), currentGathered: 0},
            {item: new IronIngotItem(6000), currentGathered: 0},
            {item: new CoalItem(9000), currentGathered: 0},
        ],
    },

    {
        name: "Âge Moderne",
        items: [
            {item: new WoodLogItem(5000), currentGathered: 0},
            {item: new CopperIngotItem(2000), currentGathered: 0},
            {item: new IronIngotItem(2000), currentGathered: 0},
            {item: new CoalItem(9000), currentGathered: 0},
            {item: new IronRodItem(8000), currentGathered: 0},
            {item: new IronFrameItem(8000), currentGathered: 0},
            {item: new IronPlateItem(3000), currentGathered: 0},
            {item: new ReinforcedIronPlateItem(1500), currentGathered: 0},
            {item: new NailItem(12000), currentGathered: 0},
            {item: new CodeBotItem(100), currentGathered: 0}
        ],
    }

];