import Tile from "../../tile";
import { Item } from "../item";

/**
 * Represents a stone ore item that can be collected or stored
 * This item has no special use behavior
 */
export class StoneItem extends Item{
    constructor(quantity: number) {
        super("stone_ore", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
