import { YIELDED_RESOURCE_MULTIPLICATOR } from "../../constants";
import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { TileContent } from "../tile_content";

export abstract class Resource extends TileContent {
    private hp: number;
    constructor(
        walkable:boolean,
        resource: ResourceType,
        hp: number,
        tile:Tile
    ) {
        super(resource, walkable, tile);
        this.hp = hp;
    }

    abstract getItem(): Item;

    getRandomQuantity(): number {
        return YIELDED_RESOURCE_MULTIPLICATOR * Math.floor(Math.random() * (this.getMaxQuantity() - this.getMinQuantity()) + this.getMinQuantity());
    }

    getMinQuantity(): number {
        return 5;
    }

    getMaxQuantity(): number {
        return 10;
    }

    mine(): Item | null {
        this.hp -= 50;
        this.tile.chunk.chunkUpdated(this.tile);
        if (this.hp <= 0) {
            this.tile.setContent = null;

            return this.getItem();
        }
        return null;
    }
}
