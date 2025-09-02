import { Recipe } from "../types/recipe";
import { WoodLogItem } from "../world/items/rawRessources/wood_log_item";
import { CraftingTableItem } from "../world/items/crafting_table_item";
import { StoneItem } from "../world/items/rawRessources/stone_item";
import { FurnaceItem } from "../world/items/furnace_item";
import { PickaxeItem } from "../world/items/tools/pickaxeItem";
import { WoodMaterial } from "../world/items/tools/woodMaterial";
import { StoneMaterial } from "../world/items/tools/stoneMaterial";
import { CopperItem } from "../world/items/rawRessources/copper_item";
import { CopperMaterial } from "../world/items/tools/copperMaterial";
import { IronItem } from "../world/items/rawRessources/iron_item";
import { IronMaterial } from "../world/items/tools/ironMaterial";
import { AxeItem } from "../world/items/tools/axeItem";
import { ShovelItem } from "../world/items/tools/shovelItem";

export const craftingRecipes: Recipe[] = [
    // Crafting Stations
    {inputs: [new WoodLogItem(4)], output: new CraftingTableItem(1)},
    {inputs: [new StoneItem(4)], output: new FurnaceItem(1)},

    // Tools
    {inputs: [new WoodLogItem(16)], output: new PickaxeItem(new WoodMaterial())},
    {inputs: [new WoodLogItem(8), new StoneItem(4)], output: new PickaxeItem(new StoneMaterial())},
    {inputs: [new WoodLogItem(8), new CopperItem(4)], output: new PickaxeItem(new CopperMaterial())},
    {inputs: [new WoodLogItem(8), new IronItem(4)], output: new PickaxeItem(new IronMaterial())},

    {inputs: [new WoodLogItem(16)], output: new AxeItem(new WoodMaterial())},
    {inputs: [new WoodLogItem(8), new StoneItem(4)], output: new AxeItem(new StoneMaterial())},
    {inputs: [new WoodLogItem(8), new CopperItem(4)], output: new AxeItem(new CopperMaterial())},
    {inputs: [new WoodLogItem(8), new IronItem(4)], output: new AxeItem(new IronMaterial())},

    {inputs: [new WoodLogItem(16)], output: new ShovelItem(new WoodMaterial())},
    {inputs: [new WoodLogItem(8), new StoneItem(4)], output: new ShovelItem(new StoneMaterial())},
    {inputs: [new WoodLogItem(8), new CopperItem(4)], output: new ShovelItem(new CopperMaterial())},
    {inputs: [new WoodLogItem(8), new IronItem(4)], output: new ShovelItem(new IronMaterial())},

    // Crafting materials
    //{inputs: [new IronIngotItem(1)], output: new },



    // Example Recipes
    // {inputs: [{spriteName: "wood_plank", quantity: 12}, {spriteName: "nail", quantity: 64}], output: {spriteName: "crate", quantity: 1}},
    // {inputs: [{spriteName: "stone", quantity: 8}, {spriteName: "coal", quantity: 2}, {spriteName: "iron_ore", quantity: 1}], output: {spriteName: "furnace_off", quantity: 1}},
    // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "pickaxe", quantity: 1}},
    // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 8}], output: {spriteName: "shovel", quantity: 1}},
    // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "axe", quantity: 1}},
];

