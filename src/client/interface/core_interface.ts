import {Application, Container, Graphics, Sprite, Spritesheet, Text} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import {CoreStep} from "../types/item";
import {ScrollBar} from "./scroll_bar";
import { CoreItem } from '../world/items/core_item';
import { BaseInterface } from './base_interface';

export class CoreInterface extends BaseInterface {
    private steps: CoreStep[];
    private currentStepIndex: number;

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, steps: CoreStep[], currentStepIndex: number = 0) {
        super(app, spritesheets, scale);
        this.steps = steps;
        this.currentStepIndex = currentStepIndex;
        this.draw();
    }

    protected draw(): void {
        const step = this.steps[this.currentStepIndex];
        if (!step) {
            throw new Error("Invalid step index");
        }

        const width = this.app.screen.width * 0.5;
        const height = this.app.screen.height * 0.5;
        const padding = 18;
        const coreInterface = this.createCenteredContainer(width, height, "dark_frame", 4);

        const viewport = new Container();
        const viewportX = padding;
        const viewportY = padding;
        const viewportW = width - padding * 2 - 40;
        const viewportH = height - padding * 2;

        viewport.x = viewportX;
        viewport.y = viewportY;
        viewport.width = viewportW;
        viewport.height = viewportH;
        coreInterface.addChild(viewport);

        const maskG = new Graphics();
        maskG.beginFill(0xff0000);
        maskG.drawRect(0, 0, viewportW, viewportH);
        maskG.endFill();
        maskG.x = viewport.x;
        maskG.y = viewport.y;
        coreInterface.addChild(maskG);
        viewport.mask = maskG;

        // holds the list of rows and title
        const content = new Container();
        viewport.addChild(content);

        const titleText = new Text({
            text: `Etape ${step.stepNumber}`,
            style: {
                fill: '#ffffff',
                fontSize: 32,
                fontFamily: 'Jersey',
                stroke: '#000000',
            },
        });
        titleText.x = (viewportW - titleText.width) / 2;
        content.addChild(titleText);

        for (let i = 0; i < step.items.length; ++i) {
            const row = new Container();

            const item = step.items[i];
            const itemSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
            itemSprite.width = itemSprite.height = Math.round(this.guiScale * 1.05);
            row.addChild(itemSprite);
            // TODO ??
            this.drawItem(new CoreItem(item.spriteName, item.goal), itemSprite, false, false);
            const progressText = new Text({
                text: `${item.spriteName.replace(/_/g, ' ').toUpperCase()}\n${item.currentGathered} / ${item.goal}`,
                style: {
                    fill: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'Jersey',
                    stroke: '#000000',
                },
            });
            progressText.x = itemSprite.x + itemSprite.width + 12;
            progressText.y = itemSprite.y + (itemSprite.height - progressText.height) / 2;
            row.addChild(progressText);

            const barWidth = this.guiScale * 2;
            const barHeight = this.guiScale / 4;
            const barX = progressText.x;
            const barY = itemSprite.y + itemSprite.height - barHeight;
            const progressBarBg = new Graphics();
            progressBarBg.beginFill(0x555555);
            progressBarBg.drawRect(barX, barY, barWidth, barHeight);
            progressBarBg.endFill();
            row.addChild(progressBarBg);

            const progress = Math.min(1, item.currentGathered / item.goal);
            const progressBar = new Graphics();
            progressBar.beginFill(0xe42d38);
            progressBar.drawRect(barX, barY, barWidth * progress, barHeight);
            progressBar.endFill();
            row.addChild(progressBar);

            row.y = i * (itemSprite.height + 12) + titleText.height + padding;
            row.x = (viewportW - row.width) / 2;

            content.addChild(row);
        }

        const contentHeight = content.getLocalBounds().height + padding;
        const scrollbarX = coreInterface.width * 0.9;
        const scrollbarY = padding;
        const scrollbarW = 18;
        const scrollbarH = height - padding * 2;

        new ScrollBar(content, contentHeight, viewportH, coreInterface, scrollbarX, scrollbarY, scrollbarW, scrollbarH, this.app);
    }
}
