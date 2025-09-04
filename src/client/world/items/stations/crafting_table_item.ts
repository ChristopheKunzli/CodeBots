import { CraftingTable } from "../../interactables/crafting_table";
import Tile from "../../tile";
import { Item } from "../item";

/**
 * Represents an item that can place a Crafting Table in the world
 */
export class CraftingTableItem extends Item {
    constructor(quantity: number) {
        super("workbench", quantity);
    }

    public use(tile:Tile): boolean {
        if(tile.getContent != null)
            return false;
        tile.setContent = new CraftingTable(tile);
        return true;
    }

}
