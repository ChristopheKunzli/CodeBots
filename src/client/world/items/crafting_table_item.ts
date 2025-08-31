import { CraftingTable } from "../interactables/crafting_table";
import Tile from "../tile";
import { Item } from "./item";

export class CraftingTableItem extends Item {
    public use(tile:Tile): boolean {
       if(tile.getContent != null)
            return false;
        tile.setContent = new CraftingTable(tile);
        return true;
    }

}
