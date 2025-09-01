import * as PIXI from "pixi.js";
import Tile from "../world/tile";
import { World } from "../world/world";
import { TileType } from "../types/tile_type";
import { ResourceType } from "../types/resource_type";
import { TextureName, findAnimation, findTexture, getSpritesheets } from "../spritesheet_atlas";
import { DecorationType } from "../types/decoration_type";
import { ANIMATION_SPEED, CAMERA_ZOOM, GUI_SCALE, TILE_SIZE } from "../constants";
import { Chunk } from "../world/chunk";
import { Entity } from "../entity/entity";
import { TileRenderer } from "./tile_renderer";
import { InteractableType } from "../types/interactable_type";
import { CraftingInterface } from "../interface/crafting_interface";
import { RobotInterface } from "../interface/robot_interface";
import { Recipe } from "../types/recipe";
import { Player } from "../entity/player";
import { ItemBar } from "../interface/item_bar";
import { OutlineFilter } from "pixi-filters";
import { Codebot } from "../entity/codebot";


export class WorldRenderer {
    public container: PIXI.Container;
    private spriteSheet: PIXI.Spritesheet<{
        meta: {
            image: string;
            format: string;
            size: {
                w: number;
                h: number;
            };
            scale: number;
        };
        frames: {};
    }>[];
    private craftingInterface: CraftingInterface;
    private tileLayer: PIXI.Container;
    private overTileLayer: PIXI.Container;
    private middleLayer: PIXI.Container;
    private foregroundLayer: PIXI.Container;
    private hudLayer: PIXI.Container;
    public gameContainer: PIXI.Container;
    private chunkContent: Map<string, Map<String, TileRenderer>> = new Map();
    private currentlyRenderingChunks: Set<string> = new Set();
    private world: World;
    private app: PIXI.Application;
    private onInteractionWithTile: (tile: Tile) => void;
    private onAddCodebot: (x: number, y: number) => void;

    constructor(
        world: World,
        app: PIXI.Application,
        onInteractionWithTile: (tile: Tile) => void,
        onAddCodebot: (x: number, y: number) => void,
    ) {
        this.app = app;
        this.world = world;
        this.container = new PIXI.Container();
        this.gameContainer = new PIXI.Container();
        this.tileLayer = new PIXI.Container();
        this.overTileLayer = new PIXI.Container();
        this.middleLayer = new PIXI.Container();
        this.foregroundLayer = new PIXI.Container();
        this.hudLayer = new PIXI.Container();
        this.gameContainer = new PIXI.Container();
        this.tileLayer.sortableChildren = false;
        this.middleLayer.sortableChildren = true;
        this.foregroundLayer.sortableChildren = true;
        this.container.addChild(this.gameContainer);
        this.gameContainer.addChild(this.tileLayer);
        this.gameContainer.addChild(this.overTileLayer);
        this.gameContainer.addChild(this.middleLayer);
        this.gameContainer.addChild(this.foregroundLayer);
        this.container.addChild(this.hudLayer);

        this.onInteractionWithTile = onInteractionWithTile;
        this.onAddCodebot = onAddCodebot;
    }

    private setCursor() {
        const getCursor = (name: string) => `url('/assets/${name}.png'),auto`;
        this.app.renderer.events.cursorStyles.default = getCursor("cursor");
        this.app.renderer.events.cursorStyles.hover = getCursor("pointer");
    }

    async initialize() {
        this.spriteSheet = await getSpritesheets();
        this.setCursor();
    }

    initializeUI(recipes:Recipe[],player:Player, onClickOnCraftLine: (recipe:Recipe)=>void){
        this.craftingInterface = new CraftingInterface(this.app,this.spriteSheet, GUI_SCALE, recipes, this.hudLayer, onClickOnCraftLine);
        const itemBar = new ItemBar(this.app, this.spriteSheet, GUI_SCALE, player.inventory, this.hudLayer);
        itemBar.show()
    }

    public render(chunks: Chunk[]) {
        const newChunkKeys = new Set(chunks.map(c => c.key));
        // 1. Unload ceux qui ne sont plus dans newChunkKeys
        for (const key of this.currentlyRenderingChunks) {
            if (!newChunkKeys.has(key)) {
                const [cx, cy] = key.split("_").map(Number);
                this.unloadChunk(cx, cy);
                this.currentlyRenderingChunks.delete(key);
            }
        }
        // 2. Render ceux qui sont nouveaux
        for (const chunk of chunks) {
            if (!this.currentlyRenderingChunks.has(chunk.key)) {
                this.currentlyRenderingChunks.add(chunk.key);
                this.renderChunk(chunk);
            }
        }
    }

    public renderCraftingInterface(){
        this.craftingInterface.show();
    }

    public renderPlayerCoordinate(player: Player) {
        const getTextFromCoordinate = (player: Player) => `x: ${Math.round(player.posX)}, y: ${Math.round(player.posY)}`

        document.fonts.ready.then(() => {
            const coordinateText = new PIXI.Text({
                text: getTextFromCoordinate(player),
                style: {
                    fontFamily: `"Jersey 10", sans-serif`,
                    fontWeight: "400",
                    fontStyle: "normal",
                    fontSize: 40,
                    fill: "#73946b",
                    stroke: {
                        color: "white",
                        width: 2,
                    },
                },
            });

            coordinateText.x = 10;
            coordinateText.y = 10;

            player.observe(() => {
                coordinateText.text = getTextFromCoordinate(player);
            });

            this.hudLayer.addChild(coordinateText);
        });
    }

    public renderEntity(entity: Entity) {
        const animation = findAnimation(this.spriteSheet, entity.getAnimationName());
        if (!animation) {
            throw new Error("animation not found");
        }

        const sprite = new PIXI.AnimatedSprite(animation);
        sprite.animationSpeed = ANIMATION_SPEED;
        sprite.anchor.set(0, 1);
        sprite.play();
        sprite.x = entity.posX * TILE_SIZE;
        sprite.y = entity.posY * TILE_SIZE + TILE_SIZE;
        sprite.zIndex = sprite.y;

        this.middleLayer.addChild(sprite);
        let animationName = entity.getAnimationName();
        entity.observe((state) => {
            if (animationName !== entity.getAnimationName()) {
                sprite.textures = findAnimation(this.spriteSheet, entity.getAnimationName())!;
                animationName = entity.getAnimationName();
            }

            sprite.x = state.posX * TILE_SIZE;
            sprite.y = state.posY * TILE_SIZE + TILE_SIZE;
            sprite.zIndex = sprite.y;

            if (entity.isAnimated()) {
                sprite.play();
            } else {
                sprite.stop();
            }
        });

        if (entity instanceof Codebot) {
            sprite.interactive = true;
            sprite.cursor = "hover";
            sprite
                .on("pointerover", () => sprite.filters = [new OutlineFilter({color: 0xffffff, thickness: 2})])
                .on("pointerout", () => sprite.filters = null)
                .on("click", () => this.renderCodebotInterface(entity));
            this.renderCodebotMessage(sprite, entity);
        }
    }

    private renderCodebotInterface(codebot: Codebot) {
        const robotInterface = new RobotInterface(this.app, this.spriteSheet, GUI_SCALE, codebot, this.hudLayer);
        robotInterface.show();
    }

    private renderCodebotMessage(sprite: PIXI.Sprite, codebot: Codebot) {
        let text = codebot.getMessage();

        const dialogBoxTexture = findTexture(this.spriteSheet, "dialog_box");
        if (!dialogBoxTexture) {
            throw new Error("could not find texture");
        }

        const padding = 5;

        const message = new PIXI.Text({
            text: text ?? "",
            style: {
                fontFamily: `"Jersey 10", sans-serif`,
                fontStyle: "normal",
                fontSize: 16,
                fill: "black",
            },
            x: padding,
            resolution: CAMERA_ZOOM,
        });

        const panel = new PIXI.NineSliceSprite({
            texture: dialogBoxTexture,
            leftWidth: 3,
            rightWidth: 9,
            topHeight: 3,
            bottomHeight: 10,
            width: message.width + 2 * padding,
            height: message.height + 2 * padding,
            x: -message.width,
            y: -(message.height + 2 * padding + TILE_SIZE),
            zIndex: 10000,
        });

        panel.addChild(message);
        sprite.addChild(panel);

        panel.visible = text !== null;

        codebot.observe(() => {
            if (text !== codebot.getMessage()) {
                text = codebot.getMessage();

                if (text) {
                    panel.visible = true;
                    message.text = text;
                    panel.width = message.width + 2 * padding;
                    panel.height = message.height + 2 * padding;
                    panel.x = -message.width;
                    panel.y = -(message.height + 2 * padding + TILE_SIZE);
                } else {
                    panel.visible = false;
                }
            }
        });
    }

    public renderMiningEffect(tileX: number, tileY: number) {
        const effect = new PIXI.Graphics();
        effect.setStrokeStyle({
            width: 2,
            color: 0xFFFFFF,
            alpha: 0.8
        });
        effect.circle(
            tileX * TILE_SIZE + TILE_SIZE / 2,
            tileY * TILE_SIZE + TILE_SIZE / 2,
            8
        );
        effect.stroke();

        this.foregroundLayer.addChild(effect);

        let alpha = 1;
        const fade = () => {
            alpha -= 0.05;
            effect.alpha = alpha;
            if (alpha <= 0) {
                effect.destroy();
                this.app.ticker.remove(fade);
            }
        };

        this.app.ticker.add(fade);
    }

    public updateTile(chunk: Chunk, tile: Tile) {
        const sprites = this.chunkContent.get(chunk.key);
        if (sprites === undefined) throw new Error("Trying to update a tile in a chunk that is not loaded");
        const tileRenderer = sprites.get(`${tile.absX - chunk.cx * chunk.size}_${tile.absY - chunk.cy * chunk.size}`);
        if (tileRenderer === undefined) throw new Error("Trying to update a tile that is not rendered");
        // destroy old sprites
        tileRenderer.tileSprite?.destroy();
        tileRenderer.contentSprite?.destroy();
        tileRenderer.decorationSprite?.destroy();
        // recreate them
        this.getTextureForTile(tile, chunk, tile.absX - chunk.cx * chunk.size, tile.absY - chunk.cy * chunk.size);
        if (tile.getContent) {
            this.getTextureForMiddleLayer(tile, chunk, tile.absX - chunk.cx * chunk.size, tile.absY - chunk.cy * chunk.size);
        }
    }

    private async unloadChunk(cx: number, cy: Number) {
        let sprites = this.chunkContent.get(`${cx}_${cy}`);
        if (sprites === undefined) throw new Error("Trying to unload a chunk that is not loaded");
        for (const [key, value] of sprites) {
            value.tileSprite?.destroy();
            value.contentSprite?.destroy();
            value.decorationSprite?.destroy();
        }
        this.chunkContent.delete(`${cx}_${cy}`)
    }

    private async renderChunk(chunk: Chunk) {

        if (!this.chunkContent.has(chunk.key)) {
            this.chunkContent.set(chunk.key, new Map());
        }

        for (let y = 0; y < chunk.size; y++) {
            for (let x = 0; x < chunk.size; x++) {
                const tile = chunk.tiles[y][x];
                this.getTextureForTile(tile, chunk, x, y);
                if (tile.getContent) {
                    this.getTextureForMiddleLayer(tile, chunk, x, y);

                } else if (tile.decoration != null) {
                    this.getTextureForDecoration(tile, chunk, x, y);
                }
            }
        }
    }

    private getTextureForTile(tile: Tile, chunk: Chunk, x: number, y: number) {
        let sprite: PIXI.Sprite;
        switch (tile.type) {
            case TileType.GRASS: {
                const grassTypes: TextureName[] = ["grass_1", "grass_2", "grass_3", "grass_4"];
                const spriteIndex = Math.floor(tile.variation * grassTypes.length);
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, grassTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                break;
            }
            case TileType.FOREST: {
                const neighbors = this.world.getTileNeighborsByDirection(tile.absX, tile.absY);
                const forestEdgeTypes: TextureName[] = ["forest_edge_1", "forest_edge_2", "forest_edge_3"];
                let textureName: TextureName;
                let rotation = 0;
                if (neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST) {
                    textureName = "forest_0_edge"; rotation = 0;
                }
                else if (neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST) {
                    textureName = "forest_one_edge"; rotation = 0;
                }
                else if (neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST) {
                    textureName = "forest_one_edge"; rotation = 90;
                }
                else if (neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST) {
                    textureName = "forest_one_edge"; rotation = 180;
                }
                else if (neighbors.left?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST) {
                    textureName = "forest_one_edge"; rotation = 270;
                } else
                    if (neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST) {
                        textureName = "forest_right_edge"; rotation = 0;
                    }
                    else if (neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST) {
                        textureName = "forest_right_edge"; rotation = 90;
                    }
                    else if (neighbors.right?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST) {
                        textureName = "forest_left_edge"; rotation = 270;
                    }
                    else if (neighbors.bottom?.type !== TileType.FOREST && neighbors.left?.type !== TileType.FOREST) {
                        textureName = "forest_left_edge"; rotation = 0;
                    }

                    else if (neighbors.left?.type !== TileType.FOREST) {
                        textureName = forestEdgeTypes[Math.floor(tile.variation * forestEdgeTypes.length)];
                        rotation = 0;
                    }
                    else if (neighbors.top?.type !== TileType.FOREST) {
                        textureName = forestEdgeTypes[Math.floor(tile.variation * forestEdgeTypes.length)];
                        rotation = 90;
                    }
                    else if (neighbors.right?.type !== TileType.FOREST) {
                        textureName = forestEdgeTypes[Math.floor(tile.variation * forestEdgeTypes.length)];
                        rotation = 180;
                    }
                    else if (neighbors.bottom?.type !== TileType.FOREST) {
                        textureName = forestEdgeTypes[Math.floor(tile.variation * forestEdgeTypes.length)];
                        rotation = 270;
                    }

                    else {
                        const forestTypes: TextureName[] = ["forest_center_1", "forest_center_2"];
                        textureName = forestTypes[Math.floor(tile.variation * forestTypes.length)];
                        rotation = 0;
                    }

                const texture = findTexture(this.spriteSheet, textureName);
                sprite = new PIXI.Sprite(texture);

                // rotation autour du centre
                sprite.anchor.set(0.5, 0.5);
                sprite.rotation = rotation * (Math.PI / 180);
                break;
            }
        }
        sprite.roundPixels = true;
        sprite.x = (chunk.cx * chunk.size + x) * TILE_SIZE + TILE_SIZE / 2;
        sprite.y = (chunk.cy * chunk.size + y) * TILE_SIZE + TILE_SIZE / 2;
        sprite.interactive = true;
        sprite.on("click", () => this.onInteractionWithTile(tile));
        this.tileLayer.addChild(sprite);

        const tileSprite = this.chunkContent.get(chunk.key)?.get(`${x}_${y}`);
        if (tileSprite) {
            tileSprite.tileSprite = sprite;
        } else {
            this.chunkContent.get(chunk.key)?.set(`${x}_${y}`, new TileRenderer(sprite, undefined, undefined));
        }
        sprite.zIndex = sprite.y;
    }

    private getTextureForMiddleLayer(tile: Tile, chunk: Chunk, x: number, y: number) {
        let sprite: PIXI.Sprite;
        let offsetY = 0;
        switch (tile.getContent?.tileContentType) {
            case ResourceType.WOOD: {
                const treeTypes: TextureName[] = ["tree_1", "tree_2", "tree_3", "tree_4"];
                const spriteIndex = Math.floor(tile.variation * treeTypes.length);
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, treeTypes[spriteIndex]));
                this.middleLayer.addChild(sprite);
                offsetY = -2;
                break;

            };
            case InteractableType.CRAFTING_TABLE: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "workbench"));
                this.middleLayer.addChild(sprite);
                sprite.anchor.set(0.5, 0.5);
                break;
            }

            case InteractableType.FURNACE: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "furnace"));
                this.middleLayer.addChild(sprite);
                sprite.anchor.set(0.5, 0.5);
                break;
            }

            case InteractableType.CHEST: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "crate"));
                this.middleLayer.addChild(sprite);
                sprite.anchor.set(0.5, 0.5);
                break;
            }
            case ResourceType.STONE: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "stone"))
                this.overTileLayer.addChild(sprite);
                break;
            };
            case ResourceType.COPPER: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "copper"))
                this.overTileLayer.addChild(sprite);
                break;
            };
            case ResourceType.IRON: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "iron"))
                this.overTileLayer.addChild(sprite);
                break;
            };
            case ResourceType.COAL: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "coal"))
                this.overTileLayer.addChild(sprite);
                break;
            };
            case InteractableType.CODEBOT: {
                this.onAddCodebot(x, y);
                tile.setContent = null;
                return;
            };
            default: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "axe"));
                this.middleLayer.addChild(sprite);
                break;
            }
        }

        sprite.anchor.set(0.5, 1);

        sprite.interactive = true;
        sprite.cursor = "hover";
        sprite
            .on("pointerover", () => sprite.filters = [new OutlineFilter({color: 0xffffff, thickness: 2})])
            .on("pointerout", () => sprite.filters = null)
            .on("click", () => this.onInteractionWithTile(tile));

        sprite.roundPixels = true;
        sprite.x = (chunk.cx * chunk.size + x) * TILE_SIZE + TILE_SIZE / 2;
        sprite.y = (chunk.cy * chunk.size + y) * TILE_SIZE + TILE_SIZE + offsetY;

        const tileSprite = this.chunkContent.get(chunk.key)?.get(`${x}_${y}`);
        if (tileSprite) {
            tileSprite.contentSprite = sprite;
        } else {
            this.chunkContent.get(chunk.key)?.set(`${x}_${y}`, new TileRenderer(undefined, sprite, undefined));
        }

        sprite.zIndex = sprite.y;
    }



    private getTextureForDecoration(tile: Tile, chunk: Chunk, x: number, y: number) {
        let sprite: PIXI.Sprite;
        switch (tile.decoration) {
            case DecorationType.BUSH: {
                const bushTypes: TextureName[] = ["bush_1", "bush_2", "bush_3"];
                const spriteIndex = Math.floor(tile.variation * bushTypes.length);
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, bushTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.7);
                this.middleLayer.addChild(sprite);
                break;
            }
            case DecorationType.FLOWER: {
                const flowerTypes: TextureName[] = ["flower_1", "flower_2", "flower_3"];
                const spriteIndex = Math.floor(tile.variation * flowerTypes.length);
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, flowerTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                this.overTileLayer.addChild(sprite);
                break;
            }
            default: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "flower_1"));
                sprite.anchor.set(0.5, 0.5);
            }
        }

        sprite.roundPixels = true;
        sprite.x = (chunk.cx * chunk.size + x) * TILE_SIZE + TILE_SIZE / 2;
        sprite.y = (chunk.cy * chunk.size + y) * TILE_SIZE + TILE_SIZE / 2;

        sprite.interactive = true;
        sprite.on("click", () => this.onInteractionWithTile(tile));

        const tileSprite = this.chunkContent.get(chunk.key)?.get(`${x}_${y}`);
        if (tileSprite) {
            tileSprite.contentSprite = sprite;
        } else {
            this.chunkContent.get(chunk.key)?.set(`${x}_${y}`, new TileRenderer(undefined, undefined, sprite));
        }

        sprite.zIndex = sprite.y;
    }
}
