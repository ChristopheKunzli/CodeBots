import { BASE_DAMAGE, YIELDED_RESOURCE_MULTIPLICATOR } from "../../constants";
import { ResourceType } from "../../types/resource_type";
import { Item } from "../items/item";
import Tile from "../tile";
import { TileContent } from "../tile_content";
import { Tool } from "../items/tools/tool";

/**
 * Represents a resource that can be mined or collected from a tile
 * Examples: trees, stones, ores
 */
export abstract class Resource extends TileContent {
    private hp: number;

    /**
     * Creates a new Resource
     * @param walkable Whether the tile is walkable when this resource is present
     * @param resource The type of resource (wood, stone)
     * @param hp The starting health points of the resource
     * @param tile The tile this resource belongs to
     */
    constructor(
        walkable: boolean,
        resource: ResourceType,
        hp: number,
        tile: Tile
    ) {
        super(resource, walkable, tile);
        this.hp = hp;
    }

    /**
     * Gets the item that this resource drops when mined
     * Must be implemented by subclasses
     * @returns The item representing this resource
     */
    public abstract getItem(): Item;

    /**
     * Calculates a random quantity of items dropped when mined
     * @returns A random quantity of items
     */
    public getRandomQuantity(): number {
        return YIELDED_RESOURCE_MULTIPLICATOR * Math.floor(Math.random() * (this.getMaxQuantity() - this.getMinQuantity()) + this.getMinQuantity());
    }

    /**
     * Gets the minimum quantity of items dropped by this resource, this can be overwriten by subclasses
     * @returns The minimum quantity
     */
    public getMinQuantity(): number {
        return 5;
    }

    /**
     * Gets the maximum quantity of items dropped by this resource, this can be overwriten by subclasses
     * @returns The maximum quantity.
     */
    public getMaxQuantity(): number {
        return 10;
    }

    /**
     * Mines the resource, reducing its HP and possibly removing it from the tile
     * If the resource is destroyed, it drops an item
     * @param tool The tool used to mine the resource, or null if none
     * @returns The item dropped if destroyed, or null if still alive
     */
    public mine(tool: Tool | null): Item | null {
        const damage = BASE_DAMAGE * (tool ? tool.efficiency(this.tileContentType as ResourceType) : 1);
        this.hp -= damage;
        this.tile.chunk.chunkUpdated(this.tile);
        if (this.hp <= 0) {
            this.tile.setContent = null;

            return this.getItem();
        }
        return null;
    }
}
