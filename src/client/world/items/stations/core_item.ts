import { ItemType } from "../../../types/item";
import Tile from "../../tile";
import { Item } from "../item";

export class CoreItem extends Item{
    constructor(spriteName: ItemType, quantity: number) {
        super(spriteName, quantity);
    }

    public use(tile: Tile): boolean {
        return false;
    }
}
