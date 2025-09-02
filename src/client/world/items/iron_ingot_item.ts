import { Item } from "./item";
import Tile from "../tile";

export class IronIngotItem extends Item {
    constructor(quantity: number) {
        super("iron_ingot", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}