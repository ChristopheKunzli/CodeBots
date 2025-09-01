import { ItemType } from "../../types/item";
import Tile from "../tile";

export abstract class Item{
    public spriteName: ItemType;
    public quantity: number;
    public isStackable: boolean;

    constructor(spriteName: ItemType, quantity: number, isStackable = true) {
        this.spriteName = spriteName;
        this.quantity = quantity;
        this.isStackable = isStackable;
    }

    public abstract use(tile:Tile):boolean;
}
