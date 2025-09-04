import Inventory from "../../inventory/inventory";
import { InteractableType } from "../../types/interactable_type";
import Tile from "../tile";
import { Interactable } from "./interactable";

export class Chest extends Interactable {
    public inventory: Inventory;

    constructor(tile: Tile, inventory?: Inventory) {
        super(InteractableType.CHEST, tile);
        this.inventory = inventory || new Inventory(27);
    }

    /**
     * Converts this chest into a JSON object for saving.
     * @returns An object containing chest data and its inventory.
     */
    public toJSON(): any {
        return {
            ...super.toJSON(),
            inventory: this.inventory.toJSON(),
        };
    }

    /**
     * Creates a Chest from saved JSON data
     * @param data The saved chest data
     * @param tile The tile where this chest is placed
     * @returns A Chest instance restored from data
     */
    static fromJSON(data: any, tile: Tile): Chest {
        return new Chest(tile, Inventory.fromJSON(data.inventory));
    }
}
