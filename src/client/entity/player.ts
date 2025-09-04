import { AnimationName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { World } from "../world/world";
import { Entity } from "./entity";
import { PLAYER_INVENTORY_SIZE, PLAYER_SPEED } from "../constants";
import Inventory from "../inventory/inventory";

/**
 * Player
 *
 * Represents the player character in the game world
 * Extends Entity and manages movement, animations, and inventory control
 */
export class Player extends Entity {
    private currentlyDisplayedAnimation: AnimationName;

    /**
     * Creates a new Player instance.
     * @param world The game world where the player exists
     * @param x Starting X position (default: 0)
     * @param y Starting Y position (default: 0)
     * @param inventory Optional Inventory object (default: empty inventory)
     * @param id Optional unique ID for the player
     */
    constructor(world: World, x: number = 0, y: number = 0, inventory?: Inventory, id?: string) {
        super(world, x, y, inventory, id);
        this.currentlyDisplayedAnimation = "player_idle";
    }

    /**
     * Updates the player state
     * - Moves the player based on pressed keys
     * - Changes animation depending on direction
     * - Updates inventory selection via number keys or scroll input
     * @param keys A set of currently pressed keys ("w", "a")
     * @param delta The time delta since last frame
     */
    public update(keys: Set<string>, delta: number): void {
        let dx = 0;
        let dy = 0;

        if (keys.has("w")) dy -= 1;
        if (keys.has("s")) dy += 1;
        if (keys.has("a")) dx -= 1;
        if (keys.has("d")) dx += 1;

        // If moving
        if (dx !== 0 || dy !== 0) {
            // normalization
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            this.posX += dx * this.getSpeed() * delta / 60;
            this.posY += dy * this.getSpeed() * delta / 60;

            // chose animation from direction
            if (dx > 0) this.currentlyDisplayedAnimation = "player_walk_right";
            else if (dx < 0) this.currentlyDisplayedAnimation = "player_walk_left";
            else if (dy > 0) this.currentlyDisplayedAnimation = "player_walk_down";
            else if (dy < 0) this.currentlyDisplayedAnimation = "player_walk_up";
        } else {
            if (this.currentlyDisplayedAnimation == "player_walk_right" || this.currentlyDisplayedAnimation == "player_idle_right") this.currentlyDisplayedAnimation = "player_idle_right";
            else if (this.currentlyDisplayedAnimation == "player_walk_left" || this.currentlyDisplayedAnimation == "player_idle_left") this.currentlyDisplayedAnimation = "player_idle_left";
            else if (this.currentlyDisplayedAnimation == "player_walk_up" || this.currentlyDisplayedAnimation == "player_idle_back") this.currentlyDisplayedAnimation = "player_idle_back";
            else this.currentlyDisplayedAnimation = "player_idle";
            this.notify();
        }

        if (keys.has("scrollup")) {
            this.inventory.setItemInHandIndex((this.inventory.getItemInHandIndex() + 1) % this.getInventorySize());
        }

        if (keys.has("scrolldown")) {
            const size = this.getInventorySize();
            const index = ((this.inventory.getItemInHandIndex() - 1) % size + size) % size;
            this.inventory.setItemInHandIndex(index);
        }

        for (const key of keys) {
            if (/^\d$/.test(key)) {
                const number = parseInt(key, 10);
                if (number > 0 && number <= this.getInventorySize()) {
                    this.inventory.setItemInHandIndex(number - 1);
                }
            }
        }
    }

    /**
     * Returns the player's movement speed.
     */
    public getSpeed(): number {
        return PLAYER_SPEED;
    }

    /**
     * Gets the current animation name based on player movement or idle state
     */
    public getAnimationName(): AnimationName {
        return this.currentlyDisplayedAnimation;
    }

    /**
     * Indicates if the player should be animated
     */
    public isAnimated(): boolean {
        return true;
    }

    /**
     * Gets the entity type (PLAYER)
     */
    public getType(): EntityType {
        return EntityType.PLAYER;
    }

    /**
     * Returns the size of the player's inventory
     */
    public getInventorySize(): number {
        return PLAYER_INVENTORY_SIZE;
    }

    /**
     * Recreates a Player object from JSON data
     * @param player Serialized player data
     * @param world The game world to associate with this player
     * @returns A fully restored Player instance
     */
    static fromJSON(player, world: World): Player {
        return new Player(world, player.posX, player.posY, Inventory.fromJSON(player.inventory), player.id);
    }
}
