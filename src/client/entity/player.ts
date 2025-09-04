import { AnimationName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { World } from "../world/world";
import { Entity } from "./entity";
import { PLAYER_INVENTORY_SIZE, PLAYER_SPEED } from "../constants";
import Inventory from "../inventory/inventory";

export class Player extends Entity {
    private currentlyDisplayedAnimation: AnimationName;

    constructor(world: World, x: number = 0, y: number = 0, inventory?: Inventory, id?: string) {
        super(world, x, y, inventory, id);
        this.currentlyDisplayedAnimation = "player_idle";
    }

    update(keys: Set<string>, delta: number) {
        let dx = 0;
        let dy = 0;

        if (keys.has("w")) dy -= 1;
        if (keys.has("s")) dy += 1;
        if (keys.has("a")) dx -= 1;
        if (keys.has("d")) dx += 1;

        // si déplacement
        if (dx !== 0 || dy !== 0) {
            // normalisation (évite vitesse diagonale trop rapide)
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            this.posX += dx * this.getSpeed() * delta / 60;
            this.posY += dy * this.getSpeed() * delta / 60;

            // choisir l’animation en fonction de la direction
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

    getSpeed(): number {
        return PLAYER_SPEED;
    }

    getAnimationName(): AnimationName {
        return this.currentlyDisplayedAnimation;
    }

    isAnimated(): boolean {
        return true;
    }

    getType(): EntityType {
        return EntityType.PLAYER;
    }

    getInventorySize(): number {
        return PLAYER_INVENTORY_SIZE;
    }

    static fromJSON(player, world: World): Player {
        return new Player(world, player.posX, player.posY, Inventory.fromJSON(player.inventory), player.id);
    }
}
