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
        return Math.floor(Math.random() * (this.getMaxQuantity() - this.getMinQuantity()) + this.getMinQuantity());
    }

    abstract getMinQuantity(): number;

    abstract getMaxQuantity(): number;

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
