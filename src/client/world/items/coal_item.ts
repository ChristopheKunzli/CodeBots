import Tile from "../tile";
import { Item } from "./item";

export class CoalItem extends Item{
    constructor(quantity: number) {
        super("coal_ore", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
