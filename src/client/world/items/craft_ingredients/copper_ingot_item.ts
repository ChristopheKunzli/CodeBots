import Tile from "../../tile";
import { Item } from "../item";

export class CopperIngotItem extends Item {
    constructor(quantity: number) {
        super("copper_ingot", quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}


