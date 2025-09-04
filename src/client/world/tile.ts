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

export default class Tile {
    public chunk: Chunk;
    public noiseValue: number;
    private content: TileContent | null;
    public decoration: DecorationType | null;
    public type: TileType;
    public variation: number; // For random sprite selection : grass_1 or grass_2 for ex
    public absX: number;
    public absY: number;

    constructor(type: TileType, chunk: Chunk) {
        this.content = null;
        this.decoration = null;
        this.type = type;
        this.chunk = chunk;
    }

    set setContent(content: TileContent | null) {
        this.content = content;
        this.chunk.chunkUpdated(this);
    }

    get getContent(): TileContent | null {
        return this.content;
    }

    toJSON(): any {
        return {
            type: this.type,
            content: this.content ? this.content.toJSON() : null,
            decoration: this.decoration,
            variation: this.variation,
            absX: this.absX,
            absY: this.absY,
        };
    }

    static fromJSON(tileData: any, chunk: Chunk) {
        const tile = new Tile(tileData.type, chunk);
        tile.setContent = Tile.makeContent(tileData, tile);
        tile.decoration = tileData.decoration;
        tile.variation = tileData.variation;
        tile.absX = tileData.absX;
        tile.absY = tileData.absY;
        return tile;
    }

    private static makeContent(tileData: any, tile: Tile): TileContent {
        if (!tileData.content) return null;

        switch (tileData.content.tileContentType) {
            case "Core":
                return new Core(tile);
            case "Chest":
                return new Chest(tile);
            case "Furnace":
                return new Furnace(tile);
            case "Crafting_table" :
                return new CraftingTable(tile);
            case "Stone":
                return new Stone(tile);
            case "Coal" :
                return new CoalStone(tile);
            case "Copper":
                return new CopperStone(tile);
            case "Iron" :
                return new IronStone(tile);
            case "Wood" :
                return new Tree(tile);
            default:
                throw new Error(`Unknown tile content type: ${tileData.content.tileContentType}`);
        }

    }

}
