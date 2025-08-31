import { Camera } from "./world/camera";
import { Player } from "./entity/player";
import { WorldRenderer } from "./renderer/world_renderer";
import { World } from "./world/world";
import * as PIXI from "pixi.js";
import { WorldGenerator } from "./world/world_generator";
import { CHUNK_SIZE, PLAYER_RANGE, TILE_SIZE } from "./constants";
import { Codebot } from "./entity/codebot";
import CustomBuiltins from "./interpreter/custom_builtins";

export class GameEngine {
    public app: PIXI.Application;
    public world: World;
    public renderer: WorldRenderer;
    public camera: Camera;
    private player: Player;
    private keys: Set<string>;
    private codebots: Codebot[];

    constructor(app: PIXI.Application) {
        this.app = app;
        const generator = new WorldGenerator("seed");
        this.world = new World(generator);
        generator.setWorld(this.world);
        this.renderer = new WorldRenderer(this.world, app);
        this.camera = new Camera();
        this.codebots = [];

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
        this.renderer.gameContainer.scale.set(this.camera.zoom);
        this.app.stage.addChild(this.renderer.container);
        await this.renderer.initialize();
        this.player = new Player(this.world);
        this.renderer.renderEntity(this.player);

        this.renderer.renderPlayerCoordinate(this.player);

        // TODO test only
        this.addCodebot();
    }

    addCodebot() {
        const codebot = new Codebot(this.world);
        this.codebots.push(codebot);
        this.renderer.renderEntity(codebot);

        // TODO test only
        codebot.setProgram(`
            wait(1000);
            var position = find("wood");
            goto(position);
            wait(1000);
            var position = find("iron");
            goto(position);
            wait(1000);
            var position = find("stone");
            goto(position);
            wait(1000);
            var position = find("coal");
            goto(position);
        `);
        codebot.setIsRunning(true);
    }

    update(delta: number) {
        const entities = [this.player, ...this.codebots /* , ...robots plus tard */];
        entities.forEach((entity) => entity.update(this.keys, delta));

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

        const mined = this.player.interactWithTile(tile);
        this.renderer.renderMiningEffect(tile.absX, tile.absY);
        if (mined) {
            let chunk = tile?.chunk;
            if (chunk == undefined || tile == null) return;
            // Rafraîchir le rendu si une ressource a été minée
            this.renderer.updateTile(chunk, tile);
            // const visibleChunks = this.world.getChunksInVisibleRange(this.player);
            // this.renderer.render(visibleChunks);
        }
    }
}
