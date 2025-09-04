import { CHUNK_LOAD_RADIUS, CHUNK_SIZE, RENDER_DISTANCE } from "../constants";
import { Entity } from "../entity/entity";
import { Player } from "../entity/player";
import { Direction } from "../types/direction";
import { ResourceType } from "../types/resource_type";
import { Chunk } from "./chunk";
import { IWorldGenerator } from "./i_world_generator";
import type { Position } from "../types/position";
import Tile from "./tile";

/**
 * Represents the game world, which is divided into chunks and tiles
 * It manages loading, saving, and generating chunks, as well as finding tiles and resources
 */
export class World {
    public savedChunks: Map<string, Chunk>; // Chunks that have been modified and need to be saved
    public activeChunks: Map<string, Chunk>; // Chunks currently loaded in memory
    public generator: IWorldGenerator;
    public entities: Entity[];

    /**
     * Creates a new World
     * @param generator The generator used to create chunks
     * @param savedData Optional saved world data
     */
    constructor(generator: IWorldGenerator, savedData?: any) {
        this.savedChunks = new Map();
        this.activeChunks = new Map();
        this.generator = generator;

        if (savedData && savedData.savedChunks) {
            for (const chunkData of savedData.savedChunks) {
                const chunk = Chunk.fromJSON(chunkData, this);
                this.savedChunks.set(chunk.key, chunk);
            }
        }
    }

    /**
     * Converts the world into a JSON object for saving
     * @returns An object representing the world state
     */
    public toJSON(): any {
        return {
            savedChunks: Array.from(this.savedChunks.values()).map(chunk => chunk.toJSON()),
        }
    }

    /**
     * Updates the set of loaded chunks based on entity positions
     * @param entities Entities whose position determines loaded chunks
     */
    public updateLoadedChunks(entities: Entity[]): void {
        const newLoaded = new Map<string, Chunk>();
        for (const entity of entities) {
            const cx = entity.cX;
            const cy = entity.cY;
            for (let dx = -CHUNK_LOAD_RADIUS; dx <= CHUNK_LOAD_RADIUS; dx++) {
                for (let dy = -CHUNK_LOAD_RADIUS; dy <= CHUNK_LOAD_RADIUS; dy++) {
                    const chunk = this.getChunk(cx + dx, cy + dy);
                    newLoaded.set(chunk.key, chunk);
                }
            }
        }
        this.activeChunks = newLoaded;
    }

    /**
     * Saves a chunk to the savedChunks map
     * @param chunk The chunk to save
     */
    public saveChunk(chunk: Chunk): void {
        this.savedChunks.set(chunk.key, chunk);
    }

    /**
     * Gets all chunks visible on the screen based on the player's position
     * @param player The player to use as a reference
     * @returns An array of visible chunks
     */
    public getChunksInVisibleRange(player: Player): Chunk[] {
        const chunks: Chunk[] = [];
        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
                const key = `${player.cX + dx}_${player.cY + dy}`;
                const chunk = this.activeChunks.get(key);
                if (chunk) chunks.push(chunk);
                else throw new Error(`Chunk ${key} not found in activeChunks`);
            }
        }
        return chunks;
    }

    /**
     * Retrieves a chunk at the given chunk coordinates
     * Loads or generates the chunk if needed
     * @param cx Chunk X coordinate
     * @param cy Chunk Y coordinate
     * @returns The requested chunk
     */
    public getChunk(cx: number, cy: number): Chunk {
        const key = `${cx}_${cy}`;

        if (this.activeChunks.has(key)) {
            return this.activeChunks.get(key)!;
        }

        if (this.savedChunks.has(key)) {
            const chunk = this.savedChunks.get(key)!;
            this.activeChunks.set(key, chunk); // Ajouter aux actifs
            return chunk;
        }

        const newChunk = this.generator.generateChunk(cx, cy, CHUNK_SIZE);
        this.activeChunks.set(key, newChunk);
        return newChunk;
    }

    /**
     * Gets the tile at the given absolute world coordinates
     * @param absX The absolute X coordinate
     * @param absY The absolute Y coordinate
     * @returns The tile or null if not found
     */
    public getTileAt(absX: number, absY: number): Tile | null {
        const chunkX = Math.floor(absX / CHUNK_SIZE);
        const chunkY = Math.floor(absY / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkY);
        if (!chunk) return null;

        const localX = Math.floor(((absX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE);
        const localY = Math.floor(((absY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE);

        return chunk.tiles[localY]?.[localX] ?? null;
    }


    /**
     * Gets neighboring tiles around a position
     * @param absX The absolute X coordinate
     * @param absY The absolute Y coordinate
     * @returns An object with neighboring tiles by direction
     */
    public getTileNeighborsByDirection(absX: number, absY: number): Partial<Record<Direction, Tile | null>> {
        const chunkX = Math.floor(absX / CHUNK_SIZE);
        const chunkY = Math.floor(absY / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkY);

        const localX = ((absX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localY = ((absY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const result: Partial<Record<Direction, Tile | null>> = {};

        // top
        if (localY > 0) {
            result[Direction.TOP] = chunk.tiles[localY - 1][localX];
        } else {
            result[Direction.TOP] = this.getChunk(chunkX, chunkY - 1).tiles[CHUNK_SIZE - 1][localX];
        }

        // bottom
        if (localY < CHUNK_SIZE - 1) {
            result[Direction.BOTTOM] = chunk.tiles[localY + 1][localX];
        } else {
            result[Direction.BOTTOM] = this.getChunk(chunkX, chunkY + 1).tiles[0][localX];
        }

        // left
        if (localX > 0) {
            result[Direction.LEFT] = chunk.tiles[localY][localX - 1];
        } else {
            result[Direction.LEFT] = this.getChunk(chunkX - 1, chunkY).tiles[localY][CHUNK_SIZE - 1];
        }

        // right
        if (localX < CHUNK_SIZE - 1) {
            result[Direction.RIGHT] = chunk.tiles[localY][localX + 1];
        } else {
            result[Direction.RIGHT] = this.getChunk(chunkX + 1, chunkY).tiles[localY][0];
        }

        return result;
    }

    /**
    * Finds the nearest tile with a specific resource type starting from a position
    * @param from The starting position
    * @param ressourceType The resource type to search for
    * @returns The position of the nearest resource or null if none found
    */
    public getNearestResourceFromPosition(from: Position, ressourceType: ResourceType): Position | null {
        const visited = new Set<string>();
        const queue: Position[] = [from];

        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
        ];

        const getKey = ({ x, y }: Position) => `${x}_${y}`
        const mod = (n: number, m: number) => ((n % m) + m) % m;

        while (queue.length > 0) {
            const current = queue.shift()!;

            const cX = Math.floor(current.x / CHUNK_SIZE);
            const cY = Math.floor(current.y / CHUNK_SIZE);

            const chunk = this.activeChunks.get(getKey({ x: cX, y: cY }));
            if (!chunk) {
                continue;
            }

            const x = mod(current.x, CHUNK_SIZE);
            const y = mod(current.y, CHUNK_SIZE);

            const tile = chunk.getTile(x, y);

            if (tile.getContent?.tileContentType === ressourceType) {
                return current;
            }

            for (const direction of directions) {
                const newPosition = {
                    x: current.x + direction.x,
                    y: current.y + direction.y,
                };

                const newCX = Math.floor(newPosition.x / CHUNK_SIZE);
                const newCY = Math.floor(newPosition.y / CHUNK_SIZE);

                if (!visited.has(getKey(newPosition)) && this.activeChunks.has(getKey({ x: newCX, y: newCY }))) {
                    visited.add(getKey(newPosition));
                    queue.push(newPosition);
                }
            }
        }

        return null;
    }
}
