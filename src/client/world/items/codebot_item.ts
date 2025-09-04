import { CodebotInteractable } from "../interactables/codebot_interactable";
import Tile from "../tile";
import { Item } from "./item";

/**
 * Represents an item that can place a Codebot in the world
 */
export class CodebotItem extends Item{
    constructor(quantity: number) {
        super("codebot_item", quantity);
    }

    public use(tile: Tile): boolean {
        if(tile.getContent != null)
            return false;
        tile.setContent = new CodebotInteractable(tile);
        return true;
    }
}
