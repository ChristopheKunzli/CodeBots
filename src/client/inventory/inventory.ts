import { INVENTORY_STACK_SIZE } from "../constants";
import Observable from "../observer/observable";
import { InventorySlot } from "../types/inventory";
import { Item } from "../world/items/item";
import { FurnaceItem } from "../world/items/stations/furnace_item";
import { CrateItem } from "../world/items/stations/crate_item";
import { CraftingTableItem } from "../world/items/stations/crafting_table_item";
import { AxeItem } from "../world/items/tools/axeItem";
import { PickaxeItem } from "../world/items/tools/pickaxeItem";
import { ShovelItem } from "../world/items/tools/shovelItem";
import { WoodMaterial } from "../world/items/tools/woodMaterial";
import { StoneMaterial } from "../world/items/tools/stoneMaterial";
import { CopperMaterial } from "../world/items/tools/copperMaterial";
import { IronMaterial } from "../world/items/tools/ironMaterial";
import { CoalItem } from "../world/items/rawRessources/coal_item";
import { CopperItem } from "../world/items/rawRessources/copper_item";
import { IronItem } from "../world/items/rawRessources/iron_item";
import { StoneItem } from "../world/items/rawRessources/stone_item";
import { WoodPlankItem } from "../world/items/craft_ingredients/wood_plank_item";
import { CementItem } from "../world/items/craft_ingredients/cement_item";
import { ConcreteItem } from "../world/items/craft_ingredients/concrete_item";
import { CopperIngotItem } from "../world/items/craft_ingredients/copper_ingot_item";
import { IronFrameItem } from "../world/items/craft_ingredients/iron_frame_item";
import { IronIngotItem } from "../world/items/craft_ingredients/iron_ingot_item";
import { IronPlateItem } from "../world/items/craft_ingredients/iron_plate_item";
import { IronRodItem } from "../world/items/craft_ingredients/iron_rod_item";
import { NailItem } from "../world/items/craft_ingredients/nail_item";
import { CodebotItem } from "../world/items/codebot_item";
import { WoodLogItem } from "../world/items/rawRessources/wood_log_item";

/**
 * Represents an entity's inventory.
 * Stores items in slots, allows adding, removing, and serializing items
 */
export default class Inventory extends Observable<InventorySlot[]> {
    private itemInHandIndex: number;

    /**
     * Creates a new inventory with a given size
     * @param size The number of slots in the inventory
     */
    constructor(size: number) {
        super(Array.from({length: size}, () => null));

        this.itemInHandIndex = 0;
    }

    /**
     * Gets the item currently selected in the inventory
     */
    get itemInHand(): InventorySlot {
        return this.items[this.itemInHandIndex];
    }

    /**
     * Sets the index of the currently selected slot
     * @param index The index to set
     */
    public setItemInHandIndex(index: number): void {
        this.itemInHandIndex = index;
        this.notify();
    }

    /**
     * Gets the index of the currently selected slot.
     */
    public getItemInHandIndex(): number {
        return this.itemInHandIndex;
    }

    /**
     * Gets all items in the inventory
     */
    get items(): InventorySlot[] {
        return this.state;
    }

    /**
     * Gets the item at a specific index
     * @param index The slot index
     * @returns The item at the index or null
     */
    public getItemAtIndex(index: number): InventorySlot | null {
        if (index < 0 || index >= this.items.length) {
            throw new Error(`Index ${index} is out of bounds`);
        }
        return this.items[index];
    }

    /**
     * Checks if an item can be added to the inventory
     * @param item The item to check
     * @returns True if there is enough space, false otherwise
     */
    public canAddItem(item: Item): boolean {
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

    /**
     * Checks if an item can be removed from the inventory
     * @param item The item to check
     * @returns True if there are enough of the item, false otherwise
     */
    public canRemoveItem(item: Item): boolean {
        const available = this.items.reduce((acc, slot) => {
            if (slot?.spriteName === item.spriteName) {
                return acc + slot.quantity;
            }

            return acc;
        }, 0);

        return Math.min(item.quantity, available) === item.quantity;
    }

    /**
     * Adds an item to the inventory
     * @param item The item to add
     * @param quantity The number of items to add
     * @returns The number of items successfully added
     */
    public addItem(item: Item, quantity = item.quantity): number {
        let remaining = quantity;

        // fill existing stacks
        if (item.isStackable) {
            for (const slot of this.items) {
                if (remaining <= 0) break;
                if (!slot) continue;

                if (slot.spriteName === item.spriteName) {
                    const canAdd = Math.min(INVENTORY_STACK_SIZE - slot.quantity, remaining);
                    slot.quantity += canAdd;
                    remaining -= canAdd;
                }
            }
        }

        // fill empty slots
        for (let i = 0; i < this.items.length; i++) {
            if (remaining <= 0) break;

            if (!this.items[i]) {
                const toAdd = Math.min(INVENTORY_STACK_SIZE, remaining);
                this.items[i] = Inventory.makeItem(item, toAdd);
                remaining -= toAdd;
            }
        }

        this.notify();

        return quantity - remaining;
    }

    /**
     * Removes an item from the inventory
     * @param item The item to remove
     * @param quantity The number of items to remove
     * @returns The number of items successfully removed
     */
    public removeItem(item: Item, quantity = item.quantity): number {
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

        return quantity - remaining;
    }

    /**
     * Checks if the inventory is empty
     * @returns True if all slots are empty, false otherwise
     */
    public isEmpty(): boolean {
        return this.items.every((slot) => !slot);
    }

    /**
     * Converts the inventory to a JSON object for saving
     * @returns JSON representation of the inventory
     */
    public toJSON(): any {
        return {
            items: this.items,
            itemInHandIndex: this.itemInHandIndex
        };
    }

    /**
     * Restores an inventory from saved JSON data
     * @param inventory Saved inventory data
     * @returns A new Inventory instance
     */
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

    /**
     * Creates an item instance based on saved data
     * @param item Saved item data
     * @param qty Optional quantity override
     * @returns An Item instance
     */
    private static makeItem(item: any, qty?: number): Item {
        const quantity = qty || item.quantity;
        switch (item.spriteName) {
            case "workbench":
                return new CraftingTableItem(1);
            case "furnace":
                return new FurnaceItem(1);
            case "crate":
                return new CrateItem(1);
            case "coal_ore":
                return new CoalItem(quantity);
            case "copper_ore":
                return new CopperItem(quantity);
            case "iron_ore":
                return new IronItem(quantity);
            case "stone_ore":
                return new StoneItem(quantity);
            case "wood_log":
                return new WoodLogItem(quantity);
            case "wood_pickaxe":
                return new PickaxeItem(new WoodMaterial());
            case "stone_pickaxe":
                return new PickaxeItem(new StoneMaterial());
            case "copper_pickaxe":
                return new PickaxeItem(new CopperMaterial());
            case "iron_pickaxe":
                return new PickaxeItem(new IronMaterial());
            case "wood_axe":
                return new AxeItem(new WoodMaterial());
            case "stone_axe":
                return new AxeItem(new StoneMaterial());
            case "copper_axe":
                return new AxeItem(new CopperMaterial());
            case "iron_axe":
                return new AxeItem(new IronMaterial());
            case "wood_shovel":
                return new ShovelItem(new WoodMaterial());
            case "stone_shovel":
                return new ShovelItem(new StoneMaterial());
            case "copper_shovel":
                return new ShovelItem(new CopperMaterial());
            case "iron_shovel":
                return new ShovelItem(new IronMaterial());
            case "cement":
                return new CementItem(quantity);
            case "concrete":
                return new ConcreteItem(quantity);
            case "copper_ingot":
                return new CopperIngotItem(quantity);
            case "iron_frame":
                return new IronFrameItem(quantity);
            case "iron_ingot":
                return new IronIngotItem(quantity);
            case "iron_rod":
                return new IronRodItem(quantity);
            case "nail":
                return new NailItem(quantity);
            case "iron_plate":
                return new IronPlateItem(quantity);
            case "reinforced_iron_plate":
                return new IronPlateItem(quantity);
            case "wood_plank":
                return new WoodPlankItem(quantity);
            case "codebot_item":
                return new CodebotItem(quantity);
            default:
                throw new Error(`Unknown item: ${item.spriteName}`);
        }
    }

}
