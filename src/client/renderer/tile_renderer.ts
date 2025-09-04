import * as PIXI from "pixi.js";
/**
 * Stores the PIXI sprites used to render a single tile
 * This includes the tile itself, its content, and any decoration
 */
export class TileRenderer {
    /**
     * Creates a new TileRenderer
     * @param tileSprite The sprite representing the tile's base texture
     * @param contentSprite The sprite representing the tile's content
     * @param decorationSprite The sprite representing the tile's decoration
     */
    constructor(public tileSprite?: PIXI.Sprite, public contentSprite?: PIXI.Sprite, public decorationSprite?: PIXI.Sprite) {

    }
}
