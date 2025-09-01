import Inventory from "../../inventory/inventory";
import { InteractableType } from "../../types/interactable_type";
import Tile from "../tile";
import { Interactable } from "./interactable";

export class Chest extends Interactable {
    public inventory:Inventory;
    constructor(tile: Tile) {
        super(InteractableType.CHEST, tile);
        this.inventory = new Inventory(27);
    }
}
