import { Camera } from "./world/camera";
import { Player } from "./entity/player";
import { WorldRenderer } from "./renderer/world_renderer";
import { World } from "./world/world";
import * as PIXI from "pixi.js";
import { WorldGenerator } from "./world/world_generator";
import { CHUNK_SIZE, PLAYER_RANGE, TILE_SIZE } from "./constants";
import Tile from "./world/tile";
import { CraftingTableItem } from "./world/items/crafting_table_item";
import { InteractableType } from "./types/interactable_type";
import { Recipe } from "./types/recipe";
import { WoodLogItem } from "./world/items/wood_log_item";
import { StoneItem } from "./world/items/stone_item";
import { FurnaceItem } from "./world/items/furnace_item";
import { CopperItem } from "./world/items/copper_item";
import { IronItem } from "./world/items/iron_item";
import { AxeItem } from "./world/items/tools/axeItem";
import { PickaxeItem } from "./world/items/tools/pickaxeItem";
import { ShovelItem } from "./world/items/tools/shovelItem";
import { WoodMaterial } from "./world/items/tools/woodMaterial";
import { StoneMaterial } from "./world/items/tools/stoneMaterial";
import { CopperMaterial } from "./world/items/tools/copperMaterial";
import { IronMaterial } from "./world/items/tools/ironMaterial";
import { CopperIngotItem } from "./world/items/copper_ingot_item";
import { CoalItem } from "./world/items/coal_item";
import { IronIngotItem } from "./world/items/iron_ingot_item";
import { Core } from "./world/interactables/core";
import { CoreStep } from "./types/item";

const coreSteps: CoreStep[] = [
    {
        name: "Âge de Pierre",
        items: [
            {item: new WoodLogItem(2500), currentGathered: 0},
            {item: new StoneItem(800), currentGathered: 0},
            {item: new CoalItem(3000), currentGathered: 0},
        ],
    },
];
import { Codebot } from "./entity/codebot";
import { CodebotItem } from "./world/items/codebot_item";
import { InteractionResult } from "./types/interaction_result";
import { Entity } from "./entity/entity";

export class GameEngine {
    public app: PIXI.Application;
    public world: World;
    public renderer: WorldRenderer;
    public camera: Camera;
    private player: Player;
    private keys: Set<string>;
    private codebots: Codebot[];
    private recipes: Recipe[]
    private furnaceRecipes: Recipe[]

    constructor(app: PIXI.Application) {
        this.app = app;
        const generator = new WorldGenerator("seed");
        this.world = new World(generator);
        generator.setWorld(this.world);
        this.renderer = new WorldRenderer(
            this.world,
            app,
            this.handleInteractWithTile.bind(this),
            this.addCodebot.bind(this),
        );
        this.camera = new Camera();
        this.codebots = [];

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
    }

    async initialize(withoutHud?: boolean) {
        await this.renderer.initialize();
        this.renderer.gameContainer.scale.set(this.camera.zoom);
        this.app.stage.addChild(this.renderer.container);
        this.player = new Player(this.world);
        this.renderer.renderEntity(this.player);

        this.recipes = [
            {inputs: [new WoodLogItem(4)], output: new CraftingTableItem(1)},
            {inputs: [new StoneItem(4)], output: new FurnaceItem(1)},

            {inputs: [new WoodLogItem(16), new StoneItem(4)], output: new PickaxeItem(new WoodMaterial())},
            {inputs: [new WoodLogItem(8), new StoneItem(4)], output: new PickaxeItem(new StoneMaterial())},
            {inputs: [new WoodLogItem(16), new CopperItem(4)], output: new PickaxeItem(new CopperMaterial())},
            {inputs: [new WoodLogItem(16), new IronItem(4)], output: new PickaxeItem(new IronMaterial())},

            {inputs: [new WoodLogItem(16), new StoneItem(4)], output: new AxeItem(new WoodMaterial())},
            {inputs: [new WoodLogItem(8), new StoneItem(4)], output: new AxeItem(new StoneMaterial())},
            {inputs: [new WoodLogItem(16), new CopperItem(4)], output: new AxeItem(new CopperMaterial())},
            {inputs: [new WoodLogItem(16), new IronItem(4)], output: new AxeItem(new IronMaterial())},

            {inputs: [new WoodLogItem(16), new StoneItem(4)], output: new ShovelItem(new WoodMaterial())},
            {inputs: [new WoodLogItem(8), new StoneItem(4)], output: new ShovelItem(new StoneMaterial())},
            {inputs: [new WoodLogItem(16), new CopperItem(4)], output: new ShovelItem(new CopperMaterial())},
            {inputs: [new WoodLogItem(16), new IronItem(4)], output: new ShovelItem(new IronMaterial())},

            {inputs:  [new IronItem(25)], output: new CodebotItem(1)},
            // {inputs: [{spriteName: "iron_ingot", quantity: 1}], output: {spriteName: "nail", quantity: 16}},
            // {inputs: [{spriteName: "wood_plank", quantity: 12}, {spriteName: "nail", quantity: 64}], output: {spriteName: "crate", quantity: 1}},
            // {inputs: [{spriteName: "stone", quantity: 8}, {spriteName: "coal", quantity: 2}, {spriteName: "iron_ore", quantity: 1}], output: {spriteName: "furnace_off", quantity: 1}},
            // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "pickaxe", quantity: 1}},
            // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 8}], output: {spriteName: "shovel", quantity: 1}},
            // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "axe", quantity: 1}},
        ];

        this.furnaceRecipes = [
            {inputs: [new CopperItem(4), new CoalItem(4)], output: new CopperIngotItem(1)},
            {inputs: [new IronItem(4), new CoalItem(4)], output: new IronIngotItem(1)},
        ];

        if (!withoutHud) {
            this.renderer.initializeUI(
                this.recipes,
                this.furnaceRecipes,
                this.player,
                (recipe) => this.craftEvent(recipe, this.player),
            );
        }

        const tile  = this.world.getTileAt(1, 0);
        if (tile) {
            tile.setContent = new Core(tile);
        }


        this.renderer.renderPlayerCoordinate(this.player);

        // TODO test only
        this.player.inventory.addItem(new CraftingTableItem(1));
        this.player.inventory.addItem(new FurnaceItem(1));
        this.player.inventory.addItem(new CodebotItem(1));
    }

    addCodebot(x: number, y: number) {
        const codebot = new Codebot(
            this.world,
            x,
            y,
            this.handleCodebotInteraction.bind(this),
        );
        this.codebots.push(codebot);
        const sprite = this.renderer.renderEntity(codebot);
        this.renderer.initializeCodebot(sprite, codebot, this.player);
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
                    const recipe = this.recipes.find((recipe) => recipe.output.spriteName === data);
                    if (!recipe) {
                        break;
                    }

                    this.craftEvent(recipe, codebot);
                } else if (result.interactableType === InteractableType.FURNACE) {
                    const recipe = this.furnaceRecipes.find((recipe) => recipe.output.spriteName === data);
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
                } else if (result.interactableType === InteractableType.CORE) {
                    this.renderer.renderCoreInterface(coreSteps, this.player);
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
