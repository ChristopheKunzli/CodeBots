import Interpreter from "codebotsinterpreter";
import CustomBuiltins from "../interpreter/custom_builtins";
import { Entity } from "./entity";
import type { AnimationName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { CODEBOT_INVENTORY_SIZE, CODEBOT_SPEED } from "../constants";
import { Position } from "../types/position";
import { World } from "../world/world";
import { InteractionResult } from "../types/interaction_result";
import Tile from "../world/tile";
import Inventory from "../inventory/inventory";

/**
 * Codebot
 *
 * A programmable robot entity that can execute user-written code,
 * move around the world, interact with tiles, and carry its own inventory
 *
 * It runs code using an interpreter, can show messages or errors
 */
export class Codebot extends Entity {
    private customBuiltins: CustomBuiltins;
    public program: string;
    private isRunning: boolean;
    private error: string | null;
    private target: Position | null;
    private onTargetReached: (() => void) | null;
    private static interpreter = new Interpreter();
    private message: string | null;
    private onInteraction: (codebot: Codebot, tile: Tile, result: InteractionResult, data?: any) => void;

    /**
     * Creates a new Codebot
     * @param world The world this Codebot belongs to
     * @param x Initial X position
     * @param y Initial Y position
     * @param onInteraction Callback when the Codebot interacts with a tile
     * @param inventory Optional inventory (a new one is created if omitted)
     * @param id Optional unique ID (auto-generated if omitted)
     */
    constructor(
        world: World,
        x: number,
        y: number,
        onInteraction: (codebot: Codebot, tile: Tile, result: InteractionResult) => void,
        inventory?: Inventory,
        id?: string) {
        super(world, x, y, inventory || undefined, id || undefined);
        this.program = "";
        this.isRunning = false;
        this.error = null;
        this.customBuiltins = new CustomBuiltins(this, this.world);
        this.target = null;
        this.onTargetReached = null;
        this.message = null;
        this.onInteraction = onInteraction;
    }

    public getType(): EntityType {
        return EntityType.CODEBOT;
    }

    public getAnimationName(): AnimationName {
        if (this.hasError()) {
            return "codebot_error";
        }

        return "codebot";
    }

    /**
     * Checks if the Codebot has encountered an error
     */
    public hasError(): boolean {
        return this.error !== null;
    }

    /**
     * Sets a message to display for this Codebot
     * @param message A string message or null to clear it
     */
    public setMessage(message: string | null): void {
        this.message = message;
        this.notify();
    }

    /**
     * Gets the current error message or message text
     */
    public getMessage(): string | null {
        return this.error ?? this.message;
    }

    /**
     * Starts or stops the Codebot's execution
     * If starting, it evaluates the program code using the interpreter
     * @param isRunning Whether the Codebot should start running code
     */
    public async setIsRunning(isRunning: boolean): Promise<void> {
        this.notify();
        this.isRunning = isRunning;

        if (this.isRunning) {
            this.error = await Codebot.interpreter.evaluate(this.program, this.customBuiltins.builtins);
            this.isRunning = false;
            this.notify();
        }
    }

    /**
     * Returns true if the Codebot is currently running code
     */
    public getIsRunning(): boolean {
        return this.isRunning;
    }

    public getSpeed(): number {
        return CODEBOT_SPEED;
    }

    public isAnimated(): boolean {
        return this.isRunning || this.hasError();
    }

    /**
     * Moves the Codebot to a specified position
     * Resolves when the target is reached
     * @param position The destination position
     */
    public async moveTo(position: Position): Promise<void> {
        this.target = position;

        return new Promise<void>((resolve) => {
            this.onTargetReached?.();
            this.onTargetReached = resolve;
        });
    }

    /**
     * Returns the inventory size of the Codebot
     */
    public getInventorySize(): number {
        return CODEBOT_INVENTORY_SIZE;
    }

    /**
     * Updates the Codebot's movement towards its target
     * @param _ Ignored key inputs
     * @param delta Time delta
     */
    public update(_: Set<string>, delta: number): void {
        if (this.target === null) {
            return;
        }

        const deltaX = this.target.x - this.posX;
        const deltaY = this.target.y - this.posY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const moveDist = this.getSpeed() * (delta / 60);
        if (moveDist >= distance) {
            this.posX = this.target.x;
            this.posY = this.target.y;
            this.target = null;
            this.onTargetReached?.();
            this.onTargetReached = null;
        } else {
            this.posX += (deltaX / distance) * moveDist;
            this.posY += (deltaY / distance) * moveDist;
        }
    }

    /**
     * Interacts with a tile and triggers the onInteraction callback
     * @param tile The tile to interact with
     * @param data Optional data passed to the callback
     */
    public interactWithTile(tile: Tile, data?: any): InteractionResult {
        const result = super.interactWithTile(tile);
        this.onInteraction(this, tile, result, data);

        return result;
    }

    public toJSON() {
        return {
            ...super.toJSON(),
            program: this.program,
            isRunning: this.isRunning,
        };
    }

    static fromJSON(codebotData, world: World,onInteraction: (codebot: Codebot, tile: Tile, result: InteractionResult) => void) : Codebot {
        const inventory = codebotData.inventory ? Inventory.fromJSON(codebotData.inventory) : new Inventory(CODEBOT_INVENTORY_SIZE);
        const codebot = new Codebot(world, codebotData.posX, codebotData.posY, onInteraction, inventory, codebotData.id);
        codebot.program = codebotData.program;
        codebot.isRunning = codebotData.isRunning;
        return codebot;
    }
}
