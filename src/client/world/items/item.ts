import { ItemType } from "../../types/item";
import Tile from "../tile";

export abstract class Item{
    public spriteName: ItemType;
    public quantity: number;

    constructor(spriteName: ItemType, quantity: number) {
        this.spriteName = spriteName;
        this.quantity = quantity;
    }

    public abstract use(tile:Tile):boolean;
}
