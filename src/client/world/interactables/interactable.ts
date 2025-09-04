import { InteractableType } from "../../types/interactable_type";
import Tile from "../tile";
import { TileContent } from "../tile_content";

/**
 * Base class for all interactable objects in the game world
 * Examples include chests, furnaces, crafting tables, etc
 */
export abstract class Interactable extends TileContent{
    /**
     * Creates a new Interactable
     * @param interactable The type of interactable object
     * @param tile The tile where this interactable is placed
     */
    constructor(
        public interactable: InteractableType, tile:Tile
    ){
        super(interactable,false, tile)
    }
}
