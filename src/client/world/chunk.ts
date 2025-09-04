import { TileType } from "../types/tile_type";
import Tile from "./tile";
import { World } from "./world";

export class Chunk {
    public tiles: Tile[][];
    public world: World;
    public cx: number;
    public cy: number;
    public size: number;
    public key: string;
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

    chunkUpdated(tile: Tile) {
        if(!this.world) throw new Error("Chunk has no world assigned");
        this.world.saveChunk(this);
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[y][x];
    }

    isWalkable(x: number, y: number): boolean | undefined {
        return this.tiles[y][x].getContent?.walkable;
    }

    toJSON(): any {
        return {
            cx: this.cx,
            cy: this.cy,
            size: this.size,
            tiles: this.tiles.map(row => row.map(tile => tile.toJSON())),
        };
    }

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
