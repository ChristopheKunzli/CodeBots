import Tile from "../tile";
import { Item } from "./item";

export class StoneItem extends Item{
    constructor() {
        super("stone_ore", 1);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
