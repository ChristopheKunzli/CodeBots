import { TileType } from "../types/tile_type";
import Tile from "./tile";
import { World } from "./world";

/**
 * Represents a chunk of the world
 * A chunk is a square grid of tiles and is used to divide the world into smaller parts
 */
export class Chunk {
    public tiles: Tile[][];
    public world: World;
    public cx: number;
    public cy: number;
    public size: number;
    public key: string;

    /**
     * Creates a new Chunk
     * @param cx The X coordinate of the chunk
     * @param cy The Y coordinate of the chunk
     * @param size The number of tiles per side
     * @param world The world this chunk belongs to
     */
    constructor(
        cx: number,
        cy: number,
        size: number,
        world: World
    ) {
        this.world = world;
        this.cx = cx;
        this.cy = cy;
        this.size = size;
        this.key = `${cx}_${cy}`;
        this.tiles = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => new Tile(TileType.GRASS, this))
        );
    }

    /**
     * Marks the chunk as updated when a tile changes
     * @param tile The tile that was updated
     * @throws Error if this chunk has no world assigned
     */
    public chunkUpdated(tile: Tile): void {
        if(!this.world) throw new Error("Chunk has no world assigned");
        this.world.saveChunk(this);
    }

    /**
     * Gets a tile from this chunk
     * @param x The X coordinate inside the chunk
     * @param y The Y coordinate inside the chunk
     * @returns The tile at the specified coordinates
     */
    public getTile(x: number, y: number): Tile {
        return this.tiles[y][x];
    }

    /**
     * Checks if a tile at given coordinates is walkable (not used for now)
     * @param x The X coordinate inside the chunk
     * @param y The Y coordinate inside the chunk
     * @returns True if the tile is walkable, false otherwise
     */
    public isWalkable(x: number, y: number): boolean | undefined {
        return this.tiles[y][x].getContent?.walkable;
    }

    /**
     * Converts this chunk into a JSON object for saving
     * @returns An object representing the chunk's data
     */
    public toJSON(): any {
        return {
            cx: this.cx,
            cy: this.cy,
            size: this.size,
            tiles: this.tiles.map(row => row.map(tile => tile.toJSON())),
        };
    }

    /**
     * Creates a Chunk from saved JSON data
     * @param chunkData The saved chunk data
     * @param world The world this chunk belongs to
     * @returns A new Chunk instance with restored tiles
     */
    static fromJSON(chunkData: any, world: World): Chunk {
        const chunk = new Chunk(chunkData.cx, chunkData.cy, chunkData.size, world);

        let i = 0;
        for(const tileRow of chunkData.tiles) {
            let j = 0;
            for(const tileData of tileRow) {
                chunk.tiles[i][j] = Tile.fromJSON(tileData, chunk);
                ++j;
            }
            ++i;
        }

        return chunk;
    }
}
