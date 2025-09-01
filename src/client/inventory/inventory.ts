import { INVENTORY_STACK_SIZE } from "../constants";
import Observable from "../observer/observable";
import { InventorySlot } from "../types/inventory";
import { Item } from "../world/items/item";

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

    canAddItem(item: Item): boolean {
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

    addItem(item: Item): number {
        let remaining = item.quantity;

        // fill existing stacks
        for (const slot of this.items) {
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
                this.items[i] = new (Object.getPrototypeOf(item).constructor)(item.spriteName, toAdd);
                remaining -= toAdd;
            }
        }

        return item.quantity - remaining;
    }

    removeItem(item: Item): number {
        let remaining = item.quantity;

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

        return item.quantity - remaining;
    }

    isEmpty(): boolean {
        return this.items.every((slot) => !slot);
    }
}
