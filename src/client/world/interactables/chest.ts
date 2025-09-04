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

    toJSON(): any {
        return {
            ...super.toJSON(),
            inventory: this.inventory.toJSON(),
        };
    }

    static fromJSON(data: any, tile: Tile): Chest {
        console.log(data)
        return new Chest(tile, Inventory.fromJSON(data.inventory));
    }
}
