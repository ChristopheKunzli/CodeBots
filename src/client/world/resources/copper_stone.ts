import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import {CopperItem} from "../items/copper_item";

export class CopperStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.COPPER,100, tile);
    }

    getItem(): Item {
        return new CopperItem(this.getRandomQuantity());
    }

    getMinQuantity(): number {
        return 5;
    }

    getMaxQuantity(): number {
        return 10;
    }
}
