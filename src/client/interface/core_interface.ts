import {Application, Container, Graphics, Sprite, Spritesheet, Text} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import {CoreStep} from "../types/item";
import {ScrollBar} from "./scroll_bar";
import { CoreItem } from '../world/items/core_item';
import { BaseInterface } from './base_interface';

export class CoreInterface extends BaseInterface {
    private steps: CoreStep[];
    private titleText: Text;
    private contentContainer: Container;
    private viewportW: number;
    private padding: number;

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, steps: CoreStep[], hudLayer: Container, onClose?: () => void) {
        super(app, spritesheets, scale, hudLayer, onClose);
        this.steps = steps;
        this.padding = 18;
        this.draw();
    }

    get currentStep(): CoreStep {
        let currentStepIndex = this.steps.findIndex((step) => step.items.some((item) => item.currentGathered < item.item.quantity));
        if (currentStepIndex === -1) {
            currentStepIndex = this.steps.length - 1;
        }

        const step = this.steps[currentStepIndex];
        if (!step) {
            throw new Error("Invalid step index");
        }

        return step;
    }

    protected draw(): void {
        const width = this.app.screen.width * 0.5;
        const height = this.app.screen.height * 0.5;
        const padding = this.padding;
        const coreInterface = this.createCenteredContainer(width, height, "dark_frame", 4);

        const viewport = new Container();
        const viewportX = padding;
        const viewportY = padding;
        this.viewportW = width - padding * 2 - 40;
        const viewportH = height - padding * 2;

        viewport.x = viewportX;
        viewport.y = viewportY;
        viewport.width = this.viewportW;
        viewport.height = viewportH;
        coreInterface.addChild(viewport);

        const maskG = new Graphics();
        maskG.beginFill(0xff0000);
        maskG.drawRect(0, 0, this.viewportW, viewportH);
        maskG.endFill();
        maskG.x = viewport.x;
        maskG.y = viewport.y;
        coreInterface.addChild(maskG);
        viewport.mask = maskG;

        // holds the list of rows and title
        const content = new Container();
        viewport.addChild(content);

        this.titleText = new Text({
            text: `Etape ${this.currentStep.name}`,
            style: {
                fill: '#ffffff',
                fontSize: 32,
                fontFamily: 'Jersey',
                stroke: '#000000',
            },
        });
        this.titleText.x = (this.viewportW - this.titleText.width) / 2;
        content.addChild(this.titleText);

        this.contentContainer = new Container();
        content.addChild(this.contentContainer);
        this.drawContent();

        const contentHeight = content.getLocalBounds().height + padding;
        const scrollbarX = coreInterface.width * 0.9;
        const scrollbarY = padding;
        const scrollbarW = 18;
        const scrollbarH = height - padding * 2;

        new ScrollBar(content, contentHeight, viewportH, coreInterface, scrollbarX, scrollbarY, scrollbarW, scrollbarH, this.app);
    }

    drawContent() {
        this.titleText.text = `Etape ${this.currentStep.name}`;
        this.contentContainer.children = [];
        for (let i = 0; i < this.currentStep.items.length; ++i) {
            const row = new Container();

            const item = this.currentStep.items[i];
            const itemSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
            itemSprite.width = itemSprite.height = Math.round(this.guiScale * 1.05);
            row.addChild(itemSprite);
            this.drawItem(new CoreItem(item.item.spriteName, item.item.quantity), itemSprite, false, false);
            const progressText = new Text({
                text: `${item.item.spriteName.replace(/_/g, ' ').toUpperCase()}\n${item.currentGathered} / ${item.item.quantity}`,
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

            const progress = Math.min(1, item.currentGathered / item.item.quantity);
            const progressBar = new Graphics();
            progressBar.beginFill(0xe42d38);
            progressBar.drawRect(barX, barY, barWidth * progress, barHeight);
            progressBar.endFill();
            row.addChild(progressBar);

            row.y = i * (itemSprite.height + 12) + this.titleText.height + this.padding;
            row.x = (this.viewportW - row.width) / 2;

            this.contentContainer.addChild(row);
        }
    }
}
