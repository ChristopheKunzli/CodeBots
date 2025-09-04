import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import {CopperItem} from "../items/rawRessources/copper_item";

/**
 * Represents a copper resource in the world
 * Can be mined to collect copper items
 */
export class CopperStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.COPPER,400, tile);
    }

    /**
     * Gets the item dropped when this copper stone is mined
     * @returns A CopperItem with a random quantity
     */
    public getItem(): Item {
        return new CopperItem(this.getRandomQuantity());
    }
}
