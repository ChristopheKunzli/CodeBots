import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { Resource } from "./resource";
import {CopperItem} from "../items/rawRessources/copper_item";

export class CopperStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.COPPER,400, tile);
    }

    getItem(): Item {
        return new CopperItem(this.getRandomQuantity());
    }
}
