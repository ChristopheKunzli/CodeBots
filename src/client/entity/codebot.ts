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

    getType(): EntityType {
        return EntityType.CODEBOT;
    }

    getAnimationName(): AnimationName {
        if (this.hasError()) {
            return "codebot_error";
        }

        return "codebot";
    }

    hasError(): boolean {
        return this.error !== null;
    }

    setMessage(message: string | null) {
        this.message = message;
        this.notify();
    }

    getMessage(): string | null {
        return this.error ?? this.message;
    }

    async setIsRunning(isRunning: boolean) {
        this.notify();
        this.isRunning = isRunning;

        if (this.isRunning) {
            this.error = await Codebot.interpreter.evaluate(this.program, this.customBuiltins.builtins);
            this.isRunning = false;
            this.notify();
        }
    }

    getIsRunning(): boolean {
        return this.isRunning;
    }

    getSpeed(): number {
        return CODEBOT_SPEED;
    }

    isAnimated(): boolean {
        return this.isRunning || this.hasError();
    }

    async moveTo(position: Position) {
        this.target = position;

        return new Promise<void>((resolve) => {
            this.onTargetReached?.();
            this.onTargetReached = resolve;
        });
    }

    getInventorySize(): number {
        return CODEBOT_INVENTORY_SIZE;
    }

    update(_: Set<string>, delta: number) {
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

    interactWithTile(tile: Tile, data?: any): InteractionResult {
        const result = super.interactWithTile(tile);
        this.onInteraction(this, tile, result, data);

        return result;
    }

    toJSON() {
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
