import { Application, Container, Sprite, Spritesheet, Text } from 'pixi.js';
import { findTexture } from "../spritesheet_atlas";
import { BaseInterface } from './base_interface';

/**
 * FurnaceInterface
 *
 * Displays a simple interface for a furnace with:
 * - An input slot for items to smelt
 * - A fuel slot
 * - An output slot for the resulting item
 */
export class FurnaceInterface extends BaseInterface {
    /**
     * Creates a FurnaceInterface instance
     * @param app The PixiJS application
     * @param spritesheets Loaded spritesheets for rendering textures
     * @param scale UI scale factor
     * @param hudLayer The HUD container where the interface is added
     */
    constructor(app: Application, spritesheets: Spritesheet[], scale: number, hudLayer: Container) {
        super(app, spritesheets, scale, hudLayer);
        this.hudLayer = hudLayer;
        this.draw();
    }

    protected draw(): void {
        const furnaceWidth = Math.round(this.app.screen.width * 0.4);
        const furnaceHeight = Math.round(this.app.screen.height * 0.4);
        const furnaceInterface = this.createCenteredContainer(furnaceWidth, furnaceHeight, "dark_frame", 4);

        // paddings & layout
        const padding = 18;
        const slotSize = this.guiScale * 1.2;
        const slotY = (furnaceHeight - slotSize) / 2;

        // Input slot
        const inputSlotBg = new Sprite(findTexture(this.spritesheets, "light_square"));
        inputSlotBg.width = inputSlotBg.height = slotSize;
        inputSlotBg.x = 2 * padding;
        inputSlotBg.y = slotY;
        furnaceInterface.addChild(inputSlotBg);

        const inputSlotText = new Text("Input", {fontSize: Math.round(this.guiScale * 0.4), fill: 0xffffff});
        inputSlotText.x = inputSlotBg.x + (slotSize - inputSlotText.width) / 2;
        inputSlotText.y = inputSlotBg.y + slotSize + 4;
        furnaceInterface.addChild(inputSlotText);

        //fuel slot
        const fuelSlotBg = new Sprite(findTexture(this.spritesheets, "light_square"));
        fuelSlotBg.width = fuelSlotBg.height = slotSize;
        fuelSlotBg.x = (furnaceWidth - slotSize) / 2
        fuelSlotBg.y = slotY;
        furnaceInterface.addChild(fuelSlotBg);

        const fuelSlotText = new Text("Fuel", {fontSize: Math.round(this.guiScale * 0.4), fill: 0xffffff});
        fuelSlotText.x = fuelSlotBg.x + (slotSize - fuelSlotText.width) / 2;
        fuelSlotText.y = fuelSlotBg.y + slotSize + 4;
        furnaceInterface.addChild(fuelSlotText);

        // Output slot
        const outputSlotBg = new Sprite(findTexture(this.spritesheets, "light_square"));
        outputSlotBg.width = outputSlotBg.height = slotSize;
        outputSlotBg.x = furnaceWidth - (2 * padding) - slotSize;
        outputSlotBg.y = slotY;
        furnaceInterface.addChild(outputSlotBg);

        const outputSlotText = new Text("Output", {fontSize: Math.round(this.guiScale * 0.4), fill: 0xffffff});
        outputSlotText.x = outputSlotBg.x + (slotSize - outputSlotText.width) / 2;
        outputSlotText.y = outputSlotBg.y + slotSize + 4;
        furnaceInterface.addChild(outputSlotText);


    }

}
