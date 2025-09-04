import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import {WoodLogItem} from "../items/rawRessources/wood_log_item";

/**
 * Represents a tree resource in the world
 * Can be chopped down to collect wood logs
 */
export class Tree extends Resource{
    constructor(tile:Tile){
        super(false, ResourceType.WOOD, 100,tile);
    }

    /**
     * Gets the item dropped when this tree is chopped down
     * @returns A WoodLogItem with a random quantity
     */
    public getItem(): Item {
        return new WoodLogItem(this.getRandomQuantity());
    }
}
