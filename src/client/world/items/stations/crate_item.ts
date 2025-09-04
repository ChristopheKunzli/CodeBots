import { Chest } from "../../interactables/chest";
import Tile from "../../tile";
import { Item } from "../item";

/**
 * Represents an item that can place a Chest in the world
 */
export class CrateItem extends Item {
    constructor(quantity: number) {
        super("crate", quantity);
    }

    public use(tile: Tile): boolean {
        if (tile.getContent != null)
            return false;
        tile.setContent = new Chest(tile);
        return true;
    }
}
