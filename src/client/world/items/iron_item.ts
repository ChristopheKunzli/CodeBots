import Tile from "../tile";
import { Item } from "./item";

export class IronItem extends Item{
    constructor(quantity: number) {
        super("iron_ore", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
