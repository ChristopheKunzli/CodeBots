import Inventory from "../inventory/inventory";
import Observable from "../observer/observable";
import { AnimationName, TextureName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { InteractableType } from "../types/interactable_type";
import { InteractionResult } from "../types/interaction_result";
import { Interactable } from "../world/interactables/interactable";
import { Resource } from "../world/resources/resource";
import Tile from "../world/tile";
import { World } from "../world/world";

type EntityState = {
    posX: number;
    posY: number;
    cX: number;
    cY: number;
};

export abstract class Entity extends Observable<EntityState> {
    private static idCounter = 1;
    public id: string;
    public inventory: Inventory;
    protected world: World;
    constructor(world: World) {
        super({
            posX: 0,
            posY: 0,
            cX: -1,
            cY: -1,
        });

        this.inventory = new Inventory(this.getInventorySize());
        this.world = world;
        this.id = `entity_${Entity.idCounter++}`;
    }

    interactWithTile(tile: Tile): InteractionResult {
        const content = tile?.getContent;

        if (content instanceof Resource) {
            const item = content.mine();
            if (item) {
                this.inventory.addItem(item);
                return { type: "MINED", tile };
            }
            return { type: "NONE", tile };
        }

        if (content instanceof Interactable) {
            return {
                type: "OPENED_UI",
                tile,
                interactableType: content.tileContentType as InteractableType
            };
        }

        const itemInHand = this.inventory.itemInHand;
        if (itemInHand) {
            const used = itemInHand.use(tile);
            if (used) {
                this.inventory.removeItem(itemInHand, 1);
            }
        }

        return { type: "NONE", tile };
    }

    abstract getSpeed(): number;

    abstract getAnimationName(): AnimationName;

    abstract isAnimated(): boolean;

    abstract getType(): EntityType;

    abstract getInventorySize(): number;

    interact(i: Interactable) {

    }

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

    set cX(newCX: number) {
        this.state.cX = newCX;
    }

    set cY(newCY: number) {
        this.state.cY = newCY;
    }
}
