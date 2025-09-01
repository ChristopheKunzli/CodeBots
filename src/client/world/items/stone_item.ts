import Tile from "../tile";
import { Item } from "./item";

export class StoneItem extends Item{
    constructor(quantity: number) {
        super("stone_ore", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
