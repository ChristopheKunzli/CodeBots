import {Application, Container, Graphics, Sprite, Spritesheet} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import { Item } from '../world/items/item';
import {ScrollBar} from "./scroll_bar";
import {MultilineInput} from "./multiline_input";
import { BaseInterface } from './base_interface';

export class RobotInterface extends BaseInterface {
    private code: string;
    private item: Item | null;

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, code: string, item: Item|null = null) {
        super(app, spritesheets, scale);
        this.code = code;
        this.item = item;
        this.draw();
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
        const codeArea = new MultilineInput(codeAreaW, codeAreaH, this.code);

        codeArea.x = viewportX;
        codeArea.y = viewportY;
        viewport.addChild(codeArea);

        const scrollbarX = codeArea.x + codeAreaW + scrollbarW + padding / 2;
        const scrollbarY = codeArea.y;

        const scrollbar = new ScrollBar(
            codeArea,
            codeArea.contentHeight,
            codeAreaH,
            robotInterface,
            scrollbarX,
            scrollbarY,
            scrollbarW,
            scrollbarH,
            this.app
        );

        codeArea.setScrollBar(scrollbar);

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
        this.drawItem(this.item, itemSlot, true, true);

        //power button
        const powerButton = new Sprite(findTexture(this.spritesheets, "power"));
        const powerButtonSize = size * 0.5;
        powerButton.width = powerButton.height = powerButtonSize;
        powerButton.x = itemSlot.x + (itemSlot.width - powerButtonSize) / 2;
        powerButton.y = itemSlot.y + itemSlot.height + (bounds.height - (itemSlot.y + itemSlot.height) - powerButtonSize) / 2;
        powerButton.interactive = true;
        powerButton.on('pointerdown', () => {
            //TODO manage robot power button click
            console.log(`Clicked on robot power button`);
            powerButton.tint = powerButton.tint === 0xff0000 ? 0xffffff : 0xff0000;
        });
        robotInterface.addChild(powerButton);
    }
}
