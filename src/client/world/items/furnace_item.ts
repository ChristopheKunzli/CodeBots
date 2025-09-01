import { Furnace } from "../interactables/furnace";
import Tile from "../tile";
import { Item } from "./item";

export class FurnaceItem extends Item {
    constructor(quantity: number) {
        super("furnace", quantity);
    }

    public use(tile:Tile): boolean {
        if(tile.getContent != null)
            return false;
        tile.setContent = new Furnace(tile);
        return true;
    }

}
