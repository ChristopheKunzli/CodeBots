
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
    "wood_pickaxe",
    "stone_pickaxe",
    "copper_pickaxe",
    "iron_pickaxe",
    "wood_axe",
    "stone_axe",
    "copper_axe",
    "iron_axe",
    "wood_shovel",
    "stone_shovel",
    "copper_shovel",
    "iron_shovel",
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

export type CoreItem = {
    item: Item;
    currentGathered: number
}

export type CoreStep = {
    name: string;
    items: CoreItem[];
}

