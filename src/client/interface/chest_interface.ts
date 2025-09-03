import {Application, Container, Sprite, Spritesheet} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import { Item } from '../world/items/item';
import { BaseInterface } from './base_interface';
import Inventory from '../inventory/inventory';

export class ChestInterface extends BaseInterface {
    private inventory: Inventory;
    private moveItemFromChest: (item:Item)=>void;
    constructor(app: Application, spritesheets: Spritesheet[], scale: number, inventory: Inventory, hudLayer:Container, moveItemFromChest:(item:Item)=>void, onCloseCallBack:()=>void) {
        super(app, spritesheets, scale, onCloseCallBack);
        this.hudLayer = hudLayer;
        this.inventory = inventory;
        this.moveItemFromChest = moveItemFromChest;
        this.inventory.observe(this.draw.bind(this));
        this.draw();
    }

    protected draw() {
        const chestWidth = this.app.screen.width * 0.5;
        const chestHeight = this.app.screen.height * 0.5;
        const chestInventory = this.createCenteredContainer(chestWidth, chestHeight, "dark_frame", 4);

        const slotsPerRow = 7, rows = 4;
        const heightPadding = chestHeight * 0.05;
        const widthPadding = chestWidth * 0.05;

        const availableWidth = chestWidth - 2 * widthPadding;
        const availableHeight = chestHeight - heightPadding;

        const squareLength = Math.min(
            availableWidth / slotsPerRow,
            availableHeight / rows
        ) * 0.8;

        const spaceBetweenSquares = (availableWidth - (slotsPerRow * squareLength)) / (slotsPerRow + 1);
        const spaceBetweenRows = (availableHeight - (rows * squareLength)) / (rows + 1);

        for (let i = 0; i < slotsPerRow * rows; ++i) {
            const darkSquare = new Sprite(findTexture(this.spritesheets, "dark_square"));
            darkSquare.width = darkSquare.height = squareLength;

            darkSquare.x = widthPadding + (i % slotsPerRow) * (squareLength + spaceBetweenSquares) + spaceBetweenSquares;
            darkSquare.y = heightPadding + Math.floor(i / slotsPerRow) * (squareLength + spaceBetweenRows) + spaceBetweenRows;

            darkSquare.interactive = true;
            darkSquare.on('pointerdown', () => {
                if(!this.inventory.items[i])
                    return;
                this.moveItemFromChest(this.inventory.items[i]!);
                this.draw();
            });

            this.drawItem(this.inventory.items[i], darkSquare);
            chestInventory.addChild(darkSquare);
        }
    }
}
