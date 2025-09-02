import { CoreStep } from "../types/item";
import { WoodLogItem } from "../world/items/rawRessources/wood_log_item";
import { StoneItem } from "../world/items/rawRessources/stone_item";
import { CoalItem } from "../world/items/rawRessources/coal_item";
import { IronIngotItem } from "../world/items/craft_ingredients/iron_ingot_item";
import { CopperIngotItem } from "../world/items/craft_ingredients/copper_ingot_item";

export const coreStepsRecipes: CoreStep[] = [
    {
        name: "Âge de Pierre",
        items: [
            {item: new WoodLogItem(2500), currentGathered: 0},
            {item: new StoneItem(5000), currentGathered: 0},
        ],
    },

    {
        name: "Âge de Bronze",
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
            {item: new CopperIngotItem(1500), currentGathered: 0},
            {item: new IronIngotItem(1500), currentGathered: 0},
            {item: new CoalItem(12000), currentGathered: 0},
        ],
    }

];