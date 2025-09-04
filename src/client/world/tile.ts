import { DecorationType } from "../types/decoration_type";
import { TileType } from "../types/tile_type";
import { Chunk } from "./chunk";
import { TileContent } from "./tile_content";
import { Core } from "./interactables/core";
import { Furnace } from "./interactables/furnace";
import { Chest } from "./interactables/chest";
import { CraftingTable } from "./interactables/crafting_table";
import { Stone } from "./resources/stone";
import { CoalStone } from "./resources/coal_stone";
import { CopperStone } from "./resources/copper_stone";
import { IronStone } from "./resources/iron_stone";
import { Tree } from "./resources/tree";
import { CodebotInteractable } from "./interactables/codebot_interactable";

/**
 * Represents a single tile in the game world
 * A tile can contain terrain type, decoration, and optional content (like a tree or chest)
 */
export default class Tile {
    public chunk: Chunk;
    public noiseValue: number;
    private content: TileContent | null;
    public decoration: DecorationType | null;
    public type: TileType;
    public variation: number; // For random sprite selection : grass_1 or grass_2 for ex
    public absX: number;
    public absY: number;

    /**
     * Creates a new Tile.
     * @param type The type of terrain for this tile.
     * @param chunk The chunk this tile belongs to.
     */
    constructor(type: TileType, chunk: Chunk) {
        this.content = null;
        this.decoration = null;
        this.type = type;
        this.chunk = chunk;
    }

    /**
     * Sets the content of this tile
     * @param content The content to place on the tile, or null to remove content
     */
    set setContent(content: TileContent | null) {
        this.content = content;
        this.chunk.chunkUpdated(this);
    }

    /**
     * Gets the current content of this tile.
     * @returns The content of this tile, or null if empty.
     */
    get getContent(): TileContent | null {
        return this.content;
    }

    /**
     * Converts this tile into a JSON object for saving
     * @returns An object representing the tile's state
     */
    public toJSON(): any {
        return {
            type: this.type,
            content: this.content ? this.content.toJSON() : null,
            decoration: this.decoration,
            variation: this.variation,
            absX: this.absX,
            absY: this.absY,
        };
    }

    /**
     * Creates a Tile from saved JSON data
     * @param tileData The saved tile data
     * @param chunk The chunk this tile belongs to
     * @returns A new Tile instance
     */
    static fromJSON(tileData: any, chunk: Chunk) {
        const tile = new Tile(tileData.type, chunk);
        tile.setContent = Tile.makeContent(tileData, tile);
        tile.decoration = tileData.decoration;
        tile.variation = tileData.variation;
        tile.absX = tileData.absX;
        tile.absY = tileData.absY;
        return tile;
    }

    /**
     * Creates tile content from saved JSON data.
     * @param tileData The saved tile data.
     * @param tile The tile to assign the content to.
     * @returns A TileContent object or null if no content.
     * @throws Error if the content type is unknown.
     */
    private static makeContent(tileData: any, tile: Tile): TileContent | null {
        if (!tileData.content) return null;

        switch (tileData.content.tileContentType) {
            case "Core":
                return new Core(tile);
            case "Chest":
                return Chest.fromJSON(tileData.content, tile);
            case "Furnace":
                return new Furnace(tile);
            case "Crafting_table":
                return new CraftingTable(tile);
            case "Stone":
                return new Stone(tile);
            case "Coal":
                return new CoalStone(tile);
            case "Copper":
                return new CopperStone(tile);
            case "Iron":
                return new IronStone(tile);
            case "Wood":
                return new Tree(tile);
            case "Codebot":
                return new CodebotInteractable(tile);
            default:
                throw new Error(`Unknown tile content type: ${tileData.content.tileContentType}`);
        }
    }

}
