import { TileContentType } from "../types/tile_content_type";
import Tile from "./tile";

/**
 * Base class for all content that can be placed on a tile
 * Examples include trees, chests, furnaces, and other interactable objects
 */
export abstract class TileContent {
    /**
     * Creates a new TileContent
     * @param tileContentType The type of this tile content (tree, chest)
     * @param walkable Whether the tile is walkable when this content is present (not used for now)
     * @param tile The tile this content belongs to
     */
    constructor(
        public tileContentType: TileContentType,
        public walkable: boolean,
        public tile: Tile
    ) {
    }

    /**
     * Converts this tile content into a JSON object for saving
     * @returns An object representing the content's state
     */
    public toJSON(): any {
        return {
            tileContentType: this.tileContentType,
            walkable: this.walkable,
        };
    }
}
