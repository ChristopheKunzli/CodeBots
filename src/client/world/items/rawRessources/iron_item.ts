import Tile from "../../tile";
import { Item } from "../item";

/**
 * Represents an iron ore item that can be collected or stored
 * This item has no special use behavior
 */
export class IronItem extends Item{
    constructor(quantity: number) {
        super("iron_ore", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
