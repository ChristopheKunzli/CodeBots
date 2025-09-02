import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import { CoalItem } from "../items/rawRessources/coal_item";

export class CoalStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.COAL, 100, tile);
    }

    getItem(): Item {
        return new CoalItem(this.getRandomQuantity());
    }
}
