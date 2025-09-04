import { ItemType } from "../../types/item";
import Tile from "../tile";

/**
 * Base class for all items in the game
 * Items can be stored in inventories and used on tiles
 */
export abstract class Item{
    public spriteName: ItemType;
    public quantity: number;
    public isStackable: boolean;

    /**
     * Creates a new Item
     * @param spriteName The type or sprite name of the item
     * @param quantity The number of items in this stack
     * @param isStackable Whether this item is stackable (default true)
     */
    constructor(spriteName: ItemType, quantity: number, isStackable = true) {
        this.spriteName = spriteName;
        this.quantity = quantity;
        this.isStackable = isStackable;
    }

    /**
     * Uses this item on a specific tile.
     * Must be implemented by subclasses.
     * @param tile The tile to use the item on.
     * @returns True if the item was successfully used, false otherwise.
     */
    public abstract use(tile:Tile):boolean;
}
