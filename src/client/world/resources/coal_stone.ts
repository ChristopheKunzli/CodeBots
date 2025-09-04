import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import { CoalItem } from "../items/rawRessources/coal_item";

/**
 * Represents a coal resource in the world
 * Can be mined to collect coal items
 */
export class CoalStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.COAL, 100, tile);
    }

    /**
     * Gets the item dropped when this coal stone is mined
     * @returns A CoalItem with a random quantity
     */
    public getItem(): Item {
        return new CoalItem(this.getRandomQuantity());
    }
}
