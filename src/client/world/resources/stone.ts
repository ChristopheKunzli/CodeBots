import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import {StoneItem} from "../items/stone_item";

import { Resource } from "./resource";
export class Stone extends Resource{
    constructor(tile:Tile){
        super(false, ResourceType.STONE, 100, tile);
    }

    getItem(): Item {
        return new StoneItem(this.getRandomQuantity());
    }
}
