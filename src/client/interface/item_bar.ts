import {Application, Container, Sprite, Spritesheet} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import { BaseInterface } from './base_interface';
import Inventory from '../inventory/inventory';

export class ItemBar extends BaseInterface {
    private inventory: Inventory;
    private slots: Sprite[];

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, inventory: Inventory, hudLayer: Container) {
        super(app, spritesheets, scale, hudLayer);
        this.inventory = inventory;
        this.slots = [];
        this.draw();
    }

    protected draw(): void {
        const itemBar = new Container();
        this.hudLayer.addChild(itemBar);

        const {items} = this.inventory;

        const spaceBetweenSquares = 20;
        const barWidth = this.guiScale * items.length + ((items.length - 1) * spaceBetweenSquares);
        const barHeight = this.guiScale;

        itemBar.width = barWidth;
        itemBar.height = barHeight;

        itemBar.x = this.app.screen.width / 2 - (barWidth / 2);
        itemBar.y = this.app.screen.height - barHeight - 20;

        const texture = findTexture(this.spritesheets, "light_square");

        for (let i = 0; i < items.length; ++i) {
            const lightSquare = new Sprite(texture);
            lightSquare.width = this.guiScale;
            lightSquare.height = this.guiScale;
            lightSquare.x = i * (lightSquare.width + spaceBetweenSquares);
            lightSquare.y = 0;

            this.drawItem(items[i], lightSquare, true, false);

            lightSquare.interactive = true;
            lightSquare.on('pointerdown', () => {
                this.inventory.setItemInHandIndex(i);
            });

            itemBar.addChild(lightSquare);

            this.slots[i] = lightSquare;
        }

        this.drawSlots();
        this.inventory.observe(this.drawSlots.bind(this));
    }

    drawSlots()  {
        for (let i = 0; i < this.inventory.items.length; ++i) {
            const item = this.inventory.items[i];
            const slot = this.slots[i];
            slot.children = [];

            if (i === this.inventory.getItemInHandIndex()) {
                const selectedTexture = findTexture(this.spritesheets, "selected_slot");
                if (!selectedTexture) {
                    throw new Error("could not find texture");
                }
                const selected = new Sprite(selectedTexture);

                slot.addChild(selected);
            }

            this.drawItem(item, slot, true, false);
        }
    }
}
