import { Recipe } from "../types/recipe";
import { CopperItem } from "../world/items/rawRessources/copper_item";
import { CoalItem } from "../world/items/rawRessources/coal_item";
import { CopperIngotItem } from "../world/items/craft_ingredients/copper_ingot_item";
import { IronItem } from "../world/items/rawRessources/iron_item";
import { IronIngotItem } from "../world/items/craft_ingredients/iron_ingot_item";

export const furnaceRecipes: Recipe[] = [
    {inputs: [new CopperItem(4), new CoalItem(4)], output: new CopperIngotItem(1)},
    {inputs: [new IronItem(4), new CoalItem(4)], output: new IronIngotItem(1)},
];