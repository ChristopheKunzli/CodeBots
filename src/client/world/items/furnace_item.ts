import { Furnace } from "../interactables/furnace";
import Tile from "../tile";
import { Item } from "./item";

export class FurnaceItem extends Item {
    constructor() {
        super("furnace", 1);
    }

    public use(tile:Tile): boolean {
        if(tile.getContent != null)
            return false;
        tile.setContent = new Furnace(tile);
        return true;
    }

}
