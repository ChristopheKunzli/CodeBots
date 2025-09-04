import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import {IronItem} from "../items/rawRessources/iron_item";

/**
 * Represents an iron resource in the world
 * Can be mined to collect iron items
 */
export class IronStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.IRON,800, tile);
    }

    /**
     * Gets the item dropped when this iron stone is mined
     * @returns An IronItem with a random quantity
     */
    public getItem(): Item {
        return new IronItem(this.getRandomQuantity());
    }
}
