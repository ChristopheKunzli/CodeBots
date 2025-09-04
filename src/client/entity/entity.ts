import Inventory from "../inventory/inventory";
import Observable from "../observer/observable";
import { AnimationName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { InteractableType } from "../types/interactable_type";
import { InteractionResult } from "../types/interaction_result";
import { Interactable } from "../world/interactables/interactable";
import { Resource } from "../world/resources/resource";
import Tile from "../world/tile";
import { World } from "../world/world";
import { Tool } from "../world/items/tools/tool";
import { Item } from "../world/items/item";

type EntityState = {
    posX: number;
    posY: number;
    cX: number;
    cY: number;
};

/**
 * Entity
 *
 * Abstract base class representing any entity in the game world
 * (Player, Codebot)
 * Provides position handling, inventory, interaction logic, and serialization
 */
export abstract class Entity extends Observable<EntityState> {
    private static idCounter = 1;
    public id: string;
    public inventory: Inventory;
    protected world: World;

    /**
     * Creates a new entity
     * @param world The game world the entity belongs to
     * @param x Initial X coordinate
     * @param y Initial Y coordinate
     * @param inventory Optional inventory (creates a new one if not provided)
     * @param id Optional custom ID (auto-generated if not provided)
     */
    constructor(world: World, x: number, y: number, inventory?: Inventory, id?: string) {
        super({
            posX: x,
            posY: y,
            cX: -1,
            cY: -1,
        });

        this.inventory = inventory ? inventory : new Inventory(this.getInventorySize());
        this.world = world;
        this.id = id ? id : `entity_${Entity.idCounter++}`;
    }

    /**
     * Sets the chunk X coordinate for this entity
     */
    set cX(newCX: number) {
        this.state.cX = newCX;
    }

    /**
     * Sets the chunk Y coordinate for this entity
     */
    set cY(newCY: number) {
        this.state.cY = newCY;
    }

    /**
     * Interacts with the specified tile
     * - Mines resources if a Resource is present
     * - Opens UI for interactable objects (chests, furnaces)
     * - Uses the held item if possible
     *
     * @param tile The tile to interact with
     * @returns An InteractionResult describing the outcome
     */
    public interactWithTile(tile: Tile): InteractionResult {
        const content = tile?.getContent;

        const itemInHand : Item | null = this.inventory.itemInHand;

        if (content instanceof Resource) {
            const item = content.mine(itemInHand instanceof Tool ? itemInHand : null);
            if (item) {
                this.inventory.addItem(item);
                return {type: "MINED", tile};
            }
            return {type: "MINING", tile};
        }

        if (content instanceof Interactable) {
            return {
                type: "OPENED_UI",
                tile,
                interactableType: content.tileContentType as InteractableType
            };
        }

        if (itemInHand) {
            const used = itemInHand.use(tile);
            if (used) {
                this.inventory.removeItem(itemInHand, 1);
            }
        }

        return {type: "NONE", tile};
    }

    /**
     * Abstract: Get the movement speed of this entity
     */
    public abstract getSpeed(): number;

    /**
     * Abstract: Get the current animation name for this entity
     */
    public abstract getAnimationName(): AnimationName;

    /**
     * Abstract: Indicates whether this entity should be animated
     */
    public abstract isAnimated(): boolean;

    /**
     * Abstract: Returns the type of this entity (PLAYER, BOT, etc.)
     */
    public abstract getType(): EntityType;

    /**
     * Abstract: Returns the size of the entity's inventory
     */
    public abstract getInventorySize(): number;

    get posX(): number {
        return this.state.posX;
    }

    get posY(): number {
        return this.state.posY;
    }

    get cX(): number {
        return this.state.cX;
    }

    get cY(): number {
        return this.state.cY;
    }

    set posX(newPosX: number) {
        this.state.posX = newPosX;
    }

    set posY(newPosY: number) {
        this.state.posY = newPosY;
    }

    /**
     * Placeholder method for custom interactions with Interactable objects
     * Subclasses can override this
     */
    public interact(i: Interactable) {

    }

    /**
     * Converts this entity into a serializable JSON object.
     */
    public toJSON(): any {
        return {
            id: this.id,
            posX: this.posX,
            posY: this.posY,
            inventory: this.inventory.toJSON(),
        };
    }

    /**
     * Loads entity data from JSON
     * @param entity JSON data
     */
    public fromJSON(entity: any) {
        this.id = entity.id;
        this.posX = entity.posX;
        this.posY = entity.posY;
        this.inventory = Inventory.fromJSON(entity.inventory);
    }
}
