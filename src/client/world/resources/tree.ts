import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import {WoodLogItem} from "../items/rawRessources/wood_log_item";

export class Tree extends Resource{
    constructor(tile:Tile){
        super(false, ResourceType.WOOD, 100,tile);
    }

    getItem(): Item {
        return new WoodLogItem(this.getRandomQuantity());
    }
}
