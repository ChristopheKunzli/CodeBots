import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import {StoneItem} from "../items/rawRessources/stone_item";
import { Resource } from "./resource";

/**
 * Represents a stone resource in the world
 * Can be mined to collect stone items
 */
export class Stone extends Resource{
    constructor(tile:Tile){
        super(false, ResourceType.STONE, 200, tile);
    }

    /**
     * Gets the item dropped when this stone is mined
     * @returns A StoneItem with a random quantity
     */
    public getItem(): Item {
        return new StoneItem(this.getRandomQuantity());
    }
}
