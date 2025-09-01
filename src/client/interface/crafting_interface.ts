import {Application, Container, Graphics, Sprite, Spritesheet, Text} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import {ScrollBar} from "./scroll_bar";
import { Recipe } from '../types/recipe';
import { BaseInterface } from './base_interface';

export class CraftingInterface extends BaseInterface {
    private readonly recipes: Recipe[];
    private onClickOnCraftLine: (recipe:Recipe)=>void;
    constructor(app: Application, spritesheets: Spritesheet[], scale: number, recipes: Recipe[], hudLayer:Container, onClickOnCraftLine: (recipe:Recipe)=>void) {
        super(app, spritesheets, scale);
        this.onClickOnCraftLine = onClickOnCraftLine;
        this.recipes = recipes;
        this.hudLayer = hudLayer;
        this.draw();
    }

    protected draw(): void {
        const craftingWidth = this.app.screen.width * 0.5;
        const craftingHeight = this.app.screen.height * 0.5;
        const craftingInterface = this.createCenteredContainer(craftingWidth, craftingHeight, "dark_frame", 4);

        // paddings & layout
        const padding = 18;
        const rowHeight = Math.max(56, Math.round(this.guiScale * 1.05)) + 10; // vertical space per recipe (+ 10 to allow displaying item name)
        const vGap = 12;
        const leftOutputSize = Math.round(this.guiScale * 1.05); // big left output slot
        const smallSlotSize = Math.round(this.guiScale * 0.85);  // small input slots
        const hGap = 12;

        // compute viewport (the visible area that will be clipped)
        const viewportX = padding;
        const viewportY = padding;
        const viewportW = craftingWidth - padding * 3 - 40; // leave space for scrollbar on right
        const viewportH = craftingHeight - padding * 2;

        // container that will be the area where rows are shown
        const viewport = new Container();
        viewport.x = viewportX;
        viewport.y = viewportY;
        viewport.width = viewportW;
        viewport.height = viewportH;
        craftingInterface.addChild(viewport);

        // content container (holds the list of rows). We'll move content.y for scrolling.
        const content = new Container();
        viewport.addChild(content);

        const stripe = new Graphics();
        stripe.x = 0;
        stripe.y = 0;
        viewport.addChildAt(stripe, 0);

        const totalRows = this.recipes.length;
        const contentHeight = totalRows * (rowHeight + vGap);

        //where the small slots begin relative to content (after the output slot)
        const leftStartX = 6 + leftOutputSize + 6;

        for (let i = 0; i < this.recipes.length; ++i) {
            const recipe = this.recipes[i];
            const row = new Container();
            row.y = i * (rowHeight + vGap);
            content.addChild(row);

            const rowBg = new Graphics(); // invisible but catches events
            rowBg.fill(0xffffff, 0);
            rowBg.rect(0, 0, viewportW, rowHeight);
            rowBg.endFill();
            row.addChildAt(rowBg, 0);

            // add darker bg color on hovering recipe
            row.interactive = true;
            row.on('mouseover', () => {
                stripe.clear();
                stripe.beginFill(0x000000, 0.1);
                stripe.drawRect(0, row.y + content.y, viewportW, rowHeight);
                stripe.endFill();
            })

            row.on('mouseout', () => {
                stripe.clear();
            })

            // big output slot on left
            const outSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
            outSprite.width = outSprite.height = leftOutputSize;
            outSprite.x = 6; // small left margin within the content
            outSprite.y = (rowHeight - leftOutputSize) / 2;
            outSprite.interactive = true;
            outSprite.on('pointerdown', () => {
                this.onClickOnCraftLine(recipe);
            })
            row.addChild(outSprite);
            this.drawItem(recipe.output, outSprite);

            // small input slots
            for (let s = 0; s < recipe.inputs.length; s++) {
                const slotSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
                slotSprite.width = smallSlotSize;
                slotSprite.height = smallSlotSize;
                slotSprite.x = leftStartX + s * (smallSlotSize + hGap);
                //align vertically with bottom of output slot
                slotSprite.y = outSprite.y + outSprite.height - slotSprite.height;
                slotSprite.interactive = true;

                const item = recipe.inputs[s] ?? null;
                this.drawItem(item, slotSprite);

                row.addChild(slotSprite);
            }
        }

        // mask to clip content to viewport rectangle
        const maskG = new Graphics();
        maskG.beginFill(0xff0000);
        maskG.drawRect(0, 0, viewportW, viewportH);
        maskG.endFill();
        maskG.x = viewport.x;
        maskG.y = viewport.y;
        craftingInterface.addChild(maskG);
        viewport.mask = maskG;

        const scrollbarX = craftingInterface.width * 0.9;
        const scrollbarY = viewport.y;
        const scrollbarW = 18;
        const scrollbarH = viewportH;

        new ScrollBar(content, contentHeight, viewportH, craftingInterface, scrollbarX, scrollbarY, scrollbarW, scrollbarH, this.app);
    }
}
