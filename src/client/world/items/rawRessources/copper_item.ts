import Tile from "../../tile";
import { Item } from "../item";

/**
 * Represents a copper ore item that can be collected or stored
 * This item has no special use behavior
 */
export class CopperItem extends Item{
    constructor(quantity: number) {
        super("copper_ore", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
