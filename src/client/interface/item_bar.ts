import {Application, Container, Sprite, Spritesheet} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import { BaseInterface } from './base_interface';
import Inventory from '../inventory/inventory';
import { InventorySlot } from '../types/inventory';

/**
 * ItemBar
 *
 * A horizontal bar displayed at the bottom of the screen
 * showing the player's inventory items. Players can click
 * on slots to select or use items
 */
export class ItemBar extends BaseInterface {
    private inventory: Inventory;
    public onClickEvent: (item:InventorySlot, index: number) => void;
    private slots: Sprite[];

    /**
     * Creates an ItemBar instance
     * @param app The PixiJS application
     * @param spritesheets Spritesheets containing item textures
     * @param scale UI scale factor for slot sizes
     * @param inventory The player's inventory to display
     * @param container The container (HUD layer) to add the item bar to
     */
    constructor(app: Application, spritesheets: Spritesheet[], scale: number, inventory: Inventory, container: Container) {
        super(app, spritesheets, scale, container);
        this.inventory = inventory;
        this.slots = [];
        this.onClickEvent = (item: InventorySlot, index: number) => {
            this.inventory.setItemInHandIndex(index);
        }
        this.draw();

    }

    /**
     * Resets the click event behavior to simply select the clicked slot
     */
    public resetOnClickEvent() {
        this.onClickEvent = (item: InventorySlot, index: number) => {
            this.inventory.setItemInHandIndex(index);
        }
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
                this.onClickEvent(items[i], i);
            });

            itemBar.addChild(lightSquare);

            this.slots[i] = lightSquare;
        }

        this.drawSlots();
        this.inventory.observe(this.drawSlots.bind(this));
    }

    /**
     * Updates the slot visuals, including highlighting the selected slot.
     */
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
