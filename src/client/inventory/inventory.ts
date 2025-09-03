import { INVENTORY_STACK_SIZE } from "../constants";
import Observable from "../observer/observable";
import { InventorySlot } from "../types/inventory";
import { Item } from "../world/items/item";
import { Tool } from "../world/items/tools/tool";
import { FurnaceItem } from "../world/items/stations/furnace_item";
import { CrateItem } from "../world/items/stations/cratet_item";
import { CraftingTableItem } from "../world/items/stations/crafting_table_item";

export default class Inventory extends Observable<InventorySlot[]> {
    private itemInHandIndex: number;

    constructor(size: number) {
        super(Array.from({length: size}, () => null));

        this.itemInHandIndex = 0;
    }

    get itemInHand(): InventorySlot {
        return this.items[this.itemInHandIndex];
    }

    setItemInHandIndex(index: number) {
        this.itemInHandIndex = index;
        this.notify();
    }

    getItemInHandIndex(): number {
        return this.itemInHandIndex;
    }

    get items(): InventorySlot[] {
        return this.state;
    }

    getItemAtIndex(index: number): InventorySlot | null {
        if (index < 0 || index >= this.items.length) {
            throw new Error(`Index ${index} is out of bounds`);
        }
        return this.items[index];
    }

    canAddItem(item: Item): boolean {
        if (!item.isStackable) {
            return this.items.some(slot => slot === null);
        }

        const space = this.items.reduce((acc, slot) => {
            if (!slot) {
                return acc + INVENTORY_STACK_SIZE;
            }

            if (slot.spriteName === item.spriteName) {
                return acc + INVENTORY_STACK_SIZE - slot.quantity;
            }

            return acc;
        }, 0);

        return Math.min(item.quantity, space) === item.quantity;
    }

    canRemoveItem(item: Item): boolean {
        const available = this.items.reduce((acc, slot) => {
            if (slot?.spriteName === item.spriteName) {
                return acc + slot.quantity;
            }

            return acc;
        }, 0);

        return Math.min(item.quantity, available) === item.quantity;
    }

    addItem(item: Item, quantity = item.quantity): number {
        const isTool = item instanceof Tool;
        let remaining = quantity;

        // fill existing stacks
        for (const slot of this.items) {
            if (isTool) break;
            if (remaining <= 0) break;
            if (!slot) continue;

            if (slot.spriteName === item.spriteName) {
                const canAdd = Math.min(INVENTORY_STACK_SIZE - slot.quantity, remaining);
                slot.quantity += canAdd;
                remaining -= canAdd;
            }
        }

        // fill empty slots
        for (let i = 0; i < this.items.length; i++) {
            if (remaining <= 0) break;

            if (!this.items[i]) {
                const toAdd = Math.min(INVENTORY_STACK_SIZE, remaining);
                if (isTool) {
                    this.items[i] = item;
                } else {
                    this.items[i] = new (Object.getPrototypeOf(item).constructor)(toAdd);
                }
                remaining -= toAdd;
            }
        }

        this.notify();

        return item.quantity - remaining;
    }

    removeItem(item: Item, quantity = item.quantity): number {
        let remaining = quantity;

        for (let i = 0; i < this.items.length; i++) {
            const slot = this.items[i];
            if (!slot) continue;

            if (slot.spriteName === item.spriteName) {
                const toRemove = Math.min(slot.quantity, remaining);
                slot.quantity -= toRemove;
                remaining -= toRemove;

                if (slot.quantity === 0) {
                    this.items[i] = null;
                }

                if (remaining <= 0) break;
            }
        }

        this.notify();

        return item.quantity - remaining;
    }

    isEmpty(): boolean {
        return this.items.every((slot) => !slot);
    }

    public toJSON(): any {
        return {
            items: this.items,
            itemInHandIndex: this.itemInHandIndex
        };
    }

    public static fromJSON(inventory: any): Inventory {
        const inv = new Inventory(inventory.items.length);
        const items = inventory.items;

        for (let i = 0; i < inv.items.length; ++i) {
            if (!items[i]) {
                inv.items[i] = null;
                continue;
            }

            inv.items[i] = this.makeItem(items[i]);
        }

        return inv;
    }

    private static getClassNameFromSpriteName(spriteName: string): string {
        const parts: string[] = spriteName.split('_');
        let className: string = "";
        for (const part of parts) {
            className += part.charAt(0).toUpperCase() + part.slice(1);
        }
        return className + "Item";
    }

    private static makeTool(item: any): Tool {
        const nameParts = item.spriteName.split('_');
        const toolType = nameParts[1];
        const materialType = nameParts[0];

        const className = toolType.charAt(0).toUpperCase() + toolType.slice(1) + "Item";
        const materialClassName = materialType.charAt(0).toUpperCase() + materialType.slice(1) + "Material";

        return new (require(`../world/items/tools/${className}`).default)(new (require(`../world/items/tools`).ToolMaterial)[materialClassName]());
    }

    private static makeStation(item: any) {
        switch (item.spriteName) {
            case "workbench":
                return new CraftingTableItem(1);
            case "furnace":
                return new FurnaceItem(1);
            case"crate":
                return new CrateItem(1);
            default:
                throw new Error(`Unknown station item: ${item.spriteName}`);
        }
    }

    private static makeRawResource(item: any): Item {
        const filePath = `../world/items/rawResources/${item.spriteName + "_item"}`;
        const className = this.getClassNameFromSpriteName(item.spriteName);
        const module = require(filePath);
        return new module[className](item.quantity);
    }

    private static makeCraftIngredient(item: any): Item {
        const filePath = `../world/items/craft_ingredients/${item.spriteName + "_item"}`;
        const className = this.getClassNameFromSpriteName(item.spriteName);
        const module = require(filePath);
        return new module[className](item.quantity);
    }

    private static makeCodebot(item: any) {
        const filePath = `../world/items/codebot_item`;
        const className = "CodebotItem";
        const module = require(filePath);
        return new module[className](1);
    }

    private static makeItem(item: any): Item {
        switch (item.spriteName) {
            case "workbench":
            case "furnace":
            case "crate":
                return this.makeStation(item);
            case "coal":
            case "copper_ore":
            case "iron_ore":
            case "stone_ore":
            case "wood_log":
                return this.makeRawResource(item);
            case "wood_pickaxe":
            case "stone_pickaxe":
            case "copper_pickaxe":
            case "iron_pickaxe":
            case "wood_axe":
            case "stone_axe":
            case "copper_axe":
            case "iron_axe":
            case "wood_shovel":
            case "stone_shovel":
            case "copper_shovel":
            case "iron_shovel":
                return this.makeTool(item);
            case "cement":
            case "concrete":
            case "copper_ingot":
            case "iron_frame":
            case "iron_ingot":
            case "iron_plate":
            case "iron_rod":
            case "nail":
            case "reinforced_iron_plate":
            case "wood_plank":
                return this.makeCraftIngredient(item);
            case "codebot_item":
                return this.makeCodebot(item);
            default:
                throw new Error(`Unknown item: ${item.spriteName}`);
        }
    }

}
