import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import {IronItem} from "../items/rawRessources/iron_item";

export class IronStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.IRON,800, tile);
    }

    getItem(): Item {
        return new IronItem(this.getRandomQuantity());
    }
}
