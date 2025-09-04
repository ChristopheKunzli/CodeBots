/// <reference path="./env.d.ts" />
import { Camera } from "./world/camera";
import { Player } from "./entity/player";
import { WorldRenderer } from "./renderer/world_renderer";
import { World } from "./world/world";
import * as PIXI from "pixi.js";
import { WorldGenerator } from "./world/world_generator";
import { CHUNK_SIZE, PLAYER_RANGE, TILE_SIZE } from "./constants";
import Tile from "./world/tile";
import { CraftingTableItem } from "./world/items/stations/crafting_table_item";
import { InteractableType } from "./types/interactable_type";
import { Recipe } from "./types/recipe";
import { FurnaceItem } from "./world/items/stations/furnace_item";
import { Core } from "./world/interactables/core";
import { craftingRecipes } from "./recipes/craftingRecipes";
import { furnaceRecipes } from "./recipes/smeltingRecipes";
import { coreStepsRecipes } from "./recipes/coreStepsRecipes";
import { Codebot } from "./entity/codebot";
import { CodebotItem } from "./world/items/codebot_item";
import { InteractionResult } from "./types/interaction_result";
import { Entity } from "./entity/entity";
import { Chest } from "./world/interactables/chest";
import { Item } from "./world/items/item";
import { InventorySlot } from "./types/inventory";
import { Clerk } from "@clerk/clerk-js";
import { CoreStep } from "./types/item";

export class GameEngine {
    public app: PIXI.Application;
    public world: World;
    public renderer: WorldRenderer;
    public camera: Camera;
    private player: Player;
    private keys: Set<string>;
    private codebots: Codebot[];
    private seed: string;
    private coreStepsRecipes: CoreStep[];

    constructor(app: PIXI.Application, save: any | null) {
        this.app = app;
        this.seed = save ? save.seed : this.generateRandomSeed();
        const generator = new WorldGenerator(this.seed);
        this.world = save ? new World(generator, save.world) : new World(generator);
        generator.setWorld(this.world);
        this.renderer = new WorldRenderer(
            this.world,
            app,
            this.handleInteractWithTile.bind(this),
            this.addCodebot.bind(this),
        );
        this.camera = new Camera();
        this.codebots = [];

        this.player = save ? Player.fromJSON(save.player, this.world) : new Player(this.world);
        this.coreStepsRecipes = save ? (save.coreStepsRecipes as CoreStep[]) : coreStepsRecipes;
        this.keys = new Set<string>();

        window.addEventListener("keydown", (e) =>
            this.keys.add(e.key.toLowerCase())
        );
        window.addEventListener("keyup", (e) =>
            this.keys.delete(e.key.toLowerCase())
        );

        window.addEventListener("wheel", (e) => {
            if (e.deltaY < 0) {
                this.keys.add("scrollup");
                this.player.update(this.keys, 0);
                this.keys.delete("scrollup");
            } else if (e.deltaY > 0) {
                this.keys.add("scrolldown");
                this.player.update(this.keys, 0);
                this.keys.delete("scrolldown");
            }
        });

        window.addEventListener('click', (event) => {
            this.handleMouseClick(event);
        });

        const viteDisableSave = import.meta.env.VITE_DISABLE_SAVE;

        if (viteDisableSave !== "true") {
            const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
            const clerk = new Clerk(clerkPubKey);
            clerk.load();

            const saveRequest = () => {
                return fetch("/api/save", {
                    method: "POST",
                    body: JSON.stringify({data: this.save()}),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
            }

            setInterval(saveRequest, 1000 * 60 * 5);// every 5 minutes

            window.addEventListener("beforeunload", () => {
                const data = new Blob([JSON.stringify({data: this.save()})], {type: "application/json"});
                navigator.sendBeacon("/api/save", data);
            }, false);
        }
    }

    private generateRandomSeed(length: number = 32): string {
        return Array.from({length}, () => Math.random().toString(36)[2]).join('');
    }

    private save(): any {
        return {
            seed: this.seed,
            player: this.player.toJSON(),
            codebots: this.codebots.map((codebot) => codebot.toJSON()),
            coreStepsRecipes: this.coreStepsRecipes,
            world: this.world.toJSON(),
        };
    }

    async initialize(withoutHud?: boolean, save?: any) {
        await this.renderer.initialize();
        this.renderer.gameContainer.scale.set(this.camera.zoom);
        this.app.stage.addChild(this.renderer.container);
        this.renderer.renderEntity(this.player);

        if (!withoutHud) {
            this.renderer.initializeUI(craftingRecipes, furnaceRecipes, this.player, (recipe) => this.craftEvent(recipe, this.player));

            const tile = this.world.getTileAt(1, 0);
            if (tile) {
                tile.setContent = new Core(tile);
            }

            if (!save) {
                this.player.inventory.addItem(new CraftingTableItem(1));
                // TODO test only
                this.player.inventory.addItem(new FurnaceItem(1));
                this.player.inventory.addItem(new CodebotItem(1));
            }
        }

        if (save) {
            for (const codebotData of save.codebots) {
                this.addCodeBot(Codebot.fromJSON(codebotData, this.world, this.handleCodebotInteraction.bind(this)));
            }
        }
    }

    addCodeBot(codebot: Codebot) {
        this.codebots.push(codebot);
        const sprite = this.renderer.renderEntity(codebot);
        this.renderer.initializeCodebot(sprite, codebot, this.player);
    }

    addCodebot(x: number, y: number) {
        const codebot = new Codebot(
            this.world,
            x,
            y,
            this.handleCodebotInteraction.bind(this),
        );
        this.addCodeBot(codebot);
    }

    craftEvent(recipe: Recipe, entity: Entity) {
        if (!entity.inventory.canAddItem(recipe.output)) {
            return;
        }
        for (const itemNeeded of recipe.inputs) {
            let canCraft = entity.inventory.canRemoveItem(itemNeeded);
            if (!canCraft)
                return;
        }

        for (const itemNeeded of recipe.inputs) {
            entity.inventory.removeItem(itemNeeded);
        }

        entity.inventory.addItem(recipe.output);
    }

    update(delta: number) {
        const entities = [this.player, ...this.codebots /* , ...robots plus tard */];
        entities.forEach((entity) => entity.update(this.renderer.robotInterface?.visible ? new Set() : this.keys, delta));

        const newCX = Math.floor(this.player.posX / CHUNK_SIZE);
        const newCY = Math.floor(this.player.posY / CHUNK_SIZE);
        if (newCX !== this.player.cX || newCY !== this.player.cY) {
            this.player.cX = newCX;
            this.player.cY = newCY;

            this.world.updateLoadedChunks(entities);

            // 2. recalcul rendu
            const visibleChunks = this.world.getChunksInVisibleRange(this.player);
            this.renderer.render(visibleChunks);
        }

        this.camera.follow(this.player, this.app.screen.width, this.app.screen.height);
        this.renderer.gameContainer.x = this.camera.x;
        this.renderer.gameContainer.y = this.camera.y;
    }

    private handleCodebotInteraction(codebot: Codebot, tile: Tile, result: InteractionResult, data?: any) {
        switch (result.type) {
            case "MINED":
                if (result.tile) {
                    this.renderer.updateTile(result.tile.chunk, result.tile);
                }
                break;
            case "OPENED_UI":
                if (result.interactableType === InteractableType.CRAFTING_TABLE) {
                    const recipe = craftingRecipes.find((recipe) => recipe.output.spriteName === data);
                    if (!recipe) {
                        break;
                    }

                    this.craftEvent(recipe, codebot);
                } else if (result.interactableType === InteractableType.FURNACE) {
                    const recipe = furnaceRecipes.find((recipe) => recipe.output.spriteName === data);
                    if (!recipe) {
                        break;
                    }

                    this.craftEvent(recipe, codebot);
                }
                break;
            case "NONE":
                this.renderer.updateTile(result.tile!.chunk, tile);
            default:
                break;
        }
    }

    private handleInteractWithTile(tile: Tile) {
        const distance = Math.sqrt(
            Math.pow(tile.absX - this.player.posX, 2) + Math.pow(tile.absY - this.player.posY, 2)
        );

        if (distance > PLAYER_RANGE) {
            return;
        }

        const result = this.player.interactWithTile(tile);

        switch (result.type) {
            case "MINED":
                if (result.tile) {
                    this.renderer.updateTile(result.tile.chunk, result.tile);
                }
                break;

            case "OPENED_UI":
                if (result.interactableType === InteractableType.CRAFTING_TABLE) {
                    this.renderer.renderCraftingInterface();
                } else if (result.interactableType === InteractableType.FURNACE) {
                    this.renderer.renderFurnaceInterface();

                } else if (result.interactableType === InteractableType.CHEST) {
                    const chest = result.tile?.getContent as Chest
                    this.renderer.renderChestInterface((result.tile?.getContent as Chest).inventory, (inventorySlot: InventorySlot, index: number) => {
                        let item = this.player.inventory.getItemAtIndex(index);
                        if (!item) return;
                        let quantity = item.quantity;
                        this.player.inventory.removeItem(item);
                        chest.inventory.addItem(item, quantity);
                    }, (i: Item) => {
                        let quantity = i.quantity;
                        this.player.inventory.addItem(i);
                        chest.inventory.removeItem(i, quantity);
                    });
                } else if (result.interactableType === InteractableType.CORE) {
                    this.renderer.renderCoreInterface(this.coreStepsRecipes, this.player);
                }
                break;

            case "NONE":
                this.renderer.updateTile(result.tile!.chunk, tile);
            default:
                break;
        }
    }

    private handleMouseClick(event: MouseEvent) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        let x = (mouseX - this.camera.x) / (TILE_SIZE * this.camera.zoom),
            y = (mouseY - this.camera.y) / (TILE_SIZE * this.camera.zoom);
        // Arrondir aux coordonnées de tile
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);
        let tile = this.world.getTileAt(tileX, tileY);
        if (tile == null) return;
        const distance = Math.sqrt(
            Math.pow(tile.absX - this.player.posX, 2) + Math.pow(tile.absY - this.player.posY, 2)
        );

        if (distance > PLAYER_RANGE) {
            return false;
        }

        this.renderer.renderMiningEffect(tile.absX, tile.absY);
    }
}
