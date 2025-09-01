import Tile from "../tile";
import { Item } from "./item";

export class CopperItem extends Item{
    constructor(quantity: number) {
        super("copper_ore", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
