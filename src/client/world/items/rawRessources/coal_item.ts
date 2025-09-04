import Tile from "../../tile";
import { Item } from "../item";

/**
 * Represents a coal ore item that can be collected or stored
 * This item has no special use behavior
 */
export class CoalItem extends Item{
    constructor(quantity: number) {
        super("coal_ore", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
