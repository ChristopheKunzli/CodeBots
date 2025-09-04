import Tile from "../../tile";
import { Item } from "../item";

/**
 * Represents a wood log item that can be collected or stored
 * This item has no special use behavior
 */
export class WoodLogItem extends Item {
    constructor(quantity: number) {
        super("wood_log", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
