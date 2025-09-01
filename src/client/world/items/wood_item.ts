import Tile from "../tile";
import { Item } from "./item";

export class WoodItem extends Item{
    constructor() {
        super("wood_log", 1);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
