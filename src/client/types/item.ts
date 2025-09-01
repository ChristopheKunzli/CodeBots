
import { TextureName } from "../spritesheet_atlas";
import {Item} from "../world/items/item";

export const ITEM_TYPES: TextureName[] = [
    "furnace",
    "workbench",
    "crate",
    "core",
    "stone_ore",
    "coal_ore",
    "copper_ore",
    "copper_ingot",
    "iron_ore",
    "iron_ingot",
    "wood_log",
    "wood_plank",
    "seed",
    "pickaxe",
    "shovel",
    "axe",
    "iron_rod",
    "nail",
    "iron_frame",
    "iron_plate",
    "reinforced_iron_plate",
    "codebot_item",
    "cement",
    "concrete",
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export type Recipe = {
    inputs: Item[],
    output: Item
}

export type CoreItem = {
    spriteName: TextureName
    currentGathered: number
    goal: number
}

export type CoreStep = {
    stepNumber: number,
    items: CoreItem[]
}

