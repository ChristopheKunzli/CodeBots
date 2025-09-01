import Tile from "../tile";
import { Item } from "./item";

export class WoodLogItem extends Item{
    constructor(quantity: number) {
        super("wood_log", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
