import { Camera } from "./world/camera";
import { Player } from "./entity/player";
import { WorldRenderer } from "./renderer/world_renderer";
import { World } from "./world/world";
import * as PIXI from "pixi.js";
import { WorldGenerator } from "./world/world_generator";
import { CHUNK_SIZE, PLAYER_RANGE, TILE_SIZE } from "./constants";
import { CraftingTableItem } from "./world/items/crafting_table_item";
import { InteractableType } from "./types/interactable_type";
import { Recipe } from "./types/recipe";
import { ResourceType } from "./types/resource_type";

export class GameEngine {
    public app: PIXI.Application;
    public world: World;
    public renderer: WorldRenderer;
    public camera: Camera;
    private player: Player;
    private keys: Set<string>;

    constructor(app: PIXI.Application) {
        this.app = app;
        const generator = new WorldGenerator("seed");
        this.world = new World(generator);
        generator.setWorld(this.world);
        this.renderer = new WorldRenderer(this.world, app);
        this.camera = new Camera();

        this.keys = new Set<string>();

        window.addEventListener("keydown", (e) =>
            this.keys.add(e.key.toLowerCase())
        );
        window.addEventListener("keyup", (e) =>
            this.keys.delete(e.key.toLowerCase())
        );

        window.addEventListener('click', (event) => {
            this.handleMouseClick(event);
        });
    }

    async initialize() {
        await this.renderer.initialize();
        this.renderer.container.scale.set(this.camera.zoom);
        this.app.stage.addChild(this.renderer.container);
        this.player = new Player(this.world);
        this.player.itemInHand = new CraftingTableItem();
        this.renderer.renderEntity(this.player);

        const recipes: Recipe[] = [
            {inputs:  [{resource:ResourceType.WOOD, quantity: 4}], output: {item:new CraftingTableItem(), quantity:1}},
            // {inputs: [{spriteName: "iron_ingot", quantity: 1}], output: {spriteName: "nail", quantity: 16}},
            // {inputs: [{spriteName: "wood_plank", quantity: 12}, {spriteName: "nail", quantity: 64}], output: {spriteName: "crate", quantity: 1}},
            // {inputs: [{spriteName: "stone", quantity: 8}, {spriteName: "coal", quantity: 2}, {spriteName: "iron_ore", quantity: 1}], output: {spriteName: "furnace_off", quantity: 1}},
            // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "pickaxe", quantity: 1}},
            // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 8}], output: {spriteName: "shovel", quantity: 1}},
            // {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "axe", quantity: 1}},
        ];
        this.renderer.initializeUI(recipes);
    }

    update(delta: number) {
        this.player.update(this.keys, delta);

        const newCX = Math.floor(this.player.posX / CHUNK_SIZE);
        const newCY = Math.floor(this.player.posY / CHUNK_SIZE);
        if (newCX !== this.player.cX || newCY !== this.player.cY) {
            this.player.cX = newCX;
            this.player.cY = newCY;

            const entities = [this.player /* , ...robots plus tard */];
            this.world.updateLoadedChunks(entities);

            // 2. recalcul rendu
            const visibleChunks = this.world.getChunksInVisibleRange(this.player);
            this.renderer.render(visibleChunks);
        }

        this.camera.follow(this.player, this.app.screen.width, this.app.screen.height);
        this.renderer.container.x = this.camera.x;
        this.renderer.container.y = this.camera.y;
    }

    private handleMouseClick(event: MouseEvent) {

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        this.app.screen.height

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

        const result = this.player.interactWithTile(tile);

        switch (result.type) {
            case "MINED":
                if (result.tile) {
                    this.renderer.renderMiningEffect(result.tile.absX, result.tile.absY);
                    this.renderer.updateTile(result.tile.chunk, result.tile);
                }
                break;

            case "OPENED_UI":
                if (result.interactableType === InteractableType.CRAFTING_TABLE) {
                    this.renderer.renderCraftingInterface();
                }
                else if (result.interactableType === InteractableType.FURNACE) {
                    
                }
                break;

            case "NONE":
                this.renderer.updateTile(result.tile!.chunk, tile);
            default:
                break;
        }

    }
}
