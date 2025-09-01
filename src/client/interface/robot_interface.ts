import {Application, Container, DestroyOptions, Graphics, Sprite, Spritesheet} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import {ScrollBar} from "./scroll_bar";
import {MultilineInput} from "./multiline_input";
import { BaseInterface } from './base_interface';
import { Codebot } from '../entity/codebot';

export class RobotInterface extends BaseInterface {
    private codebot: Codebot;
    private codeArea: MultilineInput;

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, codebot: Codebot, hudLayer: Container) {
        super(app, spritesheets, scale, hudLayer, () => this.handleClose());
        this.codebot = codebot;
        this.draw();
    }

    private handleClose() {
        this.codebot.program = this.codeArea.getText();
        this.destroy();
    }

    protected draw(): void {
        const width = this.app.screen.width * 0.5;
        const height = this.app.screen.height * 0.5;
        const padding = 18;
        const robotInterface = this.createCenteredContainer(width, height, "dark_frame", 4);

        const viewport = new Container();
        const viewportX = padding;
        const viewportY = padding;
        const viewportW = width - padding * 2;
        const viewportH = height - padding * 2;

        const scrollbarW = 18;
        const scrollbarH = height - padding * 2;

        viewport.x = viewportX;
        viewport.y = viewportY;
        viewport.width = viewportW;
        viewport.height = viewportH;
        robotInterface.addChild(viewport);

        const maskG = new Graphics();
        maskG.fill(0xff0000);
        maskG.rect(0, 0, viewportW, viewportH);
        maskG.fill();
        maskG.x = viewport.x;
        maskG.y = viewport.y;
        robotInterface.addChild(maskG);
        viewport.mask = maskG;

        const codeAreaW = viewportW * 0.8 - scrollbarW;
        const codeAreaH = viewportH;
        this.codeArea = new MultilineInput(codeAreaW, codeAreaH, this.codebot.program);

        this.codeArea.x = viewportX;
        this.codeArea.y = viewportY;
        viewport.addChild(this.codeArea);

        const scrollbarX = this.codeArea.x + codeAreaW + scrollbarW + padding / 2;
        const scrollbarY = this.codeArea.y;

        const scrollbar = new ScrollBar(
            this.codeArea,
            this.codeArea.contentHeight,
            codeAreaH,
            robotInterface,
            scrollbarX,
            scrollbarY,
            scrollbarW,
            scrollbarH,
            this.app
        );

        this.codeArea.setScrollBar(scrollbar);

        //measure available space to add itemSlot and power button
        const bounds = robotInterface.getLocalBounds();
        const availableWidth = bounds.width - scrollbarX - padding;
        const size = availableWidth * 0.75;

        //item slot on right
        const itemSlot = new Sprite(findTexture(this.spritesheets, "light_square"));
        itemSlot.width = itemSlot.height = size;
        itemSlot.x = (scrollbarX + scrollbarW) + (availableWidth - size) / 2;
        itemSlot.y = (bounds.height - size) / 2;
        robotInterface.addChild(itemSlot);
        this.drawItem(this.codebot.inventory.itemInHand, itemSlot, true, true);

        //power button
        const powerButton = new Sprite(findTexture(this.spritesheets, "power"));
        const powerButtonSize = size * 0.5;
        powerButton.width = powerButton.height = powerButtonSize;
        powerButton.x = itemSlot.x + (itemSlot.width - powerButtonSize) / 2;
        powerButton.y = itemSlot.y + itemSlot.height + (bounds.height - (itemSlot.y + itemSlot.height) - powerButtonSize) / 2;
        powerButton.tint = this.codebot.getIsRunning() ? 0xffffff : 0xff0000;
        powerButton.interactive = true;
        powerButton.on('pointerdown', () => {
            this.codebot.program = this.codeArea.getText();
            this.codebot.setIsRunning(!this.codebot.getIsRunning())
        });

        this.codebot.observe(() => {
            powerButton.tint = this.codebot.getIsRunning() ? 0xffffff : 0xff0000;
        });

        robotInterface.addChild(powerButton);

        const helpButton = new Sprite(findTexture(this.spritesheets, "help"));
        const helpButtonSize = size * 0.5;
        helpButton.width = helpButtonSize;
        helpButton.height = helpButtonSize;
        helpButton.x = itemSlot.x + (itemSlot.width - helpButtonSize) / 2;
        helpButton.y = itemSlot.y - (bounds.height - (itemSlot.y + itemSlot.height) - helpButtonSize) / 2;
        helpButton.interactive = true;
        helpButton
            .on('mouseover', () => helpButton.tint = 0xff0000)
            .on('mouseout', () => helpButton.tint = 0xffffff)
            .on('pointerdown', () => window.open("/doc", "_blank"));
        robotInterface.addChild(helpButton);
    }

    destroy(): void {
        this.codeArea.destroy();
    }
}
